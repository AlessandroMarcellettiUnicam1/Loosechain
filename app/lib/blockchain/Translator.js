import connectToBlockchain from './connection';

import Web3 from 'web3';
const { ethereum } = window;
const web3 = new Web3(ethereum);


export async function translateDiagram(modeler,contract){
    // const contract = await connectToBlockchain();
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
        createActivity(elements[e],activityList,addressKeyMappingList,participantList,keyMappingParticipants)
        // let activity={
        //   id:"",
        //   name:"",
        //   initiator:"",
        //   target:"",
        //   idInElement:"",
        //   idOutElement:"",
        //   messageIn:"",
        //   messageOut:"",
        //   executed:false,
        //   tempState:false
        // }
        
        // const asciiResult=web3.utils.asciiToHex(elements[e].element.id);
        // activity.id=web3.utils.padRight(asciiResult,64)
        // activity.name=web3.utils.padRight(asciiResult,64)
        // activity.initiator=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.participantRef[0].name),64);
        // activity.target=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.participantRef[1].name),64);
        // if(elements[e].element.businessObject.incoming && elements[e].element.businessObject.incoming.length>0){
        //   activity.idInElement=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.incoming[0].sourceRef.id),64);
        // }else{
        //   activity.idInElement=web3.utils.padRight(0,64);
        // }

        // if(elements[e].element.businessObject.outgoing && elements[e].element.businessObject.outgoing.length>0){
        //   activity.idOutElement=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.outgoing[0].targetRef.id),64);
        // }else{
        //   activity.idOutElement=web3.utils.padRight(0,64);
        // }
        // if(elements[e].element.businessObject.messageFlowRef[1]){
        //   activity.messageIn=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.messageFlowRef[1].messageRef.id),64);
        //   activity.messageOut=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.messageFlowRef[0].messageRef.id),64);
        // }else{
        //   activity.messageIn=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.messageFlowRef[0].messageRef.id),64);
        //   activity.messageOut=web3.utils.padRight(0,64);
        // }
        // activityList.push(activity);
        // if(elements[e].element.businessObject.participantRef[0].participantItems){
        //   console.log(elements[e].element.businessObject)

        //   if (!addressKeyMappingList.includes(activity.initiator)){
        //     participantList.push({
        //       keyMapping:activity.initiator,
        //       addr:elements[e].element.businessObject.participantRef[0].participantItems.map(e=>e.name)
        //     })
        //     addressKeyMappingList.push(activity.initiator)
        //   }
        //   if(!addressKeyMappingList.includes(activity.target)){

        //     participantList.push({
        //       keyMapping:activity.target,
        //       addr:elements[e].element.businessObject.participantRef[1].participantItems.map(e=>e.name)
        //   })
        //     addressKeyMappingList.push(activity.target);
        //   }
        // }else if(participantList.length<1){
        //   let participantAddress=[];
          
        //   elements[e].element.businessObject.$parent.participantItems.forEach(e=>{
        //     participantAddress.push(e.name)
        //   })
        //   elements[e].element.businessObject.$parent.participants.forEach(e=>{
        //     if(!keyMappingParticipants.includes(e.name)){
        //       keyMappingParticipants.push(e.name);
        //       participantList.push({
        //         addr:participantAddress,
        //         keyMapping:web3.utils.padRight(web3.utils.asciiToHex(e.name),64)
        //       })
        //     }
        //   })


        // }

          //TODO List of message attributes 
      }else if(elements[e].element.type.includes("Message")){
        // console.log(elements[e].element) 
        createMessage(elements[e],messagges,activityList,messageAttributesList)
        // let message={
        //   id:"",
        //   name:"",
        //   mappingKey:"",
        //   selectedAttr:[],
        //   sourceParticipant:"",
        //   targetParticipant:"",
        //   idActivity:"",
        //   executed:false,
        //   tempState:false
        // }
        // const asciiResult=web3.utils.asciiToHex(elements[e].element.id);
        // message.id=web3.utils.padRight(asciiResult,64)
        // message.name=web3.utils.padRight(asciiResult,64)
        // message.mappingKey=web3.utils.padRight(0,64);

        // message.sourceParticipant="0x0000000000000000000000000000000000000000";
        // message.targetParticipant="0x0000000000000000000000000000000000000000";
        // activityList.forEach((e)=>{
        //   if(e.messageIn.includes(message.id)){
        //     message.idActivity=e.id;
        //   }else if (e.messageOut.includes(message.id)){
        //     message.idActivity=e.id;
        //   }
        // })
        // messagges.push(message);
        // let messageAttributeStruct={
        //   keyMapping:"",
        //   attributes:[]
        // }
        // if (elements[e].element.businessObject.get('messageItems').length>0){
        //   let splitString=elements[e].element.businessObject.get('messageItems')[0].name.split("(");
        //   messageAttributeStruct.keyMapping=web3.utils.padRight(web3.utils.asciiToHex(splitString[0]),64);
        //   let splitCut=splitString[1].substring(0,splitString[1].length-1).split(",");
        //   splitCut.forEach((e)=>{
        //     messageAttributeStruct.attributes.push(web3.utils.padRight(web3.utils.asciiToHex(e),64));
        //   })
        //   messageAttributesList.push(messageAttributeStruct);
        // }else{
        //   //TODO how store the messagge and the attrbutes in the case of composition
        //   //we thought about a sigle key mapping for all attributes but we have multiple key mapping (one for each messages) 
        //   //for all the attributes 
        //   if(messageAttributesList.length==0){
        //     if(elements[e].element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography')){
        //       let attributes=elements[e].element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').attributeItems.map(item=>item.name).map(item=>web3.utils.padRight(web3.utils.asciiToHex(item),64));
        //       let keyMappings=elements[e].element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').messageItems.map(item=>item.name).map(item=>web3.utils.padRight(web3.utils.asciiToHex(item),64));
            
        //         keyMappings.forEach((element)=>{
        //           messageAttributesList.push({
        //             attributes:attributes,
        //             keyMapping:element
        //           });
        //         })
        //     }
        //   }
        // }
      }else if(elements[e].element.type.includes("Event") ||elements[e].element.type.includes("Gateway")){
        createGatewayElement(elements[e],controlFlowElementList)
        // let typeList=["bpmn:StartEvent","bpmn:ExclusiveGateway","bpmn:EndEvent","bpmn:ParallelGateway","bpmn:EventBasedGateway"]
        // let controlFlowElement={
        //   id:"",
        //   tipo:"",
        //   incomingActivity:[],
        //   outgoingActivity:[],
        //   executed:false
        // }
        // const asciiResult=web3.utils.asciiToHex(elements[e].element.id);
        // controlFlowElement.id=web3.utils.padRight(asciiResult,64)
        // if(elements[e].element.type.includes("bpmn:StartEvent")){
        //   controlFlowElement.tipo="0"
        // }else if(elements[e].element.type.includes("bpmn:ExclusiveGateway")){
        //   if(elements[e].element.businessObject.incoming && elements[e].element.businessObject.incoming.length==1 && elements[e].element.businessObject.outgoing.length>1 ){
        //     controlFlowElement.tipo="1"
        //   }else if(elements[e].element.businessObject.incoming && elements[e].element.businessObject.incoming.length>1 && elements[e].element.businessObject.outgoing.length==1 ){
        //     controlFlowElement.tipo="2"
        //   }else{
        //     controlFlowElement.tipo="7"
        //   }
        // }else if(elements[e].element.type.includes("bpmn:ParallelGateway")){
        //   if(elements[e].element.businessObject.incoming.length==1 && elements[e].element.businessObject.outgoing.length>1 ){
        //     controlFlowElement.tipo="3"
        //   }else if(elements[e].element.businessObject.incoming.length>1 && elements[e].element.businessObject.outgoing.length==1){
        //     controlFlowElement.tipo="4"
        //   }else{
        //     controlFlowElement.tipo="7"
        //   }
        // }else if(elements[e].element.type.includes("bpmn:EventBasedGateway")){
        //   controlFlowElement.tipo="5"
        // }else if(elements[e].element.type.includes("bpmn:EndEvent")){
        //   controlFlowElement.tipo="6"
        // }
        // if(elements[e].element.businessObject.outgoing){
        //   elements[e].element.businessObject.outgoing.forEach((ref)=>{
        //     controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.targetRef.id),64))
        //   })
        // }
        // if(elements[e].element.businessObject.incoming){
        //   elements[e].element.businessObject.incoming.forEach((ref)=>{
        //     controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.sourceRef.id),64))
        //   })
        // }
        // controlFlowElementList.push(controlFlowElement);
      }else if(elements[e].element.type.includes("bpmn:SequenceFlow")){
        createEdegeList(elements[e],edgeConditionList)
        // let edgeCondition={
        //   attribute:"",
        //   comparisonValue:"",
        //   condition:"",
        //   idActivity:""
        // }
        // if(elements[e].element.businessObject.name){
        //   let condtionType=["GREATER","LESS","EQUAL","GREATEREQUAL","LESSEQUAL"]
        //   let stringcondition=elements[e].element.businessObject.name.split(" ");
        //   edgeCondition.attribute=web3.utils.padRight(web3.utils.asciiToHex(stringcondition[0]),64);
        //   edgeCondition.comparisonValue=web3.utils.padRight(web3.utils.asciiToHex(stringcondition[2]),64);
        //   edgeCondition.condition=condtionType.indexOf(stringcondition[1].toUpperCase())
        //   if(elements[e].element.businessObject.targetRef.$type){
        //     edgeCondition.idActivity=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.targetRef.id),64);
        //   }
        //   edgeConditionList.push(edgeCondition)
        // }
      }else if(elements[e].element.type.includes("bpmn:SubChoreography")){
        // createSubChoreographyList(elements[e],subChoreographyList);
        // let elementContained=elements[e].element.businessObject.flowElements.
        // filter(e=>e.$type.includes("bpmn:SequenceFlow")||
        //       e.$type.includes("Event")||
        //       e.$type.includes("Gateway")||
        //       e.$type.includes("Message")||
        //       e.$type.includes("Task")).
        // map(e=>web3.utils.padRight(web3.utils.asciiToHex(e.id),64));
        // console.log(elementContained)
        // subChoreographyList.push({
        //   executed:false,
        //   id:web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.id),64),
        //   elementId:elementContained
        // })
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
    // console.log(subChoreographyList)

    //TODO metodo Web3 per leggere l'address direttamente 
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 3000000;
    await contract.methods.setInformation(activityList,messagges,participantList,messageAttributesList,controlFlowElementList,edgeConditionList).send({from:"0x1bf6d93F3CE0dDc961560819aa774dE7Cf54D69D",gas:gasLimit,gasPrice: gasPrice})
}


