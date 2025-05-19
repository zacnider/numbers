// components/modals/CreateWalletModal.tsx
// Cüzdan oluşturma modalı - İngilizce versiyonu

import React, { useState } from "react";

interface CreateWalletModalProps {
  onClose: () => void;
  onSave: () => any;
  isMetaMaskConnected: boolean;
}

export const CreateWalletModal: React.FC<CreateWalletModalProps> = ({ 
  onClose, 
  onSave, 
  isMetaMaskConnected 
}) => {
  const [wallet, setWallet] = useState<any>(null);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleCreateWallet = () => {
    setIsSaving(true);
    try {
      const newWallet = onSave();
      setWallet(newWallet);
    } catch (error) {
      console.error('Failed to create wallet:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClose = () => {
    if (wallet) {
      onClose();
    } else if (confirm('Wallet not saved yet. Are you sure you want to exit?')) {
      onClose();
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };
  
  return (
    <div className="modal" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{wallet ? 'Your New Wallet' : 'Create Wallet'}</h2>
        
        {!wallet ? (
          <>
            <p className="mb-4">Are you sure you want to create a new in-game wallet?</p>
            <p className="text-sm text-gray-600 mb-6">This wallet will be stored on the blockchain and used to receive and send MON tokens.</p>
            
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 rounded-md font-medium ${
                  !isMetaMaskConnected || isSaving 
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
                onClick={handleCreateWallet}
                disabled={!isMetaMaskConnected || isSaving}
              >
                {isSaving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 mb-4">
              <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address:</label>
                <div className="flex items-center">
                  <p className="text-sm font-mono bg-white p-2 rounded-l-md border border-gray-300 flex-grow truncate">
                    {wallet.address}
                  </p>
                  <button 
                    className="bg-gray-100 hover:bg-gray-200 border border-gray-300 border-l-0 p-2 rounded-r-md"
                    onClick={() => copyToClipboard(wallet.address)}
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-1">Private Key:</label>
                <div className="flex items-center">
                  <p className="text-sm font-mono bg-white p-2 rounded-l-md border border-gray-300 flex-grow truncate">
                    {showPrivateKey ? wallet.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                  </p>
                  <button 
                    className="bg-gray-100 hover:bg-gray-200 border border-gray-300 p-2"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    {showPrivateKey ? 'Hide' : 'Show'}
                  </button>
                  <button 
                    className="bg-gray-100 hover:bg-gray-200 border border-gray-300 border-l-0 p-2 rounded-r-md"
                    onClick={() => copyToClipboard(wallet.privateKey)}
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mnemonic (Recovery Phrase):</label>
                <div className="flex items-center">
                  <p className="text-sm font-mono bg-white p-2 rounded-l-md border border-gray-300 flex-grow truncate">
                    {showMnemonic ? wallet.mnemonic : '•••• •••• •••• •••• •••• •••• •••• ••••'}
                  </p>
                  <button 
                    className="bg-gray-100 hover:bg-gray-200 border border-gray-300 p-2"
                    onClick={() => setShowMnemonic(!showMnemonic)}
                  >
                    {showMnemonic ? 'Hide' : 'Show'}
                  </button>
                  <button 
                    className="bg-gray-100 hover:bg-gray-200 border border-gray-300 border-l-0 p-2 rounded-r-md"
                    onClick={() => copyToClipboard(wallet.mnemonic)}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-sm mb-6">
              <p className="font-bold mb-1">Warning:</p>
              <p>Store your private key and recovery phrase in a secure place. Anyone with access to these can control your wallet funds.</p>
            </div>
            
            <div className="flex justify-end">
              <button 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
