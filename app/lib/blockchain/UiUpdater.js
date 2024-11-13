import Web3 from 'web3';
import { modeler } from '../../app';
/**
 * Fetch the current state of the contract and update the UI.
 *
 * @param contract - The contract instance to fetch the state from.
 * @param modeler - The modeler instance to update the UI.
 */
const { ethereum } = window;
const web3 = new Web3(ethereum);
export default async function updateUI(contract, modeler) {
  const state = await getCurrentState(contract,modeler);
  applyStateToUI(state, modeler);
}

async function getCurrentState(contract,modeler) {
  const elements=modeler.get('elementRegistry')['_elements'];
  let idInstance;
  for (const e in elements) {

    if (elements[e].element.type.includes('bpmn:Choreography') && !elements[e].element.type.includes('bpmn:ChoreographyTask')) {
      if (!elements[e].element.businessObject.instanceId) {
        idInstance='0x3100000000000000000000000000000000000000000000000000000000000000';
      } else {
        idInstance=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.businessObject.instanceId), 64);
      }
    }
  }
  // TODO get generica per istanza per colorare tutto di bianco
  let result=[];
  for (const e in elements) {
    const asciiResult=web3.utils.asciiToHex(elements[e].element.id);
    if (elements[e].element.type.includes('Task')) {
      result.push(await contract.methods.attivita(idInstance,web3.utils.padRight(asciiResult,64),1).call());
    } else if (elements[e].element.type.includes('Message')) {
      result.push(await contract.methods.messaggi(idInstance,web3.utils.padRight(asciiResult,64),1).call());
    } else if (elements[e].element.type.includes('Event') ||elements[e].element.type.includes('Gateway')) {
      result.push(await contract.methods.controlFlowElementList(idInstance,web3.utils.padRight(asciiResult,64)).call());
    }
  }

  return result;
  // return await contract.methods.getCurrentState().call();
}

function applyStateToUI(state, modeler) {
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
  const temp=elementId.replace(/\u0000/g, '');
  const element = elementRegistry.get(temp);
  if (element) {
    modeling.setColor([element], {
      stroke: strokeColor,
      fill: fillColor
    });
  }
}
