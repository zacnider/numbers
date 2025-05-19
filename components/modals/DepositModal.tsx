// components/modals/DepositModal.tsx
// Para yatırma modalı - İngilizce versiyonu

import React, { useState } from "react";

interface DepositModalProps {
  gameWalletAddress: string;
  metamaskAddress: string | null;
  onDeposit: (amount: string) => void;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  gameWalletAddress,
  metamaskAddress,
  onDeposit,
  onClose,
}) => {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      await onDeposit(amount);
      // Modal will be closed on success
    } catch (error: any) {
      setError(error.message || "Deposit failed");
      setIsSubmitting(false);
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
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Deposit MON</h2>
        
        <p className="mb-4">Deposit MON tokens from your Warpcast wallet to your in-game wallet.</p>
        
        <div className="bg-gray-50 rounded-md p-4 mb-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">From (Warpcast):</label>
            <div className="flex items-center">
              <p className="text-sm font-mono bg-white p-2 rounded-md border border-gray-300 flex-grow truncate">
                {metamaskAddress}
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To (Game Wallet):</label>
            <div className="flex items-center">
              <p className="text-sm font-mono bg-white p-2 rounded-l-md border border-gray-300 flex-grow truncate">
                {gameWalletAddress}
              </p>
              <button
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 border-l-0 p-2 rounded-r-md"
                onClick={() => copyToClipboard(gameWalletAddress)}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (MON):
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.001"
              step="0.001"
              placeholder="0.001"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Minimum amount: 0.001 MON</p>
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
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
              {isSubmitting ? "Processing..." : "Deposit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
