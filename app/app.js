import ChorJSModeler from 'chor-js/lib/Modeler';
import Reporter from './lib/validator/Validator.js';
import PropertiesPanelModule from 'bpmn-js-properties-panel';
import PropertiesProviderModule from './lib/provider';
import ChoreoModeling from 'chor-js/lib/features/modeling';
import CreateParticipantBandHandler from 'chor-js/lib/features/modeling/cmd/CreateParticipantBandHandler.js';
import ChangeParticipantBandHandler from 'chor-js/lib/features/modeling/cmd/ChangeParticipantBandHandler.js';
import looseValuesModdleDescriptor from './lib/descriptors/loose-values.json';
import { updateParticipantBandKinds } from 'chor-js/lib/features/modeling/cmd/ChangeParticipantBandHandler.js';
import BpmnPropertiesProvider from 'bpmn-js-properties-panel/lib/provider/bpmn/BpmnPropertiesProvider';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import { is } from 'bpmn-js/lib/util/ModelUtil';
//import xml from './diagrams/CompositionCaseSim.bpmn';
import xml from './diagrams/newDiagram.bpmn';
import blankXml from './diagrams/newDiagram.bpmn';

import connectToBlockchain from './lib/blockchain/Connection';
import { translateDiagram } from './lib/blockchain/Translator.js';
import updateUI from './lib/blockchain/UiUpdater';
import { getDiagram, getDiagrams, saveDiagram } from './lib/diagram-storage';
import { blockchainChainId, blockchainTarget } from './lib/blockchain/Contract';
import { refreshInstanceOptions } from './lib/blockchain/InstanceNumbers';
import { isInitiating } from 'chor-js/lib/util/BandUtil.js';

let lastFile;
let isValidating = false;
let isDirty = false;
let contract;
let notificationTimeout;

function showNotification(message, type = 'info') {
  const notification = document.getElementById('app-notification');
  const notificationMessage = document.getElementById('app-notification-message');
  if (!notification || !notificationMessage) {
    return;
  }
  notificationMessage.textContent = message;
  notification.className = `app-notification ${type}`;
  notification.hidden = false;
  window.clearTimeout(notificationTimeout);
  notificationTimeout = window.setTimeout(() => {
    notification.hidden = true;
  }, type === 'success' ? 12000 : 10000);
}

window.addEventListener('loosechain:notification', event => {
  showNotification(event.detail.message, event.detail.type);
});
document.getElementById('app-notification-close').addEventListener('click', () => {
  document.getElementById('app-notification').hidden = true;
  window.clearTimeout(notificationTimeout);
});
// create and configure a chor-js instance
export const modeler = new ChorJSModeler({
  container: '#canvas',
  propertiesPanel: {
    parent: '#properties-panel'
  },
  additionalModules: [
    PropertiesPanelModule,
    PropertiesProviderModule
  ],
  keyboard: {
    bindTo: document
  },
  moddleExtensions: {
    looseValues : looseValuesModdleDescriptor
  }
});

// display the given model (XML representation)
async function renderModel(newXml) {
  await modeler.importXML(newXml);
  // const canva=modeler.get('canvas');
  // const rootElement=canva.getRootElement();
  // console.log(rootElement);
  // const id= rootElement.id;
  // const idBytes = web3.utils.padRight(web3.utils.asciiToHex(id), 64);
  // const contract1 = await connectToBlockchain();
  // numberOfInstance=await contract1.methods.choInstanceListNumber(idBytes).call();
  isDirty = false;
}

// returns the file name of the diagram currently being displayed
function diagramName() {
  if (lastFile) {
    return lastFile.name;
  }
  return 'diagram.bpmn';
}

