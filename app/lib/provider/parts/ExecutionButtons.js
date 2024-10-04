import connectToBlockchain from '../../blockchain/connection';
import Web3 from 'web3';
const { ethereum } = window;
const web3 = new Web3(ethereum);
var domify = require('min-dom').domify;

export async function buttonExecutePressedSelection(businessObject) {
   
    const contract = await connectToBlockchain();
    let selectionStruct = {
        idActivity: "",
        idMessage: "",
        keyMapping: "",
        source: "",
        target: "",
        attributi: [],
        value: []
    }
    let tempActivity;
    let flag = true;
    businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').flowElements.forEach(e => {
        if (e.$type.includes("bpmn:ChoreographyTask") && flag) {
            if (e.messageFlowRef[1]) {
                if (businessObject.id.includes(e.messageFlowRef[0].messageRef.id)) {
                    flag = false;
                    selectionStruct.idActivity = web3.utils.padRight(web3.utils.asciiToHex(e.id), 64);
                    tempActivity = e;
                } else {
                    if (businessObject.id.includes(e.messageFlowRef[1].messageRef.id)) {
                        tempActivity = e;
                        flag = false;
                        selectionStruct.idActivity = web3.utils.padRight(web3.utils.asciiToHex(e.id), 64);
                    }
                }
            } else {
                if (businessObject.id.includes(e.messageFlowRef[0].messageRef.id)) {
                    tempActivity = e;
                    flag = false;
                    selectionStruct.idActivity = web3.utils.padRight(web3.utils.asciiToHex(e.id), 64);
                }
            }
        }
    })
    let stringAttributes = businessObject.name.split("(");
    selectionStruct.idMessage = web3.utils.padRight(web3.utils.asciiToHex(businessObject.id), 64);
    selectionStruct.keyMapping = web3.utils.padRight(web3.utils.asciiToHex(stringAttributes[0]), 64);
    selectionStruct.source = tempActivity.participantRef[0].$attrs.participantType
    selectionStruct.target = tempActivity.participantRef[1].$attrs.participantType
    stringAttributes[1].substring(0, stringAttributes[1].length - 1).split(",").forEach((attr) => {
        selectionStruct.attributi.push(web3.utils.padRight(web3.utils.asciiToHex(attr), 64))
    })
    businessObject.attributeValues.split(";").forEach((value) => {
        selectionStruct.value.push(web3.utils.padRight(web3.utils.asciiToHex(value), 64))
    })
    await contract.methods.executeSelectMessage(selectionStruct.attributi, selectionStruct.idActivity, selectionStruct.idMessage, selectionStruct.keyMapping, selectionStruct.source, selectionStruct.target, selectionStruct.value).send({ from: "0xD8d3683EA59d8AB2af961DA41af971e2A1d62fA0" })

}


