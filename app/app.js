import ChorJSModeler from 'chor-js/lib/Modeler';
import Reporter from './lib/validator/Validator.js';
import PropertiesPanelModule from 'bpmn-js-properties-panel';
import PropertiesProviderModule from './lib/provider';

import looseValuesModdleDescriptor from './lib/descriptors/loose-values.json';

import xml from './diagrams/SelectionCase01.bpmn';
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


    const elements=modeler.get('elementRegistry')["_elements"];
    let activityList=[];
    
    let controlFlowElementList=[];
    let messagges=[];
    let messageAttributesList=[];
    //TODO: figure out how to pass the address to the front-end for the participant list 
    let addressKeyMappingList=[];
    let participantList=[];
    let keyMappingParticipants=[];
    let edgeConditionList=[];
    let subChoreographyList=[];

    for(const e in elements){
      if(elements[e].element.type.includes("Task")){
        let activity={
          id:"",
          name:"",
          initiator:"",
          target:"",
          idInElement:"",
          idOutElement:"",
          messageIn:"",
          messageOut:"",
          executed:false,
          tempState:false
        }
        
        const asciiResult=web3.utils.asciiToHex(elements[e].element.id);
        activity.id=web3.utils.padRight(asciiResult,64)
        activity.name=web3.utils.padRight(asciiResult,64)
        activity.initiator=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.participantRef[0].name),64);
        activity.target=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.participantRef[1].name),64);
        if(elements[e].element.businessObject.incoming && elements[e].element.businessObject.incoming.length>0){
          activity.idInElement=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.incoming[0].sourceRef.id),64);
        }else{
          activity.idInElement=web3.utils.padRight(0,64);
        }

        if(elements[e].element.businessObject.outgoing && elements[e].element.businessObject.outgoing.length>0){
          activity.idOutElement=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.outgoing[0].targetRef.id),64);
        }else{
          activity.idOutElement=web3.utils.padRight(0,64);
        }
        if(elements[e].element.businessObject.messageFlowRef[1]){
          activity.messageIn=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.messageFlowRef[1].messageRef.id),64);
          activity.messageOut=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.messageFlowRef[0].messageRef.id),64);
        }else{
          activity.messageIn=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.messageFlowRef[0].messageRef.id),64);
          activity.messageOut=web3.utils.padRight(0,64);
        }
        activityList.push(activity);
        console.log(elements[e].element)
        if(elements[e].element.businessObject.participantRef[0].participantItems){
          console.log(elements[e].element.businessObject)

          if (!addressKeyMappingList.includes(activity.initiator)){
            participantList.push({
              keyMapping:activity.initiator,
              addr:elements[e].element.businessObject.participantRef[0].participantItems.map(e=>e.name)
            })
            addressKeyMappingList.push(activity.initiator)
          }
          if(!addressKeyMappingList.includes(activity.target)){

            participantList.push({
              keyMapping:activity.target,
              addr:elements[e].element.businessObject.participantRef[1].participantItems.map(e=>e.name)
          })
            addressKeyMappingList.push(activity.target);
          }
        }else if(participantList.length<1){
          let participantAddress=[];
          
          elements[e].element.businessObject.$parent.participantItems.forEach(e=>{
            participantAddress.push(e.name)
          })
          elements[e].element.businessObject.$parent.participants.forEach(e=>{
            if(!keyMappingParticipants.includes(e.name)){
              keyMappingParticipants.push(e.name);
              participantList.push({
                addr:participantAddress,
                keyMapping:web3.utils.padRight(web3.utils.asciiToHex(e.name),64)
              })
            }
          })


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
          executed:false,
          tempState:false
        }
        const asciiResult=web3.utils.asciiToHex(elements[e].element.id);
        message.id=web3.utils.padRight(asciiResult,64)
        message.name=web3.utils.padRight(asciiResult,64)
        message.mappingKey=web3.utils.padRight(0,64);

        message.sourceParticipant="0x0000000000000000000000000000000000000000";
        message.targetParticipant="0x0000000000000000000000000000000000000000";
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
        if (elements[e].element.businessObject.get('messageItems').length>0){
          let splitString=elements[e].element.businessObject.get('messageItems')[0].name.split("(");
          messageAttributeStruct.keyMapping=web3.utils.padRight(web3.utils.asciiToHex(splitString[0]),64);
          let splitCut=splitString[1].substring(0,splitString[1].length-1).split(",");
          splitCut.forEach((e)=>{
            messageAttributeStruct.attributes.push(web3.utils.padRight(web3.utils.asciiToHex(e),64));
          })
          messageAttributesList.push(messageAttributeStruct);
        }else{
          //TODO how store the messagge and the attrbutes in the case of composition
          //we thought about a sigle key mapping for all attributes but we have multiple key mapping (one for each messages) 
          //for all the attributes 
          if(messageAttributesList.length==0){
            if(elements[e].element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography')){
              let attributes=elements[e].element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').attributeItems.map(item=>item.name).map(item=>web3.utils.padRight(web3.utils.asciiToHex(item),64));
              let keyMappings=elements[e].element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').messageItems.map(item=>item.name).map(item=>web3.utils.padRight(web3.utils.asciiToHex(item),64));
            
                keyMappings.forEach((element)=>{
                  messageAttributesList.push({
                    attributes:attributes,
                    keyMapping:element
                  });
                })
            }
          }
        }
      }else if(elements[e].element.type.includes("Event") ||elements[e].element.type.includes("Gateway")){
        let typeList=["bpmn:StartEvent","bpmn:ExclusiveGateway","bpmn:EndEvent","bpmn:ParallelGateway","bpmn:EventBasedGateway"]
        let controlFlowElement={
          id:"",
          tipo:"",
          incomingActivity:[],
          outgoingActivity:[],
          executed:false
        }
        const asciiResult=web3.utils.asciiToHex(elements[e].element.id);
        controlFlowElement.id=web3.utils.padRight(asciiResult,64)
        if(elements[e].element.type.includes("bpmn:StartEvent")){
          controlFlowElement.tipo="0"
        }else if(elements[e].element.type.includes("bpmn:ExclusiveGateway")){
          if(elements[e].element.businessObject.incoming && elements[e].element.businessObject.incoming.length==1 && elements[e].element.businessObject.outgoing.length>1 ){
            controlFlowElement.tipo="1"
          }else if(elements[e].element.businessObject.incoming && elements[e].element.businessObject.incoming.length>1 && elements[e].element.businessObject.outgoing.length==1 ){
            controlFlowElement.tipo="2"
          }else{
            controlFlowElement.tipo="7"
          }
        }else if(elements[e].element.type.includes("bpmn:ParallelGateway")){
          if(elements[e].element.businessObject.incoming.length==1 && elements[e].element.businessObject.outgoing.length>1 ){
            controlFlowElement.tipo="3"
          }else if(elements[e].element.businessObject.incoming.length>1 && elements[e].element.businessObject.outgoing.length==1){
            controlFlowElement.tipo="4"
          }
        }else if(elements[e].element.type.includes("bpmn:EventBasedGateway")){
          controlFlowElement.tipo="5"
        }else if(elements[e].element.type.includes("bpmn:EndEvent")){
          controlFlowElement.tipo="6"
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
      }else if(elements[e].element.type.includes("bpmn:SequenceFlow")){
        let edgeCondition={
          attribute:"",
          comparisonValue:"",
          condition:"",
          idActivity:""
        }
        if(elements[e].element.businessObject.name){
          let condtionType=["GREATER","LESS","EQUAL","GREATEREQUAL","LESSEQUAL"]
          let stringcondition=elements[e].element.businessObject.name.split(" ");
          edgeCondition.attribute=web3.utils.padRight(web3.utils.asciiToHex(stringcondition[0]),64);
          edgeCondition.comparisonValue=web3.utils.padRight(web3.utils.asciiToHex(stringcondition[2]),64);
          edgeCondition.condition=condtionType.indexOf(stringcondition[1].toUpperCase())
          if(elements[e].element.businessObject.targetRef.$type){
            edgeCondition.idActivity=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.targetRef.id),64);
          }
          edgeConditionList.push(edgeCondition)
        }
      }else if(elements[e].element.type.includes("bpmn:SubChoreography")){
        let elementContained=elements[e].element.businessObject.flowElements.
        filter(e=>e.$type.includes("bpmn:SequenceFlow")||
              e.$type.includes("Event")||
              e.$type.includes("Gateway")||
              e.$type.includes("Message")||
              e.$type.includes("Task")).
        map(e=>web3.utils.padRight(web3.utils.asciiToHex(e.id),64));
        console.log(elementContained)
        subChoreographyList.push({
          executed:false,
          id:web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.id),64),
          elementId:elementContained
        })
      }
    }
    // console.log(messageAttributesList)
    // console.log(participantList)
    // let activityResult="[";
    // activityList.forEach((element)=>{
      
    // })
    // activityResult=activityResult.substring(0,activityResult.length-1)
    // activityResult+="]"
    // let messaggesResult="[";
    // messagges.forEach(element=>{
    //   messaggesResult+=JSON.stringify([
    //     element.id,
    //     element.name,
    //     element.mappingKey,
    //     element.selectedAttr,
    //     element.sourceParticipant,
    //     element.targetParticipant,
    //     element.idActivity,
    //     element.executed
    //   ])+","
    // })
    // messaggesResult=messaggesResult.substring(0,messaggesResult.length-1);
    // messaggesResult+="]";
    // let participantListResult="[";
    // participantList.forEach(element=>{
    //   participantListResult+=JSON.stringify([
    //     element.keyMapping,
    //     element.address
    //   ])+","
    // })
    // participantListResult=participantListResult.substring(0,participantListResult.length-1);
    // participantListResult+="]";
    // let messageAttributesResult="[";
    // messageAttributesList.forEach((element)=>{
    //   messageAttributesResult+=JSON.stringify([
    //     element.keyMapping,
    //     element.attributes
    //   ])+","
    // })
    // messageAttributesResult=messageAttributesResult.substring(0,messageAttributesResult.length-1);
    // messageAttributesResult+="]";
    // let controlFlowElementListResult="[";
    // controlFlowElementList.forEach((element)=>{
    //   controlFlowElementListResult+=JSON.stringify([
    //     element.id,
    //     element.type,
    //     element.incomingActivity,
    //     element.outgoingActivity,
    //     element.executed
    //   ])+","
    // })
    // controlFlowElementListResult=controlFlowElementListResult.substring(0,controlFlowElementListResult.length-1);
    // controlFlowElementListResult+="]";
    // let edgeConditionResult="[]";
    // let totalResult;
    // totalResult=activityResult+messaggesResult+participantListResult+messageAttributesResult+controlFlowElementListResult+edgeConditionResult;
    // console.log(totalResult)
    // console.log(controlFlowElementListResult)

    console.log(activityList)
    console.log(messagges)
    console.log(participantList)
    console.log(messageAttributesList)
    console.log(controlFlowElementList)
    console.log(edgeConditionList)
    console.log(subChoreographyList)

    //TODO metodo Web3 per leggere l'address direttamente 
    await contract.methods.setInformation(activityList,messagges,participantList,messageAttributesList,controlFlowElementList,edgeConditionList,subChoreographyList).send({from:"0xcCAC66062051Ac9E445A2b59B239938483F88E70"})
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
