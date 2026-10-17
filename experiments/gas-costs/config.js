module.exports = {
  network: 'hardhat',

  experiment: {
    name: 'process-gas-costs',
    strategy: 'one-at-a-time',
    repetitions: 1,
    maxScenarios: 50,
    outputDirectory: './experiments/gas-costs/results'
  },

  execution: {
    mode: 'incremental',
    steps: 10,
    insertedElementType: 'START'
  },

  workload: {
    baseline: {
      participants: 2,
      messages: 1,
      attributes: 10,
      tasks: 1,
      elements: 1
    },

    participants: {
      enabled: false,
      values: []
    },

    messages: {
      enabled: false,
      values: []
    },

    attributes: {
      enabled: false,
      values: []
    },

    tasks: {
      enabled: false,
      values: []
    },

    elements: {
      enabled: false,
      values: []
    }
  }
};