export async function buttonExecutePressedComposition(businessObject) {
    const contract = await connectToBlockchain();
    let nextActivity=[];
    let newMessage=[];
    let tempActivity;
    console.log(businessObject)
    let flag = true;
    businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').flowElements.forEach(e => {
        if (e.$type.includes("bpmn:ChoreographyTask") && flag) {
            if (e.messageFlowRef[1]) {
                if (businessObject.id.includes(e.messageFlowRef[0].messageRef.id)) {
                    tempActivity = e;
                    flag=false;
                } else {
                    if (businessObject.id.includes(e.messageFlowRef[1].messageRef.id)) {
                        tempActivity = e;
                        flag=false;
                    }
                }
            } else {
                if (businessObject.id.includes(e.messageFlowRef[0].messageRef.id)) {
                    flag=false;
                    tempActivity = e;
                }
            }
        }
    })
    if (!tempActivity) {
        businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').flowElements.forEach(e => {
            if (e.$type.includes("bpmn:SubChoreography")) {
                e.flowElements.forEach(ele => {
                    if (ele.$type.includes("bpmn:ChoreographyTask")) {
                        if (ele.messageFlowRef[1]) {
                            if (businessObject.id.includes(ele.messageFlowRef[0].messageRef.id)) {
                                tempActivity = ele;
                            } else {
                                if (businessObject.id.includes(ele.messageFlowRef[1].messageRef.id)) {
                                    tempActivity = ele;
                                }
                            }
                        } else {
                            if (businessObject.id.includes(ele.messageFlowRef[0].messageRef.id)) {
                                tempActivity = ele;
                            }
                        }
                    }
                })
            }
        })
    }
    let activity = {
        id: "",
        name: "",
        initiator: "",
        target: "",
        idInElement: "",
        idOutElement: "",
        messageIn: "",
        executed: false,
        messageOut: "",
        tempState: false
    }

    const asciiResult = web3.utils.asciiToHex(tempActivity.id);
    activity.id = web3.utils.padRight(asciiResult, 64)
    activity.name = web3.utils.padRight(asciiResult, 64)
    if(tempActivity.$parent.participantItems && tempActivity.$parent.participantItems.length>0){
        activity.initiator =web3.utils.padRight(0,64);
        activity.target = web3.utils.padRight(0,64);
    }else{
        activity.initiator = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.participantRef[0].name), 64);
        activity.target = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.participantRef[1].name), 64);
    }
    if (tempActivity.incoming) {
        activity.idInElement = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.incoming[0].sourceRef.id), 64);
    } else if(tempActivity.$parent.$type.includes("bpmn:SubChoreography")){
        console.log("CASO IN CUI L'attivita non è connessa")
    }else{
        activity.idInElement = web3.utils.padRight(0, 64);
    }
    if (tempActivity.outgoing) {
        activity.idOutElement = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.outgoing[0].targetRef.id), 64);
    } else if(tempActivity.$parent.$type.includes("bpmn:SubChoreography")) {
        activity.idOutElement=web3.utils.padRight(web3.utils.asciiToHex(tempActivity.$parent.outgoing[0].targetRef.id), 64);
    }else{
        activity.idOutElement = web3.utils.padRight(0, 64);
    }
    if (tempActivity.messageFlowRef[1]) {
        activity.messageIn = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.messageFlowRef[1].messageRef.id), 64);
        activity.messageOut = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.messageFlowRef[0].messageRef.id), 64);
    } else {
        activity.messageIn = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.messageFlowRef[0].messageRef.id), 64);
        activity.messageOut = web3.utils.padRight(0, 64);
    }

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
    const messageAsciiResult = web3.utils.asciiToHex(businessObject.id);
    message.id = web3.utils.padRight(messageAsciiResult, 64)
    message.name = web3.utils.padRight(messageAsciiResult, 64)
    message.sourceParticipant = tempActivity.participantRef[0].$attrs.participantType;
    message.targetParticipant = tempActivity.participantRef[1].$attrs.participantType;
    message.idActivity = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.id), 64)
    let attributes;
    if (businessObject.get('messageItems').length > 0) {
        let splitString = businessObject.get('messageItems')[0].name.split("(");
        message.mappingKey = web3.utils.padRight(web3.utils.asciiToHex(splitString[0]), 64);
        let splitCut = splitString[1].substring(0, splitString[1].length - 1).split(",");
        let attributesListTemp = []
        splitCut.forEach((e) => {
            attributesListTemp.push(web3.utils.padRight(web3.utils.asciiToHex(e), 64));
        })
        message.selectedAttr = attributesListTemp;
    } else {
        message.mappingKey = web3.utils.padRight(web3.utils.asciiToHex(businessObject.$attrs.messageItem), 64);
        if (businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography')) {
            attributes = businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').attributeItems.map(item => item.name)
        }
        attributes.forEach((attr) => {
            if (businessObject.get(attr)) {
                message.selectedAttr.push(web3.utils.padRight(web3.utils.asciiToHex(attr), 64))
            }
        })
    }
    let selectAttributes = message.selectedAttr;
    let values = [];
    businessObject.attributeValues.split(";").forEach((e) => {
        values.push(web3.utils.padRight(web3.utils.asciiToHex(e), 64))
    });
    let controlFlowElementList = [];
    let edgeConditionList = [];
    console.log(tempActivity)
    if (tempActivity.incoming) {
        tempActivity.incoming.forEach((element) => {
            let incomingElement = element.sourceRef
            if (incomingElement.$type.includes("Event") || incomingElement.$type.includes("Gateway")) {

                let controlFlowElement = {
                    id: "",
                    tipo: "",
                    incomingActivity: [],
                    outgoingActivity: [],
                    executed: false
                }
                const controlAsciiResult = web3.utils.asciiToHex(incomingElement.id);
                controlFlowElement.id = web3.utils.padRight(controlAsciiResult, 64);
                if(incomingElement.di.fill){
                    controlFlowElement.executed = incomingElement.di.fill.includes("lightgreen")|| incomingElement.$type.includes("bpmn:StartEvent") ;
                }else{
                    controlFlowElement.executed =incomingElement.$type.includes("bpmn:StartEvent") ;
                }
                
                if (incomingElement.outgoing) {
                    incomingElement.outgoing.forEach((ref) => {
                        controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.targetRef.id), 64))
                    })
                }
                if (incomingElement.incoming) {
                    incomingElement.incoming.forEach((ref) => {
                        controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.sourceRef.id), 64))
                    })
                }
                if (incomingElement.$type.includes("bpmn:StartEvent")) {
                    controlFlowElement.tipo = "0"
                } else if (incomingElement.$type.includes("bpmn:ExclusiveGateway")) {
                    if (controlFlowElement.incomingActivity.length == 1 && controlFlowElement.outgoingActivity.length > 1) {
                        controlFlowElement.tipo = "1"
                    } else if (controlFlowElement.incomingActivity.length > 1 && controlFlowElement.outgoingActivity.length == 1) {
                        controlFlowElement.tipo = "2"
                    }else{
                        controlFlowElement.tipo = "7"
                    }
                } else if (incomingElement.$type.includes("bpmn:ParallelGateway")) {
                    if (controlFlowElement.incomingActivity.length == 1 && controlFlowElement.outgoingActivity.length > 1) {
                        controlFlowElement.tipo = "3"
                    } else if (controlFlowElement.incomingActivity.length > 1 && controlFlowElement.outgoingActivity.length == 1) {
                        controlFlowElement.tipo = "4"
                    }else{
                        controlFlowElement.tipo = "7"
                    }
                } else if (incomingElement.$type.includes("bpmn:EventBasedGateway")) {
                    controlFlowElement.tipo = "5"
                } else if (incomingElement.$type.includes("bpmn:EndEvent")) {
                    controlFlowElement.tipo = "6"
                }
                if (controlFlowElement.tipo.includes("1")) {
                    incomingElement.outgoing.forEach((edge) => {
                        let edgeCondition = {
                            attribute: "",
                            comparisonValue: "",
                            condition: "",
                            idActivity: ""
                        }
                        let condtionType = ["GREATER", "LESS", "EQUAL", "GREATEREQUAL", "LESSEQUAL"]
                        let stringcondition = edge.name.split(" ");
                        edgeCondition.attribute = web3.utils.padRight(web3.utils.asciiToHex(stringcondition[0]), 64);
                        edgeCondition.comparisonValue = web3.utils.padRight(web3.utils.asciiToHex(stringcondition[2]), 64);
                        edgeCondition.condition = condtionType.indexOf(stringcondition[1].toUpperCase())
                        if (edge.targetRef.$type) {
                            edgeCondition.idActivity = web3.utils.padRight(web3.utils.asciiToHex(edge.targetRef.id), 64);
                        }
                        edgeConditionList.push(edgeCondition)
                    })
                }
                controlFlowElementList.push(controlFlowElement)
            }
        })

    }
    if (tempActivity.outgoing) {
        tempActivity.outgoing.forEach((element) => {
            let outgoingElement = element.targetRef
            if (outgoingElement.$type.includes("Event") || outgoingElement.$type.includes("Gateway")) {
                let controlFlowElement = {
                    id: "",
                    tipo: "",
                    incomingActivity: [],
                    outgoingActivity: [],
                    executed: false
                }
                const controlAsciiResult = web3.utils.asciiToHex(outgoingElement.id);
                controlFlowElement.id = web3.utils.padRight(controlAsciiResult, 64)
                if (outgoingElement.outgoing) {
                    outgoingElement.outgoing.forEach((ref) => {
                        controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.targetRef.id), 64))
                    })
                }else{
                    if(outgoingElement.$parent.$type.includes("bpmn:SubChoreography")){
                        console.log(outgoingElement.$parent)
                        controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(outgoingElement.$parent.outgoing[0].targetRef.id), 64))
                    }
                }
                if (outgoingElement.incoming) {
                    outgoingElement.incoming.forEach((ref) => {
                        controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.sourceRef.id), 64))
                    })
                }else{
                    console.log("CASO DA FIXARE")
                }
                if (outgoingElement.$type.includes("bpmn:StartEvent")) {
                    controlFlowElement.tipo = "0"
                } else if (outgoingElement.$type.includes("bpmn:ExclusiveGateway")) {
                    if (controlFlowElement.incomingActivity.length == 1 && controlFlowElement.outgoingActivity.length > 1) {
                        controlFlowElement.tipo = "1"
                    } else if (controlFlowElement.incomingActivity.length > 1 && controlFlowElement.outgoingActivity.length == 1) {
                        controlFlowElement.tipo = "2"
                    } else {
                        controlFlowElement.tipo = "7"
                    }
                } else if (outgoingElement.$type.includes("bpmn:ParallelGateway")) {
                    if (controlFlowElement.incomingActivity.length == 1 && controlFlowElement.outgoingActivity.length > 1) {
                        controlFlowElement.tipo = "3"
                    } else if (controlFlowElement.incomingActivity.length > 1 && controlFlowElement.outgoingActivity.length == 1) {
                        controlFlowElement.tipo = "4"
                    }else {
                        controlFlowElement.tipo = "7"
                    }
                } else if (outgoingElement.$type.includes("bpmn:EventBasedGateway")) {
                    controlFlowElement.tipo = "5"
                } else if (outgoingElement.$type.includes("bpmn:EndEvent")) {
                    controlFlowElement.tipo = "6"
                }
                //I can save the control flow element only if it outgoing element because if i save the incoming i can have some problem
                //with the validation of the variables
                if (controlFlowElement.tipo.includes("1")) {
                    outgoingElement.outgoing.forEach((edge) => {
                        let edgeCondition = {
                            attribute: "",
                            comparisonValue: "",
                            condition: "",
                            idActivity: ""
                        }
                        let condtionType = ["GREATER", "LESS", "EQUAL", "GREATEREQUAL", "LESSEQUAL"]
                        let stringcondition = edge.name.split(" ");
                        edgeCondition.attribute = web3.utils.padRight(web3.utils.asciiToHex(stringcondition[0]), 64);
                        edgeCondition.comparisonValue = web3.utils.padRight(web3.utils.asciiToHex(stringcondition[2]), 64);
                        edgeCondition.condition = condtionType.indexOf(stringcondition[1].toUpperCase())
                        if (edge.targetRef.$type) {
                            edgeCondition.idActivity = web3.utils.padRight(web3.utils.asciiToHex(edge.targetRef.id), 64);
                        }
                        edgeConditionList.push(edgeCondition)
                    })
                }
                controlFlowElementList.push(controlFlowElement)
            }
            console.log(outgoingElement)
            if(!outgoingElement.$parent.$type.includes("bpmn:SubChoreography")){
                if(outgoingElement.$type.includes("Event")|| outgoingElement.$type.includes("Gateway")){
                    searchForNextActivities(outgoingElement,controlFlowElementList,nextActivity,newMessage);
                    // if(outgoingElement.outgoing){
                    //     outgoingElement.outgoing.forEach((element)=>{
                    //         if(element.targetRef.$type.includes("bpmn:ChoreographyTask")){
                    //             console.log(element.targetRef)
                    //             nextActivity.push(createActivity(element.targetRef));
                    //             createMessage(element.targetRef,newMessage);
                    //         }
                    //     })
                    // }
                }else if(outgoingElement.$type.includes("bpmn:ChoreographyTask")){
                    console.log(outgoingElement)
                    if(!outgoingElement.di.fill){
                        nextActivity.push(createActivity(outgoingElement));
                        createMessage(outgoingElement,newMessage);
                            // activityList.push(createActivity(element.targetRef));
                    }
                }
            }
        })
    }

    let subChoId=web3.utils.padRight(0, 64)
    businessObject.$parent.rootElements.find(e => e.$type === 'bpmn:Choreography').flowElements.forEach(e => {
        if (e.$type.includes("bpmn:SubChoreography")) {
            e.flowElements.forEach(ele => {
                if (ele.$type.includes("bpmn:ChoreographyTask") && ele.id==web3.utils.hexToAscii(activity.id).replace(/\0/g,'')) {
                    subChoId=web3.utils.padRight(web3.utils.asciiToHex(e.id), 64);
                }
            })
        }
    })
    console.log(activity, message, selectAttributes, values, controlFlowElementList, edgeConditionList)
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 3000000;
    console.log(nextActivity,newMessage);
    await contract.methods.executeCompMessage(activity, message, selectAttributes, values, controlFlowElementList, edgeConditionList,nextActivity,newMessage).send({ from: "0x21796286b6f32f8F3273B2AA7e198d5D132a3870" ,gas:gasLimit,gasPrice:gasPrice})



}
function searchForNextActivities(tempActivity,controlFlowElementList,nextActivity,newMessage){

        tempActivity.outgoing.forEach((element)=>{

                if(element.targetRef.$type.includes("bpmn:ChoreographyTask")){
                    console.log(element)
                    if(!element.targetRef.di.fill){
                        nextActivity.push(createActivity(element.targetRef));
                        createMessage(element.targetRef,newMessage);
                    }
                }else if(element.targetRef.$type.includes("Event")|| element.targetRef.$type.includes("Gateway")){
                    if(!element.targetRef.di.fill){
                        genereteControlFlow(element.targetRef,controlFlowElementList);
                        console.log(element.targetRef)
                        if(!element.targetRef.$type.includes("bpmn:EndEvent")){
                            searchForNextActivities(element.targetRef,controlFlowElementList,nextActivity,newMessage);
                        }
                    }
                
               }
            
        })
}
function genereteControlFlow(element,controlFlowElementList){
        let controlFlowElement = {
            id: "",
            tipo: "",
            incomingActivity: [],
            outgoingActivity: [],
            executed: false
        }
        const controlAsciiResult = web3.utils.asciiToHex(element.id);
        controlFlowElement.id = web3.utils.padRight(controlAsciiResult, 64)
        if (element.outgoing) {
            element.outgoing.forEach((ref) => {
                controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.targetRef.id), 64))
                console.log(ref.targetRef)
                // if(ref.target.$type.includes("bpmn:ChoreographyTask")){
                //     nextActivity.push(createActivity(ref.target))
                // }else if(ref.targetRef.$type.includes("Event")|| ref.targetRef.$type.includes("Gateway")){
                //     genereteControlFlow(ref.targetRef,controlFlowElement,nextActivity);
                // }
            })
        }else{
            if(element.$parent.$type.includes("bpmn:SubChoreography")){
                console.log(element.$parent)
                controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(element.$parent.outgoing[0].targetRef.id), 64))
            }
        }
        if (element.incoming) {
            element.incoming.forEach((ref) => {
                controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.sourceRef.id), 64))
            })
        }else{
            console.log("CASO DA FIXARE")
        }
        if (element.$type.includes("bpmn:StartEvent")) {
            controlFlowElement.tipo = "0"
        } else if (element.$type.includes("bpmn:ExclusiveGateway")) {
            if (controlFlowElement.incomingActivity.length == 1 && controlFlowElement.outgoingActivity.length > 1) {
                controlFlowElement.tipo = "1"
            } else if (controlFlowElement.incomingActivity.length > 1 && controlFlowElement.outgoingActivity.length == 1) {
                controlFlowElement.tipo = "2"
            } else {
                controlFlowElement.tipo = "7"
            }
        } else if (element.$type.includes("bpmn:ParallelGateway")) {
            if (controlFlowElement.incomingActivity.length == 1 && controlFlowElement.outgoingActivity.length > 1) {
                controlFlowElement.tipo = "3"
            } else if (controlFlowElement.incomingActivity.length > 1 && controlFlowElement.outgoingActivity.length == 1) {
                controlFlowElement.tipo = "4"
            }else {
                controlFlowElement.tipo = "7"
            }
        } else if (element.$type.includes("bpmn:EventBasedGateway")) {
            controlFlowElement.tipo = "5"
        } else if (element.$type.includes("bpmn:EndEvent")) {
            controlFlowElement.tipo = "6"
        }
        //I can save the control flow element only if it outgoing element because if i save the incoming i can have some problem
        //with the validation of the variables
        if (controlFlowElement.tipo.includes("1")) {
            element.outgoing.forEach((edge) => {
                let edgeCondition = {
                    attribute: "",
                    comparisonValue: "",
                    condition: "",
                    idActivity: ""
                }
                let condtionType = ["GREATER", "LESS", "EQUAL", "GREATEREQUAL", "LESSEQUAL"]
                let stringcondition = edge.name.split(" ");
                edgeCondition.attribute = web3.utils.padRight(web3.utils.asciiToHex(stringcondition[0]), 64);
                edgeCondition.comparisonValue = web3.utils.padRight(web3.utils.asciiToHex(stringcondition[2]), 64);
                edgeCondition.condition = condtionType.indexOf(stringcondition[1].toUpperCase())
                if (edge.targetRef.$type) {
                    edgeCondition.idActivity = web3.utils.padRight(web3.utils.asciiToHex(edge.targetRef.id), 64);
                }
                // edgeConditionList.push(edgeCondition)
            })
        }
        controlFlowElementList.push(controlFlowElement);
}

