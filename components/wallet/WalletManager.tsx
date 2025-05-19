// components/wallet/WalletManager.tsx
// Cüzdan yönetim bileşeni - Save butonu eklendi

import React from "react";
import { WalletManagerProps } from "@/types";
import { SaveWalletButton } from "./SaveWalletButton";

export const WalletManager: React.FC<WalletManagerProps> = ({
  wallets,
  currentWallet,
  onCreateWallet,
  onSelectWallet,
  onDeleteWallet,
  onViewDetails,
  onConnectMetaMask,
  onSaveWallets,
  isConnectedToMetaMask,
  metamaskAddress,
  isBlockchainSynced,
  isSavingToBlockchain
}) => {
  const handleDeleteWallet = (address: string) => {
    if (confirm('Are you sure you want to delete this wallet?')) {
      onDeleteWallet(address);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-bold mb-3">Wallet Connection</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 text-sm">
        <p className="mb-1">1. Connect your Warpcast wallet using the <strong>Connect Warpcast</strong> button below.</p>
        <p className="mb-1">2. Then, create an in-game wallet by clicking the <strong>Create Game Wallet</strong> button.</p>
        <p className="mb-1">3. Your in-game wallet will be stored in your browser.</p>
        <p>4. Use the <strong>Save Wallets to Blockchain</strong> button to store your wallets securely on the blockchain.</p>
      </div>
      
      <div className="bg-gray-50 p-3 rounded mb-4">
        {isConnectedToMetaMask ? (
          <div>
            <p className="text-sm mb-1">
              <span className="font-semibold">Warpcast:</span> 
              <span className="text-green-600 ml-1">Connected</span>
            </p>
            <p className="text-xs text-gray-500 truncate">{metamaskAddress}</p>
            
            {currentWallet ? (
              <div className="mt-2">
                <p className="text-sm mb-1">
                  <span className="font-semibold">Game Wallet:</span>
                  <span className="text-green-600 ml-1">Ready</span>
                </p>
                <p className="text-xs text-gray-500 truncate">{currentWallet.address}</p>
              </div>
            ) : (
              <p className="text-sm mt-2">
                <span className="font-semibold">Game Wallet:</span>
                <span className="text-yellow-600 ml-1">Not Created</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm">You need to connect Warpcast wallet and create a game wallet to play.</p>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        <button 
          className={`px-4 py-2 font-medium rounded-md ${
            isConnectedToMetaMask 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          onClick={onConnectMetaMask}
          disabled={isConnectedToMetaMask}
        >
          {isConnectedToMetaMask ? 'Warpcast Connected' : 'Connect Warpcast'}
        </button>
        
        <button 
          className={`px-4 py-2 rounded-md ${
            !isConnectedToMetaMask 
              ? 'bg-gray-400 cursor-not-allowed text-white' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          onClick={onCreateWallet}
          disabled={!isConnectedToMetaMask}
        >
          Create Game Wallet
        </button>
        
        {/* Yeni: Cüzdanları Blockchain'e kaydetme butonu */}
        {isConnectedToMetaMask && wallets.length > 0 && (
          <SaveWalletButton
            onSave={onSaveWallets}
            hasWallets={wallets.length > 0}
            isBlockchainSynced={isBlockchainSynced}
            isSaving={isSavingToBlockchain}
          />
        )}
        
        {wallets.length > 0 && (
          <div className="mt-3">
            <h3 className="text-sm font-semibold mb-2">Your Wallets:</h3>
            <div className="max-h-[120px] overflow-y-auto">
              {wallets.map((wallet) => (
                <div 
                  key={wallet.address} 
                  className={`flex justify-between items-center p-2 mb-1 rounded text-sm ${
                    currentWallet?.address === wallet.address 
                      ? 'bg-indigo-100 border border-indigo-300' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate max-w-[150px]">
                    {wallet.address.substring(0, 6)}...{wallet.address.substring(38)}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                      onClick={() => onSelectWallet(wallet.address)}
                    >
                      {currentWallet?.address === wallet.address ? 'Selected' : 'Select'}
                    </button>
                    <button 
                      className="text-xs px-2 py-1 bg-white border border-red-300 text-red-600 rounded hover:bg-red-50"
                      onClick={() => handleDeleteWallet(wallet.address)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {currentWallet && (
          <button 
            className="px-4 py-2 mt-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
            onClick={onViewDetails}
          >
            View Wallet Details
          </button>
        )}
      </div>
    </div>
  );
};
