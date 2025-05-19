// lib/contracts.ts
// Kontrat adresleri ve ABI'ler

import { NETWORK_CONFIG } from './constants';

// Sliding Puzzle Oyun Sözleşmesi adresi
export const CONTRACT_ADDRESS = '0x58C47b55af42A75E81Ea616732e09600F533DF7B';

// Oyun Sözleşmesi ABI
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "completeGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "encryptedPrivateKey",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "encryptedMnemonic",
        "type": "string"
      }
    ],
    "name": "createWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllWallets",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "encryptedPrivateKeys",
        "type": "string[]"
      },
      {
        "internalType": "string[]",
        "name": "encryptedMnemonics",
        "type": "string[]"
      },
      {
        "internalType": "bool[]",
        "name": "activeStates",
        "type": "bool[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getGameStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "moves",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "completed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getHighScore",
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
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getWallet",
    "outputs": [
      {
        "internalType": "string",
        "name": "encryptedPrivateKey",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "encryptedMnemonic",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWalletCount",
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
    "inputs": [],
    "name": "makeMove",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "removeWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "setActiveWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
