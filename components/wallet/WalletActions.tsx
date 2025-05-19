// components/wallet/WalletActions.tsx
// Cüzdan işlem butonları bileşeni

import React from "react";

interface WalletActionsProps {
  walletBalance: string;
  onDeposit: () => void;
  onWithdraw: () => void;
  hasWallet: boolean;
}

export const WalletActions: React.FC<WalletActionsProps> = ({ 
  walletBalance, 
  onDeposit, 
  onWithdraw, 
  hasWallet 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-bold mb-3">Cüzdan İşlemleri</h2>
      
      <div className="bg-gray-50 p-3 rounded-md mb-4 font-semibold">
        Mevcut Bakiye: <span className="text-indigo-600">{parseFloat(walletBalance).toFixed(4)} MON</span>
      </div>
      
      <div className="flex gap-2">
        <button 
          className={`flex-1 px-4 py-2 font-medium rounded-md ${
            !hasWallet 
              ? 'bg-gray-400 cursor-not-allowed text-white' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          onClick={onDeposit}
          disabled={!hasWallet}
        >
          MON Yatır
        </button>
        
        <button 
          className={`flex-1 px-4 py-2 font-medium rounded-md ${
            !hasWallet || parseFloat(walletBalance) === 0
              ? 'bg-gray-400 cursor-not-allowed text-white' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          onClick={onWithdraw}
          disabled={!hasWallet || parseFloat(walletBalance) === 0}
        >
          MON Çek
        </button>
      </div>
    </div>
  );
};
