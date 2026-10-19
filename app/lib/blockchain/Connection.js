import Web3 from 'web3';
import {
  blockchainRpcUrl,
  blockchainTarget,
  blockchainChainId,
  contractVersion,
  contractAbi,
  contractAddress
} from './Contract';

let web3;
let contractPromise;

export function getBlockchainWeb3() {
  if (web3) {
    return web3;
  }

  if (blockchainTarget === 'local') {
    web3 = new Web3(blockchainRpcUrl || 'http://127.0.0.1:8545');
  } else if (window.ethereum) {
    web3 = new Web3(window.ethereum);
  } else {
    throw new Error('Install or enable MetaMask to connect to the configured public blockchain.');
  }

  return web3;
}

export default async function connectToBlockchain() {
  if (contractVersion < 2) {
    throw new Error('Contract Logic V2 has not been deployed. Run the blockchain deployment script and restart the app.');
  }

  if (!contractPromise) {
    contractPromise = (async () => {
      const providerWeb3 = getBlockchainWeb3();
      const connectedChainId = Number(await providerWeb3.eth.getChainId());
      if (connectedChainId !== blockchainChainId) {
        throw new Error(`Configured contract is for chain ${blockchainChainId}, but the connected blockchain is chain ${connectedChainId}.`);
      }

      const contract = new providerWeb3.eth.Contract(contractAbi, contractAddress);
      const code = await providerWeb3.eth.getCode(contractAddress);
      if (!code || code === '0x') {
        throw new Error(`No smart contract was found at ${contractAddress} on chain ${connectedChainId}. Deploy the contracts and restart the app.`);
      }
      return contract;
    })().catch(error => {
      contractPromise = undefined;
      throw error;
    });
  }

  return contractPromise;
}

export async function getAccount() {
  if (!window.ethereum) {
    throw new Error('Install or enable MetaMask to submit a public-network transaction.');
  }

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts[0]) {
    throw new Error('MetaMask did not provide an account.');
  }
  return accounts[0];
}

export async function getChoreographyInstanceCount(contract, choreographyId) {
  const providerWeb3 = getBlockchainWeb3();
  const choreographyIdBytes = providerWeb3.utils.padRight(
    providerWeb3.utils.asciiToHex(choreographyId),
    64
  );
  const result = await contract.methods.getChoreographyInstances(choreographyIdBytes).call();
  return Number(result);
}
