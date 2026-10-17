import BpmnPropertiesProvider from 'bpmn-js-properties-panel/lib/provider/bpmn/BpmnPropertiesProvider';
import inherits from 'inherits';
import selectionProps from './parts/SelectionProps';
import compositionProps from './parts/CompositionProps';
import executionProps from './parts/ExecutionProps';
import { selectBox } from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { addCustomLabel } from './parts/helper/TableDefinitionHelper';
import connectToBlockchain from '../blockchain/Connection';
import { modeler } from '../../app';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import updateUI from '../blockchain/UiUpdater';
import { getInstanceOptions, refreshInstanceOptions } from '../blockchain/InstanceNumbers';
import notify from '../notifications';

var domify = require('min-dom').domify;

/**
 * Custom properties provider for Looseness properties. This provider adds a new tab to the base properties panel of
 * bpmn-js. This tab contains the following groups: Selection Degree, Composition Degree, and Execution.
 *
 * @param {Object} injector - The dependency injector.
 * @param {Object} bpmnFactory - Factory to create new BPMN elements.
 * @param {Function} translate - Function to translate labels and descriptions.
 */
export default function LoosenessPropertiesProvider(injector, bpmnFactory, translate) {
  injector.invoke(BpmnPropertiesProvider, this);
  const superGetTabs = this.getTabs;
  this.getTabs = function(element) {
    const tabs = superGetTabs.call(this, element);
    tabs.push({
      id: 'modeling',
      label: 'Modeling',
      groups: createModelingGroups(element, bpmnFactory, translate)
    });

    tabs.push({
      id: 'execution',
      label: 'Execution',
      groups: createExecutionGroups(element, bpmnFactory, translate)
    });
    if (element.type==='bpmn:Choreography') {
      tabs.push({
        id: 'choreography',
        label: 'Instance',
        groups: createChoreographyGroups(element, bpmnFactory, translate)
      });
    }
    return tabs;
  };
}
inherits(LoosenessPropertiesProvider, BpmnPropertiesProvider);

/**
 * Creates the groups for the modeling tab.
 * @param {djs.model.Base|ModdleElement} element - The element to create the groups for.
 * @param {Object} bpmnFactory - Factory to create new BPMN elements.
 * @param {Function} translate - Function to translate labels and descriptions.
 * @returns {Array} The modeling groups created.
 */
function createModelingGroups(element, bpmnFactory, translate) {
  const selectionGroup = {
    id: 'selection-degree',
    label: 'Selection Degree',
    entries: []
  };
  selectionProps(selectionGroup, element, bpmnFactory, translate);

  const compositionGroup = {
    id: 'composition-degree',
    label: 'Composition Degree',
    entries: []
  };
  compositionProps(compositionGroup, element, bpmnFactory, translate);

  return [selectionGroup, compositionGroup];
}

/**
     * Creates the groups for the choreography tab.
     * @param {djs.model.Base|ModdleElement} element - The element to create the groups for.
     * @param {Object} bpmnFactory - Factory to create new BPMN elements.
     * @param {Function} translate - Function to translate labels and descriptions.
     * @returns {Array} The choreography groups created.
     */

function createChoreographyGroups(element, bpmnFactory, translate) {
  const choreographyGroup = {
    id: 'choreography-properties',
    label: 'Choreography Properties',
    entries: []
  };
  addCustomLabel(choreographyGroup, element, bpmnFactory, translate, 'bpmn:Choreography', {
    id: 'ChorInstanceId',
    description: 'Instace Id',
    label: 'Instance Id',
    businessObjectProperty: 'ChorInstanceId',
  });
  connectToBlockchain()
    .then(contract => refreshInstanceOptions(element, contract, modeler))
    .catch(error => {
      window.dispatchEvent(new CustomEvent('loosechain:notification', {
        detail: { type: 'error', message: `Could not load choreography instances: ${error.message}` }
      }));
    });

  choreographyGroup.entries.push(selectBox(translate, {
    id: 'instanceNumberId',
    label: translate('Select Instance Number'),
    selectOptions: getInstanceOptions(element.businessObject),
    modelProperty: 'instanceNumberId',
    set: function(element, values) {
      const props = {};
      const instanceNumber = values.instanceNumberId || '';
      element.businessObject.set('ChorInstanceId', instanceNumber.replace(/[^\x20-\x7E]/g, ''));
      return cmdHelper.updateBusinessObject(element, props);
    }
  }));


  choreographyGroup.entries.push(
    {
      id: 'getIstance',
      html: storeChor(),
      modelProperty: 'getIstance',
      execute: async function() {
        try {
          const contract = await connectToBlockchain();
          await updateUI(contract, modeler);
          const instance = (element.businessObject.$attrs && element.businessObject.$attrs.ChorInstanceId) || '1';
          notify(`Status loaded for choreography instance ${instance}.`, 'success');
        } catch (error) {
          console.error('Could not load choreography instance status.', error);
          notify(`Could not load choreography instance status: ${error.message}`, 'error');
        }
      }
    }
  );
  // Add choreography specific properties here
  // choreographyProps(choreographyGroup, element, bpmnFactory, translate);
  return [choreographyGroup];
}

function storeChor() {

  return domify('<div class="bpp-field-wrapper" style="flex-direction:column;">' +
    '<div class="bpp-properties-entry" ' + 'data-show="show"' + ' >' +
    '</div>' +
    '<button type="button"  class="btn btn-outline-primary" data-action="execute" ><span>Get instance status</span></button>' +
    '<p>' + '' + '</p>' +
    '</div>');
}

/**
 * Creates the groups for the execution tab.
 * @param {djs.model.Base|ModdleElement} element - The element to create the groups for.
 * @param {Object} bpmnFactory - Factory to create new BPMN elements.
 * @param {Function} translate - Function to translate labels and descriptions.
 * @returns {Array} The execution groups created.
 */
function createExecutionGroups(element, bpmnFactory, translate) {
  const executionGroup = {
    id: 'execution',
    label: 'Execution',
    entries: []
  };
  executionProps(executionGroup, element, bpmnFactory, translate);

  return [executionGroup];
}


LoosenessPropertiesProvider.$inject = ['injector', 'bpmnFactory', 'translate'];
