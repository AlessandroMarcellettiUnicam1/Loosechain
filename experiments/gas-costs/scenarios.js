const dimensions = ['participants', 'messages', 'attributes', 'tasks', 'elements'];
const strategies = ['one-at-a-time', 'combinations'];
const defaultMaxScenarios = 100;
const executionModes = ['batch', 'incremental'];
const incrementalElementTypes = Object.freeze({
  START: 1,
  EX_JOIN: 3,
  PAR_SPLIT: 4,
  PAR_JOIN: 5,
  EVENT_BASED: 6,
  TEMP: 8
});

function validateConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('Experiment configuration must be an object.');
  }
  if (config.network !== 'hardhat') {
    throw new Error('Gas-cost experiments must use the isolated "hardhat" network.');
  }

  const experiment = config.experiment;
  if (!experiment || typeof experiment.name !== 'string' || !experiment.name.trim()) {
    throw new Error('experiment.name must be a non-empty string.');
  }
  if (!strategies.includes(experiment.strategy)) {
    throw new Error(`experiment.strategy must be one of: ${strategies.join(', ')}.`);
  }
  if (!Number.isSafeInteger(experiment.repetitions) || experiment.repetitions < 1) {
    throw new Error('experiment.repetitions must be a positive integer.');
  }
  if (
    experiment.maxScenarios !== undefined &&
    (!Number.isSafeInteger(experiment.maxScenarios) || experiment.maxScenarios < 1)
  ) {
    throw new Error('experiment.maxScenarios must be a positive integer.');
  }
  if (typeof experiment.outputDirectory !== 'string' || !experiment.outputDirectory.trim()) {
    throw new Error('experiment.outputDirectory must be a non-empty path.');
  }
  if (!config.execution || !executionModes.includes(config.execution.mode)) {
    throw new Error(`execution.mode must be one of: ${executionModes.join(', ')}.`);
  }
  if (config.execution.mode === 'incremental' &&
      (!Number.isSafeInteger(config.execution.steps) || config.execution.steps < 1)) {
    throw new Error('execution.steps must be a positive integer in incremental mode.');
  }
  if (
    config.execution.mode === 'incremental' &&
    !Object.prototype.hasOwnProperty.call(
      incrementalElementTypes,
      config.execution.insertedElementType
    )
  ) {
    throw new Error(
      `execution.insertedElementType must be one of: ${Object.keys(incrementalElementTypes).join(', ')}.`
    );
  }

  const workload = config.workload;
  if (!workload || typeof workload !== 'object' || !workload.baseline) {
    throw new Error('workload.baseline must define the fixed values for all dimensions.');
  }

  for (const dimension of dimensions) {
    const baseline = workload.baseline[dimension];
    if (!Number.isSafeInteger(baseline) || baseline < 1) {
      throw new Error(`workload.baseline.${dimension} must be a positive integer.`);
    }

    const setting = workload[dimension];
    if (!setting || typeof setting.enabled !== 'boolean') {
      throw new Error(`workload.${dimension}.enabled must be a boolean.`);
    }
    if (!setting.enabled) {
      continue;
    }
    if (!Array.isArray(setting.values) || setting.values.length === 0) {
      throw new Error(`workload.${dimension}.values must be a non-empty list when enabled.`);
    }
    if (setting.values.some(value => !Number.isSafeInteger(value) || value < 1)) {
      throw new Error(`workload.${dimension}.values must contain only positive integers.`);
    }
    if (new Set(setting.values).size !== setting.values.length) {
      throw new Error(`workload.${dimension}.values must not contain duplicates.`);
    }
  }

  if (config.execution.mode === 'incremental') {
    for (const dimension of ['participants', 'messages', 'tasks', 'elements']) {
      if (workload[dimension].enabled) {
        throw new Error(
          `workload.${dimension} cannot vary in incremental mode; use the fixed incremental participant pair and seed shape.`
        );
      }
    }
    if (
      workload.baseline.participants !== 2 ||
      workload.baseline.messages !== 1 ||
      workload.baseline.tasks !== 1
    ) {
      throw new Error(
        'Incremental mode requires exactly two participants, one seed task, and one seed message.'
      );
    }
    if (workload.baseline.elements < 1) {
      throw new Error('Incremental mode requires at least one baseline start element.');
    }
    if (workload.baseline.attributes < config.execution.steps) {
      throw new Error(
        `Incremental mode requires at least ${config.execution.steps} baseline attributes, ` +
        'one distinct attribute per execution step.'
      );
    }
  }

  return config;
}

function validateScenarioWorkload(workload) {
  if (workload.messages < workload.tasks) {
    throw new Error(
      `messages (${workload.messages}) must be at least tasks (${workload.tasks}); ` +
      'the contract requires at least one message per task.'
    );
  }
  if (workload.messages > workload.tasks * 2) {
    throw new Error(
      `messages (${workload.messages}) cannot exceed twice the task count (${workload.tasks * 2}); ` +
      'the contract Activity structure supports only messageIn and messageOut.'
    );
  }
  if (workload.elements < workload.tasks) {
    throw new Error(
      `elements (${workload.elements}) must be at least tasks (${workload.tasks}); ` +
      'the execution fixture requires one start control-flow element per task.'
    );
  }
}

function scenarioKey(workload) {
  return dimensions.map(dimension => workload[dimension]).join(':');
}

function generateScenarios(config) {
  validateConfig(config);
  const { experiment, workload } = config;
  const baseline = { ...workload.baseline };
  const scenarios = [];
  const seen = new Set();
  const maxScenarios = experiment.maxScenarios === undefined
    ? defaultMaxScenarios
    : experiment.maxScenarios;

  function addScenario(values) {
    const key = scenarioKey(values);
    if (!seen.has(key)) {
      validateScenarioWorkload(values);
      if (config.execution.mode === 'incremental' && values.attributes < config.execution.steps) {
        throw new Error(
          `Incremental scenario has ${values.attributes} attributes for ${config.execution.steps} execution steps; ` +
          'provide at least one distinct attribute per step.'
        );
      }
      seen.add(key);
      scenarios.push({
        id: `S${String(scenarios.length + 1).padStart(3, '0')}`,
        workload: values,
        execution: config.execution
      });
      if (scenarios.length > maxScenarios) {
        throw new Error(
          `Scenario generation exceeded experiment.maxScenarios (${maxScenarios}). ` +
          'Reduce the workload values or raise the limit.'
        );
      }
    }
  }

  if (experiment.strategy === 'one-at-a-time') {
    addScenario(baseline);
    dimensions.forEach(dimension => {
      const setting = workload[dimension];
      if (!setting.enabled) {
        return;
      }
      setting.values.forEach(value => addScenario({ ...baseline, [dimension]: value }));
    });
  } else {
    const enabledDimensions = dimensions.filter(dimension => workload[dimension].enabled);
    if (!enabledDimensions.length) {
      addScenario(baseline);
    } else {
      const addCombinations = (index, values) => {
        if (index === enabledDimensions.length) {
          addScenario(values);
          return;
        }
        const dimension = enabledDimensions[index];
        workload[dimension].values.forEach(value => {
          addCombinations(index + 1, { ...values, [dimension]: value });
        });
      };
      addCombinations(0, baseline);
    }
  }

  return scenarios;
}

module.exports = {
  dimensions,
  generateScenarios,
  incrementalElementTypes,
  validateConfig,
  validateScenarioWorkload
};
