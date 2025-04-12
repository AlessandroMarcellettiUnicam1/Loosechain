import connectToBlockchain from './connection';
import { accountAddress } from '../../app';
import Web3 from 'web3';
const { ethereum } = window;
const web3 = new Web3(ethereum);

let isDirty = false;
export async function translateDiagram(modeler, contract) {
  // const contract = await connectToBlockchain();
  const elements = modeler.get('elementRegistry')["_elements"];
  let activityList = [];

  let controlFlowElementList = [];
  let messagges = [];
  let messageAttributesList = [];
  // TODO: figure out how to pass the address to the front-end for the participant list 
  let addressKeyMappingList = [];
  let participantList = [];
  let keyMappingParticipants = [];
  let edgeConditionList = [];
  let subChoreographyList = [];
  let idChoreography;
  let idInstance;
  for (const e in elements) {
    if (elements[e].element.type.includes("Task")) {
      createActivity(elements[e], activityList, addressKeyMappingList, participantList, keyMappingParticipants)
    } else if (elements[e].element.type.includes("Message")) {
      createMessage(elements[e], messagges, activityList, messageAttributesList)
    } else if (elements[e].element.type.includes("Event") || elements[e].element.type.includes("Gateway")) {
      createGatewayElement(elements[e], controlFlowElementList)
    } else if (elements[e].element.type.includes("bpmn:SequenceFlow")) {
      createEdegeList(elements[e], edgeConditionList)
    } else if (elements[e].element.type.includes("bpmn:SubChoreography")) {
      console.log("subCho")
    }else if (elements[e].element.type.includes("bpmn:Choreography") && !elements[e].element.type.includes("bpmn:ChoreographyTask")){
      if(!elements[e].element.businessObject.$attrs.ChorInstanceId){
        idInstance=elements[e].element.id+'+'+1;
      }else{
        idInstance=elements[e].element.id+'+'+elements[e].element.businessObject.$attrs.ChorInstanceId;
      }
      idChoreography=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.id), 64);
    }
  }

  idInstance= idInstance=web3.utils.padRight(web3.utils.asciiToHex(idInstance), 64);
  console.log("activityList",activityList)
  console.log("messagges",messagges)
  console.log("participantList",participantList)
  console.log("messageAttributesList",messageAttributesList)
  console.log("controlFlowElementList",controlFlowElementList)
  console.log("edgeConditionList",edgeConditionList)
  console.log(idChoreography)
  console.log(idInstance)
  // console.log(subChoreographyList)
  
  //TODO metodo Web3 per leggere l'address direttamente 
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = 6721975;
  const gasEstimation = await contract.methods.setChoreography(activityList, messagges, participantList, messageAttributesList, controlFlowElementList, edgeConditionList,idChoreography,idInstance).send({ from: accountAddress, gas: gasLimit, gasPrice: gasPrice })
}


function createActivity(diagramElement, activityList, addressKeyMappingList, participantList, keyMappingParticipants) {
  let activity = {
    id: "",
    name: "",
    initiator: "",
    target: "",
    idInElement: "",
    idOutElement: "",
    messageIn: "",
    messageOut: "",
    executed: false,
    tempState: false
  }

  const asciiResult = web3.utils.asciiToHex(diagramElement.element.id);
  activity.id = web3.utils.padRight(asciiResult, 64)
  activity.name = web3.utils.padRight(asciiResult, 64)
  if (diagramElement.element.businessObject.participantRef[0].name) {
    activity.initiator = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.participantRef[0].name), 64);
  } else {
    activity.initiator = web3.utils.padRight(0, 64);
  }
  if (diagramElement.element.businessObject.participantRef[1].name) {
    activity.target = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.participantRef[1].name), 64);
  } else {
    activity.target = web3.utils.padRight(0, 64);
  }
  if (diagramElement.element.businessObject.incoming && diagramElement.element.businessObject.incoming.length > 0) {
    activity.idInElement = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.incoming[0].sourceRef.id), 64);
  } else if (diagramElement.element.businessObject.$parent.$type.includes("bpmn:SubChoreography")) {
    activity.idOutElement = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.incoming[0].sourceRef.id), 64);
  } else {
    activity.idInElement = web3.utils.padRight(0, 64);
  }

  if (diagramElement.element.businessObject.outgoing && diagramElement.element.businessObject.outgoing.length > 0) {
    activity.idOutElement = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.outgoing[0].targetRef.id), 64);
  } else {
    if (diagramElement.element.businessObject.$parent.$type.includes("bpmn:SubChoreography")) {
      activity.idOutElement = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.outgoing[0].targetRef.id), 64)
    } else {
      activity.idOutElement = web3.utils.padRight(0, 64);
    }
  }
  if (diagramElement.element.businessObject.messageFlowRef[1]) {
    activity.messageIn = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.messageFlowRef[1].messageRef.id), 64);
    activity.messageOut = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.messageFlowRef[0].messageRef.id), 64);
  } else {
    activity.messageIn = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.messageFlowRef[0].messageRef.id), 64);
    activity.messageOut = web3.utils.padRight(0, 64);
  }
  activityList.push(activity);
  console.log(diagramElement.element.businessObject.participantRef[0].participantItems)
  if (diagramElement.element.businessObject.participantRef[0].participantItems && diagramElement.element.businessObject.participantRef[0].participantItems.length > 0) {
    // console.log(diagramElement.element.businessObject)

    if (!addressKeyMappingList.includes(activity.initiator)) {
      participantList.push({
        keyMapping: activity.initiator,
        addr: diagramElement.element.businessObject.participantRef[0].participantItems.map(e => e.name)
      })
      addressKeyMappingList.push(activity.initiator)
    }
    if (!addressKeyMappingList.includes(activity.target)) {

      participantList.push({
        keyMapping: activity.target,
        addr: diagramElement.element.businessObject.participantRef[1].participantItems.map(e => e.name)
      })
      addressKeyMappingList.push(activity.target);
    }
  } else if (participantList.length < 1) {
    let participantAddress = [];

    diagramElement.element.businessObject.$parent.participantItems.forEach(e => {
      participantAddress.push(e.name)
    })
    participantList.push({
      addr: participantAddress,
      keyMapping: web3.utils.padRight(0, 64)
    })
  }
}

