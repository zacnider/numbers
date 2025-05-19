// components/game/GameControls.tsx
// Oyun kontrol butonları bileşeni

import React from "react";

interface GameControlsProps {
  onStartGame: () => void;
  onHint?: () => void;
  isGameActive: boolean;
  hasWallet: boolean;
  hasBalance: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onStartGame,
  onHint,
  isGameActive,
  hasWallet,
  hasBalance
}) => {
  const startButtonDisabled = isGameActive || !hasWallet || !hasBalance;
  const hintButtonDisabled = !isGameActive;
  
  return (
    <div className="flex justify-center gap-4">
      <button
        className={`px-4 py-2 font-medium rounded-md transition-colors ${
          startButtonDisabled
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
        onClick={onStartGame}
        disabled={startButtonDisabled}
      >
        Start Game
      </button>
      
      <button
        className={`px-4 py-2 font-medium rounded-md transition-colors ${
          hintButtonDisabled
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
        onClick={onHint}
        disabled={hintButtonDisabled}
      >
        Hint
      </button>
    </div>
  );
};
