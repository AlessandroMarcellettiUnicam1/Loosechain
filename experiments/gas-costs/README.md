# Hardhat gas-cost experiment

This standalone experiment measures the gas used by the existing Loosechain
process contract. It does not start or depend on the browser editor, repository
API, Docker, MetaMask, or the emergency-response example.

## Contract and process used

The process runtime is `contractLogic` in `app/contracts/contracLogic.sol`.
It inherits the storage structs and `setChoreography` function from
`contractMemory.sol`; those inherited functions are part of the deployed
`contractLogic` bytecode. The separate `contractMemory` instance that the web
deployment script creates is not called by the application process flow, so the
experiment does not deploy or count it. `EmergencyResponsePlan` from
`emergencyResponsePlan_none.sol` is explicitly excluded.

Each repetition deploys a new `contractLogic` instance, then uses its actual
process API. The default configuration selects incremental execution:

1. `setChoreography` initializes activities, messages, participant roles,
   message-attribute mappings, control-flow elements, and the instance ID in
   one mined transaction. Incremental mode seeds exactly one task and one
   message. Its participant map has distinct initiator and target roles, each
   containing one of the two participant addresses used throughout the run.
2. In incremental mode, the configured number of `executeMessage` transactions
   each executes the current task/message and registers the following task and
   message plus a new control-flow element via the function's runtime arrays.
   `execution.insertedElementType` selects the new element's type. Each
   execution supplies exactly one attribute and its value, assigning one
   configured attribute to each step. The last call therefore leaves one newly
   registered task/message/element pending: with 10 steps, 11 tasks/messages
   and `baseline.elements + 10` elements are registered, the first 10
   tasks/messages are executed, and the 11th is ready for the next execution.
   In batch mode,
   `executeMessage` is sent for each configured message instead. It performs the
   contract's participant and message-mapping checks, advances the message and
   task state, and emits `functionDone("Messagge executed")`.
3. The experiment checks the event, instance count, every message's executed
   state, each task's executed state and distinct participant roles, and the
   associated start element before marking a repetition successful.

The workload is encoded using the real contract structs and is not a deployed
web-editor BPMN file. In batch mode, each task has an independent `START`
control-flow element and one or two messages. Additional configured baseline
elements are stored as independent unused `START` records. In incremental
mode, the configured baseline elements are initialized first; every execution
then inserts a control-flow element of the configured type, with the preceding
task as its incoming activity and the newly registered task as its outgoing
activity. Runtime tasks reuse the seed task's initiator/target roles and
message-attribute mapping. All messages have a
nonempty attribute mapping containing the configured attributes; each
incremental `executeMessage` call supplies one selected attribute and its
value. The current contracts do not expose a getter for stored attribute
values, so the runner validates transaction inputs and task/message execution
state instead. Participant addresses are taken from the local Hardhat signers.
Incremental transaction CSV rows include the two addresses and attribute
ID/value passed to each execution.

These constraints follow the Solidity implementation:

- At least one message per task is required; no more than two are supported per
  task because `Activity` contains only `messageIn` and `messageOut`.
- At least one attribute is required because `executeMessage` checks that each
  message mapping has a nonempty attribute list.
- Batch runs require at least one control-flow element per task for the start
  element used in execution. Incremental runs use one start element for the
  seed task; subsequent task runtime records link to their preceding task.
- `setChoreography` combines all process initialization dimensions into one
  transaction. The contracts expose no independent participant registration,
  task-creation, or attribute-creation transactions, so those costs cannot be
  isolated from initialization gas.
- The contract checks that the supplied participant addresses are registered
  under the activity's role keys; it does not require the transaction sender
  to be one of those participants.

Invalid process shapes are rejected before any deployment. This matters for
independent or Cartesian-product runs: choose fixed baselines and values that
respect the message/task and element/task constraints.

## Configure

Edit [`config.js`](./config.js). The default is a small one-at-a-time run.

- `network`: must be `hardhat`. The experiment refuses other networks to avoid
  accidental public or persistent-chain transactions.
- `experiment.name`: prefix used for the timestamped report filenames.
- `experiment.strategy`:
  - `one-at-a-time` runs the baseline plus each enabled dimension value
    independently, holding all other dimensions at their baseline.
  - `combinations` runs the Cartesian product of enabled dimension values.
