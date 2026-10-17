import { getChoreographyInstanceCount } from './Connection';

const optionCache = new WeakMap();
const pendingLoads = new WeakMap();
const countCache = new WeakMap();

export function getInstanceOptions(businessObject) {
  return optionCache.get(businessObject) || [{ name: 'Loading instances...', value: '' }];
}

export async function refreshInstanceOptions(element, contract, modeler, force = false) {
  const businessObject = element.businessObject;
  if (!force && countCache.has(businessObject)) {
    return countCache.get(businessObject);
  }
  const pendingLoad = pendingLoads.get(businessObject);
  if (pendingLoad) {
    return pendingLoad;
  }

  const load = getChoreographyInstanceCount(contract, businessObject.id)
    .then(count => {
      const options = count
        ? Array.from({ length: count }, (_, index) => ({
          name: `Instance ${index + 1}`,
          value: String(index + 1)
        }))
        : [{ name: 'No uploaded instances', value: '' }];

      optionCache.set(businessObject, options);
      countCache.set(businessObject, count);
      const selection = modeler.get('selection').get();
      if (selection.includes(element)) {
        modeler.get('eventBus').fire('elements.changed', { elements: [element] });
      }
      return count;
    })
    .finally(() => {
      pendingLoads.delete(businessObject);
    });

  pendingLoads.set(businessObject, load);
  return load;
}
