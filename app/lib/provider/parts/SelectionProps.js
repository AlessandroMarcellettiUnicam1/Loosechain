import { addTableDefinition } from './helper/TableDefinitionHelper';

/**
 * Adds selection properties for the specified BPMN element to the properties group. The properties include a table
 * definition for message items and a table definition for participants.
 *
 * @param {Object} group - The properties panel group.
 * @param {djs.model.Base|ModdleElement} element - The BPMN element.
 * @param {Object} bpmnFactory - Factory to create new BPMN elements.
 * @param {Function} translate - Function to translate labels and descriptions.
 */
export default function addSelectionProps(group, element, bpmnFactory, translate) {
  addTableDefinition(group, element, bpmnFactory, translate, 'bpmn:Message', {
    id: 'messageList',
    description: 'Message List',
    labels: 'Message',
    addLabel: 'Add Message',
    businessObjectProperty: 'messageItems',
    type: 'loose:MessageValue'
  });

  addTableDefinition(group, element, bpmnFactory, translate, 'bpmn:Message', {
    id: 'attributeList',
    description: 'Attribute List',
    labels: 'Attribute',
    addLabel: 'Add Attribute',
    businessObjectProperty: 'attributeItems',
    type: 'loose:AttributeValue'
  });

  addTableDefinition(group, element, bpmnFactory, translate, 'bpmn:Participant', {
    id: 'participantList',
    description: 'Participant List',
    labels: 'Participant',
    addLabel: 'Add Participant',
    businessObjectProperty: 'participantItems',
    type: 'loose:ParticipantValue'
  });
}
