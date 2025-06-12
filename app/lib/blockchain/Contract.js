/**
 * @file Contract.js
 * @description This file contains the ABI and address of the EmergencyResponsePlan smart contract on the blockchain.
 */

export const contractAbi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "functionDone",
		"type": "event"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idInElement",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idOutElement",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "initiator",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "messageIn",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "messageOut",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "name",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "target",
						"type": "bytes32"
					},
					{
						"internalType": "bool",
						"name": "tempState",
						"type": "bool"
					}
				],
				"internalType": "struct contractMemory.Activity",
				"name": "_activity",
				"type": "tuple"
			},
			{
				"components": [
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idActivity",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "mappingKey",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "name",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32[]",
						"name": "selectedAttr",
						"type": "bytes32[]"
					},
					{
						"internalType": "address",
						"name": "sourceParticipant",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "targetParticipant",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "tempState",
						"type": "bool"
					}
				],
				"internalType": "struct contractMemory.Message",
				"name": "_message",
				"type": "tuple"
			},
			{
				"components": [
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32[]",
						"name": "incomingActivity",
						"type": "bytes32[]"
					},
					{
						"internalType": "bytes32[]",
						"name": "outgoingActivity",
						"type": "bytes32[]"
					},
					{
						"internalType": "enum contractMemory.ElementType",
						"name": "elementType",
						"type": "uint8"
					}
				],
				"internalType": "struct contractMemory.ControlFlowElement[]",
				"name": "currentcontrolFlowElement",
				"type": "tuple[]"
			},
			{
				"internalType": "bytes32[]",
				"name": "attributi",
				"type": "bytes32[]"
			},
			{
				"internalType": "bytes32[]",
				"name": "value",
				"type": "bytes32[]"
			},
			{
				"components": [
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idInElement",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idOutElement",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "initiator",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "messageIn",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "messageOut",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "name",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "target",
						"type": "bytes32"
					},
					{
						"internalType": "bool",
						"name": "tempState",
						"type": "bool"
					}
				],
				"internalType": "struct contractMemory.Activity[]",
				"name": "activityList",
				"type": "tuple[]"
			},
			{
				"components": [
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32[]",
						"name": "incomingActivity",
						"type": "bytes32[]"
					},
					{
						"internalType": "bytes32[]",
						"name": "outgoingActivity",
						"type": "bytes32[]"
					},
					{
						"internalType": "enum contractMemory.ElementType",
						"name": "elementType",
						"type": "uint8"
					}
				],
				"internalType": "struct contractMemory.ControlFlowElement[]",
				"name": "controlFlowElement",
				"type": "tuple[]"
			},
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "attribute",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "comparisonValue",
						"type": "bytes32"
					},
					{
						"internalType": "enum contractMemory.ConditionType",
						"name": "condition",
						"type": "uint8"
					},
					{
						"internalType": "bytes32",
						"name": "idActivity",
						"type": "bytes32"
					}
				],
				"internalType": "struct contractMemory.EdgeCondition[]",
				"name": "edgeCondition",
				"type": "tuple[]"
			},
			{
				"components": [
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idActivity",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "mappingKey",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "name",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32[]",
						"name": "selectedAttr",
						"type": "bytes32[]"
					},
					{
						"internalType": "address",
						"name": "sourceParticipant",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "targetParticipant",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "tempState",
						"type": "bool"
					}
				],
				"internalType": "struct contractMemory.Message[]",
				"name": "messageList",
				"type": "tuple[]"
			},
			{
				"internalType": "bytes32",
				"name": "hashInstance",
				"type": "bytes32"
			}
		],
		"name": "executeMessage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "choId",
				"type": "bytes32"
			}
		],
		"name": "getChoreographyInstances",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "hashIdInstance",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "idControlFlowElement",
				"type": "bytes32"
			}
		],
		"name": "getControlFlowElement",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32[]",
						"name": "incomingActivity",
						"type": "bytes32[]"
					},
					{
						"internalType": "bytes32[]",
						"name": "outgoingActivity",
						"type": "bytes32[]"
					},
					{
						"internalType": "enum contractMemory.ElementType",
						"name": "elementType",
						"type": "uint8"
					}
				],
				"internalType": "struct contractMemory.ControlFlowElement",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "hashIdInstance",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "idMessagge",
				"type": "bytes32"
			}
		],
		"name": "getMessage",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idActivity",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "mappingKey",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "name",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32[]",
						"name": "selectedAttr",
						"type": "bytes32[]"
					},
					{
						"internalType": "address",
						"name": "sourceParticipant",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "targetParticipant",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "tempState",
						"type": "bool"
					}
				],
				"internalType": "struct contractMemory.Message",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "hashIdInstance",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "idActivity",
				"type": "bytes32"
			}
		],
		"name": "getTask",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idInElement",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idOutElement",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "initiator",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "messageIn",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "messageOut",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "name",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "target",
						"type": "bytes32"
					},
					{
						"internalType": "bool",
						"name": "tempState",
						"type": "bool"
					}
				],
				"internalType": "struct contractMemory.Activity",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idInElement",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idOutElement",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "initiator",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "messageIn",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "messageOut",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "name",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "target",
						"type": "bytes32"
					},
					{
						"internalType": "bool",
						"name": "tempState",
						"type": "bool"
					}
				],
				"internalType": "struct contractMemory.Activity[]",
				"name": "allActivities",
				"type": "tuple[]"
			},
			{
				"components": [
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idActivity",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "mappingKey",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "name",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32[]",
						"name": "selectedAttr",
						"type": "bytes32[]"
					},
					{
						"internalType": "address",
						"name": "sourceParticipant",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "targetParticipant",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "tempState",
						"type": "bool"
					}
				],
				"internalType": "struct contractMemory.Message[]",
				"name": "allMessages",
				"type": "tuple[]"
			},
			{
				"components": [
					{
						"internalType": "address[]",
						"name": "addr",
						"type": "address[]"
					},
					{
						"internalType": "bytes32",
						"name": "keyMapping",
						"type": "bytes32"
					}
				],
				"internalType": "struct contractMemory.PartecipantRoles[]",
				"name": "participantList",
				"type": "tuple[]"
			},
			{
				"components": [
					{
						"internalType": "bytes32[]",
						"name": "attributes",
						"type": "bytes32[]"
					},
					{
						"internalType": "bytes32",
						"name": "keyMapping",
						"type": "bytes32"
					}
				],
				"internalType": "struct contractMemory.MessageAttributes[]",
				"name": "messagesAttributeList",
				"type": "tuple[]"
			},
			{
				"components": [
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32[]",
						"name": "incomingActivity",
						"type": "bytes32[]"
					},
					{
						"internalType": "bytes32[]",
						"name": "outgoingActivity",
						"type": "bytes32[]"
					},
					{
						"internalType": "enum contractMemory.ElementType",
						"name": "elementType",
						"type": "uint8"
					}
				],
				"internalType": "struct contractMemory.ControlFlowElement[]",
				"name": "allControlFlowElement",
				"type": "tuple[]"
			},
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "attribute",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "comparisonValue",
						"type": "bytes32"
					},
					{
						"internalType": "enum contractMemory.ConditionType",
						"name": "condition",
						"type": "uint8"
					},
					{
						"internalType": "bytes32",
						"name": "idActivity",
						"type": "bytes32"
					}
				],
				"internalType": "struct contractMemory.EdgeCondition[]",
				"name": "edgeCondition",
				"type": "tuple[]"
			},
			{
				"internalType": "bytes32",
				"name": "idInstance",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "hashIdInstance",
				"type": "bytes32"
			}
		],
		"name": "setChoreography",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idActivity",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "mappingKey",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "name",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32[]",
						"name": "selectedAttr",
						"type": "bytes32[]"
					},
					{
						"internalType": "address",
						"name": "sourceParticipant",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "targetParticipant",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "tempState",
						"type": "bool"
					}
				],
				"internalType": "struct contractMemory.Message",
				"name": "_message",
				"type": "tuple"
			},
			{
				"internalType": "bytes32",
				"name": "hashInstance",
				"type": "bytes32"
			}
		],
		"name": "setMessageRuntime",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					},
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idInElement",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "idOutElement",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "initiator",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "messageIn",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "messageOut",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "name",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "target",
						"type": "bytes32"
					},
					{
						"internalType": "bool",
						"name": "tempState",
						"type": "bool"
					}
				],
				"internalType": "struct contractMemory.Activity",
				"name": "act",
				"type": "tuple"
			},
			{
				"internalType": "bytes32",
				"name": "hashInstance",
				"type": "bytes32"
			}
		],
		"name": "setTaskRuntime",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

export const contractAddress = '0xB82f8429bb9ddDf4b6eb6Cabbf53889f4766FdDC';
//0x6D478dA4710494eBe77e6f6B8960d42d64bF480d contratto nella testnet troppe transazioni inutili
//0x52eF9e94fa6C767908c63db4dA99d536Ff64685D altro contratto non ci è stato eseguito niente
//0x52A2791D1df55d5d3b17fa0615a199703657D1b8
//0xFd58FB576bb17f4Ce0abD5486248B0bEC8eB252E
//0x7c79F484f9f8693344E05db719D7CA3DE013e6eB ganache simulazione Selection
//0xd19961640D14297434DB5B327BDc84850199Be1e ganache simulazione Composition
