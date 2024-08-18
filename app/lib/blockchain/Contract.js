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
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "attivita",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "name",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "initiator",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "target",
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
				"name": "messageIn",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "messageOut",
				"type": "bytes32"
			},
			{
				"internalType": "bool",
				"name": "executed",
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
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "controlFlowElementList",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			},
			{
				"internalType": "enum storeElement.ElementType",
				"name": "tipo",
				"type": "uint8"
			},
			{
				"internalType": "bool",
				"name": "executed",
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
				"internalType": "enum storeElement.ConditionType",
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
				"components": [
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "name",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "initiator",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "target",
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
						"name": "messageIn",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "messageOut",
						"type": "bytes32"
					},
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					}
				],
				"internalType": "struct storeElement.Activity",
				"name": "_activity",
				"type": "tuple"
			},
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "nome",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "mappingKey",
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
						"internalType": "bytes32",
						"name": "idActivity",
						"type": "bytes32"
					},
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					}
				],
				"internalType": "struct storeElement.Message",
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
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "enum storeElement.ElementType",
						"name": "tipo",
						"type": "uint8"
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
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					}
				],
				"internalType": "struct storeElement.ControlFlowElement[]",
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
						"internalType": "enum storeElement.ConditionType",
						"name": "condition",
						"type": "uint8"
					},
					{
						"internalType": "bytes32",
						"name": "idActivity",
						"type": "bytes32"
					}
				],
				"internalType": "struct storeElement.EdgeCondition[]",
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
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "idActivity",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "idMessage",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "keyMapping",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "source",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "target",
				"type": "address"
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
			}
		],
		"name": "executeSelectMessage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "name",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "initiator",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "target",
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
				"name": "messageIn",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "messageOut",
				"type": "bytes32"
			},
			{
				"internalType": "bool",
				"name": "executed",
				"type": "bool"
			}
		],
		"name": "getAttivita",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "name",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "initiator",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "target",
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
						"name": "messageIn",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "messageOut",
						"type": "bytes32"
					},
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					}
				],
				"internalType": "struct storeElement.Activity",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			},
			{
				"internalType": "enum storeElement.ElementType",
				"name": "tipo",
				"type": "uint8"
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
				"internalType": "bool",
				"name": "executed",
				"type": "bool"
			}
		],
		"name": "getFlow",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "enum storeElement.ElementType",
						"name": "tipo",
						"type": "uint8"
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
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					}
				],
				"internalType": "struct storeElement.ControlFlowElement",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "idMessage",
				"type": "bytes32"
			}
		],
		"name": "getListSelectedAttribute",
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
				"name": "id",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "nome",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "mappingKey",
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
				"internalType": "bytes32",
				"name": "idActivity",
				"type": "bytes32"
			},
			{
				"internalType": "bool",
				"name": "executed",
				"type": "bool"
			}
		],
		"name": "getMessage",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "nome",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "mappingKey",
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
						"internalType": "bytes32",
						"name": "idActivity",
						"type": "bytes32"
					},
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					}
				],
				"internalType": "struct storeElement.Message",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "n",
				"type": "uint256"
			}
		],
		"name": "intToBytes",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "pure",
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
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "nome",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "mappingKey",
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
				"internalType": "bytes32",
				"name": "idActivity",
				"type": "bytes32"
			},
			{
				"internalType": "bool",
				"name": "executed",
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
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "name",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "initiator",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "target",
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
						"name": "messageIn",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "messageOut",
						"type": "bytes32"
					},
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					}
				],
				"internalType": "struct storeElement.Activity",
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
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "nome",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "mappingKey",
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
						"internalType": "bytes32",
						"name": "idActivity",
						"type": "bytes32"
					},
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					}
				],
				"internalType": "struct storeElement.Message",
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
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "name",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "initiator",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "target",
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
						"name": "messageIn",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "messageOut",
						"type": "bytes32"
					},
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					}
				],
				"internalType": "struct storeElement.Activity[]",
				"name": "allActivities",
				"type": "tuple[]"
			},
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "nome",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "mappingKey",
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
						"internalType": "bytes32",
						"name": "idActivity",
						"type": "bytes32"
					},
					{
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					}
				],
				"internalType": "struct storeElement.Message[]",
				"name": "allMessages",
				"type": "tuple[]"
			},
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "key",
						"type": "bytes32"
					},
					{
						"internalType": "address[]",
						"name": "indirizzi",
						"type": "address[]"
					}
				],
				"internalType": "struct storeElement.PartecipantRoles[]",
				"name": "participantList",
				"type": "tuple[]"
			},
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "key",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32[]",
						"name": "attributes",
						"type": "bytes32[]"
					}
				],
				"internalType": "struct storeElement.MessageAttributes[]",
				"name": "messagesAttributeList",
				"type": "tuple[]"
			},
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "enum storeElement.ElementType",
						"name": "tipo",
						"type": "uint8"
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
						"internalType": "bool",
						"name": "executed",
						"type": "bool"
					}
				],
				"internalType": "struct storeElement.ControlFlowElement[]",
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
						"internalType": "enum storeElement.ConditionType",
						"name": "condition",
						"type": "uint8"
					},
					{
						"internalType": "bytes32",
						"name": "idActivity",
						"type": "bytes32"
					}
				],
				"internalType": "struct storeElement.EdgeCondition[]",
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
				"name": "idMessage",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "keyMapping",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "source",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "target",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "idActivity",
				"type": "bytes32"
			}
		],
		"name": "setSelecMessage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

export const contractAddress = '0xD506cFf3baE1e9e41165541cc7DA246001b23f70';