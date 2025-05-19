// components/modals/WithdrawModal.tsx
// Para çekme modalı

import React, { useState } from "react";

interface WithdrawModalProps {
  gameWalletAddress: string;
  metamaskAddress: string | null;
  balance: string;
  onWithdraw: (amount: string) => void;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  gameWalletAddress,
  metamaskAddress,
  balance,
  onWithdraw,
  onClose,
}) => {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Lütfen geçerli bir miktar girin");
      return;
    }
    
    if (parseFloat(amount) > parseFloat(balance)) {
      setError(`Yetersiz bakiye. Mevcut bakiyeniz: ${balance} MON`);
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      await onWithdraw(amount);
      // İşlem başarılıysa modal kapatılacak
    } catch (error: any) {
      setError(error.message || "Para çekme işlemi başarısız oldu");
      setIsSubmitting(false);
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

  const handleMaxClick = () => {
    setAmount(balance);
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">MON Çek</h2>
        
        <p className="mb-4">Oyun içi cüzdanınızdan Warpcast cüzdanınıza MON token çekin.</p>
        
        <div className="bg-gray-50 rounded-md p-4 mb-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Gönderen (Oyun Cüzdanı):</label>
            <div className="flex items-center">
              <p className="text-sm font-mono bg-white p-2 rounded-md border border-gray-300 flex-grow truncate">
                {gameWalletAddress}
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alıcı (Warpcast):</label>
            <div className="flex items-center">
              <p className="text-sm font-mono bg-white p-2 rounded-l-md border border-gray-300 flex-grow truncate">
                {metamaskAddress}
              </p>
              <button
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 border-l-0 p-2 rounded-r-md"
                onClick={() => copyToClipboard(metamaskAddress || '')}
              >
                Kopyala
              </button>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Miktar (MON):
              </label>
              <span className="text-sm text-gray-600">
                Mevcut: <span className="font-medium">{parseFloat(balance).toFixed(4)} MON</span>
              </span>
            </div>
            
            <div className="flex">
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.001"
                step="0.001"
                placeholder="0.001"
                className="w-full p-2 border border-gray-300 rounded-l-md"
                required
              />
              <button
                type="button"
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 border-l-0 px-3 rounded-r-md text-sm font-medium"
                onClick={handleMaxClick}
              >
                MAX
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-1">
              İşlem ücretleri otomatik olarak düşülecektir. Minimum miktar: 0.001 MON
            </p>
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md font-medium ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "İşleniyor..." : "Çek"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
