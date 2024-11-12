import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import { modeler } from '../../../../app';
/**
 * Creates a custom table entry in the BPMN properties panel.
 *
 * @param {djs.model.Base|ModdleElement} element - The BPMN element.
 * @param {Object} bpmnFactory - Factory to create new BPMN elements.
 * @param {Function} translate - Function to translate labels and descriptions.
 * @param {Object} options - Configuration options.
 * @param {string} options.businessObjectProperty - The property of the business object to be modified.
 * @param {string} options.id - The ID of the entry.
 * @param {string} options.description - The description of the entry.
 * @param {string} options.labels - The label of the entry.
 * @param {string} options.addLabel - The label for the add button.
 * @param {string} options.type - The type of the new BPMN element to be created.
 * @returns {Object} The custom property table entry.
 */
export function createCustomTableEntry(element, bpmnFactory, translate, options) {
  const {
    businessObjectProperty,
    id,
    description,
    labels,
    addLabel,
    type
  } = options;
  const businessObject = getBusinessObject(element);

  return entryFactory.table(translate, {
    id,
    description: translate(description),
    modelProperties: ['name'],
    labels: [translate(labels)],
    addLabel: translate(addLabel),
    getElements: () => getBusinessObjectElements(businessObject, businessObjectProperty),
    addElement: element => addBusinessObjectElement(element, businessObject, bpmnFactory, businessObjectProperty, type),
    removeElement: (element, node, idx) => removeBusinessObjectElement(element, businessObject, idx,
      businessObjectProperty),
    updateElement: (element, values, node, idx) => updateBusinessObjectElement(element, businessObject, values, idx,
      businessObjectProperty)
  });
}

function getBusinessObjectElements(businessObject, businessObjectProperty) {
  return businessObject.get(businessObjectProperty);
}

function addBusinessObjectElement(element, businessObject, bpmnFactory, businessObjectProperty, type) {
  const newObject = bpmnFactory.create(type, { name: undefined });
  return cmdHelper.addElementsTolist(element, businessObject, businessObjectProperty, [newObject]);
}

function removeBusinessObjectElement(element, businessObject, idx, businessObjectProperty) {
  const objectToRemove = businessObject.get(businessObjectProperty)[idx];
  return cmdHelper.removeElementsFromList(element, businessObject, businessObjectProperty, null,
    [objectToRemove]);
}

//TODO Tab instaza serve un drop down menu per selezionare le varie istance

function updateBusinessObjectElement(element, businessObject, values, idx, businessObjectProperty) {
  console.log(element,businessObject, values, idx, businessObjectProperty)
  const itemToUpdate = businessObject.get(businessObjectProperty)[idx];
  const cavas=modeler.get('canvas');
  const rootElement=cavas.getRootElement();
  const participantList=rootElement.businessObject.participants;
  if (!element.type.includes("bpmn:Participant") && businessObjectProperty.includes('participantItems')) {
    const commandStack = modeler.get('commandStack');
    const participantProps = {
      id: 'newParticipant',
      name: values.name,
      type: 'participant',
      index:idx
    };
    if (idx+1>participantList.length) {
      commandStack.execute('participant.create', participantProps);
    } else {
      participantList[idx].name=values.name;
      modeler.get('eventBus').fire('element.changed', { 
        element: participantList[idx],
        additionalParam: true
      });
    }
  }
  return cmdHelper.updateBusinessObject(element, itemToUpdate, values);
}
/**
 * Creates a custom label entry in the BPMN properties panel.
 *
 * @param {djs.model.Base|ModdleElement} element - The BPMN element.
 * @param {Object} bpmnFactory - Factory to create new BPMN elements.
 * @param {Function} translate - Function to translate labels and descriptions.
 * @param {Object} options - Configuration options.
 * @param {string} options.businessObjectProperty - The property of the business object to be modified.
 * @param {string} options.id - The ID of the entry.
 * @param {string} options.description - The description of the entry.
 * @param {string} options.label - The label of the entry.
 * @returns {Object} The custom label entry.
 */
export function createCustomLabel(element, bpmnFactory, translate, options) {
  const {
    businessObjectProperty,
    id,
    description,
    label
  } = options;
  const businessObject = getBusinessObject(element);
  return entryFactory.textField(translate, {
    id,
    description: translate(description),
    label: translate(label),
    modelProperty: businessObjectProperty,
    get: (element) => {
      const bo = getBusinessObject(element);
      return { [businessObjectProperty]: bo.get(businessObjectProperty) };
    },
    set: (element, values) => {
      const bo = getBusinessObject(element);
      const properties = {};
      properties[businessObjectProperty] = values[businessObjectProperty];
      return cmdHelper.updateBusinessObject(element, bo, properties);
    }
  });
}