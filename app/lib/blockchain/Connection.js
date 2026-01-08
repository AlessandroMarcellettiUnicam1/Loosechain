import Web3 from 'web3';
import { contractAbi, contractAddress } from './contract';

/**
 * Connect to the blockchain. If MetaMask is not installed, an alert is shown. If MetaMask is installed, a new Web3
 * instance is created, the user is prompted to grant account access, and a new contract instance is returned.
 *
 * @returns {Promise<Web3.eth.Contract>|undefined} A new contract instance or undefined if MetaMask is not installed or
 * access is denied.
 */
export default async function connectToBlockchain() {
  const { ethereum } = window;
  const accountGranted = await requestAccount(ethereum);
  if (!accountGranted) return;

  const web3 = new Web3(ethereum);
  return new web3.eth.Contract(contractAbi, contractAddress);
}

// utils.js
export async function getAccount() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log(accounts[0])
      return accounts[0];
    } catch (err) {
      console.error("User denied account access", err);
      return null;
    }
  } else {
    console.error("MetaMask not installed");
    return null;
  }
}


/**
 * Request account access from the user. If MetaMask is not installed, an alert is shown.
 *
 * @param {Object} ethereum - The ethereum object injected by MetaMask.
 * @returns {Promise<boolean>} A promise that resolves to true if account access is granted, otherwise false.
 */
async function requestAccount(ethereum) {
  if (!ethereum) {
    alert('If you want to interact with the blockchain, please install MetaMask.');
    return false;
  }
  try {
    await ethereum.request({ method: 'eth_requestAccounts' });
    return true;
  } catch (error) {
    console.error('User denied account access or there was an error connecting to MetaMask', error);
    return false;
  }
}