function createActivity(diagramElement,activityList,addressKeyMappingList,participantList){
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
  
  const asciiResult=web3.utils.asciiToHex(diagramElement.element.id);
  activity.id=web3.utils.padRight(asciiResult,64)
  activity.name=web3.utils.padRight(asciiResult,64)
  activity.initiator=web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.participantRef[0].name),64);
  activity.target=web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.participantRef[1].name),64);
  if(diagramElement.element.businessObject.incoming && diagramElement.element.businessObject.incoming.length>0){
    activity.idInElement=web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.incoming[0].sourceRef.id),64);
  }else if(diagramElement.element.businessObject.$parent.$type.includes("bpmn:SubChoreography")){
    activity.idOutElement=web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.incoming[0].sourceRef.id),64);
  }else{
    activity.idInElement=web3.utils.padRight(0,64);
  }

  if(diagramElement.element.businessObject.outgoing){
    activity.idOutElement=web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.outgoing[0].targetRef.id),64);
  }else{
    // 
    if(diagramElement.element.businessObject.$parent.$type.includes("bpmn:SubChoreography")){
      activity.idOutElement=web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.outgoing[0].targetRef.id),64)
    }else{
      activity.idOutElement=web3.utils.padRight(0,64);
    }
  }
  if(diagramElement.element.businessObject.messageFlowRef[1]){
    activity.messageIn=web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.messageFlowRef[1].messageRef.id),64);
    activity.messageOut=web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.messageFlowRef[0].messageRef.id),64);
  }else{
    activity.messageIn=web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.messageFlowRef[0].messageRef.id),64);
    activity.messageOut=web3.utils.padRight(0,64);
  }
  activityList.push(activity);
  if(diagramElement.element.businessObject.participantRef[0].participantItems){
    // console.log(diagramElement.element.businessObject)

    if (!addressKeyMappingList.includes(activity.initiator)){
      participantList.push({
        keyMapping:activity.initiator,
        addr:diagramElement.element.businessObject.participantRef[0].participantItems.map(e=>e.name)
      })
      addressKeyMappingList.push(activity.initiator)
    }
    if(!addressKeyMappingList.includes(activity.target)){

      participantList.push({
        keyMapping:activity.target,
        addr:diagramElement.element.businessObject.participantRef[1].participantItems.map(e=>e.name)
    })
      addressKeyMappingList.push(activity.target);
    }
  }else if(participantList.length<1){
    let participantAddress=[];
    
    diagramElement.element.businessObject.$parent.participantItems.forEach(e=>{
      participantAddress.push(e.name)
    })
    diagramElement.element.businessObject.$parent.participants.forEach(e=>{
      if(!keyMappingParticipants.includes(e.name)){
        keyMappingParticipants.push(e.name);
        participantList.push({
          addr:participantAddress,
          keyMapping:web3.utils.padRight(web3.utils.asciiToHex(e.name),64)
        })
      }
    })


  }
}

