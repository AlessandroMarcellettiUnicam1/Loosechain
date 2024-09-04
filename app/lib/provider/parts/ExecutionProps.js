import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import connectToBlockchain from '../../blockchain/connection';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import Web3 from 'web3';
const { ethereum } = window;
const web3 = new Web3(ethereum);
var domify = require('min-dom').domify;
/**
 * Adds execution properties to the properties panel group based on the type of BPMN element.
 *
 * The properties include a select box for message items and a list of checkboxes for attributes for message elements.
 * For participant elements, the properties include a select box for participant items.
 *
 * @param {Object} group - The properties panel group.
 * @param {djs.model.Base|ModdleElement} element - The BPMN element.
 * @param {Object} bpmnFactory - Factory to create new BPMN elements.
 * @param {Function} translate - Function to translate labels and descriptions.
 */
export default function addExecutionProps(group, element, bpmnFactory, translate) {
  const businessObject = getBusinessObject(element);

  if (is(element, 'bpmn:Message')) {
    addMessageProps(group, businessObject, translate);
  }

  if (is(element, 'bpmn:Participant')) {
    addParticipantProps(group, businessObject, translate);
  }
}

/**
 * Adds message properties to the properties panel group. The properties include a select box for message items and a
 * list of checkboxes for attributes.
 *
 * First of all, the function checks if the BPMN element has message items. If not, it gets the message items from the
 * parent choreography element. Then, it adds a select box for message items and a list of checkboxes for attributes.
 *
 * @param {Object} group - The properties panel group.
 * @param {Object} businessObject - The BPMN business object of the element.
 * @param {Function} translate - Function to translate labels and descriptions.
 */
