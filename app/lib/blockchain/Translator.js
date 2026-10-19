//import { accountAddress } from '../../app';
import Web3 from 'web3';
import { blockchainChainId, blockchainRpcUrl, blockchainTarget } from './Contract';
import { getAccount, getBlockchainWeb3 } from './Connection';

let isDirty = false;
let web3;
export async function translateDiagram(modeler, contract) {
  web3 = getBlockchainWeb3();
  // const contract = await connectToBlockchain();
  const elements = modeler.get('elementRegistry')["_elements"];
  let activityList = [];

  let controlFlowElementList = [];
  let messagges = [];
  let messageAttributesList = [];
  let addressKeyMappingList = [];
  let participantList = [];
  let edgeConditionList = [];
  let subChoreographyList = [];
  let idChoreography;
  let idInstance;
  for (const e in elements) {
    if (elements[e].element.type.includes("Task")) {
      createActivity(elements[e], activityList, addressKeyMappingList, participantList)
    } else if (elements[e].element.type.includes("Message")) {
      createMessage(elements[e], messagges, activityList, messageAttributesList)
    } else if (elements[e].element.type.includes("Event") || elements[e].element.type.includes("Gateway")) {
      createGatewayElement(elements[e], controlFlowElementList)
    } else if (elements[e].element.type.includes("bpmn:SequenceFlow")) {
      createEdegeList(elements[e], edgeConditionList)
    } else if (elements[e].element.type.includes("bpmn:SubChoreography")) {
      console.log("subCho")
    }else if (elements[e].element.type.includes("bpmn:Choreography") && !elements[e].element.type.includes("bpmn:ChoreographyTask")){
      if(!elements[e].element.businessObject.$attrs.ChorInstanceId){
        idInstance=elements[e].element.id+'+'+1;
      }else{
        idInstance=elements[e].element.id+'+'+elements[e].element.businessObject.$attrs.ChorInstanceId;
      }
      idChoreography=web3.utils.padRight(web3.utils.asciiToHex(elements[e].element.id), 64);
    }
  }

  idInstance= idInstance=web3.utils.padRight(web3.utils.asciiToHex(idInstance), 64);
  console.log("activityList",activityList)
  console.log("messagges",messagges)
  console.log("messageAttributesList",messageAttributesList)
  console.log("controlFlowElementList",controlFlowElementList)
  console.log("edgeConditionList",edgeConditionList)
  console.log(idChoreography)
  console.log(idInstance)
  // console.log(subChoreographyList)
  
  const readWeb3 = blockchainRpcUrl ? new Web3(blockchainRpcUrl) : web3;
  const readContract = blockchainRpcUrl
    ? new readWeb3.eth.Contract(contract.options.jsonInterface, contract.options.address)
    : contract;
  let deploymentChainId;
  try {
    deploymentChainId = Number(await readWeb3.eth.getChainId());
  } catch (error) {
    throw new Error(`Could not reach the configured blockchain RPC at ${blockchainRpcUrl || 'the MetaMask endpoint'}: ${error.message}`);
  }

  if (deploymentChainId !== blockchainChainId) {
    throw new Error(`The blockchain RPC is on chain ${deploymentChainId}, but the deployed contract config requires chain ${blockchainChainId}.`);
  }

  if (blockchainTarget !== 'local') {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${blockchainChainId.toString(16)}` }]
      });
    } catch (error) {
      if (error.code === 4902) {
        throw new Error(`Add the configured ${blockchainTarget} network (chain ID ${blockchainChainId}) to MetaMask before uploading.`);
      }
      throw error;
    }

    let walletChainId;
    try {
      walletChainId = Number(await window.ethereum.request({ method: 'eth_chainId' }));
    } catch (error) {
      throw new Error(`Could not read the chain ID from MetaMask: ${error.message}. Check that MetaMask uses a healthy RPC endpoint.`);
    }
    if (walletChainId !== blockchainChainId) {
      throw new Error(`MetaMask is connected to chain ${walletChainId}, but this deployment requires chain ${blockchainChainId}.`);
    }
  }

  let contractCode;
  try {
    contractCode = await readWeb3.eth.getCode(contract.options.address);
  } catch (error) {
    throw new Error(`Could not verify contract ${contract.options.address} using the configured RPC: ${error.message}`);
  }
  if (!contractCode || contractCode === '0x') {
    const localRpcTip = blockchainTarget === 'local'
      ? 'Check that the local Hardhat node is running and the app was rebuilt after deployment.'
      : 'Check that the contract was deployed to this network.';
    throw new Error(`No contract code found at ${contract.options.address} on chain ${deploymentChainId}. ${localRpcTip}`);
  }

  const accountAddress = await getAccount();

  const submitContract = blockchainTarget === 'local' ? readContract : contract;
  if (blockchainTarget === 'local') {
    const unlockedAccounts = await readWeb3.eth.getAccounts();
    if (!unlockedAccounts.some(account => account.toLowerCase() === accountAddress.toLowerCase())) {
      throw new Error('The selected MetaMask account is not unlocked in the local Hardhat node. Import one of Hardhat\'s funded test accounts (for example the first account listed in the blockchain logs) into MetaMask.');
    }
  }

  const transactionArguments = [
    activityList,
    messagges,
    participantList,
    messageAttributesList,
    controlFlowElementList,
    edgeConditionList,
    idChoreography,
    idInstance
  ];
  const readTransaction = readContract.methods.setChoreography(...transactionArguments);
  const transaction = submitContract.methods.setChoreography(...transactionArguments);
  let estimatedGas;
  try {
    estimatedGas = BigInt(await readTransaction.estimateGas({ from: accountAddress }));
  } catch (error) {
    throw new Error(`The configured RPC could not estimate the contract upload on chain ${deploymentChainId}: ${error.message}. Check that the BPMN data is valid for this contract.`);
  }
  const block = await readWeb3.eth.getBlock('latest');
  const blockGasLimit = BigInt(block.gasLimit);
  if (estimatedGas > blockGasLimit) {
    throw new Error(`The upload requires ${estimatedGas} gas, exceeding this network's ${blockGasLimit} gas block limit.`);
  }

  const gasWithBuffer = estimatedGas + estimatedGas / 5n;
  const gasLimit = gasWithBuffer < blockGasLimit ? gasWithBuffer : blockGasLimit;
  try {
    if (blockchainTarget === 'local') {
      console.info('Sending transaction directly to the local Hardhat node using the selected unlocked test account.');
    }
    return await transaction.send({ from: accountAddress, gas: gasLimit });
  } catch (error) {
    throw new Error(`Could not submit the upload transaction on chain ${deploymentChainId}: ${error.message}`);
  }
}


