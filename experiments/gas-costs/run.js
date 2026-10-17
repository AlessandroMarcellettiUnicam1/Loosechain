/* global BigInt */

const path = require('path');
const hre = require('hardhat');
const config = require('./config');
const { generateScenarios, incrementalElementTypes } = require('./scenarios');
const { buildSummaryRow, writeReports } = require('./reporting');

const zeroBytes32 = `0x${'0'.repeat(64)}`;

function bytes32(value) {
  return hre.ethers.encodeBytes32String(value);
}

function workloadTransactionFields(scenario) {
  return {
    participants: scenario.workload.participants,
    messages: scenario.workload.messages,
    attributes: scenario.workload.attributes,
    tasks: scenario.workload.tasks,
    elements: scenario.workload.elements,
    execution_mode: config.execution.mode,
    execution_steps: config.execution.mode === 'incremental' ? config.execution.steps : '',
    execution_step: '',
    inserted_element_type: config.execution.mode === 'incremental'
      ? config.execution.insertedElementType
      : ''
  };
}

function gasPriceFromReceipt(receipt) {
  const price = receipt.effectiveGasPrice === undefined
    ? receipt.gasPrice
    : receipt.effectiveGasPrice;
  return price === undefined || price === null ? null : BigInt(price.toString());
}

function transactionRecord(scenario, repetition, details, transaction, receipt, error) {
  const gasUsed = receipt ? BigInt(receipt.gasUsed.toString()) : null;
  const gasPrice = receipt ? gasPriceFromReceipt(receipt) : null;
  const status = error || !receipt || Number(receipt.status) !== 1 ? 'FAILED' : 'SUCCESS';
  return {
    scenario_id: scenario.id,
    repetition,
    ...workloadTransactionFields(scenario),
    stage: details.stage,
    execution_step: details.executionStep || '',
    contract: details.contract,
    operation: details.operation,
    contract_address: details.contractAddress || '',
    participant_addresses: details.participantAddresses
      ? details.participantAddresses.join(';')
      : '',
    attribute_id: details.attributeId || '',
    attribute_value: details.attributeValue || '',
    transaction_hash: (receipt && receipt.hash) || (transaction && transaction.hash) || '',
    gas_used: gasUsed === null ? '' : gasUsed.toString(),
    effective_gas_price_wei: gasPrice === null ? '' : gasPrice.toString(),
    transaction_cost_wei: gasUsed === null || gasPrice === null ? '' : (gasUsed * gasPrice).toString(),
    status,
    error: error ? error.message : ''
  };
}

async function waitForTransaction(scenario, repetition, details, transactionPromise, rows) {
  let transaction;
  try {
    transaction = await transactionPromise;
    const receipt = await transaction.wait();
    const row = transactionRecord(scenario, repetition, details, transaction, receipt, null);
    if (row.status !== 'SUCCESS') {
      const failure = new Error(`${details.contract}.${details.operation} mined with status ${receipt.status}.`);
      row.error = failure.message;
      rows.push(row);
      failure.receipt = receipt;
      throw failure;
    }
    rows.push(row);
    return receipt;
  } catch (error) {
    const receipt = error.receipt || null;
    const alreadyRecorded = receipt && rows.some(row => row.transaction_hash === receipt.hash);
    if (!alreadyRecorded) {
      rows.push(transactionRecord(scenario, repetition, details, transaction, receipt, error));
    }
    throw error;
  }
}

function hasEvent(contract, receipt, expectedMessage) {
  const event = contract.interface.getEvent('functionDone');
  return receipt.logs.some(log => {
    if (log.address.toLowerCase() !== contract.target.toLowerCase() ||
        log.topics[0].toLowerCase() !== event.topicHash.toLowerCase()) {
      return false;
    }
    return contract.interface.parseLog(log).args[0] === expectedMessage;
  });
}

