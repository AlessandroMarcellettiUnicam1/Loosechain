import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import { getAccount } from '../../blockchain/Connection';
import notify from '../../notifications';
import { modeler } from '../../../app';

var domify = require('min-dom').domify;

export default function createParticipantSubscriptionEntry(element, bpmnFactory, scope) {
  const businessObject = getBusinessObject(element);
  const buttonLabel = scope === 'process'
    ? 'Subscribe to this process with MetaMask'
    : 'Subscribe to this role with MetaMask';

  return {
    id: `subscribe-${scope}`,
    html: domify(
      '<div class="bpp-field-wrapper">' +
        `<button type="button" class="btn btn-outline-primary" data-action="execute">${buttonLabel}</button>` +
      '</div>'
    ),
    execute: async function() {
      try {
        const address = await getAccount();
        const existingParticipants = businessObject.get('participantItems') || [];
        if (existingParticipants.some(item => item.name && item.name.toLowerCase() === address.toLowerCase())) {
          notify('This MetaMask address is already subscribed here.', 'info');
          return;
        }

        const participant = bpmnFactory.create('loose:ParticipantValue', { name: address });
        const command = cmdHelper.addElementsTolist(
          element,
          businessObject,
          'participantItems',
          [participant]
        );
        modeler.get('commandStack').execute(command.cmd, command.context);
        notify('MetaMask address added as a participant. Save the diagram to share the subscription.', 'success');
      } catch (error) {
        console.error(`Could not subscribe to the ${scope}.`, error);
        notify(`Could not subscribe to the ${scope}: ${error.message}`, 'error');
      }
    }
  };
}