function createMessage(diagramElement,messagges,activityList,messageAttributesList){
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
  const asciiResult=web3.utils.asciiToHex(diagramElement.element.id);
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
  if (diagramElement.element.businessObject.get('messageItems').length>0){
    let splitString=diagramElement.element.businessObject.get('messageItems')[0].name.split("(");
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
      if(diagramElement.element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography')){
        let attributes=diagramElement.element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').attributeItems.map(item=>item.name).map(item=>web3.utils.padRight(web3.utils.asciiToHex(item),64));
        let keyMappings=diagramElement.element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').messageItems.map(item=>item.name).map(item=>web3.utils.padRight(web3.utils.asciiToHex(item),64));
      
          keyMappings.forEach((element)=>{
            messageAttributesList.push({
              attributes:attributes,
              keyMapping:element
            });
          })
      }
    }
  }
}

function createGatewayElement(diagramElement,controlFlowElementList){
  // console.log(diagramElement)
  let typeList=["bpmn:StartEvent","bpmn:ExclusiveGateway","bpmn:EndEvent","bpmn:ParallelGateway","bpmn:EventBasedGateway"]
  let controlFlowElement={
    id:"",
    tipo:"",
    incomingActivity:[],
    outgoingActivity:[],
    executed:false
  }
  const asciiResult=web3.utils.asciiToHex(diagramElement.element.id);
  controlFlowElement.id=web3.utils.padRight(asciiResult,64)
  
  if(diagramElement.element.businessObject.outgoing){
    diagramElement.element.businessObject.outgoing.forEach((ref)=>{
      controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.targetRef.id),64))
    })
  }else if(diagramElement.element.businessObject.$parent.$type.includes("bpmn:SubChoreography")){
    controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.outgoing[0].targetRef.id),64));
  }
  if(diagramElement.element.businessObject.incoming){
    diagramElement.element.businessObject.incoming.forEach((ref)=>{
      if(ref.sourceRef.$type.includes("bpmn:SubChoreography")){
        let temp=ref.sourceRef.flowElements.
        filter(e=>
                e.$type.includes("Event")||
                e.$type.includes("Gateway")||
                e.$type.includes("Task")).
        filter(e=>!e.outgoing)[0]
        controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(temp.id),64))
      }else{
        controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.sourceRef.id),64))
      }
    })
  }else if(diagramElement.element.businessObject.$parent.$type.includes("bpmn:SubChoreography")){
    control.flowElements.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.incoming[0].sourceRef.id),64));
  }
  if(diagramElement.element.type.includes("bpmn:StartEvent")){
    controlFlowElement.tipo="0"
  }else if(diagramElement.element.type.includes("bpmn:ExclusiveGateway")){
    if(controlFlowElement.incomingActivity.length==1 && controlFlowElement.outgoingActivity.length>1 ){
      controlFlowElement.tipo="1"
    }else if(controlFlowElement.incomingActivity.length>1 &&controlFlowElement.outgoingActivity.length==1 ){
      controlFlowElement.tipo="2"
    }else{
      controlFlowElement.tipo="7"
    }
  }else if(diagramElement.element.type.includes("bpmn:ParallelGateway")){
    if(controlFlowElement.incomingActivity.length==1 && controlFlowElement.outgoingActivity.length>1 ){
      controlFlowElement.tipo="3"
    }else if(controlFlowElement.incomingActivity.length>1 && controlFlowElement.outgoingActivity.length==1){
      controlFlowElement.tipo="4"
    }else{
      controlFlowElement.tipo="7"
    }
  }else if(diagramElement.element.type.includes("bpmn:EventBasedGateway")){
    controlFlowElement.tipo="5"
  }else if(diagramElement.element.type.includes("bpmn:EndEvent")){
    controlFlowElement.tipo="6"
  }
  controlFlowElementList.push(controlFlowElement);
}