function createActivity(tempActivity){
    console.log(tempActivity)
    let activity = {
        id: "",
        name: "",
        initiator: "",
        target: "",
        idInElement: "",
        idOutElement: "",
        messageIn: "",
        executed: false,
        messageOut: "",
        tempState: false
    }

    const asciiResult = web3.utils.asciiToHex(tempActivity.id);
    activity.id = web3.utils.padRight(asciiResult, 64)
    activity.name = web3.utils.padRight(asciiResult, 64)
    if(tempActivity.participantRef[0].name){
        activity.initiator = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.participantRef[0].name), 64);
    }else{
        activity.initiator = web3.utils.padRight(0,64);
    }
    if(tempActivity.participantRef[1].name){
        activity.target = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.participantRef[1].name), 64);
    }else{
        activity.target = web3.utils.padRight(0,64);
    }
    if (tempActivity.incoming) {
        activity.idInElement = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.incoming[0].sourceRef.id), 64);
    } else if(tempActivity.$parent.$type.includes("bpmn:SubChoreography")){
        console.log("CASO IN CUI L'attivita non è connessa")
    }else{
        activity.idInElement = web3.utils.padRight(0, 64);
    }
    if (tempActivity.outgoing && tempActivity.outgoing>0) {
        activity.idOutElement = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.outgoing[0].targetRef.id), 64);
    } else if(tempActivity.$parent.$type.includes("bpmn:SubChoreography")) {
        activity.idOutElement=web3.utils.padRight(web3.utils.asciiToHex(tempActivity.$parent.outgoing[0].targetRef.id), 64);
    }else{
        activity.idOutElement = web3.utils.padRight(0, 64);
    }
    if (tempActivity.messageFlowRef[1]) {
        activity.messageIn = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.messageFlowRef[1].messageRef.id), 64);
        activity.messageOut = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.messageFlowRef[0].messageRef.id), 64);
    } else {
        activity.messageIn = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.messageFlowRef[0].messageRef.id), 64);
        activity.messageOut = web3.utils.padRight(0, 64);
    }
    
    return activity
}
function createMessage(tempActivity,newMessage){
    tempActivity.messageFlowRef.forEach((msg)=>{
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
        const messageAsciiResult = web3.utils.asciiToHex(msg.messageRef.id);
        message.id = web3.utils.padRight(messageAsciiResult, 64)
        message.name = web3.utils.padRight(messageAsciiResult, 64)
        message.mappingKey=web3.utils.padRight(0,64);
        message.sourceParticipant = "0x0000000000000000000000000000000000000000";
        message.targetParticipant = "0x0000000000000000000000000000000000000000";
        message.idActivity = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.id), 64);
        newMessage.push(message);
    })
}