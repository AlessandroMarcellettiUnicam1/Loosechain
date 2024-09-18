import Web3 from 'web3';
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
  const elements=modeler.get('elementRegistry')["_elements"];
 
  let result=[];
  for(const e in elements){
    const asciiResult=web3.utils.asciiToHex(elements[e].element.id);
    if(elements[e].element.type.includes("Task")){
      result.push(await contract.methods.attivita(web3.utils.padRight(asciiResult,64)).call());
    }else if(elements[e].element.type.includes("Message")){
      result.push(await contract.methods.messaggi(web3.utils.padRight(asciiResult,64)).call());
    }else if(elements[e].element.type.includes("Event") ||elements[e].element.type.includes("Gateway")){
      result.push(await contract.methods.controlFlowElementList(web3.utils.padRight(asciiResult,64)).call());
    }else if(elements[e].element.type.includes("SubChoreography")){
      result.push(await contract.methods.subChoList(web3.utils.padRight(asciiResult,64)).call());
    }
  }
  return result;
  // return await contract.methods.getCurrentState().call();
}

function applyStateToUI(state, modeler) {
  
  state.forEach(element => {
    const elementId = web3.utils.hexToAscii(element.id);
    let strokeColor, fillColor;
    if(element.executed){
      strokeColor = 'green';
      fillColor = 'lightgreen';
    }else{
      if(element.tempState){
        strokeColor = 'black';
        fillColor = 'yellow';
      }else{
        strokeColor = 'gray';
        fillColor = 'lightgray';
      }
    }
    setTaskColor(modeler, elementId, strokeColor, fillColor);
  });
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
