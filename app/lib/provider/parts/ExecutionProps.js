import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

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
function addMessageProps(group, businessObject, translate) {
  group.entries.push(entryFactory.selectBox(translate, {
    id: 'messageItem',
    label: translate('Select Message'),
    selectOptions: () => getMessageItems(businessObject),
    modelProperty: 'messageItem',
  }));
  //TODO: differentiate the selection and the composition case 
  if(businessObject.get('attributeItems').length>0){
    const attributeSelectionItems = businessObject.get('attributeItems');
    attributeSelectionItems.forEach((item, index) => addAttributeProps(group, businessObject, translate, item, index));
  }else{
    const attributeItems = getParentChoreographyElement(businessObject).get('attributeItems');
    attributeItems.forEach((item, index) => addAttributeProps(group, businessObject, translate, item, index));
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

function addAttributeProps(group, businessObject, translate, item, index) {
  const modelProperty = 'attribute' + index + '_' + item.name;
  group.entries.push(entryFactory.checkbox(translate,{
    id: 'attribute' + index,
    label: item.name,
    modelProperty: modelProperty,
    //line that hide the checkbox in the case of attribute selected during the selection
    // hidden: () => hasMessageItems(businessObject),
    get: () => {
      // Logic for getting the attribute value and deselecting the checkbox if the BPMN element has message items
      const res = {};
      // res[modelProperty] = hasMessageItems(businessObject)
      //   ? delete businessObject.$attrs[modelProperty]
      //   : businessObject.get(modelProperty);
      res[modelProperty]=businessObject.get(modelProperty);
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