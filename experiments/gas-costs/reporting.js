/* global BigInt */

const fs = require('fs');
const path = require('path');

const summaryColumns = [
  'scenario_id',
  'participants',
  'messages',
  'attributes',
  'tasks',
  'elements',
  'execution_mode',
  'execution_steps',
  'inserted_element_type',
  'registered_tasks_total',
  'registered_messages_total',
  'registered_elements_total',
  'executed_tasks',
  'executed_messages',
  'repetitions',
  'status',
  'successful_repetitions',
  'deployment_gas_mean',
  'deployment_gas_min',
  'deployment_gas_max',
  'execution_gas_mean',
  'execution_gas_min',
  'execution_gas_max',
  'execution_gas_stddev',
  'total_gas_mean',
  'deployment_cost_wei_mean',
  'execution_cost_wei_mean',
  'total_cost_wei_mean',
  'deployment_gas_by_repetition',
  'execution_gas_by_repetition',
  'deployed_contracts',
  'errors'
];

const transactionColumns = [
  'scenario_id',
  'repetition',
  'participants',
  'messages',
  'attributes',
  'tasks',
  'elements',
  'execution_mode',
  'execution_steps',
  'execution_step',
  'inserted_element_type',
  'stage',
  'contract',
  'operation',
  'contract_address',
  'participant_addresses',
  'attribute_id',
  'attribute_value',
  'transaction_hash',
  'gas_used',
  'effective_gas_price_wei',
  'transaction_cost_wei',
  'status',
  'error'
];

function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows, columns) {
  return [
    columns.join(','),
    ...rows.map(row => columns.map(column => csvCell(row[column])).join(','))
  ].join('\n') + '\n';
}

function markdownCell(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>');
}

function markdownTable(rows, columns) {
  if (!rows.length) {
    return '_No transactions were recorded._';
  }
  return [
    `| ${columns.map(column => markdownCell(column.label)).join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${columns.map(column => markdownCell(row[column.key])).join(' | ')} |`)
  ].join('\n');
}

function average(values) {
  if (!values.length) {
    return '';
  }
  const total = values.reduce((sum, value) => sum + BigInt(value), 0n);
  return (total / BigInt(values.length)).toString();
}

function stats(values) {
  if (!values.length) {
    return { mean: '', min: '', max: '', stddev: '' };
  }
  const numbers = values.map(Number);
  const mean = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  const variance = numbers.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / numbers.length;
  return {
    mean: mean.toFixed(2),
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    stddev: Math.sqrt(variance).toFixed(2)
  };
}

function buildSummaryRow(scenario, repetitions, requestedRepetitions) {
  const succeeded = repetitions.filter(result => result.status === 'SUCCESS');
  const execution = scenario.execution || { mode: 'batch', steps: 0 };
  const deploymentGas = succeeded.map(result => result.deploymentGas);
  const executionGas = succeeded.map(result => result.executionGas);
  const totalGas = succeeded.map(result => result.deploymentGas + result.executionGas);
  const deploymentCosts = succeeded
    .map(result => result.deploymentCostWei)
    .filter(value => value !== null);
  const executionCosts = succeeded
    .map(result => result.executionCostWei)
    .filter(value => value !== null);
  const totalCosts = succeeded
    .filter(result => result.deploymentCostWei !== null && result.executionCostWei !== null)
    .map(result => result.deploymentCostWei + result.executionCostWei);
  const executionStats = stats(executionGas);
  const deploymentStats = stats(deploymentGas);
  const errors = repetitions.flatMap(result => result.errors.map(error => `R${result.repetition}: ${error}`));
  const deployedContracts = repetitions
    .map(result => `R${result.repetition} ${JSON.stringify(result.deployedContracts)}`)
    .join('; ');

  return {
    scenario_id: scenario.id,
    ...scenario.workload,
    execution_mode: execution.mode,
    execution_steps: execution.mode === 'incremental' ? execution.steps : 0,
    inserted_element_type: execution.mode === 'incremental'
      ? execution.insertedElementType
      : '',
    registered_tasks_total: succeeded.length ? succeeded[0].registeredTasks : '',
    registered_messages_total: succeeded.length ? succeeded[0].registeredMessages : '',
    registered_elements_total: succeeded.length ? succeeded[0].registeredElements : '',
    executed_tasks: succeeded.length ? succeeded[0].executedTasks : '',
    executed_messages: succeeded.length ? succeeded[0].executedMessages : '',
    repetitions: requestedRepetitions,
    status: succeeded.length === requestedRepetitions ? 'SUCCESS' : 'FAILED',
    successful_repetitions: succeeded.length,
    deployment_gas_mean: average(deploymentGas),
    deployment_gas_min: deploymentStats.min,
    deployment_gas_max: deploymentStats.max,
    execution_gas_mean: average(executionGas),
    execution_gas_min: executionStats.min,
    execution_gas_max: executionStats.max,
    execution_gas_stddev: executionStats.stddev,
    total_gas_mean: average(totalGas),
    deployment_cost_wei_mean: average(deploymentCosts),
    execution_cost_wei_mean: average(executionCosts),
    total_cost_wei_mean: average(totalCosts),
    deployment_gas_by_repetition: JSON.stringify(repetitions.map(result => result.deploymentGas.toString())),
    execution_gas_by_repetition: JSON.stringify(repetitions.map(result => result.executionGas.toString())),
    deployed_contracts: deployedContracts,
    errors: errors.join(' | ')
  };
}

