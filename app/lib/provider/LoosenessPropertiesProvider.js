import BpmnPropertiesProvider from 'bpmn-js-properties-panel/lib/provider/bpmn/BpmnPropertiesProvider';
import inherits from 'inherits';
import selectionProps from './parts/SelectionProps';
import compositionProps from './parts/CompositionProps';
import executionProps from './parts/ExecutionProps';
import entryFactory, { selectBox } from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { addCustomLabel } from './parts/helper/TableDefinitionHelper';
import connectToBlockchain from '../blockchain/connection';
import { modeler } from '../../app';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import contract from '../blockchain/contract';

import updateUI from '../blockchain/uiUpdater';
var domify = require('min-dom').domify;

import Web3 from 'web3';
const { ethereum } = window;
const web3 = new Web3(ethereum);
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
    console.log(element)
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
    id: 'instanceId',
    description: 'Attribute values',
    label: 'Values',
    businessObjectProperty: 'instanceId',
  });
  let instanceValue="";
  // TODO Correggere le async await
  let instanceOptions = [ { name: 'Select instance number', value: '1' }];
  choreographyGroup.entries.push(selectBox(translate, {
    id: 'instanceNumberId',
    label: translate('Select Instance Number'),
    selectOptions: element.businessObject.instanceNumber ? element.businessObject.instanceNumber : instanceOptions,
    modelProperty: 'instanceNumberId',
    set: function(element, values) {
      const props = {};
      instanceValue = values["instanceNumberId"];
      props["instanceId"] = values["instanceNumberId"];
      element.businessObject.instanceId =instanceValue ;
      return cmdHelper.updateBusinessObject(element, props);
    }
  })
);
console.log(instanceValue);
 
  choreographyGroup.entries.push(
    {
      id: 'getIstance',
      html: storeChor(),
      modelProperty: 'getIstance',
      execute: async function() {
        const cntr=await connectToBlockchain();
        console.log('execute');
        await updateUI(cntr, modeler);
      }
    }
  );
  console.log(instanceOptions); //
  // Add choreography specific properties here
  // choreographyProps(choreographyGroup, element, bpmnFactory, translate);
  return [choreographyGroup];
}

function storeChor() {

  return domify('<div class="bpp-field-wrapper" style="flex-direction:column;">' +
    '<div class="bpp-properties-entry" ' + 'data-show="show"' + ' >' +
    '</div>' +
    '<button type="button"  class="btn btn-outline-primary" data-action="execute" ><span>Execute </span></button>' +
    '<p>' + '' + '</p>' +
    '</div>');
}

async function tempFunction(element) {
  const id= element.id;
  const idBytes = web3.utils.padRight(web3.utils.asciiToHex(id), 64);
  const instanceNumberId= await contract.methods.choInstanceListNumber(idBytes).call();
  let numberOfInstance=[];
  console.log(instanceNumberId);
  for (let i = 1; i <= instanceNumberId; i++) {
    numberOfInstance.push({ name: i, value: i });
  }

  const options = numberOfInstance.map(instance => `<option value="${instance.value}">${instance.name}</option>`).join('');
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
