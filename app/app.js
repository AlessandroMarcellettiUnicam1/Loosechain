import ChorJSModeler from 'chor-js/lib/Modeler';
import Reporter from './lib/validator/Validator.js';
import PropertiesPanelModule from 'bpmn-js-properties-panel';
import PropertiesProviderModule from './lib/provider';

import looseValuesModdleDescriptor from './lib/descriptors/loose-values.json';

import xml from './diagrams/EmergencyResponePlan_none.bpmn';
import blankXml from './diagrams/newDiagram.bpmn';

import connectToBlockchain from './lib/blockchain/connection';
import setupEventListeners from './lib/blockchain/events';
import updateUI from './lib/blockchain/uiUpdater';

import Web3 from 'web3';
const { ethereum } = window;
const web3 = new Web3(ethereum);
let lastFile;
let isValidating = false;
let isDirty = false;

// create and configure a chor-js instance
const modeler = new ChorJSModeler({
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

  //upload information into contract 
  document.getElementById('js-smart-contract').addEventListener('click',async() =>{

    console.log("cia9")
    const elements=modeler.get('elementRegistry')["_elements"];
 
    let activityList=[];
    
    let controlFlowElementList=[];
    let messagges=[];
    let messageAttributesList=[];
    let messageAttributesListKey=[];
    //TODO: figure out how to pass the address to the front-end for the participant list 
    let defaultAddress="0xf9F784267A3B39b926B9A98281CA22f0E5D11Baf";
    let addressKeyMappingList=[];
    let participantList=[];
    for(const e in elements){
      if(elements[e].element.type.includes("Task")){
        // console.log(elements[e].element) 
        let activity={
          id:"",
          name:"",
          initiator:"",
          target:"",
          idInElement:"",
          idOutElement:"",
          messageIn:"",
          messageOut:"",
          executed:false
        }
        const asciiResult=web3.utils.asciiToHex(elements[e].element.id);
        activity.id=web3.utils.padRight(asciiResult,64)
        activity.name=web3.utils.padRight(asciiResult,64)
        activity.initiator=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.participantRef[0].id),64);
        activity.target=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.participantRef[1].id),64);
        activity.idInElement=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.incoming[0].sourceRef.id),64);
        activity.idOutElement=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.outgoing[0].targetRef.id),64);
        if(elements[e].element.businessObject.messageFlowRef[1]){
          activity.messageIn=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.messageFlowRef[1].messageRef.id),64);
          activity.messageOut=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.messageFlowRef[0].messageRef.id),64);
        }else{
          activity.messageIn=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.messageFlowRef[0].messageRef.id),64);
          activity.messageOut=web3.utils.padRight(0,64);
        }
        activityList.push(activity);
        let participantElement={
          keyMapping:"",
          address:[]
        }
          if (!addressKeyMappingList.includes(activity.initiator)){
            participantElement.keyMapping=activity.initiator;
            participantElement.address.push(defaultAddress);
            participantList.push(participantElement)
            addressKeyMappingList.push(activity.initiator)
          }else if(!addressKeyMappingList.includes(activity.target)){
            participantElement.keyMapping=activity.target;
            participantElement.address.push(defaultAddress);
            participantList.push(participantElement)
            addressKeyMappingList.push(activity.target);
          }
          //TODO List of message attributes 
      }else if(elements[e].element.type.includes("Message")){
        // console.log(elements[e].element) 
        let message={
          id:"",
          name:"",
          mappingKey:"",
          selectedAttr:[],
          sourceParticipant:"",
          targetParticipant:"",
          idActivity:"",
          executed:false
        }
        const asciiResult=web3.utils.asciiToHex(elements[e].element.id);
        message.id=web3.utils.padRight(asciiResult,64)
        message.name=web3.utils.padRight(asciiResult,64)
        message.mappingKey=web3.utils.padRight(0,64);
        message.sourceParticipant="0xDc5796010883B712413fC0b97F257d724088eD37";
        message.targetParticipant="0xDc5796010883B712413fC0b97F257d724088eD37";
        activityList.forEach((e)=>{
          if(e.messageIn.includes(message.id)){
            message.idActivity=e.id;
          }else if (e.messageOut.includes(message.id)){
            message.idActivity=e.id;
          }
        })
        messagges.push(message);
        let messageAttributeStruct={
          keyMapping:"",
          attributes:[]
        }
        if (elements[e].element.businessObject.get('messageItems')[0] && !messageAttributesListKey.includes(elements[e].element.businessObject.get('messageItems'))){
          messageAttributeStruct.keyMapping=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.get('messageItems')[0].name),64);
          elements[e].element.businessObject.get('attributeItems').forEach((attrbute)=>{
            messageAttributeStruct.attributes.push(web3.utils.padRight(web3.utils.asciiToHex(attrbute.name),64))
          })
          messageAttributesList.push(messageAttributeStruct)
          messageAttributesListKey.push(elements[e].element.businessObject.get('messageItems')[0].name)
        }
      }else if(elements[e].element.type.includes("Event") ||elements[e].element.type.includes("Gateway")){
        // console.log(elements[e].element)
        let typeList=["bpmn:StartEvent","bpmn:ExclusiveGateway","bpmn:EndEvent","bpmn:ParallelGateway","bpmn:EventBasedGateway"]
        let controlFlowElement={
          id:"",
          type:"",
          incomingActivity:[],
          outgoingActivity:[],
          executed:false
        }
        const asciiResult=web3.utils.asciiToHex(elements[e].element.id);
        controlFlowElement.id=web3.utils.padRight(asciiResult,64)
        if(elements[e].element.type.includes("bpmn:StartEvent")){
          controlFlowElement.type="0"
        }else if(elements[e].element.type.includes("bpmn:ExclusiveGateway")){
          if(elements[e].element.businessObject.name="SPLIT"){
            controlFlowElement.type="1"
          }else{
            controlFlowElement.type="2"
          }
        }else if(elements[e].element.type.includes("bpmn:ParallelGateway")){
          if(elements[e].element.businessObject.name="SPLIT"){
            controlFlowElement.type="3"
          }else{
            controlFlowElement.type="4"
          }
        }else if(elements[e].element.type.includes("bpmn:EventBasedGateway")){
          controlFlowElement.type="5"
        }else if(elements[e].element.type.includes("bpmn:EndEvent")){
          controlFlowElement.type="6"
        }
        if(elements[e].element.businessObject.outgoing){
          elements[e].element.businessObject.outgoing.forEach((ref)=>{
            controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.targetRef.id),64))
          })
        }
        if(elements[e].element.businessObject.incoming){
          elements[e].element.businessObject.incoming.forEach((ref)=>{
            controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.sourceRef.id),64))
          })
        }
        controlFlowElementList.push(controlFlowElement);
      }
    }
    // console.log(messageAttributesList)
    // console.log(participantList)
    let activityResult="[";
    activityList.forEach((element)=>{
      activityResult+=JSON.stringify([
        element.id,
        element.name,
        element.initiator,
        element.target,
        element.idInElement,
        element.idOutElement,
        element.messageIn,
        element.messageOut,
        element.executed
      ])+","
    })
    activityResult=activityResult.substring(0,activityResult.length-1)
    activityResult+="],"
    let messaggesResult="[";
    messagges.forEach(element=>{
      messaggesResult+=JSON.stringify([
        element.id,
        element.name,
        element.mappingKey,
        element.selectedAttr,
        element.sourceParticipant,
        element.targetParticipant,
        element.idActivity,
        element.executed
      ])+","
    })
    messaggesResult=messaggesResult.substring(0,messaggesResult.length-1);
    messaggesResult+="],";
    let participantListResult="[";
    participantList.forEach(element=>{
      participantListResult+=JSON.stringify([
        element.keyMapping,
        element.address
      ])+","
    })
    participantListResult=participantListResult.substring(0,participantListResult.length-1);
    participantListResult+="],";
    let messageAttributesResult="[";
    messageAttributesList.forEach((element)=>{
      messageAttributesResult+=JSON.stringify([
        element.keyMapping,
        element.attributes
      ])+","
    })
    messageAttributesResult=messageAttributesResult.substring(0,messageAttributesResult.length-1);
    messageAttributesResult+="],";
    console.log(messageAttributesResult)
    let controlFlowElementListResult="[";
    controlFlowElementList.forEach((element)=>{
      controlFlowElementListResult+=JSON.stringify([
        element.id,
        element.type,
        element.incomingActivity,
        element.outgoingActivity,
        element.executed
      ])+","
    })
    controlFlowElementListResult=controlFlowElementListResult.substring(0,controlFlowElementListResult.length-1);
    controlFlowElementListResult+="],";
    let edgeConditionResult="[]";
    let totalResult;
    totalResult=activityResult+messaggesResult+participantListResult+messageAttributesResult+controlFlowElementListResult+edgeConditionResult;
    console.log(totalResult)
  })

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
});

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
