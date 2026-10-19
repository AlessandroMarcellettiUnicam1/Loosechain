require('@nomicfoundation/hardhat-ethers');

const blockchainSettings = {
  // Choose 'local' or 'public'.
  target: 'local',
  publicNetwork: {
    rpcUrl: 'https://your-public-rpc.example',
    chainId: 11155111
  },
  // Set to a public RPC URL to fork it locally, or leave empty for a fresh Hardhat chain.
  localForkUrl: ''
};

const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
const isPublicTarget = blockchainSettings.target === 'public';
const publicRpcUrl = blockchainSettings.publicNetwork.rpcUrl;
const publicChainId = Number(blockchainSettings.publicNetwork.chainId);

if (!['local', 'public'].includes(blockchainSettings.target)) {
  throw new Error('Set blockchainSettings.target to either "local" or "public" in hardhat.config.js.');
}

if (isPublicTarget && !deployerPrivateKey) {
  throw new Error('Set DEPLOYER_PRIVATE_KEY in your shell environment when targeting a public network.');
}

if (isPublicTarget) {
  if (!Number.isSafeInteger(publicChainId) || publicChainId <= 0) {
    throw new Error('Set a positive integer publicNetwork.chainId in hardhat.config.js.');
  }
  if (!publicRpcUrl || publicRpcUrl === 'https://your-public-rpc.example') {
    throw new Error('Set publicNetwork.rpcUrl to your public RPC URL in hardhat.config.js.');
  }
}

module.exports = {
  solidity: {
    compilers: [
      { version: '0.8.20' }
    ],
    overrides: {
      'app/contracts/contractLogicV2.sol': {
        version: '0.8.20',
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    }
  },
  paths: {
    sources: './app/contracts'
  },
  networks: {
    hardhat: {
      chainId: 1337,
      forking: blockchainSettings.localForkUrl ? {
        url: blockchainSettings.localForkUrl
      } : undefined
    },
    docker: {
      url: isPublicTarget ? publicRpcUrl : 'http://blockchain:8545',
      chainId: isPublicTarget ? publicChainId : 1337,
      accounts: isPublicTarget
        ? [deployerPrivateKey]
        : { mnemonic: 'test test test test test test test test test test test junk' }
    }
  }
};
