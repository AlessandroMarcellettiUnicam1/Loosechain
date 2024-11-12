/* eslint-disable keyword-spacing */
/* eslint-disable indent */
import connectToBlockchain from '../../blockchain/connection';
import Web3 from 'web3';
import { modeler } from '../../../app';
const { ethereum } = window;
const web3 = new Web3(ethereum);
var domify = require('min-dom').domify;


export async function buttonExecutePressedComposition(businessObject) {
    const contract = await connectToBlockchain();
    console.log(businessObject)
    let nextActivity = [];
    let newMessage = [];
    let tempActivity;
    let flag = true;
    let controlFlowElementList=[];
    let edgeConditionList=[];
    businessObject.$parent
        .get('rootElements')
        .find((e) => e.$type === 'bpmn:Choreography')
        .flowElements.forEach((e) => {
            if (e.$type.includes('bpmn:ChoreographyTask') && flag) {
                if (e.messageFlowRef[1]) {
                    if (businessObject.id.includes(e.messageFlowRef[0].messageRef.id)) {
                        tempActivity = e;
                        flag = false;
                    } else {
                        if (businessObject.id.includes(e.messageFlowRef[1].messageRef.id)) {
                            tempActivity = e;
                            flag = false;
                        }
                    }
                } else {
                    if (businessObject.id.includes(e.messageFlowRef[0].messageRef.id)) {
                        flag = false;
                        tempActivity = e;
                    }
                }
            }
        });
    if (!tempActivity) {
        businessObject.$parent
            .get('rootElements')
            .find((e) => e.$type === 'bpmn:Choreography')
            .flowElements.forEach((e) => {
                if (e.$type.includes('bpmn:SubChoreography')) {
                    e.flowElements.forEach((ele) => {
                        if (ele.$type.includes('bpmn:ChoreographyTask')) {
                            if (ele.messageFlowRef[1]) {
                                if (
                                    businessObject.id.includes(
                                        ele.messageFlowRef[0].messageRef.id
                                    )
                                ) {
                                    tempActivity = ele;
                                } else {
                                    if (
                                        businessObject.id.includes(
                                            ele.messageFlowRef[1].messageRef.id
                                        )
                                    ) {
                                        tempActivity = ele;
                                    }
                                }
                            } else {
                                if (
                                    businessObject.id.includes(
                                        ele.messageFlowRef[0].messageRef.id
                                    )
                                ) {
                                    tempActivity = ele;
                                }
                            }
                        }
                    });
                }
            });
    }
    let activity = {
        id: '',
        name: '',
        initiator: '',
        target: '',
        idInElement: '',
        idOutElement: '',
        messageIn: '',
        executed: false,
        messageOut: '',
        tempState: false,
    };
    console.log(tempActivity)
    const asciiResult = web3.utils.asciiToHex(tempActivity.id);
    activity.id = web3.utils.padRight(asciiResult, 64);
    activity.name = web3.utils.padRight(asciiResult, 64);
    if (
        tempActivity.$parent.participantItems &&
        tempActivity.$parent.participantItems.length > 0
    ) {
        activity.initiator = web3.utils.padRight(0, 64);
        activity.target = web3.utils.padRight(0, 64);
    } else {
        activity.initiator = web3.utils.padRight(
            web3.utils.asciiToHex(tempActivity.participantRef[0].name),
            64
        );
        activity.target = web3.utils.padRight(
            web3.utils.asciiToHex(tempActivity.participantRef[1].name),
            64
        );
    }
    if (tempActivity.incoming) {
        activity.idInElement = web3.utils.padRight(
            web3.utils.asciiToHex(tempActivity.incoming[0].sourceRef.id),
            64
        );
    } else if (tempActivity.$parent.$type.includes('bpmn:SubChoreography')) {
        console.log("CASO IN CUI L'attivita non è connessa");
    } else {
        activity.idInElement = web3.utils.padRight(0, 64);
    }
    if (tempActivity.outgoing && tempActivity.outgoing.length > 0) {
        activity.idOutElement = web3.utils.padRight(
            web3.utils.asciiToHex(tempActivity.outgoing[0].targetRef.id),
            64
        );
    } else if (tempActivity.$parent.$type.includes('bpmn:SubChoreography')) {
        activity.idOutElement = web3.utils.padRight(
            web3.utils.asciiToHex(tempActivity.$parent.outgoing[0].targetRef.id),
            64
        );
    } else {
        activity.idOutElement = web3.utils.padRight(0, 64);
    }
    if (tempActivity.messageFlowRef[1]) {
        activity.messageIn = web3.utils.padRight(
            web3.utils.asciiToHex(tempActivity.messageFlowRef[1].messageRef.id),
            64
        );
        activity.messageOut = web3.utils.padRight(
            web3.utils.asciiToHex(tempActivity.messageFlowRef[0].messageRef.id),
            64
        );
    } else {
        activity.messageIn = web3.utils.padRight(
            web3.utils.asciiToHex(tempActivity.messageFlowRef[0].messageRef.id),
            64
        );
        activity.messageOut = web3.utils.padRight(0, 64);
    }
    let message = {
        id: '',
        name: '',
        mappingKey: '',
        selectedAttr: [],
        sourceParticipant: '',
        targetParticipant: '',
        idActivity: '',
        executed: false,
        tempState: false,
    };
    const messageAsciiResult = web3.utils.asciiToHex(businessObject.id);
    message.id = web3.utils.padRight(messageAsciiResult, 64);
    message.name = web3.utils.padRight(messageAsciiResult, 64);
    message.sourceParticipant =
        tempActivity.participantRef[0].$attrs.participantType;
    message.targetParticipant =
        tempActivity.participantRef[1].$attrs.participantType;
    message.idActivity = web3.utils.padRight(
        web3.utils.asciiToHex(tempActivity.id),
        64
    );
    let attributes;
    if (businessObject.get('messageItems').length > 0) {
        console.log(businessObject);
        let splitString = businessObject.name.split('(');
        message.mappingKey = web3.utils.padRight(
            web3.utils.asciiToHex(splitString[0]),
            64
        );
        let splitCut = splitString[1]
            .substring(0, splitString[1].length - 1)
            .split(',');
        let attributesListTemp = [];
        splitCut.forEach((e) => {
            attributesListTemp.push(
                web3.utils.padRight(web3.utils.asciiToHex(e), 64)
            );
        });
        message.selectedAttr = attributesListTemp;
    } else {
        message.mappingKey = web3.utils.padRight(
            web3.utils.asciiToHex(businessObject.$attrs.messageItem),
            64
        );
        if (
            businessObject.$parent
                .get('rootElements')
                .find((e) => e.$type === 'bpmn:Choreography')
        ) {
            attributes = businessObject.$parent
                .get('rootElements')
                .find((e) => e.$type === 'bpmn:Choreography')
                .attributeItems.map((item) => item.name);
        }
        attributes.forEach((attr) => {
            if (businessObject.get(attr)) {
                message.selectedAttr.push(
                    web3.utils.padRight(web3.utils.asciiToHex(attr), 64)
                );
            }
        });
    }
    let selectAttributes = message.selectedAttr;
    let values = [];
    businessObject.$attrs.attributeValues.split(';').forEach((e) => {
        values.push(web3.utils.padRight(web3.utils.asciiToHex(e), 64));
    });

    let diff=createDiff(businessObject);
    diff.activityList=diff.activityList.filter((e)=>e.id!=activity.id);
    diff.messages=diff.messages.filter((e=>e.id!=message.id));
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 3000000;
    let instance;
    if(businessObject.$parent.get('rootElements').find((e) => e.$type === 'bpmn:Choreography').$attrs.instanceId) {
        instance=businessObject.$parent.get('rootElements').find((e) => e.$type === 'bpmn:Choreography').$attrs.instanceId;
    }else{
        instance='0';
    }
    const hashInstance=web3.utils.padRight(web3.utils.asciiToHex(instance),64);
    if(tempActivity.outgoing && tempActivity.outgoing.length>0 && (tempActivity.outgoing[0].targetRef.$type.includes('Event') || tempActivity.outgoing[0].targetRef.$type.includes('Gateway'))) {
        genereteControlFlow(tempActivity.outgoing[0].targetRef,controlFlowElementList);
    }
    console.log(
        activity,
        message,
        controlFlowElementList,
        selectAttributes,
        values,
        diff.activityList,
        diff.controlFlowElementList,
        diff.edgeConditionList,
        diff.messages,
        hashInstance
    );


    await contract.methods
      .executeCompMessage(
            activity,
            message,
            controlFlowElementList,
            selectAttributes,
            values,
            diff.activityList,
            diff.controlFlowElementList,
            diff.edgeConditionList,
            diff.messages,
            hashInstance,
        )
        .send({
            from: '0xaBD182AFFE39B8826B11f76D0550118BAB6A5C2f',
            gas: gasLimit,
            gasPrice: gasPrice,
        });
       return true;
}
function searchForNextActivities(
    tempActivity,
    controlFlowElementList,
    nextActivity,
    newMessage
) {
    tempActivity.outgoing.forEach((element) => {
        if (element.targetRef.$type.includes('bpmn:ChoreographyTask')) {
            console.log(element);
            if (!element.targetRef.di.fill) {
                nextActivity.push(createActivity(element.targetRef));
                createMessage(element.targetRef, newMessage);
            }
        } else if (
            element.targetRef.$type.includes('Event') ||
            element.targetRef.$type.includes('Gateway')
        ) {
            if (!element.targetRef.di.fill) {
                genereteControlFlow(element.targetRef, controlFlowElementList);
                console.log(element.targetRef);
                if (!element.targetRef.$type.includes('bpmn:EndEvent')) {
                    searchForNextActivities(
                        element.targetRef,
                        controlFlowElementList,
                        nextActivity,
                        newMessage
                    );
                }
            }
        }
    });
}
function genereteControlFlow(element, controlFlowElementList) {
    let controlFlowElement = {
        id: '',
        tipo: '',
        incomingActivity: [],
        outgoingActivity: [],
        executed: false,
    };
    const controlAsciiResult = web3.utils.asciiToHex(element.id);
    controlFlowElement.id = web3.utils.padRight(controlAsciiResult, 64);
    if (element.outgoing) {
        element.outgoing.forEach((ref) => {
            controlFlowElement.outgoingActivity.push(
                web3.utils.padRight(web3.utils.asciiToHex(ref.targetRef.id), 64)
            );
            console.log(ref.targetRef);
            // if(ref.target.$type.includes("bpmn:ChoreographyTask")){
            //     nextActivity.push(createActivity(ref.target))
            // }else if(ref.targetRef.$type.includes("Event")|| ref.targetRef.$type.includes("Gateway")){
            //     genereteControlFlow(ref.targetRef,controlFlowElement,nextActivity);
            // }
        });
    } else {
        if (element.$parent.$type.includes('bpmn:SubChoreography')) {
            console.log(element.$parent);
            controlFlowElement.outgoingActivity.push(
                web3.utils.padRight(
                    web3.utils.asciiToHex(element.$parent.outgoing[0].targetRef.id),
                    64
                )
            );
        }
    }
    if (element.incoming) {
        element.incoming.forEach((ref) => {
            controlFlowElement.incomingActivity.push(
                web3.utils.padRight(web3.utils.asciiToHex(ref.sourceRef.id), 64)
            );
        });
    } else {
        console.log('CASO DA FIXARE');
    }
    if (element.$type.includes('bpmn:StartEvent')) {
        controlFlowElement.tipo = '1';
    } else if (element.$type.includes('bpmn:ExclusiveGateway')) {
        if (
            controlFlowElement.incomingActivity.length == 1 &&
            controlFlowElement.outgoingActivity.length > 1
        ) {
            controlFlowElement.tipo = '2';
        } else if (
            controlFlowElement.incomingActivity.length > 1 &&
            controlFlowElement.outgoingActivity.length == 1
        ) {
            controlFlowElement.tipo = '3';
        } else {
            controlFlowElement.tipo = '8';
        }
    } else if (element.$type.includes('bpmn:ParallelGateway')) {
        if (
            controlFlowElement.incomingActivity.length == 1 &&
            controlFlowElement.outgoingActivity.length > 1
        ) {
            controlFlowElement.tipo = '4';
        } else if (
            controlFlowElement.incomingActivity.length > 1 &&
            controlFlowElement.outgoingActivity.length == 1
        ) {
            controlFlowElement.tipo = '5';
        } else {
            controlFlowElement.tipo = '8';
        }
    } else if (element.$type.includes('bpmn:EventBasedGateway')) {
        controlFlowElement.tipo = '6';
    } else if (element.$type.includes('bpmn:EndEvent')) {
        controlFlowElement.tipo = '7';
    }
    // I can save the control flow element only if it outgoing element because if i save the incoming i can have some problem
    // with the validation of the variables
    if (controlFlowElement.tipo.includes('2')) {
        element.outgoing.forEach((edge) => {
            let edgeCondition = {
                attribute: '',
                comparisonValue: '',
                condition: '',
                idActivity: '',
            };
            let condtionType = [
                'GREATER',
                'LESS',
                'EQUAL',
                'GREATEREQUAL',
                'LESSEQUAL',
            ];
            let stringcondition = edge.name.split(' ');
            edgeCondition.attribute = web3.utils.padRight(
                web3.utils.asciiToHex(stringcondition[0]),
                64
            );
            edgeCondition.comparisonValue = web3.utils.padRight(
                web3.utils.asciiToHex(stringcondition[2]),
                64
            );
            edgeCondition.condition = condtionType.indexOf(
                stringcondition[1].toUpperCase()
            );
            if (edge.targetRef.$type) {
                edgeCondition.idActivity = web3.utils.padRight(
                    web3.utils.asciiToHex(edge.targetRef.id),
                    64
                );
            }
            // edgeConditionList.push(edgeCondition)
        });
    }
    controlFlowElementList.push(controlFlowElement);
}