function buildProcess(workload, scenarioId, repetition, participantAddresses, incremental) {
  const initiatorRoleKey = bytes32('initiator-role');
  const targetRoleKey = bytes32('target-role');
  const roleKey = bytes32('participant-role');
  const attributeIds = Array.from({ length: workload.attributes }, (_, index) =>
    bytes32(`a_${scenarioId}_${repetition}_${index + 1}`)
  );
  const attributeValues = attributeIds.map((_, index) =>
    bytes32(`v_${scenarioId}_${repetition}_${index + 1}`)
  );

  const activities = [];
  const messages = [];
  const controlFlow = [];
  let nextMessage = 0;

  for (let taskIndex = 0; taskIndex < workload.tasks; taskIndex += 1) {
    const taskId = bytes32(`t_${scenarioId}_${repetition}_${taskIndex + 1}`);
    const startId = bytes32(`s_${scenarioId}_${repetition}_${taskIndex + 1}`);
    const inboundId = bytes32(`m_${scenarioId}_${repetition}_${nextMessage + 1}`);
    const outboundId = nextMessage + 1 < workload.messages
      ? bytes32(`m_${scenarioId}_${repetition}_${nextMessage + 2}`)
      : zeroBytes32;
    const sourceParticipant = participantAddresses[taskIndex % participantAddresses.length];
    const targetParticipant = participantAddresses[(taskIndex + 1) % participantAddresses.length];

    activities.push({
      executed: false,
      id: taskId,
      idInElement: startId,
      idOutElement: zeroBytes32,
      initiator: incremental ? initiatorRoleKey : roleKey,
      messageIn: inboundId,
      messageOut: outboundId,
      name: taskId,
      target: incremental ? targetRoleKey : roleKey,
      tempState: false
    });

    controlFlow.push({
      executed: false,
      id: startId,
      incomingActivity: [],
      outgoingActivity: [taskId],
      elementType: 1
    });

    const taskMessageCount = outboundId === zeroBytes32 ? 1 : 2;
    for (let messageIndex = 0; messageIndex < taskMessageCount; messageIndex += 1) {
      const messageId = messageIndex === 0 ? inboundId : outboundId;
      const mappingKey = bytes32(`k_${scenarioId}_${repetition}_${nextMessage + 1}`);
      messages.push({
        executed: false,
        id: messageId,
        idActivity: taskId,
        mappingKey,
        name: messageId,
        selectedAttr: attributeIds,
        sourceParticipant,
        targetParticipant,
        tempState: false
      });
      nextMessage += 1;
    }
  }

  while (controlFlow.length < workload.elements) {
    const elementId = bytes32(`x_${scenarioId}_${repetition}_${controlFlow.length + 1}`);
    controlFlow.push({
      executed: false,
      id: elementId,
      incomingActivity: [],
      outgoingActivity: [],
      elementType: 1
    });
  }

  const participantList = incremental
    ? [
      { addr: [participantAddresses[0]], keyMapping: initiatorRoleKey },
      { addr: [participantAddresses[1]], keyMapping: targetRoleKey }
    ]
    : [{
      addr: participantAddresses,
      keyMapping: roleKey
    }];
  const messageAttributes = messages.map(message => ({
    attributes: attributeIds,
    keyMapping: message.mappingKey
  }));

  return {
    activities,
    messages,
    controlFlow,
    participantList,
    messageAttributes,
    attributeIds,
    attributeValues,
    roleKey: incremental ? null : roleKey,
    initiatorRoleKey: incremental ? initiatorRoleKey : roleKey,
    targetRoleKey: incremental ? targetRoleKey : roleKey
  };
}

