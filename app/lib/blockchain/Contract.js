/**
 * @file Contract.js
 * @description This file contains the ABI and address of the EmergencyResponsePlan smart contract on the blockchain.
 */

export const contractAbi = [
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
						"name": "tipo",
						"type": "uint8"
					}
				],
				"internalType": "struct contractMemory.ControlFlowElement[]",
				"name": "_contolFlowElement",
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
				"name": "someEdgeCondition",
				"type": "tuple[]"
			}
		],
		"name": "executeCompMessage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "messaggeId",
				"type": "bytes32"
			}
		],
		"name": "FunctionDone",
		"type": "event"
	},
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
				"name": "act",
				"type": "tuple"
			}
		],
		"name": "setCompActivity",
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
			}
		],
		"name": "setCompMessage",
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
						"name": "tipo",
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
			}
		],
		"name": "setInformation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "attivita",
		"outputs": [
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
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "attributiValue",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "key",
				"type": "bytes32"
			}
		],
		"name": "checkKeyMessage",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "controlFlowElementList",
		"outputs": [
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
				"internalType": "enum contractMemory.ElementType",
				"name": "tipo",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "edgeConditionMapping",
		"outputs": [
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
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "key",
				"type": "bytes32"
			}
		],
		"name": "getListAttributeForKey",
		"outputs": [
			{
				"internalType": "bytes32[]",
				"name": "",
				"type": "bytes32[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "key",
				"type": "bytes32"
			}
		],
		"name": "getListParticipant",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "messageAttributes",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "messaggi",
		"outputs": [
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
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "participants",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

export const contractAddress = '0x52eF9e94fa6C767908c63db4dA99d536Ff64685D';
//0x6D478dA4710494eBe77e6f6B8960d42d64bF480d contratto nella testnet troppe transazioni inutili
//0x52eF9e94fa6C767908c63db4dA99d536Ff64685D altro contratto