function createEdegeList(diagramElement,edgeConditionList){
  let edgeCondition={
    attribute:"",
    comparisonValue:"",
    condition:"",
    idActivity:""
  }
  if(diagramElement.element.businessObject.name){
    let condtionType=["GREATER","LESS","EQUAL","GREATEREQUAL","LESSEQUAL"]
    let stringcondition=diagramElement.element.businessObject.name.split(" ");
    edgeCondition.attribute=web3.utils.padRight(web3.utils.asciiToHex(stringcondition[0]),64);
    edgeCondition.comparisonValue=web3.utils.padRight(web3.utils.asciiToHex(stringcondition[2]),64);
    edgeCondition.condition=condtionType.indexOf(stringcondition[1].toUpperCase())
    if(diagramElement.element.businessObject.targetRef.$type){
      edgeCondition.idActivity=web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.targetRef.id),64);
    }
    edgeConditionList.push(edgeCondition)
  }
}
function createSubChoreographyList(diagramElement,subChoreographyList){
  let elementContained=diagramElement.element.businessObject.flowElements.
  filter(e=>
        e.$type.includes("Event")||
        e.$type.includes("Gateway")||
        e.$type.includes("Task"))
  elementContained.forEach((element)=>{
    if(!element.outgoing){
    }
  })
}
function findLastSubChoElement(diagramElement){
  console.log(diagramElement)
  let elementContained=diagramElement.flowElements.
  filter(e=>
        e.$type.includes("Event")||
        e.$type.includes("Gateway")||
        e.$type.includes("Task")).
  filter(e=>!e.outgoing)[0]

  console.log(elementContained)
}