function buildNextRuntimePair(process, currentActivity, scenario, repetition, step, participantAddresses) {
  const taskId = bytes32(`t_${scenario.id}_r${repetition}_step${step + 1}`);
  const messageId = bytes32(`m_${scenario.id}_r${repetition}_step${step + 1}`);
  const elementId = bytes32(`e_${scenario.id}_r${repetition}_step${step + 1}`);
  const sourceParticipant = participantAddresses[0];
  const targetParticipant = participantAddresses[1];
  return {
    activity: {
      executed: false,
      id: taskId,
      idInElement: elementId,
      idOutElement: zeroBytes32,
      initiator: process.initiatorRoleKey,
      messageIn: messageId,
      messageOut: zeroBytes32,
      name: taskId,
      target: process.targetRoleKey,
      tempState: false
    },
    message: {
      executed: false,
      id: messageId,
      idActivity: taskId,
      mappingKey: process.messages[0].mappingKey,
      name: messageId,
      selectedAttr: [process.attributeIds[step % process.attributeIds.length]],
      sourceParticipant,
      targetParticipant,
      tempState: false
    },
    element: {
      executed: false,
      id: elementId,
      incomingActivity: [currentActivity.id],
      outgoingActivity: [taskId],
      elementType: incrementalElementTypes[config.execution.insertedElementType]
    }
  };
}

async function deployContract(scenario, repetition, rows, deployedContracts) {
  const factory = await hre.ethers.getContractFactory('app/contracts/contracLogic.sol:contractLogic');
  const contract = await factory.deploy();
  const address = await contract.getAddress();
  deployedContracts.contractLogic = address;
  const deploymentTransaction = contract.deploymentTransaction();
  await waitForTransaction(scenario, repetition, {
    stage: 'deployment',
    contract: 'contractLogic',
    operation: 'constructor',
    contractAddress: address
  }, Promise.resolve(deploymentTransaction), rows);
  await contract.waitForDeployment();
  return contract;
}

function transactionCost(rows, stage) {
  const matchingRows = rows.filter(row => row.stage === stage);
  if (matchingRows.some(row => !row.transaction_cost_wei)) {
    return null;
  }
  return matchingRows.reduce((sum, row) => sum + BigInt(row.transaction_cost_wei), 0n);
}

