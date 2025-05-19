// components/wallet/SaveWalletButton.tsx
// Cüzdanları blockchain'e kaydetmek için buton bileşeni

import React, { useState } from "react";

interface SaveWalletButtonProps {
  onSave: () => Promise<boolean>;
  hasWallets: boolean;
  isBlockchainSynced: boolean;
  isSaving?: boolean;
}

export const SaveWalletButton: React.FC<SaveWalletButtonProps> = ({ 
  onSave, 
  hasWallets, 
  isBlockchainSynced,
  isSaving = false
}) => {
  const [saving, setSaving] = useState<boolean>(isSaving);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const handleSave = async () => {
    if (saving) return;
    
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);
    
    try {
      const success = await onSave();
      setSaveSuccess(success);
      
      // Başarı göstergesini 3 saniye sonra kaldır
      if (success) {
        setTimeout(() => {
          setSaveSuccess(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Blockchain\'e kayıt başarısız:', error);
      setSaveError(error instanceof Error ? error.message : 'Unknown error');
      
      // Hata mesajını 5 saniye sonra kaldır
      setTimeout(() => {
        setSaveError(null);
      }, 5000);
    } finally {
      setSaving(false);
    }
  };
  
  // Buton metni
  let buttonText = "Save Wallets to Blockchain";
  if (saving) {
    buttonText = "Saving...";
  } else if (isBlockchainSynced) {
    buttonText = "Wallets Synced with Blockchain";
  }
  
  // Buton sınıfı
  let buttonClass = "px-4 py-2 font-medium rounded-md ";
  
  if (saving) {
    buttonClass += "bg-gray-400 cursor-not-allowed text-white";
  } else if (!hasWallets) {
    buttonClass += "bg-gray-400 cursor-not-allowed text-white";
  } else if (isBlockchainSynced) {
    buttonClass += "bg-green-600 text-white";
  } else {
    buttonClass += "bg-blue-600 hover:bg-blue-700 text-white";
  }
  
  return (
    <div>
      <button 
        className={buttonClass}
        onClick={handleSave}
        disabled={saving || !hasWallets}
      >
        {buttonText}
      </button>
      
      {saveSuccess && (
        <div className="mt-2 text-sm font-medium text-green-600">
          Wallets successfully saved to blockchain!
        </div>
      )}
      
      {saveError && (
        <div className="mt-2 text-sm font-medium text-red-600">
          Error: {saveError}
        </div>
      )}
    </div>
  );
};
