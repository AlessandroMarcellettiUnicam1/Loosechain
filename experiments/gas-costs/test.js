const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const config = require('./config');
const { generateScenarios, validateConfig } = require('./scenarios');
const { buildSummaryRow, writeReports } = require('./reporting');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
test('one-at-a-time includes a baseline and varies only enabled dimensions', () => {
  const batchConfig = clone(config);
  batchConfig.execution.mode = 'batch';
  batchConfig.workload.participants.enabled = true;
  batchConfig.workload.participants.values = [2, 4];
  batchConfig.workload.baseline.messages = 2;
  batchConfig.workload.baseline.elements = 2;
  batchConfig.workload.tasks.enabled = true;
  batchConfig.workload.tasks.values = [1, 2];
  const scenarios = generateScenarios(batchConfig);
  assert.equal(scenarios[0].workload.tasks, batchConfig.workload.baseline.tasks);
  assert.equal(scenarios.some(scenario => scenario.workload.participants === 4), true);
  assert.equal(scenarios.some(scenario => scenario.workload.tasks === 2), true);
  assert.equal(scenarios.some(scenario => scenario.workload.attributes === 2), false);
  scenarios.forEach(scenario => {
    assert.equal(scenario.workload.attributes, config.workload.baseline.attributes);
    assert.equal(scenario.workload.elements, batchConfig.workload.baseline.elements);
  });
});

test('incremental default plans one seed scenario with ten execution steps', () => {
  const scenarios = generateScenarios(config);
  assert.equal(scenarios.length, 1);
  assert.equal(scenarios[0].execution.mode, 'incremental');
  assert.equal(scenarios[0].execution.steps, 10);
  assert.equal(scenarios[0].workload.tasks, 1);
  assert.equal(scenarios[0].workload.messages, 1);
  assert.equal(scenarios[0].workload.participants, 2);
  assert.equal(scenarios[0].workload.attributes, 10);
  assert.equal(scenarios[0].workload.elements, 1);
  assert.equal(scenarios[0].execution.insertedElementType, 'START');
});

test('incremental mode allows a configured baseline element count and supported inserted type', () => {
  const multiElementConfig = clone(config);
  multiElementConfig.workload.baseline.elements = 4;
  multiElementConfig.execution.insertedElementType = 'PAR_SPLIT';
  const scenarios = generateScenarios(multiElementConfig);
  assert.equal(scenarios[0].workload.elements, 4);
  assert.equal(scenarios[0].execution.insertedElementType, 'PAR_SPLIT');

  const invalidElementTypeConfig = clone(config);
  invalidElementTypeConfig.execution.insertedElementType = 'EX_SPLIT';
  assert.throws(() => validateConfig(invalidElementTypeConfig), /insertedElementType must be one of/);
});

test('combinations generates the Cartesian product and skips disabled dimensions', () => {
  const combinationConfig = clone(config);
  combinationConfig.execution.mode = 'batch';
  combinationConfig.experiment.strategy = 'combinations';
  delete combinationConfig.experiment.maxScenarios;
  combinationConfig.workload.participants.values = [2, 4];
  combinationConfig.workload.participants.enabled = true;
  combinationConfig.workload.messages.enabled = false;
  combinationConfig.workload.tasks.enabled = false;
  combinationConfig.workload.attributes.enabled = true;
  combinationConfig.workload.attributes.values = [10, 12];
  combinationConfig.workload.elements.values = ['ignored when disabled'];
  const scenarios = generateScenarios(combinationConfig);
  assert.equal(scenarios.length, 4);
  assert.deepEqual(
    [...new Set(scenarios.map(scenario => scenario.workload.participants))].sort((a, b) => a - b),
    [2, 4]
  );
  scenarios.forEach(scenario => {
    assert.equal(scenario.workload.messages, combinationConfig.workload.baseline.messages);
    assert.equal(scenario.workload.tasks, combinationConfig.workload.baseline.tasks);
  });
});

test('workload validation rejects unsupported task/message and flow-element shapes', () => {
  const invalidConfig = clone(config);
  invalidConfig.execution.mode = 'batch';
  invalidConfig.workload.baseline.messages = 1;
  invalidConfig.workload.baseline.tasks = 2;
  assert.throws(() => generateScenarios(invalidConfig), /at least tasks/);

  const missingStartConfig = clone(config);
  missingStartConfig.execution.mode = 'batch';
  missingStartConfig.workload.baseline.elements = 1;
  missingStartConfig.workload.baseline.tasks = 2;
  missingStartConfig.workload.baseline.messages = 2;
  missingStartConfig.experiment.strategy = 'combinations';
  for (const dimension of ['participants', 'messages', 'attributes', 'tasks', 'elements']) {
    missingStartConfig.workload[dimension].enabled = false;
  }
  assert.throws(() => generateScenarios(missingStartConfig), /one start control-flow element per task/);
});