async function runRepetition(scenario, repetition, signers) {
  const transactionRows = [];
  const deployedContracts = {};
  const errors = [];
  let executionGas = 0n;
  let deploymentGas = 0n;
  let executionCostWei = null;
  let deploymentCostWei = null;

  try {
    const participantAddresses = signers.slice(0, scenario.workload.participants)
      .map(signer => signer.address);
    if (
      config.execution.mode === 'incremental' &&
      (participantAddresses.length !== 2 ||
        participantAddresses[0].toLowerCase() === participantAddresses[1].toLowerCase())
    ) {
      throw new Error('Incremental execution requires two distinct participant addresses.');
    }
    const contract = await deployContract(scenario, repetition, transactionRows, deployedContracts);
    if (deployedContracts.EmergencyResponsePlan || deployedContracts.emergencyResponsePlan_none) {
      throw new Error('The emergency response plan must not be deployed by this experiment.');
    }

    const process = buildProcess(
      scenario.workload,
      scenario.id,
      repetition,
      participantAddresses,
      config.execution.mode === 'incremental'
    );
    const choreographyId = bytes32(`c_${scenario.id}`);
    const instanceId = bytes32(`i_${scenario.id}_r${repetition}`);
    const initialized = await waitForTransaction(scenario, repetition, {
      stage: 'process-initialization',
      contract: 'contractLogic',
      operation: 'setChoreography',
      contractAddress: await contract.getAddress()
    }, contract.setChoreography(
      process.activities,
      process.messages,
      process.participantList,
      process.messageAttributes,
      process.controlFlow,
      [],
      choreographyId,
      instanceId
    ), transactionRows);

    if (!hasEvent(contract, initialized, 'Resources Loaded')) {
      throw new Error('setChoreography succeeded without the expected "Resources Loaded" event.');
    }
    const instanceCount = await contract.getChoreographyInstances(choreographyId);
    if (instanceCount !== 1n) {
      throw new Error(`Expected one choreography instance after initialization, got ${instanceCount}.`);
    }
    for (const element of process.controlFlow) {
      const storedElement = await contract.getControlFlowElement(instanceId, element.id);
      if (
        storedElement.id.toLowerCase() !== element.id.toLowerCase() ||
        Number(storedElement.elementType) !== element.elementType
      ) {
        throw new Error(`Baseline control-flow element ${element.id} was not initialized.`);
      }
    }

    if (config.execution.mode === 'incremental') {
      let currentActivity = process.activities[0];
      let currentMessage = process.messages[0];

      for (let step = 1; step <= config.execution.steps; step += 1) {
        const attributeIndex = step - 1;
        const attributeId = process.attributeIds[attributeIndex];
        const attributeValue = process.attributeValues[attributeIndex];
        const executingMessage = { ...currentMessage, selectedAttr: [attributeId] };
        if (
          executingMessage.selectedAttr.length !== 1 ||
          executingMessage.sourceParticipant.toLowerCase() !== participantAddresses[0].toLowerCase() ||
          executingMessage.targetParticipant.toLowerCase() !== participantAddresses[1].toLowerCase()
        ) {
          throw new Error(`Execution step ${step} must use one attribute and the configured participant pair.`);
        }
        const nextPair = buildNextRuntimePair(
          process,
          currentActivity,
          scenario,
          repetition,
          step,
          participantAddresses
        );
        const receipt = await waitForTransaction(scenario, repetition, {
          stage: 'message-task-execution',
          contract: 'contractLogic',
          operation: 'executeMessage',
          contractAddress: await contract.getAddress(),
          executionStep: step,
          insertedElementType: config.execution.insertedElementType,
          participantAddresses: [
            executingMessage.sourceParticipant,
            executingMessage.targetParticipant
          ],
          attributeId,
          attributeValue
        }, contract.executeMessage(
          currentActivity,
          executingMessage,
          [],
          [attributeId],
          [attributeValue],
          [nextPair.activity],
          [nextPair.element],
          [],
          [nextPair.message],
          instanceId
        ), transactionRows);
        if (!hasEvent(contract, receipt, 'Messagge executed')) {
          throw new Error(`Incremental execution ${step} did not emit the expected completion event.`);
        }
        const storedMessage = await contract.getMessage(instanceId, currentMessage.id);
        if (!storedMessage.executed) {
          throw new Error(`Message ${currentMessage.id} was not marked executed at step ${step}.`);
        }
        const storedTask = await contract.getTask(instanceId, currentActivity.id);
        if (
          !storedTask.executed ||
          storedTask.initiator.toLowerCase() === storedTask.target.toLowerCase()
        ) {
          throw new Error(
            `Task ${currentActivity.id} was not completed with distinct initiator and target participants at step ${step}.`
          );
        }
        const nextStoredTask = await contract.getTask(instanceId, nextPair.activity.id);
        const nextStoredMessage = await contract.getMessage(instanceId, nextPair.message.id);
        const nextStoredElement = await contract.getControlFlowElement(instanceId, nextPair.element.id);
        if (
          nextStoredTask.id.toLowerCase() !== nextPair.activity.id.toLowerCase() ||
          nextStoredMessage.id.toLowerCase() !== nextPair.message.id.toLowerCase() ||
          nextStoredMessage.executed ||
          nextStoredElement.id.toLowerCase() !== nextPair.element.id.toLowerCase() ||
          Number(nextStoredElement.elementType) !== nextPair.element.elementType
        ) {
          throw new Error(
            `Incremental execution ${step} did not register the next task, message, and ` +
            `${config.execution.insertedElementType} control-flow element.`
          );
        }
        currentActivity = nextPair.activity;
        currentMessage = nextPair.message;
      }

      const seedStart = await contract.getControlFlowElement(instanceId, process.activities[0].idInElement);
      if (!seedStart.executed) {
        throw new Error('The seed start control-flow element was not marked executed.');
      }
    } else {
      for (let taskIndex = 0; taskIndex < process.activities.length; taskIndex += 1) {
        const activity = process.activities[taskIndex];
        const taskMessages = process.messages.filter(message => message.idActivity === activity.id);
        for (const message of taskMessages) {
          const receipt = await waitForTransaction(scenario, repetition, {
            stage: 'message-task-execution',
            contract: 'contractLogic',
            operation: 'executeMessage',
            contractAddress: await contract.getAddress()
          }, contract.executeMessage(
            activity,
            message,
            [],
            process.attributeIds,
            process.attributeValues,
            [],
            [],
            [],
            [],
            instanceId
          ), transactionRows);
          if (!hasEvent(contract, receipt, 'Messagge executed')) {
            throw new Error(`executeMessage for ${message.id} did not emit the expected completion event.`);
          }
          const storedMessage = await contract.getMessage(instanceId, message.id);
          if (!storedMessage.executed) {
            throw new Error(`Message ${message.id} was not marked executed.`);
          }
        }

        const storedTask = await contract.getTask(instanceId, activity.id);
        if (!storedTask.executed) {
          throw new Error(`Task ${activity.id} was not marked executed after its messages.`);
        }
        const startElement = await contract.getControlFlowElement(instanceId, activity.idInElement);
        if (!startElement.executed) {
          throw new Error(`Start control-flow element for task ${activity.id} was not marked executed.`);
        }
      }

      const checkedMessages = await Promise.all(process.messages.map(message =>
        contract.getMessage(instanceId, message.id)
      ));
      if (checkedMessages.some(message => !message.executed)) {
        throw new Error('Not all configured messages completed execution.');
      }
    }

    const deploymentRows = transactionRows.filter(row => row.stage === 'deployment');
    const executionRows = transactionRows.filter(row => row.stage !== 'deployment');
    deploymentGas = deploymentRows.reduce((sum, row) => sum + BigInt(row.gas_used || 0), 0n);
    executionGas = executionRows.reduce((sum, row) => sum + BigInt(row.gas_used || 0), 0n);
    deploymentCostWei = transactionCost(transactionRows, 'deployment');
    const processExecutionCostRows = transactionRows.filter(row => row.stage === 'message-task-execution');
    if (
      processExecutionCostRows.some(row => !row.transaction_cost_wei) ||
      transactionRows.some(row => row.stage === 'process-initialization' && !row.transaction_cost_wei)
    ) {
      executionCostWei = null;
    } else {
      executionCostWei = processExecutionCostRows.concat(
        transactionRows.filter(row => row.stage === 'process-initialization')
      ).reduce((sum, row) => sum + BigInt(row.transaction_cost_wei), 0n);
    }

    return {
      repetition,
      status: 'SUCCESS',
      deploymentGas,
      executionGas,
      deploymentCostWei,
      executionCostWei,
      deployedContracts,
      registeredTasks: scenario.workload.tasks + (
        config.execution.mode === 'incremental' ? config.execution.steps : 0
      ),
      registeredMessages: scenario.workload.messages + (
        config.execution.mode === 'incremental' ? config.execution.steps : 0
      ),
      registeredElements: scenario.workload.elements + (
        config.execution.mode === 'incremental' ? config.execution.steps : 0
      ),
      executedTasks: config.execution.mode === 'incremental'
        ? config.execution.steps
        : scenario.workload.tasks,
      executedMessages: config.execution.mode === 'incremental'
        ? config.execution.steps
        : scenario.workload.messages,
      transactionRows,
      errors
    };
  } catch (error) {
    errors.push(error.message);
    const deploymentRows = transactionRows.filter(row => row.stage === 'deployment');
    const executionRows = transactionRows.filter(row => row.stage !== 'deployment');
    deploymentGas = deploymentRows.reduce((sum, row) => sum + BigInt(row.gas_used || 0), 0n);
    executionGas = executionRows.reduce((sum, row) => sum + BigInt(row.gas_used || 0), 0n);
    deploymentCostWei = transactionCost(transactionRows, 'deployment');
    const processRows = transactionRows.filter(row => row.stage !== 'deployment');
    executionCostWei = processRows.length && processRows.every(row => row.transaction_cost_wei)
      ? processRows.reduce((sum, row) => sum + BigInt(row.transaction_cost_wei), 0n)
      : null;
    return {
      repetition,
      status: 'FAILED',
      deploymentGas,
      executionGas,
      deploymentCostWei,
      executionCostWei,
      deployedContracts,
      registeredTasks: transactionRows.filter(row => row.stage === 'process-initialization' && row.status === 'SUCCESS').length
        ? scenario.workload.tasks + (config.execution.mode === 'incremental'
          ? transactionRows.filter(row => row.execution_step && row.status === 'SUCCESS').length
          : 0)
        : 0,
      registeredMessages: transactionRows.filter(row => row.stage === 'process-initialization' && row.status === 'SUCCESS').length
        ? scenario.workload.messages + (config.execution.mode === 'incremental'
          ? transactionRows.filter(row => row.execution_step && row.status === 'SUCCESS').length
          : 0)
        : 0,
      registeredElements: transactionRows.filter(row => row.stage === 'process-initialization' && row.status === 'SUCCESS').length
        ? scenario.workload.elements + (config.execution.mode === 'incremental'
          ? transactionRows.filter(row => row.execution_step && row.status === 'SUCCESS').length
          : 0)
        : 0,
      executedTasks: transactionRows.filter(row => row.stage === 'message-task-execution' && row.status === 'SUCCESS').length,
      executedMessages: transactionRows.filter(row => row.stage === 'message-task-execution' && row.status === 'SUCCESS').length,
      transactionRows,
      errors
    };
  }
}

