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
import xml from './diagrams/CompositionCaseSim.bpmn';
import blankXml from './diagrams/newDiagram.bpmn';

import connectToBlockchain from './lib/blockchain/connection';
import { translateDiagram } from './lib/blockchain/Translator.js';
import setupEventListeners from './lib/blockchain/events';
import updateUI from './lib/blockchain/uiUpdater';

import Web3 from 'web3';
import { isInitiating } from 'chor-js/lib/util/BandUtil.js';

const { ethereum } = window;
export const accountAddress='0x837683436fa30Fe74070a6C1fd5122D9F39FBc89';
const web3 = new Web3(ethereum);
let lastFile;
let isValidating = false;
let isDirty = false;
let numberOfInstance;
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

  // console.log(numberOfInstance)

  if (window.localStorage.getItem('xml')) {
    await modeler.importXML(window.localStorage.getItem('xml'));
  } else {
    await modeler.importXML(newXml);
  }
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
  // initialize the blockchain connection and set up event listeners
  const contract = await connectToBlockchain();

  if (contract) {
    setupEventListeners(contract, modeler);
    await updateUI(contract, modeler);

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
    localStorage.clear();
  });




  document.querySelector('[data-entry="instanceNumberId"]').addEventListener('click', e => {
    const canva=modeler.get('canvas');
    const rootElement=canva.getRootElement();
    const id= rootElement.id;
    const idBytes = web3.utils.padRight(web3.utils.asciiToHex(id), 64);
    contract.methods.choInstanceListNumber(idBytes).call().then(result=>{
      const numberOfInstance=[];
      result.forEach(i => {
        numberOfInstance.push({ name: i, value: i });
      });

      modeler.get('eventBus').fire('element.changed', {
        element: rootElement,
        numberOfInstance: numberOfInstance
      });
    });
  });
  // contract.methods.choInstanceListNumber(idBytes).call().then(instanceNumberId => {
  //   for (let i = 0; i <= Number(instanceNumberId); i++) {
  //     numberOfInstance.push({ name: i, value: i });
  //   }

  //   modeler.get('eventBus').fire('element.changed', {
  //     element: rootElement,
  //     numberOfInstance: numberOfInstance
  // });
  // });

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
  document.getElementById('js-smart-contract').addEventListener('click',async () =>{
    translateDiagram(modeler,contract);
  });

  document.getElementById('js-save-progress').addEventListener('click',async () =>{
    const result = await modeler.saveXML({ format: true });
    window.localStorage.setItem('xml',result.xml);
    location.reload();
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
  if (event.numberOfInstance) {
    document.getElementById('camunda-instanceNumberId-select').innerHTML = event.numberOfInstance.map(instance => `<option value="${cleanData(instance.value)}">${cleanData(instance.name)}</option>`).join('');
  }
});
function cleanData(bytes32) {
  return web3.utils.hexToAscii(bytes32).split('+')[1]?web3.utils.hexToAscii(bytes32).split('+')[1]:web3.utils.hexToAscii(bytes32);

}


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
renderModel(xml);