function connectParticipants() {

  return domify('<div class="bpp-field-wrapper" style="flex-direction:column;">' +
    '<div class="bpp-properties-entry" ' + 'data-show="show"' + ' >' +
    '</div>' +
    '<button type="button"  class="btn btn-outline-primary" data-action="execute" ><span>Execute </span></button>' +
    '<p>' + "" + '</p>' +
    "</div>");
}
function addMessageProps(group, businessObject, translate) {
  group.entries.push(entryFactory.selectBox(translate, {
    id: 'messageItem',
    label: translate('Select Message'),
    selectOptions: () => getMessageItems(businessObject),
    modelProperty: 'messageItem',
    set: function(element, values) {
      let props={};
      props['name']=values['messageItem'] || undefined;
      props['messageItem']=values['messageItem'] || undefined;
      
      return cmdHelper.updateProperties(element,props)
    }
    
  }));
  const attributeItems = getParentChoreographyElement(businessObject).get('attributeItems');
  attributeItems.forEach((item, index) => addAttributeProps(group, businessObject, translate, item, index));
  group.entries.push(entryFactory.textBox(translate, {
    id: 'attributeValues',
    label: translate('Attribute Value'),
    modelProperty: 'attributeValues',
  }));
  group.entries.push(
    {
      id: "tortellini",
      html: connectParticipants(),
      modelProperty: "tortellini",
      execute: function () {
        buttonExecutePressedSelection(businessObject)
      }
    }
  );
  // }

}
function getBusinessObjectName(messageItem){
  return 'Name'+messageItem;
}
async function buttonExecutePressedSelection(businessObject) {
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
  let flag=true;
  businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').flowElements.forEach(e => {
    if (e.$type.includes("bpmn:ChoreographyTask") && flag) {
      if (e.messageFlowRef[1]) {
        if (businessObject.id.includes(e.messageFlowRef[0].messageRef.id)) {
          flag=false;
          selectionStruct.idActivity = web3.utils.padRight(web3.utils.asciiToHex(e.id), 64);
        } else {
          if (businessObject.id.includes(e.messageFlowRef[1].messageRef.id)) {
            flag=false;
            selectionStruct.idActivity = web3.utils.padRight(web3.utils.asciiToHex(e.id), 64);
          }
        }
      } else {
        if (businessObject.id.includes(e.messageFlowRef[0].messageRef.id)) {
          flag=false;
          selectionStruct.idActivity = web3.utils.padRight(web3.utils.asciiToHex(e.id), 64);
        }
      }
    }
  })
  let stringAttributes = businessObject.name.split("(");
  selectionStruct.idMessage = web3.utils.padRight(web3.utils.asciiToHex(businessObject.id), 64);
  selectionStruct.keyMapping = web3.utils.padRight(web3.utils.asciiToHex(stringAttributes[0]), 64);
  selectionStruct.source = "0xf9F784267A3B39b926B9A98281CA22f0E5D11Baf"
  selectionStruct.target = "0xf9F784267A3B39b926B9A98281CA22f0E5D11Baf"
  stringAttributes[1].substring(0, stringAttributes[1].length - 1).split(",").forEach((attr) => {
    selectionStruct.attributi.push(web3.utils.padRight(web3.utils.asciiToHex(attr), 64))
  })
  businessObject.attributeValues.split(";").forEach((value) => {
    selectionStruct.value.push(web3.utils.padRight(web3.utils.asciiToHex(value), 64))
  })
  console.log(selectionStruct)
  await contract.methods.executeSelectMessage(selectionStruct.attributi, selectionStruct.idActivity, selectionStruct.idMessage, selectionStruct.keyMapping, selectionStruct.source, selectionStruct.target, selectionStruct.value).send({ from: "0xD8d3683EA59d8AB2af961DA41af971e2A1d62fA0" })

}
async function buttonExecutePressed(businessObject) {
  let tempActivity;
  businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').flowElements.forEach(e => {
    if (e.$type.includes("bpmn:ChoreographyTask")) {
      if (e.messageFlowRef[1]) {
        if (businessObject.id.includes(e.messageFlowRef[0].messageRef.id)) {
          tempActivity = e;
        } else {
          if (businessObject.id.includes(e.messageFlowRef[1].messageRef.id)) {
            tempActivity = e;
          }
        }
      } else {
        if (businessObject.id.includes(e.messageFlowRef[0].messageRef.id)) {
          tempActivity = e;
        }
      }
    }
  })
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
  }

  const asciiResult = web3.utils.asciiToHex(tempActivity.id);
  activity.id = web3.utils.padRight(asciiResult, 64)
  activity.name = web3.utils.padRight(asciiResult, 64)
  activity.initiator = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.participantRef[0].id), 64);
  activity.target = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.participantRef[1].id), 64);
  console.log(tempActivity.incoming)
  if (tempActivity.incoming) {
    activity.idInElement = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.incoming[0].sourceRef.id), 64);
  } else {
    activity.idInElement = web3.utils.padRight(0, 64);
  }
  if (tempActivity.outgoing) {
    activity.idOutElement = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.outgoing[0].targetRef.id), 64);
  } else {
    activity.idOutElement = web3.utils.padRight(0, 64);
  }
  if (tempActivity.messageFlowRef[1]) {
    activity.messageIn = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.messageFlowRef[1].messageRef.id), 64);
    activity.messageOut = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.messageFlowRef[0].messageRef.id), 64);
  } else {
    activity.messageIn = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.messageFlowRef[0].messageRef.id), 64);
    activity.messageOut = web3.utils.padRight(0, 64);
  }
  console.log(activity)

  let message = {
    id: "",
    name: "",
    mappingKey: "",
    selectedAttr: [],
    sourceParticipant: "",
    targetParticipant: "",
    idActivity: "",
    executed: false
  }

  const messageAsciiResult = web3.utils.asciiToHex(businessObject.id);
  console.log(businessObject)
  message.id = web3.utils.padRight(messageAsciiResult, 64)
  message.name = web3.utils.padRight(messageAsciiResult, 64)
  message.mappingKey = web3.utils.padRight(0, 64);
  message.sourceParticipant = "0xDc5796010883B712413fC0b97F257d724088eD37";
  message.targetParticipant = "0xDc5796010883B712413fC0b97F257d724088eD37";
  message.idActivity = web3.utils.padRight(web3.utils.asciiToHex(tempActivity.id), 64)
  let attributes;
  if (businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography')) {
    attributes = businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').attributeItems.map(item => item.name)//.map(item => web3.utils.padRight(web3.utils.asciiToHex(item), 64));
  }
  attributes.forEach((attr) => {
    if (businessObject.get(attr)) {
      message.selectedAttr.push(web3.utils.padRight(web3.utils.asciiToHex(attr), 64))
    }
  })
  let selectAttributes = message.selectedAttr;
  let values = businessObject.attributeValues.split(";");
  console.log(selectAttributes)
  console.log(values)

  
  console.log(tempActivity)
  let controlFlowElementList=[]
  if (tempActivity.incoming) {
    tempActivity.incoming.forEach((element) => {
      let incomingElement=element.source

      if (incomingElement.$type.includes("Event") || incomingElement.$type.includes("Gateway")) {
        let controlFlowElement = {
          id: "",
          tipo: "",
          incomingActivity: [],
          outgoingActivity: [],
          executed: false
        }
        const controlAsciiResult = web3.utils.asciiToHex(element.id);
        controlFlowElement.id = web3.utils.padRight(controlAsciiResult, 64)
        if (incomingElement.$type.includes("bpmn:StartEvent")) {
          controlFlowElement.tipo = "0"
        } else if (incomingElement.$type.includes("bpmn:ExclusiveGateway")) {
          if (incomingElement.incoming.length == 1 && incomingElement.outgoing.length > 1) {
            controlFlowElement.tipo = "1"
          } else if (incomingElement.incoming.length > 1 && incomingElement.outgoing.length == 1) {
            controlFlowElement.tipo = "2"
          }
        } else if (incomingElement.$type.includes("bpmn:ParallelGateway")) {
          if (incomingElement.incoming.length == 1 && incomingElement.outgoing.length > 1) {
            controlFlowElement.tipo = "3"
          } else if (element.businessObject.incoming.length > 1 && element.businessObject.outgoing.length == 1) {
            controlFlowElement.tipo = "4"
          }
        } else if (element.type.includes("bpmn:EventBasedGateway")) {
          controlFlowElement.tipo = "5"
        } else if (element.type.includes("bpmn:EndEvent")) {
          controlFlowElement.tipo = "6"
        }
        if (element.businessObject.outgoing) {
          element.businessObject.outgoing.forEach((ref) => {
            controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.targetRef.id), 64))
          })
        }
        if (element.businessObject.incoming) {
          element.businessObject.incoming.forEach((ref) => {
            controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.sourceRef.id), 64))
          })
        }
        controlFlowElementList.push(controlFlowElement)
      }
  })
  console.log(controlFlowElementList)
}
 
  


}
/**
 * Adds participant properties to the properties panel group. The properties include a select box for participant items.
 *
 * First of all, the function checks if the BPMN element has participant items. If not, it gets the participant items
 * from the parent choreography element. Then, it adds a select box for participant items.
 *
 * @param {Object} group - The properties panel group.
 * @param {Object} businessObject - The BPMN business object of the element.
 * @param {Function} translate - Function to translate labels and descriptions.
 */