function createDiff(businessObject) {

  const elements = modeler.get('elementRegistry')['_elements'];
  let diff;
  let activityList = [];

  let controlFlowElementList = [];
  let messagges = [];
  let messageAttributesList = [];
  let addressKeyMappingList = [];
  let participantList = [];
  let keyMappingParticipants = [];
  let edgeConditionList = [];
  let subChoreographyList = [];
  for (const e in elements) {
    if (elements[e].element.type.includes('Task') && !elements[e].element.businessObject.di.fill) {
      createActivity(elements[e], activityList, addressKeyMappingList, participantList, keyMappingParticipants);
    } else if (elements[e].element.type.includes('Message') && !checkMessageColor(modeler.get('elementRegistry').getGraphics(elements[e].element.id).querySelector('g').children[1].style.fill)) {
      createMessage(elements[e], messagges, activityList, messageAttributesList);
    } else if (!elements[e].element.businessObject.di.fill && (elements[e].element.type.includes('Event') || elements[e].element.type.includes('Gateway'))) {
      createGatewayElement(elements[e], controlFlowElementList);
    } else if (elements[e].element.type.includes('bpmn:SequenceFlow')) {
      createEdegeList(elements[e], edgeConditionList);
    } else if (elements[e].element.type.includes('bpmn:SubChoreography')) {
  }
}
diff={
    activityList:activityList,
    messages:messagges,
    controlFlowElementList:controlFlowElementList,
    edgeConditionList:edgeConditionList
}
;
return diff;
}
function createActivity(diagramElement, activityList, addressKeyMappingList, participantList, keyMappingParticipants) {
    let activity = {
      id: '',
      name: '',
      initiator: '',
      target: '',
      idInElement: '',
      idOutElement: '',
      messageIn: '',
      messageOut: '',
      executed: false,
      tempState: false
    };

    const asciiResult = web3.utils.asciiToHex(diagramElement.element.id);
    activity.id = web3.utils.padRight(asciiResult, 64);
    activity.name = web3.utils.padRight(asciiResult, 64);
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
    } else if (diagramElement.element.businessObject.$parent.$type.includes('bpmn:SubChoreography')) {
      activity.idOutElement = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.incoming[0].sourceRef.id), 64);
    } else {
      activity.idInElement = web3.utils.padRight(0, 64);
    }

    if (diagramElement.element.businessObject.outgoing && diagramElement.element.businessObject.outgoing.length > 0) {
      activity.idOutElement = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.outgoing[0].targetRef.id), 64);
    } else {
      if (diagramElement.element.businessObject.$parent.$type.includes('bpmn:SubChoreography')) {
        activity.idOutElement = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.outgoing[0].targetRef.id), 64);
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
  }

  function createMessage(diagramElement, messagges, activityList, messageAttributesList) {
    let message = {
      id: '',
      name: '',
      mappingKey: '',
      selectedAttr: [],
      sourceParticipant: '',
      targetParticipant: '',
      idActivity: '',
      executed: false,
      tempState: false
    };
    const asciiResult = web3.utils.asciiToHex(diagramElement.element.id);
    message.id = web3.utils.padRight(asciiResult, 64);
    message.name = web3.utils.padRight(asciiResult, 64);
    message.mappingKey = web3.utils.padRight(0, 64);

    message.sourceParticipant = '0x0000000000000000000000000000000000000000';
    message.targetParticipant = '0x0000000000000000000000000000000000000000';
    activityList.forEach((e) => {
      if (e.messageIn.includes(message.id)) {
        message.idActivity = e.id;
      } else if (e.messageOut.includes(message.id)) {
        message.idActivity = e.id;
      }
    });
    messagges.push(message);

  }

  function createGatewayElement(diagramElement, controlFlowElementList) {
    // console.log(diagramElement)
    let typeList = ['bpmn:StartEvent', 'bpmn:ExclusiveGateway', 'bpmn:EndEvent', 'bpmn:ParallelGateway', 'bpmn:EventBasedGateway'];
    let controlFlowElement = {
      id: '',
      tipo: '',
      incomingActivity: [],
      outgoingActivity: [],
      executed: false
    };
    const asciiResult = web3.utils.asciiToHex(diagramElement.element.id);
    controlFlowElement.id = web3.utils.padRight(asciiResult, 64);

    if (diagramElement.element.businessObject.outgoing) {
      diagramElement.element.businessObject.outgoing.forEach((ref) => {
        controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.targetRef.id), 64));
      });
    } else if (diagramElement.element.businessObject.$parent.$type.includes('bpmn:SubChoreography')) {
      controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.outgoing[0].targetRef.id), 64));
    }
    if (diagramElement.element.businessObject.incoming) {
      diagramElement.element.businessObject.incoming.forEach((ref) => {
        if (ref.sourceRef.$type.includes('bpmn:SubChoreography')) {
          let temp = ref.sourceRef.flowElements.
            filter(e =>
              e.$type.includes('Event') ||
              e.$type.includes('Gateway') ||
              e.$type.includes('Task')).
            filter(e => !e.outgoing)[0];
          controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(temp.id), 64));
        } else {
          controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.sourceRef.id), 64));
        }
      });
    } else if (diagramElement.element.businessObject.$parent.$type.includes('bpmn:SubChoreography')) {
        controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.incoming[0].sourceRef.id), 64));
    }
    if (diagramElement.element.type.includes('bpmn:StartEvent')) {
      controlFlowElement.tipo = '1';
    } else if (diagramElement.element.type.includes('bpmn:ExclusiveGateway')) {
      if (controlFlowElement.incomingActivity.length == 1 && controlFlowElement.outgoingActivity.length > 1) {
        controlFlowElement.tipo = '2';
      } else if (controlFlowElement.incomingActivity.length > 1 && controlFlowElement.outgoingActivity.length == 1) {
        controlFlowElement.tipo = '3';
      } else {
        controlFlowElement.tipo = '8';
      }
    } else if (diagramElement.element.type.includes('bpmn:ParallelGateway')) {
      if (controlFlowElement.incomingActivity.length == 1 && controlFlowElement.outgoingActivity.length > 1) {
        controlFlowElement.tipo = '4';
      } else if (controlFlowElement.incomingActivity.length > 1 && controlFlowElement.outgoingActivity.length == 1) {
        controlFlowElement.tipo = '5';
      } else {
        controlFlowElement.tipo = '8';
      }
    } else if (diagramElement.element.type.includes('bpmn:EventBasedGateway')) {
      controlFlowElement.tipo = '6';
    } else if (diagramElement.element.type.includes('bpmn:EndEvent')) {
      controlFlowElement.tipo = '7';
    }

    controlFlowElementList.push(controlFlowElement);
  }

  function createEdegeList(diagramElement, edgeConditionList) {
    let edgeCondition = {
      attribute: '',
      comparisonValue: '',
      condition: '',
      idActivity: ''
    };
    if (diagramElement.element.businessObject.name) {
      let condtionType = ['GREATER', 'LESS', 'EQUAL', 'GREATEREQUAL', 'LESSEQUAL'];
      let stringcondition = diagramElement.element.businessObject.name.split(' ');
      edgeCondition.attribute = web3.utils.padRight(web3.utils.asciiToHex(stringcondition[0]), 64);
      edgeCondition.comparisonValue = web3.utils.padRight(web3.utils.asciiToHex(stringcondition[2]), 64);
      edgeCondition.condition = condtionType.indexOf(stringcondition[1].toUpperCase());
      if (diagramElement.element.businessObject.targetRef.$type) {
        edgeCondition.idActivity = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.targetRef.id), 64);
      }
      edgeConditionList.push(edgeCondition);
    }
  }
//   function createSubChoreographyList(diagramElement, subChoreographyList) {
//     let elementContained = diagramElement.element.businessObject.flowElements.
//       filter(e =>
//         e.$type.includes('Event') ||
//         e.$type.includes('Gateway') ||
//         e.$type.includes('Task'));
//     elementContained.forEach((element) => {
//       if (!element.outgoing) {
//       }
//     });
//   }
//   function findLastSubChoElement(diagramElement) {
//     console.log(diagramElement);
//     let elementContained = diagramElement.flowElements.
//       filter(e =>
//         e.$type.includes('Event') ||
//         e.$type.includes('Gateway') ||
//         e.$type.includes('Task')).
//       filter(e => !e.outgoing)[0];

//     console.log(elementContained);
//   }
  function checkMessageColor(color) {
    return color.includes('lightgreen') || color.includes('yellow') || color.includes('lightgray');
  }