function createActivity(diagramElement, activityList, addressKeyMappingList, participantList) {
  let activity = {
    id: "",
    name: "",
    initiator: "",
    target: "",
    idInElement: "",
    idOutElement: "",
    messageIn: "",
    messageOut: "",
    executed: false,
    tempState: false
  }

  const asciiResult = web3.utils.asciiToHex(diagramElement.element.id);
  activity.id = web3.utils.padRight(asciiResult, 64)
  activity.name = web3.utils.padRight(asciiResult, 64)
  const participantRefs = diagramElement.element.businessObject.participantRef;
  activity.initiator = web3.utils.padRight(web3.utils.asciiToHex(participantRefs[0].id), 64);
  activity.target = web3.utils.padRight(web3.utils.asciiToHex(participantRefs[1].id), 64);
  if (diagramElement.element.businessObject.incoming && diagramElement.element.businessObject.incoming.length > 0) {
    activity.idInElement = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.incoming[0].sourceRef.id), 64);
  } else if (diagramElement.element.businessObject.$parent.$type.includes("bpmn:SubChoreography")) {
    activity.idOutElement = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.incoming[0].sourceRef.id), 64);
  } else {
    activity.idInElement = web3.utils.padRight(0, 64);
  }

  if (diagramElement.element.businessObject.outgoing && diagramElement.element.businessObject.outgoing.length > 0) {
    activity.idOutElement = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.outgoing[0].targetRef.id), 64);
  } else {
    if (diagramElement.element.businessObject.$parent.$type.includes("bpmn:SubChoreography")) {
      activity.idOutElement = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.outgoing[0].targetRef.id), 64)
    } else {
      activity.idOutElement = web3.utils.padRight(0, 64);
    }
  }
  if (diagramElement.element.businessObject.messageFlowRef[1]) {
    activity.messageIn = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.messageFlowRef[1].messageRef.id), 64);
    activity.messageOut = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.messageFlowRef[0].messageRef.id), 64);
  } else {
    activity.messageIn = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.messageFlowRef[0].messageRef.id), 64);
    activity.messageOut = web3.utils.padRight(0, 64);
  }
  activityList.push(activity);
  let choreography = diagramElement.element.businessObject.$parent;
  while (choreography && choreography.$type !== 'bpmn:Choreography') {
    choreography = choreography.$parent;
  }
  [activity.initiator, activity.target].forEach((keyMapping, index) => {
    const participantItems = participantRefs[index].get('participantItems') || [];
    const addresses = participantItems.length > 0
      ? participantItems.map(item => item.name)
      : (choreography ? (choreography.get('participantItems') || []).map(item => item.name) : []);
    if (addresses.length > 0 && !addressKeyMappingList.includes(keyMapping)) {
      const uniqueAddresses = [];
      const seenAddresses = new Set();
      addresses.forEach(address => {
        if (!web3.utils.isAddress(address)) {
          throw new Error(`Participant "${participantRefs[index].name}" has an invalid Ethereum address: ${address}`);
        }
        const normalizedAddress = address.toLowerCase();
        if (!seenAddresses.has(normalizedAddress)) {
          seenAddresses.add(normalizedAddress);
          uniqueAddresses.push(address);
        }
      });
      participantList.push({
        keyMapping,
        addr: uniqueAddresses
      });
      addressKeyMappingList.push(keyMapping);
    }
  });
}

