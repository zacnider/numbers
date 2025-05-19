// components/modals/WalletDetailsModal.tsx
// Cüzdan detayları modalı

import React, { useState } from "react";

interface Wallet {
  address: string;
  privateKey: string;
  mnemonic: string;
}

interface WalletDetailsModalProps {
  wallet: Wallet;
  onClose: () => void;
}

export const WalletDetailsModal: React.FC<WalletDetailsModalProps> = ({ wallet, onClose }) => {
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Panoya kopyalandı!');
      })
      .catch(err => {
        console.error('Kopyalama başarısız:', err);
      });
  };
  
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Cüzdan Detayları</h2>
        
        <div className="space-y-4 mb-4">
          <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres:</label>
            <div className="flex items-center">
              <p className="text-sm font-mono bg-white p-2 rounded-l-md border border-gray-300 flex-grow truncate">
                {wallet.address}
              </p>
              <button 
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 border-l-0 p-2 rounded-r-md"
                onClick={() => copyToClipboard(wallet.address)}
              >
                Kopyala
              </button>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-1">Özel Anahtar:</label>
            <div className="flex items-center">
              <p className="text-sm font-mono bg-white p-2 rounded-l-md border border-gray-300 flex-grow truncate">
                {showPrivateKey ? wallet.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
              </p>
              <button 
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 p-2"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
              >
                {showPrivateKey ? 'Gizle' : 'Göster'}
              </button>
              <button 
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 border-l-0 p-2 rounded-r-md"
                onClick={() => copyToClipboard(wallet.privateKey)}
              >
                Kopyala
              </button>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mnemonic (Kurtarma Cümlesi):</label>
            <div className="flex items-center">
              <p className="text-sm font-mono bg-white p-2 rounded-l-md border border-gray-300 flex-grow truncate">
                {showMnemonic ? wallet.mnemonic : '•••• •••• •••• •••• •••• •••• •••• ••••'}
              </p>
              <button 
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 p-2"
                onClick={() => setShowMnemonic(!showMnemonic)}
              >
                {showMnemonic ? 'Gizle' : 'Göster'}
              </button>
              <button 
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 border-l-0 p-2 rounded-r-md"
                onClick={() => copyToClipboard(wallet.mnemonic)}
              >
                Kopyala
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-sm mb-6">
          <p className="font-bold mb-1">Uyarı:</p>
          <p>Özel anahtarınızı ve kurtarma cümlenizi güvenli bir yerde saklayın. Bu bilgilere sahip olan herkes cüzdanınızdaki fonları kontrol edebilir.</p>
        </div>
        
        <div className="flex justify-end">
          <button 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium"
            onClick={onClose}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
