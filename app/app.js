import ChorJSModeler from 'chor-js/lib/Modeler';
import Reporter from './lib/validator/Validator.js';
import PropertiesPanelModule from 'bpmn-js-properties-panel';
import PropertiesProviderModule from './lib/provider';

import looseValuesModdleDescriptor from './lib/descriptors/loose-values.json';

import xml from './diagrams/CompositionCaseSim.bpmn';
import blankXml from './diagrams/newDiagram.bpmn';

import connectToBlockchain from './lib/blockchain/connection';
import { translateDiagram } from './lib/blockchain/Translator.js';
import setupEventListeners from './lib/blockchain/events';
import updateUI from './lib/blockchain/uiUpdater';

import Web3 from 'web3';
const { ethereum } = window;
const web3 = new Web3(ethereum);
let lastFile;
let isValidating = false;
let isDirty = false;
const numberOfInstance = [];
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
  if (window.localStorage.getItem('xml')) {
    await modeler.importXML(window.localStorage.getItem('xml'));
  } else {
    await modeler.importXML(newXml);
  }
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
  // const elements = modeler.get('elementRegistry')["_elements"];
  // for (const key in elements) {
  //   if (elements[key].element.type === 'bpmn:Choreography') {
  //     const id = elements[key].element.id;
  //     const idBytes = web3.utils.padRight(web3.utils.asciiToHex(id), 64);
  //     elements[key].element.businessObject.instanceNumberId = Number(await contract.methods.choInstanceListNumber(idBytes).call());
  //     elements[key].element.businessObject.instanceNumberId=3;
  //     console.log(elements[key].element.businessObject.instanceNumberId);
  //   }
  // }
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

  document.getElementById('js-set-cookie').addEventListener('click', function() {
    document.cookie = 'selectedOption=true; path=/; max-age=3600'; // Cookie expires in 1 hour
    this.style.display = 'none'; // Hide the button
    location.reload();
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
  if (document.cookie.split(';').some((item) => item.trim().startsWith('selectedOption='))) {
    document.getElementById('js-set-cookie').style.display = 'none';
    modeler.on('commandStack.connection.create.postExecuted', function(event) {
      const edgeAdded = event.context;
      const elementTarget = edgeAdded.target;
      if (elementTarget.businessObject.di.fill && elementTarget.businessObject.di.fill.includes('lightgreen')) {
        modeler.get('commandStack').undo();
      }
    });
  }
});


// listener for creating a new participant
// TODO quando creo un task i partecipanti devono essere vuoti
// TODO durante execution cambio l'oggetto partecipante del task
modeler.on('commandStack.participant.create.postExecuted', function(event) {

  if (event.context.name) {
    // event.context.created.name=event.context.name.substring(0,4);
    event.context.created.name='';
  }
});
modeler.on('commandStack.element.updateProperties.postExecuted', function(event) {

});
modeler.get('eventBus').on('element.changed', function(event) {
  const element = event.element;
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
  // Add your custom logic here
});
modeler.on('element.changed', function(event) {
  const element = event.element;
  // console.log(event)

  if (element.type === 'bpmn:Participant' && element.businessObject.name) {
    // console.log(`Participant name updated to: ${element.businessObject.name}`);
  }
});

window.onload = function() {
  if (document.cookie.split(';').some((item) => item.trim().startsWith('selectedOption='))) {
    document.getElementById('js-set-cookie').style.display = 'none';
  }
};
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
