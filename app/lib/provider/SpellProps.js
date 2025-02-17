// spellProps.js

import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { is } from 'bpmn-js/lib/util/ModelUtil';

/**
 * Crea e restituisce le proprietà "Spell" per un particolare elemento.
 * @param {Object} element - L'elemento BPMN a cui aggiungere le proprietà.
 * @returns {Array} - Un array di entry da visualizzare nel pannello delle proprietà.
 */
export default function spellProps(element) {

  // Verifica se l'elemento è del tipo che ti interessa, ad esempio un StartEvent
  if (!is(element, 'bpmn:StartEvent')) {
    return [];
  }

  // Crea un input field per modificare una proprietà personalizzata "spell"
  return [
    entryFactory.textField({
      id: 'spell',
      description: 'Inserisci una magia qui',
      label: 'Magic Spell',
      modelProperty: 'spell' // Nome della proprietà nel modello BPMN
    })
  ];
}
