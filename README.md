# Loosechain

Loosechain is a browser-based BPMN 2.0 choreography editor built with
[chor-js](https://github.com/bptlab/chor-js). It combines diagram editing and
validation with local diagram storage and smart-contract-backed choreography
instances.

## Features

- Create and edit BPMN choreography diagrams; open and download BPMN/XML files.
- Save named diagrams in the browser's IndexedDB and reopen them later.
- Validate diagrams with the built-in validator.
- Deploy the Solidity contracts in `app/contracts` with Hardhat.
- Upload a choreography to the configured blockchain, read its instances, inspect
  instance state, and execute messages.

## Requirements

- Docker Desktop with Docker Compose (recommended; includes the app and local
  Hardhat node), or Node.js 20+ for running the editor separately.
- A modern browser. MetaMask is needed when uploading or executing transactions.

## Configure the blockchain

Network selection and deployment settings are in `hardhat.config.js`; no `.env`
file is used.

### Local Hardhat network (default)

The default `blockchainSettings.target` is `'local'`. Optionally set
`blockchainSettings.localForkUrl` to a public RPC URL to fork that chain while
keeping the local Hardhat chain ID at `1337`. Leave it empty for a fresh local
chain.

For local transactions, add a custom network in MetaMask with:

- Network URL: `http://127.0.0.1:8545`
- Chain ID: `1337`

Import one of the funded accounts printed in the `blockchain` container logs
into MetaMask. The account must be unlocked by the local Hardhat node. These
accounts and their private keys are for local testing only; never use them on a
public network.

### Public network

To deploy to a public network, change `blockchainSettings.target` to `'public'`
and configure `blockchainSettings.publicNetwork.rpcUrl` and
`blockchainSettings.publicNetwork.chainId` in `hardhat.config.js`. The deployment
process also requires a funded deployer account's private key in the
`DEPLOYER_PRIVATE_KEY` environment variable. For example, in PowerShell, set it
in the current shell before starting Compose:

```powershell
$env:DEPLOYER_PRIVATE_KEY = "<deployer-private-key>"
docker compose up --build
```

Do not put the key in source files, commit it, or use a Hardhat test key for a
public deployment. The editor uses MetaMask for public-network reads and
transactions; add the configured network to MetaMask and select an account with
funds for transaction gas. The local Hardhat node still starts under Compose,
but contracts are deployed to the selected public network.

## Run with Docker (recommended)

From the repository root:

```shell
docker compose up --build
```

Compose starts the Hardhat node, waits for it to be healthy, deploys the
contracts in `app/contracts`, writes the generated ABI/address/network settings
to `app/lib/blockchain/deployed-contract.json`, and starts the web editor.

- Editor: <http://localhost:9013>
- Local Hardhat JSON-RPC (local target): <http://127.0.0.1:8545>

The deployment is performed each time the app container starts. The blockchain
container has no persistent volume, so its local chain state and deployments are
reset when the blockchain container is recreated. Browser-saved diagrams are
stored separately in IndexedDB and remain in that browser for the same site
origin.

Stop the containers with:

```shell
docker compose down
```

When the editor opens, it verifies the configured chain and contract and reads
contract state without asking for wallet access. A connection warning is shown
if the configured blockchain or deployed contract is unavailable.

## Run the editor separately

Install dependencies and start the Parcel development server:

```shell
npm ci
npm run dev
```

Open <http://localhost:9013>. The development server does not start a blockchain
or deploy contracts. Configure and start a reachable blockchain, deploy the
contracts, and ensure `app/lib/blockchain/deployed-contract.json` contains the
matching ABI, address, target, chain ID, and browser RPC URL (for a local
network) before loading the editor. The Docker workflow creates this file
automatically.

Other available commands:

```shell
npm run build             # Build the editor into build/
npm run blockchain:node   # Start a Hardhat node
```

The `blockchain:deploy` command is used by the Docker startup script and expects
the `docker` network hostname configured in `hardhat.config.js`; it is not a
standalone host deployment command.

## Use the editor

1. **Open a diagram:** use the folder button to open a `.bpmn` or `.xml` file,
   or create a new diagram with the new-document button.
2. **Save locally:** use the save button and provide a name. Saved diagrams are
   held in this browser's IndexedDB; they are not uploaded to a server.
3. **Reopen a saved diagram:** choose it from the saved-diagram selector. Loading
   a diagram replaces the current editor contents.
4. **Edit and validate:** select BPMN elements and use the properties panel.
   Use the validator button to toggle diagram validation.
5. **Upload a choreography:** select the diagram to upload and use the upload
   button. MetaMask asks for an account when needed. A popup reports transaction
   confirmation, including the transaction hash and block.
6. **Select an existing instance:** select the choreography element and open
   its **Instance** properties tab. The instance selector is populated from the
   configured contract; choose an instance to inspect.
7. **Read instance status:** use **Get instance status** to load the selected
   instance state and update the diagram's element colors.
8. **Execute a message:** select a message, configure its message and attribute
   properties as needed, then use **Execute message** in the **Execution**
   properties. The editor reports success or failure and refreshes the status
   after a successful transaction.
9. **Export:** use the download buttons to save the diagram as BPMN/XML or SVG.

Success and error notifications can be dismissed with the **×** button. Local
blockchain transactions are sent directly to Hardhat using the selected,
unlocked local test account; public transactions are sent through MetaMask.

## License

MIT