document.addEventListener('DOMContentLoaded', async () => {
  const legacyDraft = window.localStorage.getItem('xml');
  try {
    await renderModel(legacyDraft || xml);
    if (legacyDraft) {
      window.localStorage.removeItem('xml');
    }
  } catch (error) {
    console.error('Could not load the BPMN diagram.', error);
    showNotification(`Could not load the BPMN diagram: ${error.message}`, 'error');
  }

  // download diagram as XML
  const downloadLink = document.getElementById('js-download-diagram');
  downloadLink.addEventListener('click', async e => {
    const result = await modeler.saveXML({ format: true });
    downloadLink['href'] = 'data:application/bpmn20-xml;charset=UTF-8,' + encodeURIComponent(result.xml);
    downloadLink['download'] = diagramName();
    isDirty = false;
  });

  // download diagram as SVG
  const downloadSvgLink = document.getElementById('js-download-svg');
  downloadSvgLink.addEventListener('click', async e => {
    const result = await modeler.saveSVG();
    downloadSvgLink['href'] = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(result.svg);
    downloadSvgLink['download'] = diagramName() + '.svg';
  });

  // open file dialog
  document.getElementById('js-open-file').addEventListener('click', e => {
    document.getElementById('file-input').click();
  });

  const savedDiagrams = document.getElementById('js-saved-diagrams');
  let activeSavedDiagramId = '';
  const refreshSavedDiagrams = async selectedId => {
    const diagrams = await getDiagrams();
    savedDiagrams.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = diagrams.length ? 'Select saved diagram' : 'No saved diagrams';
    savedDiagrams.appendChild(placeholder);

    diagrams.forEach(diagram => {
      const option = document.createElement('option');
      option.value = diagram.id;
      option.textContent = `${diagram.name} (${new Date(diagram.updatedAt).toLocaleString()})`;
      savedDiagrams.appendChild(option);
    });

    if (selectedId !== undefined) {
      savedDiagrams.value = String(selectedId);
    }
  };

  try {
    await refreshSavedDiagrams();
  } catch (error) {
    console.error('Could not load locally saved diagrams.', error);
    window.alert(`Could not load locally saved diagrams: ${error.message}`);
  }

  savedDiagrams.addEventListener('change', async () => {
    const selectedId = savedDiagrams.value;
    if (!selectedId) {
      activeSavedDiagramId = '';
      return;
    }

    if (isDirty && !window.confirm('Loading this saved diagram will discard unsaved changes. Continue?')) {
      savedDiagrams.value = activeSavedDiagramId;
      return;
    }

    savedDiagrams.disabled = true;
    try {
      const diagram = await getDiagram(Number(selectedId));
      if (!diagram) {
        throw new Error('The selected saved diagram could not be found.');
      }
      await renderModel(diagram.xml);
      lastFile = { name: diagram.name };
      activeSavedDiagramId = selectedId;
    } catch (error) {
      savedDiagrams.value = activeSavedDiagramId;
      console.error('Could not load the selected BPMN diagram.', error);
      window.alert(`Could not load the selected BPMN diagram: ${error.message}`);
    } finally {
      savedDiagrams.disabled = false;
    }
  });




  // toggle side panels
  const panels = Array.prototype.slice.call(
    document.getElementById('panel-toggle').children
  );
  panels.forEach(panel => {
    panel.addEventListener('click', () => {
      panels.forEach(otherPanel => {
        if (panel === otherPanel && !panel.classList.contains('active')) {
          // show clicked panel if it is not already active, otherwise hide it as well
          panel.classList.add('active');
          document.getElementById(panel.dataset.togglePanel).classList.remove('hidden');
        } else {
          // hide all other panels
          otherPanel.classList.remove('active');
          document.getElementById(otherPanel.dataset.togglePanel).classList.add('hidden');
        }
      });
    });
  });

  // upload information into contract
  const uploadButton = document.getElementById('js-smart-contract');
  uploadButton.addEventListener('click', async () => {
    uploadButton.disabled = true;
    try {
      contract = contract || await connectToBlockchain();
      const receipt = await translateDiagram(modeler, contract);
      const transactionHash = receipt.transactionHash || receipt.hash || 'unavailable';
      let successMessage = `BPMN upload confirmed in block ${receipt.blockNumber}; transaction ${transactionHash}.`;
      try {
        const choreography = modeler.get('elementRegistry').getAll()
          .find(element => element.type === 'bpmn:Choreography');
        if (choreography) {
          const count = await refreshInstanceOptions(choreography, contract, modeler, true);
          successMessage += ` ${count} instance${count === 1 ? '' : 's'} are now available.`;
        }
        await updateUI(contract, modeler);
      } catch (refreshError) {
        console.error('The BPMN upload succeeded, but the diagram state could not be refreshed.', refreshError);
        successMessage += ` The upload succeeded, but the editor could not refresh contract state: ${refreshError.message}`;
      }
      showNotification(successMessage, 'success');
    } catch (error) {
      console.error('Could not upload the selected BPMN diagram.', error);
      showNotification(`Could not upload the selected BPMN diagram: ${error.message}`, 'error');
    } finally {
      uploadButton.disabled = false;
    }
  });

  document.getElementById('js-save-progress').addEventListener('click',async () =>{
    try {
      const name = window.prompt('Name this BPMN diagram:', diagramName());
      if (name === null) {
        return;
      }
      const trimmedName = name.trim();
      if (!trimmedName) {
        window.alert('Please enter a name for this BPMN diagram.');
        return;
      }
      const result = await modeler.saveXML({ format: true });
      const id = await saveDiagram(trimmedName, result.xml);
      await refreshSavedDiagrams(id);
      activeSavedDiagramId = String(id);
      isDirty = false;
    } catch (error) {
      console.error('Could not save the BPMN diagram locally.', error);
      window.alert(`Could not save the BPMN diagram locally: ${error.message}`);
    }
  });

  const lockClosed = document.getElementById('lock-closed');
  const lockOpened = document.getElementById('lock-opened');

  lockClosed.addEventListener('click', () => {
    lockClosed.setAttribute('button-value', 'false');
    lockClosed.style.display = 'none';
    lockOpened.style.display = 'inline-block';
  });

  lockOpened.addEventListener('click', () => {
    lockClosed.setAttribute('button-value', 'true');

    lockOpened.style.display = 'none';
    lockClosed.style.display = 'inline-block';
  });

  // create new diagram
  const newDiagram = document.getElementById('js-new-diagram');
  newDiagram.addEventListener('click', async e => {
    await renderModel(blankXml);
    lastFile = false;
  });

  // load diagram from disk
  const loadDiagram = document.getElementById('file-input');
  loadDiagram.addEventListener('change', e => {
    const file = loadDiagram.files[0];
    if (file) {
      const reader = new FileReader();
      lastFile = file;
      reader.addEventListener('load', async () => {
        await renderModel(reader.result);
        loadDiagram.value = null; // allows reloading the same file
      }, false);
      reader.readAsText(file);
    }
  });

  // drag & drop file
  const dropZone = document.body;
  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('is-dragover');
  });
  dropZone.addEventListener('dragleave', e => {
    e.preventDefault();
    dropZone.classList.remove('is-dragover');
  });
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('is-dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      lastFile = file;
      reader.addEventListener('load', () => {
        renderModel(reader.result);
      }, false);
      reader.readAsText(file);
    }
  });

  // validation logic and toggle
  const reporter = new Reporter(modeler);
  const validateButton = document.getElementById('js-validate');
  validateButton.addEventListener('click', e => {
    isValidating = !isValidating;
    if (isValidating) {
      reporter.validateDiagram();
      validateButton.classList.add('selected');
      validateButton['title'] = 'Disable checking';
    } else {
      reporter.clearAll();
      validateButton.classList.remove('selected');
      validateButton['title'] = 'Check diagram for problems';
    }
  });
  modeler.on('commandStack.changed', () => {
    if (isValidating) {
      reporter.validateDiagram();
    }
    isDirty = true;
  });
  modeler.on('import.render.complete', () => {
    if (isValidating) {
      reporter.validateDiagram();
    }
    if (contract) {
      updateUI(contract, modeler).catch(error => {
        console.error('Could not refresh the editor from contract state.', error);
        showNotification(`Could not refresh the editor from contract state: ${error.message}`, 'error');
      });
    }
  });
  // TODO rimettere la funzione bloccante
  modeler.on('commandStack.connection.create.preExecuted', function(event) {
    console.log(event)
    // if (lockClosed.getAttribute('button-value') === 'true') {
    //   const edgeAdded = event.context;
    //   const elementTarget = edgeAdded.target;
    //   if (elementTarget.businessObject.di.fill && elementTarget.businessObject.di.fill.includes('lightgreen')) {
    //     modeler.get('commandStack').undo();
    //   }
    // }
  });
  modeler.on('commandStack.connection.create.postExecuted', function(event) {
    if(lockClosed.getAttribute('button-value')){
      console.log("true")
    }
    if (lockClosed.getAttribute('button-value') === 'true') {
      
      const edgeAdded = event.context;
      const elementTarget = edgeAdded.target;
      console.log(elementTarget.businessObject.di.fill)
      if (elementTarget.businessObject.di.fill && elementTarget.businessObject.di.fill.includes('lightgreen')) {
        modeler.get('commandStack').undo();
      }
    }
  });

  try {
    contract = await connectToBlockchain();
    await updateUI(contract, modeler);
    showNotification(`Connected to the ${blockchainTarget} blockchain (chain ${blockchainChainId}); deployed contract verified.`, 'success');
  } catch (error) {
    console.error('Could not connect to the configured smart contract.', error);
    showNotification(`Smart contract connection unavailable: ${error.message}`, 'error');
  }
});