function createMessage(diagramElement, messagges, activityList, messageAttributesList) {
  let message = {
    id: "",
    name: "",
    mappingKey: "",
    selectedAttr: [],
    sourceParticipant: "",
    targetParticipant: "",
    idActivity: "",
    executed: false,
    tempState: false
  }
  const asciiResult = web3.utils.asciiToHex(diagramElement.element.id);
  message.id = web3.utils.padRight(asciiResult, 64)
  message.name = web3.utils.padRight(asciiResult, 64)
  const businessObject = diagramElement.element.businessObject;
  const messageItems = businessObject.get('messageItems') || [];
  if (messageItems.length > 0 && businessObject.name) {
    message.mappingKey = web3.utils.padRight(
      web3.utils.asciiToHex(businessObject.name.split('(')[0]),
      64
    );
  } else if (businessObject.$attrs.messageItem) {
    message.mappingKey = web3.utils.padRight(
      web3.utils.asciiToHex(businessObject.$attrs.messageItem),
      64
    );
  } else {
    message.mappingKey = web3.utils.padRight(0, 64);
  }

  message.sourceParticipant = "0x0000000000000000000000000000000000000000";
  message.targetParticipant = "0x0000000000000000000000000000000000000000";
  activityList.forEach((e) => {
    if (e.messageIn.includes(message.id)) {
      message.idActivity = e.id;
    } else if (e.messageOut.includes(message.id)) {
      message.idActivity = e.id;
    }
  })
  messagges.push(message);
  
  if (messageItems.length > 0) {
    
    console.log("messageItems", messageItems)
    messageItems.forEach((element) => {
      let messageAttributeStruct = {
        keyMapping: "",
        attributes: []
      }
      let splitString = element.name.split("(");
      messageAttributeStruct.keyMapping = web3.utils.padRight(web3.utils.asciiToHex(splitString[0]), 64);
      let splitCut = splitString[1].substring(0, splitString[1].length - 1).split(",");
      splitCut.forEach((e) => {
        messageAttributeStruct.attributes.push(web3.utils.padRight(web3.utils.asciiToHex(e), 64));
      })

      if(!listIncludeMapping(messageAttributesList,messageAttributeStruct)){
        messageAttributesList.push(messageAttributeStruct);
      }
      
      // console.log("messageAttributeStruct",messageAttributeStruct)
      // console.log("messageAttributesList",messageAttributesList)
      // messageAttributesList.push(messageAttributeStruct);
    })
   
    
  } else {
    //we thought about a sigle key mapping for all attributes but we have multiple key mapping (one for each messages) 
    //for all the attributes 
    if (messageAttributesList.length == 0) {
      if (diagramElement.element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography')) {
        let attributes = diagramElement.element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').attributeItems.map(item => item.name).map(item => web3.utils.padRight(web3.utils.asciiToHex(item), 64));
        let keyMappings = diagramElement.element.businessObject.$parent.get('rootElements').find(e => e.$type === 'bpmn:Choreography').messageItems.map(item => item.name).map(item => web3.utils.padRight(web3.utils.asciiToHex(item), 64));

        keyMappings.forEach((element) => {
          messageAttributesList.push({
            attributes: attributes,
            keyMapping: element
          });
        })
      }
    }
  }
}
function listIncludeMapping(messageAttributesList,messageAttributeStruct){
  let flag=false;
  messageAttributesList.forEach((e)=>{
    if(e.keyMapping.includes(messageAttributeStruct.keyMapping)){
      flag=true;
    }
  })
  return flag;
}

