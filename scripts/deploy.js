const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

async function main() {
  const deployment = {};
  const contracts = [
    ['app/contracts/contractMemory.sol:contractMemory', 'contractMemory'],
    ['app/contracts/contracLogic.sol:contractLogic', 'contractLogic'],
    ['app/contracts/contractLogicV2.sol:contractLogicV2', 'contractLogicV2'],
    ['app/contracts/emergencyResponsePlan_none.sol:EmergencyResponsePlan', 'EmergencyResponsePlan']
  ];

  for (const [fullyQualifiedName, name] of contracts) {
    const factory = await hre.ethers.getContractFactory(fullyQualifiedName);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    deployment[name] = {
      address: await contract.getAddress(),
      abi: JSON.parse(factory.interface.formatJson())
    };
    console.log(`${name} deployed to ${deployment[name].address}`);
  }

  const deployedNetwork = hre.config.networks.docker;
  deployment.settings = {
    target: deployedNetwork.url === 'http://blockchain:8545' ? 'local' : 'public',
    chainId: deployedNetwork.chainId,
    browserRpcUrl: deployedNetwork.url === 'http://blockchain:8545'
      ? 'http://127.0.0.1:8545'
      : null
  };

  const outputPath = path.join(__dirname, '..', 'app', 'lib', 'blockchain', 'deployed-contract.json');
  fs.writeFileSync(outputPath, `${JSON.stringify(deployment, null, 2)}\n`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
