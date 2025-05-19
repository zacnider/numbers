// components/modals/CreateWalletModal.tsx
// Cüzdan oluşturma modalı

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
      console.error('Cüzdan oluşturulamadı:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClose = () => {
    if (wallet) {
      onClose();
    } else if (confirm('Cüzdan henüz kaydedilmedi. Çıkmak istediğinizden emin misiniz?')) {
      onClose();
    }
  };
  
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
    <div className="modal" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{wallet ? 'Yeni Cüzdanınız' : 'Cüzdan Oluştur'}</h2>
        
        {!wallet ? (
          <>
            <p className="mb-4">Yeni bir oyun içi cüzdan oluşturmak istediğinizden emin misiniz?</p>
            <p className="text-sm text-gray-600 mb-6">Bu cüzdan, blockchain üzerinde saklanacak ve MON token alıp göndermek için kullanılacaktır.</p>
            
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={onClose}
              >
                İptal
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
                {isSaving ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};