async function main() {
  const scenarios = generateScenarios(config);
  if (hre.network.name !== config.network) {
    throw new Error(
      `Configured experiment network is "${config.network}", but Hardhat is using "${hre.network.name}". ` +
      'Run this experiment with --network hardhat; no external networks are supported.'
    );
  }

  const signers = await hre.ethers.getSigners();
  const largestParticipantCount = Math.max(...scenarios.map(scenario => scenario.workload.participants));
  if (largestParticipantCount > signers.length) {
    throw new Error(
      `The workload requests ${largestParticipantCount} participants, but this Hardhat network provides ` +
      `${signers.length} accounts. Reduce the participant values.`
    );
  }

  const plannedRuns = scenarios.length * config.experiment.repetitions;
  console.log(`Gas experiment: ${scenarios.length} scenario(s), ${plannedRuns} fresh deployment/run(s).`);
  console.log(`Scenario strategy: ${config.experiment.strategy}; repetitions: ${config.experiment.repetitions}.`);
  console.log(
    `Execution mode: ${config.execution.mode}` +
    (config.execution.mode === 'incremental' ? `; ${config.execution.steps} step(s).` : '.')
  );
  scenarios.forEach(scenario => {
    console.log(`${scenario.id}: ${JSON.stringify(scenario.workload)}`);
  });

  const summaryRows = [];
  const allTransactionRows = [];
  for (const scenario of scenarios) {
    console.log(`Running ${scenario.id}...`);
    const repetitionResults = [];
    for (let repetition = 1; repetition <= config.experiment.repetitions; repetition += 1) {
      const result = await runRepetition(scenario, repetition, signers);
      repetitionResults.push(result);
      allTransactionRows.push(...result.transactionRows);
      console.log(
        `  repetition ${repetition}: ${result.status}; deployment=${result.deploymentGas} gas, ` +
        `execution=${result.executionGas} gas${result.errors.length ? `; ${result.errors.join('; ')}` : ''}`
      );
    }
    summaryRows.push(buildSummaryRow(scenario, repetitionResults, config.experiment.repetitions));
  }

  const projectRoot = path.resolve(__dirname, '..', '..');
  const outputDirectory = path.resolve(projectRoot, config.experiment.outputDirectory);
  const reports = writeReports(config, summaryRows, allTransactionRows, outputDirectory);
  console.log(`Summary CSV: ${reports.summaryPath}`);
  console.log(`Transaction CSV: ${reports.transactionsPath}`);
  console.log(`Markdown report: ${reports.reportPath}`);

  const failed = summaryRows.filter(row => row.status !== 'SUCCESS');
  if (failed.length) {
    throw new Error(`${failed.length} scenario(s) failed. See the generated report for transaction-level errors.`);
  }
}

main().catch(error => {
  console.error('Gas-cost experiment failed.', error);
  process.exitCode = 1;
});