- `experiment.repetitions`: number of independent runs for each scenario.
- `experiment.maxScenarios`: optional maximum planned scenarios (not
  repetitions); defaults to 100. Scenario count and total runs are printed
  before any transaction is sent, and generation stops at the limit.
- `experiment.outputDirectory`: output directory, relative to the repository
  root unless absolute.
- `execution.mode`: `batch` to initialize all configured tasks/messages first,
  or `incremental` to seed one task/message and register one next pair during
  every execution.
- `execution.steps`: number of incremental `executeMessage` transactions.
  Incremental mode requires exactly two distinct participants, one baseline
  task and message, at least one baseline element, and at least one attribute
  per execution step. The baseline element count is set directly by
  `workload.baseline.elements`; those initialized elements are `START` elements.
  Participants, tasks, messages, and elements cannot vary as independent
  scenario dimensions.
- `execution.insertedElementType`: control-flow type inserted with each new
  incremental task. Supported values are `START`, `EX_JOIN`, `PAR_SPLIT`,
  `PAR_JOIN`, `EVENT_BASED`, and `TEMP`. The current fixture excludes `EX_SPLIT`
  because it needs edge conditions, and `END` because it cannot precede another
  task in this execution flow.
- `workload.baseline`: positive integer values for participants, messages,
  attributes, tasks, and elements. These fixed values are used for dimensions
  that are disabled or held constant by the `one-at-a-time` strategy.
- Each dimension has `enabled` and `values`. Enabled dimensions require a
  nonempty list of unique positive integers. Disabled dimensions use only their
  baseline, and their values are ignored.

The checked-in configuration runs a single requested flow: deploy
`contractLogic`, initialize one seed task and message with two participants and
ten available attributes, then perform 10 incremental executions. It starts
with one baseline element (`workload.baseline.elements`) and inserts a `START`
element for each new task (`execution.insertedElementType`). Every execution
uses one attribute and the same participant pair. To change the baseline
element count, edit `workload.baseline.elements`; to choose the inserted type,
edit `execution.insertedElementType`. To change the number of added
task/message/element triples, edit `execution.steps` and ensure there are at
least that many attributes. With 10 steps the run registers 10 new triples in
addition to its seed task/message and baseline elements.

To run an ordinary scaling experiment, set `execution.mode` to `batch`; then,
for example, to scale attributes alone, disable other dimensions and set
`attributes.enabled` to `true`. For a combined experiment, select
`combinations` and enable two or more dimensions. Ensure every Cartesian
combination is valid before running.

## Run

From the repository root, with the project dependencies installed:

```shell
npm run experiment:gas
```

This runs Hardhat's isolated in-memory network directly; no Hardhat node or web
application needs to be started. Each repetition uses a fresh `contractLogic`
deployment, so contract storage and execution history do not carry over between
measurements. The local Hardhat account nonce and chain block do continue
forward within a run; constructor/process gas is collected from the actual
receipts, not estimated. The repository's Hardhat network uses chain ID 1337
and Hardhat's deterministic default accounts. Transaction gas usage is
reproducible for a fixed workload and compiler configuration, while effective
gas prices and wei costs can vary with the network's block fee state.

Run the experiment infrastructure tests with:

```shell
npm run experiment:gas:test
```

## Measurements and reports

For every mined transaction, the transaction CSV records the scenario and
repetition, workload sizes, stage, contract/function, transaction hash, receipt
gas, effective gas price when available, wei transaction cost, status, and any
error. It includes deployment, process initialization, and each
message/task-execution transaction.

The scenario summary CSV has one row per scenario, with deployment and execution
gas reported separately, repetition statistics, status, and deployed contract
addresses. Mean gas and wei costs are integer averages rounded down; execution
gas standard deviation is population standard deviation. Per-repetition gas
values and transaction-level measurements remain available in the output files.
Failed or incomplete repetitions are included as failures; the command writes
reports and exits nonzero if any scenario fails.

All reported gas comes from `receipt.gasUsed`. Transaction costs use
`gasUsed × effectiveGasPrice` when the receipt supplies a gas price. The
experiment does not assume an ETH price or convert wei to fiat.

Reports are timestamped under `experiments/gas-costs/results/`:

- `*-summary.csv` — aggregated scenario summary.
- `*-transactions.csv` — raw transaction-level records.
- `*-report.md` — readable summary and transaction tables.