// listener for creating a new participant
// TODO quando creo un task i partecipanti devono essere vuoti
// TODO durante execution cambio l'oggetto partecipante del task

modeler.get('eventBus').on('element.changed', function(event) {
  const element = event.element;
  const modeling = modeler.get('modeling');
  if (event.additionalParam) {
    const elements = modeler.get('elementRegistry').filter(el => el.businessObject.id === element.id);
    elements.forEach(el => {
      modeler.get('commandStack').execute('element.updateProperties', {
        element: el,
        properties: {
          name: ''
        }
      });
    });
  }
});


modeler.get('eventBus').on('commandStack.shape.create.postExecuted', function(event) {
  if (is(event.context.shape.businessObject, 'bpmn:ChoreographyActivity')) {
    const changeParticipantBandHandler = new ChangeParticipantBandHandler(modeler.get('injector'),modeler.get('modeling'), modeler.get('commandStack'));
    const createParticipantBandHandler = new CreateParticipantBandHandler(modeler.get('injector'),modeler.get('canvas'),modeler.get('bpmnFactory'),modeler.get('elementFactory'),modeler.get('moddle'),modeler.get('modeling'));
    changePartipant(createParticipantBandHandler,changeParticipantBandHandler,0,event,true);
    changePartipant(createParticipantBandHandler,changeParticipantBandHandler,1,event,false);
  }
});

function changePartipant(createBandHandler,changeParticipantHandler,index,event,isInitiating) {
  const context = {
    activityShape: event.context.shape,
    bandShape:event.context.shape.bandShapes[index],
    delete:false,
    index:index,
    isInitiating:isInitiating,
    participant:event.context.shape.bandShapes[index].businessObject,
  };
  createBandHandler.preExecute(context);
  changeParticipantHandler.preExecute(context);
  try {
    context.newParticipant.name='';
  } catch (e) {
    console.log(e);
  }
  changeParticipantHandler.execute(context);
  changeParticipantHandler.postExecute(context);
}



// expose bpmnjs to window for debugging purposes
window.bpmnjs = modeler;

window.addEventListener('beforeunload', function(e) {
  if (isDirty) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
    e.preventDefault();
    e.returnValue = '';
  }
});