function createMessage(diagramElement, messagges, activityList, messageAttributesList) {
  let message = {
    id: "",
    name: "",
    mappingKey: "",
    selectedAttr: [],
    sourceParticipant: "",
    targetParticipant: "",
    idActivity: "",
    executed: false,
    tempState: false
  }
  const asciiResult = web3.utils.asciiToHex(diagramElement.element.id);
  message.id = web3.utils.padRight(asciiResult, 64)
  message.name = web3.utils.padRight(asciiResult, 64)
  message.mappingKey = web3.utils.padRight(0, 64);

  message.sourceParticipant = "0x0000000000000000000000000000000000000000";
  message.targetParticipant = "0x0000000000000000000000000000000000000000";
  activityList.forEach((e) => {
    if (e.messageIn.includes(message.id)) {
      message.idActivity = e.id;
    } else if (e.messageOut.includes(message.id)) {
      message.idActivity = e.id;
    }
  })
  messagges.push(message);
  
  if (diagramElement.element.businessObject.get('messageItems').length > 0) {
    
    console.log("messageItems",diagramElement.element.businessObject.get('messageItems'))
    diagramElement.element.businessObject.get('messageItems').forEach((element) => {
      let messageAttributeStruct = {
        keyMapping: "",
        attributes: []
      }
      let splitString = element.name.split("(");
      messageAttributeStruct.keyMapping = web3.utils.padRight(web3.utils.asciiToHex(splitString[0]), 64);
      let splitCut = splitString[1].substring(0, splitString[1].length - 1).split(",");
      splitCut.forEach((e) => {
        messageAttributeStruct.attributes.push(web3.utils.padRight(web3.utils.asciiToHex(e), 64));
      })

      if(!listIncludeMapping(messageAttributesList,messageAttributeStruct)){
        messageAttributesList.push(messageAttributeStruct);
      }
      
      // console.log("messageAttributeStruct",messageAttributeStruct)
      // console.log("messageAttributesList",messageAttributesList)
      // messageAttributesList.push(messageAttributeStruct);
    })
   
    
  } else {
    //we thought about a sigle key mapping for all attributes but we have multiple key mapping (one for each messages) 
    //for all the attributes 
    if (messageAttributesList.length == 0) {
      if (diagramElement.element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography')) {
        let attributes = diagramElement.element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').attributeItems.map(item => item.name).map(item => web3.utils.padRight(web3.utils.asciiToHex(item), 64));
        let keyMappings = diagramElement.element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').messageItems.map(item => item.name).map(item => web3.utils.padRight(web3.utils.asciiToHex(item), 64));

        keyMappings.forEach((element) => {
          messageAttributesList.push({
            attributes: attributes,
            keyMapping: element
          });
        })
      }
    }
  }
}
function listIncludeMapping(messageAttributesList,messageAttributeStruct){
  let flag=false;
  messageAttributesList.forEach((e)=>{
    if(e.keyMapping.includes(messageAttributeStruct.keyMapping)){
      flag=true;
    }
  })
  return flag;
}