function writeReports(config, summaryRows, transactionRows, outputDirectory) {
  fs.mkdirSync(outputDirectory, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const basename = `${config.experiment.name}-${timestamp}`;
  const summaryPath = path.join(outputDirectory, `${basename}-summary.csv`);
  const transactionsPath = path.join(outputDirectory, `${basename}-transactions.csv`);
  const reportPath = path.join(outputDirectory, `${basename}-report.md`);

  fs.writeFileSync(summaryPath, toCsv(summaryRows, summaryColumns));
  fs.writeFileSync(transactionsPath, toCsv(transactionRows, transactionColumns));

  const scenarioTable = markdownTable(summaryRows, [
    { key: 'scenario_id', label: 'Scenario' },
    { key: 'participants', label: 'Participants' },
    { key: 'messages', label: 'Messages' },
    { key: 'attributes', label: 'Attributes' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'elements', label: 'Elements' },
    { key: 'execution_mode', label: 'Execution mode' },
    { key: 'execution_steps', label: 'Execution steps' },
    { key: 'inserted_element_type', label: 'Inserted element type' },
    { key: 'registered_tasks_total', label: 'Registered tasks total' },
    { key: 'registered_messages_total', label: 'Registered messages total' },
    { key: 'registered_elements_total', label: 'Registered elements total' },
    { key: 'executed_tasks', label: 'Tasks executed' },
    { key: 'executed_messages', label: 'Messages executed' },
    { key: 'status', label: 'Status' },
    { key: 'deployment_gas_mean', label: 'Mean deployment gas' },
    { key: 'deployment_cost_wei_mean', label: 'Mean deployment cost (wei)' },
    { key: 'execution_gas_mean', label: 'Mean execution gas' },
    { key: 'execution_cost_wei_mean', label: 'Mean execution cost (wei)' },
    { key: 'total_gas_mean', label: 'Mean total gas incl. deployment' },
    { key: 'total_cost_wei_mean', label: 'Mean total cost (wei)' },
    { key: 'execution_gas_min', label: 'Min execution gas' },
    { key: 'execution_gas_max', label: 'Max execution gas' },
    { key: 'execution_gas_stddev', label: 'Execution gas stddev' },
    { key: 'execution_gas_by_repetition', label: 'Execution gas by repetition' }
  ]);
  const transactionTable = markdownTable(transactionRows, [
    { key: 'scenario_id', label: 'Scenario' },
    { key: 'repetition', label: 'Repetition' },
    { key: 'participants', label: 'Participants' },
    { key: 'messages', label: 'Messages' },
    { key: 'attributes', label: 'Attributes' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'elements', label: 'Elements' },
    { key: 'execution_mode', label: 'Execution mode' },
    { key: 'execution_steps', label: 'Execution steps' },
    { key: 'execution_step', label: 'Execution step' },
    { key: 'inserted_element_type', label: 'Inserted element type' },
    { key: 'stage', label: 'Stage' },
    { key: 'contract', label: 'Contract' },
    { key: 'operation', label: 'Operation' },
    { key: 'transaction_hash', label: 'Transaction hash' },
    { key: 'gas_used', label: 'Gas used' },
    { key: 'effective_gas_price_wei', label: 'Effective gas price (wei)' },
    { key: 'transaction_cost_wei', label: 'Transaction cost (wei)' },
    { key: 'status', label: 'Status' },
    { key: 'error', label: 'Error' }
  ]);
  const markdown = [
    `# ${config.experiment.name} gas-cost report`,
    '',
    `Generated: ${new Date().toISOString()}`,
    `Network: ${config.network}`,
    `Scenario strategy: ${config.experiment.strategy}`,
    `Repetitions: ${config.experiment.repetitions}`,
    '',
    'Deployment and process execution are measured separately. All gas values come from mined transaction receipts. ' +
      'Wei costs use the receipt effective gas price when reported by the network; an empty value means the receipt did not provide one.',
    '',
    '## Scenario summary',
    '',
    scenarioTable,
    '',
    'Mean gas figures in the summary CSV are integer averages rounded down; standard deviation is population standard deviation. ' +
      'Per-repetition raw gas is retained in the JSON columns and transaction CSV.',
    '',
    '## Transaction details',
    '',
    transactionTable,
    '',
    '## Failures',
    '',
    ...summaryRows.filter(row => row.status !== 'SUCCESS')
      .map(row => `- ${row.scenario_id}: ${row.errors || 'one or more repetitions did not complete successfully.'}`),
    summaryRows.every(row => row.status === 'SUCCESS') ? 'No scenario failures.' : '',
    ''
  ].filter(Boolean).join('\n');
  fs.writeFileSync(reportPath, markdown);

  return { summaryPath, transactionsPath, reportPath };
}

module.exports = {
  buildSummaryRow,
  summaryColumns,
  transactionColumns,
  toCsv,
  writeReports
};
