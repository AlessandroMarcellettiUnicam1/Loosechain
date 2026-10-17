import updateUI from './UiUpdater';

/**
 * Sets up event listeners for the given contract. When the functionDone event is emitted, the UI is updated.
 *
 * @param contract - The contract instance to listen to.
 * @param modeler - The modeler instance to update the UI.
 */
export default function setupEventListeners(contract, modeler) {
  contract.events.functionDone().on('data', async () => {
    await updateUI(contract, modeler);
  });
}
