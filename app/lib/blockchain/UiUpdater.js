import { getBlockchainWeb3 } from './Connection';
/**
 * Fetch the current state of the contract and update the UI.
 *
 * @param contract - The contract instance to fetch the state from.
 * @param modeler - The modeler instance to update the UI.
 */
export default async function updateUI(contract, modeler) {
  const web3 = getBlockchainWeb3();
  const state = await getCurrentState(contract,modeler);
  applyStateToUI(state, modeler, web3);
}

async function getCurrentState(contract,modeler) {
  const web3 = getBlockchainWeb3();
  const elements=modeler.get('elementRegistry')['_elements'];
  let idInstance;

  for (const e in elements) {
    if (elements[e].element.id!='__implicitroot') {
      if (elements[e].element.type.includes('bpmn:Choreography') && !elements[e].element.type.includes('bpmn:ChoreographyTask')) {
        const choreography = elements[e].element.businessObject;
        const selectedInstance = choreography.$attrs && choreography.$attrs.ChorInstanceId
          ? choreography.$attrs.ChorInstanceId
          : 1;
        idInstance = `${choreography.id}+${selectedInstance}`;
      }
    }
  }
  if (!idInstance) {
    throw new Error('The diagram does not contain a choreography to load from the contract.');
  }
  idInstance=web3.utils.padRight(web3.utils.asciiToHex(idInstance), 64);
  let result=[];
  for (const e in elements) {
    if (elements[e].element.id!='__implicitroot') {
      const asciiResult=web3.utils.asciiToHex(elements[e].element.id);
      if (elements[e].element.type.includes('Task')) {
        result.push(await contract.methods.getTask(idInstance,web3.utils.padRight(asciiResult,64)).call());
      } else if (elements[e].element.type.includes('Message')) {
        result.push(await contract.methods.getMessage(idInstance,web3.utils.padRight(asciiResult,64)).call());
      } else if (elements[e].element.type.includes('Event') ||elements[e].element.type.includes('Gateway')) {
        result.push(await contract.methods.getControlFlowElement(idInstance,web3.utils.padRight(asciiResult,64)).call());
      }
    }
  }
  return result;
  // return await contract.methods.getCurrentState().call();
}

function applyStateToUI(state, modeler, web3) {
  const temp = state.filter(element => element.id !== web3.utils.padRight(0, 64));
  if (temp.length>0) {
    state.forEach(element => {
      const elementId = web3.utils.hexToAscii(element.id);
      let strokeColor, fillColor;
      if (element.executed) {
        strokeColor = 'green';
        fillColor = 'lightgreen';
        // colorTheParticipant(elementId);
      } else {
        if (element.tempState) {
          strokeColor = 'black';
          fillColor = 'yellow';
        } else {
          strokeColor = 'gray';
          fillColor = 'lightgray';
        }
      }
      setTaskColor(modeler, elementId, strokeColor, fillColor);
    });
  } else {
    const elements = modeler.get('elementRegistry')['_elements'];
    for (const e in elements) {
      if (elements[e].element.type!=='bpmn:Participant') {
        let ele=elements[e].element;
        setTaskColor(modeler,ele.id,'black','white');
      }
    }
  }
}


/**
 * Utility function to set the color of a task in the diagram.
 *
 * @param modeler - The modeler instance.
 * @param elementId - The ID of the element to set the color for.
 * @param strokeColor - The stroke color to set.
 * @param fillColor - The fill color to set.
 */
function setTaskColor(modeler, elementId, strokeColor, fillColor) {
  const elementRegistry = modeler.get('elementRegistry');
  const modeling = modeler.get('modeling');
  const temp=elementId.split(String.fromCharCode(0)).join('');
  const element = elementRegistry.get(temp);
  if (element) {
    modeling.setColor([element], {
      stroke: strokeColor,
      fill: fillColor
    });
  }
}
