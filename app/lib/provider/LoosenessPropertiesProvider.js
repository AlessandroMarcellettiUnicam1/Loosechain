import BpmnPropertiesProvider from 'bpmn-js-properties-panel/lib/provider/bpmn/BpmnPropertiesProvider';
import inherits from 'inherits';

import selectionProps from './parts/SelectionProps';
import compositionProps from './parts/CompositionProps';
import executionProps from './parts/ExecutionProps';
import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';


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
    
    return tabs;
  };
}


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


inherits(LoosenessPropertiesProvider, BpmnPropertiesProvider);
LoosenessPropertiesProvider.$inject = ['injector', 'bpmnFactory', 'translate'];