function createGatewayElement(diagramElement, controlFlowElementList) {
  // console.log(diagramElement)
  let typeList = ["bpmn:StartEvent", "bpmn:ExclusiveGateway", "bpmn:EndEvent", "bpmn:ParallelGateway", "bpmn:EventBasedGateway"]
  let controlFlowElement = {
    id: "",
    elementType: "",
    incomingActivity: [],
    outgoingActivity: [],
    executed: false
  }
  const asciiResult = web3.utils.asciiToHex(diagramElement.element.id);
  controlFlowElement.id = web3.utils.padRight(asciiResult, 64)

  if (diagramElement.element.businessObject.outgoing) {
    diagramElement.element.businessObject.outgoing.forEach((ref) => {
      controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.targetRef.id), 64))
    })
  } else if (diagramElement.element.businessObject.$parent.$type.includes("bpmn:SubChoreography")) {
    controlFlowElement.outgoingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.outgoing[0].targetRef.id), 64));
  }
  if (diagramElement.element.businessObject.incoming) {
    diagramElement.element.businessObject.incoming.forEach((ref) => {
      if (ref.sourceRef.$type.includes("bpmn:SubChoreography")) {
        let temp = ref.sourceRef.flowElements.
          filter(e =>
            e.$type.includes("Event") ||
            e.$type.includes("Gateway") ||
            e.$type.includes("Task")).
          filter(e => !e.outgoing)[0]
        controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(temp.id), 64))
      } else {
        controlFlowElement.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(ref.sourceRef.id), 64))
      }
    })
  } else if (diagramElement.element.businessObject.$parent.$type.includes("bpmn:SubChoreography")) {
    control.flowElements.incomingActivity.push(web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.$parent.incoming[0].sourceRef.id), 64));
  }
  if (diagramElement.element.type.includes("bpmn:StartEvent")) {
    controlFlowElement.elementType = "1"
  } else if (diagramElement.element.type.includes("bpmn:ExclusiveGateway")) {
    if (controlFlowElement.incomingActivity.length == 1 && controlFlowElement.outgoingActivity.length > 1) {
      controlFlowElement.elementType = "2"
    } else if (controlFlowElement.incomingActivity.length > 1 && controlFlowElement.outgoingActivity.length == 1) {
      controlFlowElement.elementType = "3"
    } else {
      controlFlowElement.elementType = "8"
    }
  } else if (diagramElement.element.type.includes("bpmn:ParallelGateway")) {
    if (controlFlowElement.incomingActivity.length == 1 && controlFlowElement.outgoingActivity.length > 1) {
      controlFlowElement.elementType = "4"
    } else if (controlFlowElement.incomingActivity.length > 1 && controlFlowElement.outgoingActivity.length == 1) {
      controlFlowElement.elementType = "5"
    } else {
      controlFlowElement.elementType = "8"
    }
  } else if (diagramElement.element.type.includes("bpmn:EventBasedGateway")) {
    controlFlowElement.elementType = "6"
  } else if (diagramElement.element.type.includes("bpmn:EndEvent")) {
    controlFlowElement.elementType = "7"
  }
  controlFlowElementList.push(controlFlowElement);
}

function createEdegeList(diagramElement, edgeConditionList) {
  let edgeCondition = {
    attribute: "",
    comparisonValue: "",
    condition: "",
    idActivity: ""
  }
  if (diagramElement.element.businessObject.name) {
    let condtionType = ["GREATER", "LESS", "EQUAL", "GREATEREQUAL", "LESSEQUAL"]
    let stringcondition = diagramElement.element.businessObject.name.split(" ");
    edgeCondition.attribute = web3.utils.padRight(web3.utils.asciiToHex(stringcondition[0]), 64);
    edgeCondition.comparisonValue = web3.utils.padRight(web3.utils.asciiToHex(stringcondition[2]), 64);
    edgeCondition.condition = condtionType.indexOf(stringcondition[1].toUpperCase())
    if (diagramElement.element.businessObject.targetRef.$type) {
      edgeCondition.idActivity = web3.utils.padRight(web3.utils.asciiToHex(diagramElement.element.businessObject.targetRef.id), 64);
    }
    edgeConditionList.push(edgeCondition)
  }
}
function createSubChoreographyList(diagramElement, subChoreographyList) {
  let elementContained = diagramElement.element.businessObject.flowElements.
    filter(e =>
      e.$type.includes("Event") ||
      e.$type.includes("Gateway") ||
      e.$type.includes("Task"))
  elementContained.forEach((element) => {
    if (!element.outgoing) {
    }
  })
}
function findLastSubChoElement(diagramElement) {
  console.log(diagramElement)
  let elementContained = diagramElement.flowElements.
    filter(e =>
      e.$type.includes("Event") ||
      e.$type.includes("Gateway") ||
      e.$type.includes("Task")).
    filter(e => !e.outgoing)[0]

  console.log(elementContained)
}