function addParticipantProps(group, businessObject, translate) {
  group.entries.push(entryFactory.selectBox(translate, {
    id: 'participantItem',
    label: translate('Select Participant'),
    selectOptions: () => getParticipantItems(businessObject),
    modelProperty: 'participantType'
  }));
}

function getMessageItems(businessObject) {
  const messageItems = hasMessageItems(businessObject)
    ? businessObject.get('messageItems')
    : getParentChoreographyElement(businessObject).get('messageItems');
  return [{ name: '', value: '' }, ...messageItems.map(item => ({ name: item.name, value: item.name }))];
}

function hasMessageItems(businessObject) {
  return businessObject.get('messageItems').length > 0;
}

function getParentChoreographyElement(businessObject) {
  return businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography');
}
//TODO how to gate the value of the checkbox from the composition case 
function addAttributeProps(group, businessObject, translate, item, index) {
  const modelProperty = item.name;
  group.entries.push(entryFactory.checkbox(translate, {
    id: 'attribute' + index,
    label: item.name,
    modelProperty: modelProperty,
    //line that hide the checkbox in the case of attribute selected during the selection
    hidden: () => hasMessageItems(businessObject),
    get: () => {
      // Logic for getting the attribute value and deselecting the checkbox if the BPMN element has message items
      const res = {};
      res[modelProperty] = hasMessageItems(businessObject)
        ? delete businessObject.$attrs[modelProperty]
        : businessObject.get(modelProperty)
      return res;
    }
  }));
  
}

function getParticipantItems(businessObject) {
  let participantItems = businessObject.get('participantItems');
  participantItems = participantItems.length > 0
    ? participantItems
    : businessObject.$parent.get('participantItems');

  return [{ name: '', value: '' }, ...participantItems.map(item => ({ name: item.name, value: item.name }))];
}