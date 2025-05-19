// components/modals/GameOverModal.tsx
// Oyun bitti modalı

import React from "react";

interface GameOverModalProps {
  onTryAgain: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onTryAgain }) => {
  return (
    <div className="modal">
      <div className="modal-content text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Oyun Bitti!</h2>
        
        <div className="my-6">
          <p className="text-lg mb-4">Süre doldu.</p>
          <p className="text-gray-600">Bulmacayı belirlenen sürede tamamlayamadınız. Tekrar denemek ister misiniz?</p>
        </div>
        
        <button
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium"
          onClick={onTryAgain}
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
};