test('configuration requires non-empty enabled values and positive integer sizes', () => {
  const invalidConfig = clone(config);
  invalidConfig.workload.participants.enabled = true;
  invalidConfig.workload.participants.values = [];
  assert.throws(() => validateConfig(invalidConfig), /non-empty list/);

  const invalidSizeConfig = clone(config);
  invalidSizeConfig.workload.baseline.attributes = 0;
  assert.throws(() => validateConfig(invalidSizeConfig), /positive integer/);
});

test('scenario generation enforces the optional maximum before building a large product', () => {
  const limitedConfig = clone(config);
  limitedConfig.execution.mode = 'batch';
  limitedConfig.experiment.strategy = 'combinations';
  limitedConfig.experiment.maxScenarios = 2;
  limitedConfig.workload.participants.values = [2, 4, 6];
  limitedConfig.workload.participants.enabled = true;
  limitedConfig.workload.messages.enabled = false;
  limitedConfig.workload.tasks.enabled = false;
  limitedConfig.workload.attributes.enabled = true;
  limitedConfig.workload.attributes.values = [1, 2];
  assert.throws(() => generateScenarios(limitedConfig), /exceeded experiment.maxScenarios/);
});

test('report writer produces summary, transaction CSVs, and Markdown from measured rows', () => {
  const outputDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'loosechain-gas-report-'));
  try {
    const summary = buildSummaryRow(
      { id: 'S001', workload: config.workload.baseline },
      [{
        repetition: 1,
        status: 'SUCCESS',
        deploymentGas: 1000n,
        executionGas: 200n,
        deploymentCostWei: 10000n,
        executionCostWei: 2000n,
        deployedContracts: { contractLogic: '0x1234' },
        errors: []
      }],
      1
    );
    const transaction = {
      scenario_id: 'S001',
      repetition: 1,
      participants: 2,
      messages: 2,
      attributes: 1,
      tasks: 1,
      elements: 2,
      stage: 'message-task-execution',
      contract: 'contractLogic',
      operation: 'executeMessage',
      contract_address: '0x1234',
      participant_addresses: '0x1111;0x2222',
      attribute_id: '0xaaaa',
      attribute_value: '0xbbbb',
      transaction_hash: '0xabcd',
      gas_used: '200',
      effective_gas_price_wei: '10',
      transaction_cost_wei: '2000',
      status: 'SUCCESS',
      error: ''
    };
    const reports = writeReports(config, [summary], [transaction], outputDirectory);
    assert.match(fs.readFileSync(reports.summaryPath, 'utf8'), /execution_gas_mean/);
    assert.match(fs.readFileSync(reports.transactionsPath, 'utf8'), /effective_gas_price_wei/);
    assert.match(fs.readFileSync(reports.transactionsPath, 'utf8'), /participant_addresses,attribute_id,attribute_value/);
    assert.match(fs.readFileSync(reports.reportPath, 'utf8'), /Mean total gas incl\. deployment/);
    assert.match(fs.readFileSync(reports.reportPath, 'utf8'), /0xabcd/);
  } finally {
    fs.rmSync(outputDirectory, { recursive: true, force: true });
  }
});

test('summary aggregation keeps deployment separate and reports failed repetitions', () => {
  const scenario = { id: 'S001', workload: config.workload.baseline };
  const summary = buildSummaryRow(scenario, [
    {
      repetition: 1,
      status: 'SUCCESS',
      deploymentGas: 1000n,
      executionGas: 200n,
      deploymentCostWei: 10000n,
      executionCostWei: 2000n,
      deployedContracts: {},
      errors: []
    },
    {
      repetition: 2,
      status: 'FAILED',
      deploymentGas: 1000n,
      executionGas: 0n,
      deploymentCostWei: 10000n,
      executionCostWei: 0n,
      deployedContracts: {},
      errors: ['execution failed']
    }
  ], 2);
  assert.equal(summary.status, 'FAILED');
  assert.equal(summary.successful_repetitions, 1);
  assert.equal(summary.execution_gas_mean, '200');
  assert.equal(summary.deployment_gas_mean, '1000');
  assert.match(summary.errors, /execution failed/);
});

test('incremental execution requires one seed task, message, and element', () => {
  const incrementalConfig = clone(config);
  incrementalConfig.execution.steps = 0;
  assert.throws(() => validateConfig(incrementalConfig), /execution.steps must be a positive integer/);

  const invalidIncrementalConfig = clone(config);
  invalidIncrementalConfig.workload.tasks.enabled = true;
  invalidIncrementalConfig.workload.tasks.values = [2];
  assert.throws(() => validateConfig(invalidIncrementalConfig), /cannot vary in incremental mode/);

  const insufficientAttributes = clone(config);
  insufficientAttributes.workload.baseline.attributes = 9;
  assert.throws(() => validateConfig(insufficientAttributes), /at least 10 baseline attributes/);
});