function createGatewayElement(diagramElement, controlFlowElementList) {
  // console.log(diagramElement)
  let typeList = ["bpmn:StartEvent", "bpmn:ExclusiveGateway", "bpmn:EndEvent", "bpmn:ParallelGateway", "bpmn:EventBasedGateway"]
  let controlFlowElement = {
    id: "",
    typeElement: "",
    incomingActivity: [],
    outgoingActivity: [],
    executed: false
  }
  const asciiResult = web3.utils.asciiToHex(diagramElement.element.id);
  controlFlowElement.id = web3.utils.padRight(asciiResult, 64)

  if (diagramElement.element.businessObject.outgoing) {
    diagramElement.element.businessObject.outgoing.forEach((ref) => {
      controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.targetRef.id), 64))
    })
  } else if (diagramElement.element.businessObject.$parent.$type.includes("bpmn:SubChoreography")) {
    controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.outgoing[0].targetRef.id), 64));
  }
  if (diagramElement.element.businessObject.incoming) {
    diagramElement.element.businessObject.incoming.forEach((ref) => {
      if (ref.sourceRef.$type.includes("bpmn:SubChoreography")) {
        let temp = ref.sourceRef.flowElements.
          filter(e =>
            e.$type.includes("Event") ||
            e.$type.includes("Gateway") ||
            e.$type.includes("Task")).
          filter(e => !e.outgoing)[0]
        controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(temp.id), 64))
      } else {
        controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.sourceRef.id), 64))
      }
    })
  } else if (diagramElement.element.businessObject.$parent.$type.includes("bpmn:SubChoreography")) {
    control.flowElements.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.incoming[0].sourceRef.id), 64));
  }
  if (diagramElement.element.type.includes("bpmn:StartEvent")) {
    controlFlowElement.typeElement = "1"
  } else if (diagramElement.element.type.includes("bpmn:ExclusiveGateway")) {
    if (controlFlowElement.incomingActivity.length == 1 && controlFlowElement.outgoingActivity.length > 1) {
      controlFlowElement.typeElement = "2"
    } else if (controlFlowElement.incomingActivity.length > 1 && controlFlowElement.outgoingActivity.length == 1) {
      controlFlowElement.typeElement = "3"
    } else {
      controlFlowElement.typeElement = "8"
    }
  } else if (diagramElement.element.type.includes("bpmn:ParallelGateway")) {
    if (controlFlowElement.incomingActivity.length == 1 && controlFlowElement.outgoingActivity.length > 1) {
      controlFlowElement.typeElement = "4"
    } else if (controlFlowElement.incomingActivity.length > 1 && controlFlowElement.outgoingActivity.length == 1) {
      controlFlowElement.typeElement = "5"
    } else {
      controlFlowElement.typeElement = "8"
    }
  } else if (diagramElement.element.type.includes("bpmn:EventBasedGateway")) {
    controlFlowElement.typeElement = "6"
  } else if (diagramElement.element.type.includes("bpmn:EndEvent")) {
    controlFlowElement.typeElement = "7"
  }
  controlFlowElementList.push(controlFlowElement);
}

function createEdegeList(diagramElement, edgeConditionList) {
  let edgeCondition = {
    attribute: "",
    comparisonValue: "",
    condition: "",
    idActivity: ""
  }
  if (diagramElement.element.businessObject.name) {
    let condtionType = ["GREATER", "LESS", "EQUAL", "GREATEREQUAL", "LESSEQUAL"]
    let stringcondition = diagramElement.element.businessObject.name.split(" ");
    edgeCondition.attribute = web3.utils.padRight(web3.utils.asciiToHex(stringcondition[0]), 64);
    edgeCondition.comparisonValue = web3.utils.padRight(web3.utils.asciiToHex(stringcondition[2]), 64);
    edgeCondition.condition = condtionType.indexOf(stringcondition[1].toUpperCase())
    if (diagramElement.element.businessObject.targetRef.$type) {
      edgeCondition.idActivity = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.targetRef.id), 64);
    }
    edgeConditionList.push(edgeCondition)
  }
}
function createSubChoreographyList(diagramElement, subChoreographyList) {
  let elementContained = diagramElement.element.businessObject.flowElements.
    filter(e =>
      e.$type.includes("Event") ||
      e.$type.includes("Gateway") ||
      e.$type.includes("Task"))
  elementContained.forEach((element) => {
    if (!element.outgoing) {
    }
  })
}
function findLastSubChoElement(diagramElement) {
  console.log(diagramElement)
  let elementContained = diagramElement.flowElements.
    filter(e =>
      e.$type.includes("Event") ||
      e.$type.includes("Gateway") ||
      e.$type.includes("Task")).
    filter(e => !e.outgoing)[0]

  console.log(elementContained)
}