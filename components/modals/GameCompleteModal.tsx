// components/modals/GameCompleteModal.tsx
// Oyun tamamlama modalı - İngilizce versiyonu

import React, { useEffect } from "react";

interface GameCompleteModalProps {
  moves: number;
  timeRemaining: number;
  onPlayAgain: () => void;
}

export const GameCompleteModal: React.FC<GameCompleteModalProps> = ({
  moves,
  timeRemaining,
  onPlayAgain,
}) => {
  // Format time as MM:SS
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Confetti effect
  useEffect(() => {
    const createConfetti = () => {
      const container = document.getElementById('confetti-container');
      if (!container) return;
      
      // Clear
      container.innerHTML = '';
      
      // Create 100 confetti pieces
      for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        
        // Random properties
        const size = Math.random() * 10 + 5; // 5-15px
        const color = `hsl(${Math.random() * 360}, 100%, 70%)`;
        const left = Math.random() * 100; // 0-100%
        const duration = Math.random() * 3 + 2; // 2-5s
        const delay = Math.random() * 1.5; // 0-1.5s
        
        // Apply styles
        confetti.style.position = 'absolute';
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = color;
        confetti.style.left = `${left}%`;
        confetti.style.top = `-10px`;
        confetti.style.opacity = '1';
        confetti.style.borderRadius = '50%';
        confetti.style.animation = `fall ${duration}s ease-in-out ${delay}s`;
        
        container.appendChild(confetti);
      }
    };
    
    createConfetti();
    
    // CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fall {
        0% {
          transform: translateY(-10px) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(400px) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="modal">
      <div className="modal-content text-center">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">Congratulations!</h2>
        
        <div id="confetti-container" className="absolute inset-0 pointer-events-none overflow-hidden"></div>
        
        <div className="my-6">
          <p className="text-lg mb-2">You completed the puzzle in <span className="font-bold text-indigo-600">{moves}</span> moves!</p>
          <p className="text-lg">Time remaining: <span className="font-bold text-indigo-600">{formatTime(timeRemaining)}</span></p>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-md mb-6">
          <p className="text-sm">Your achievement has been recorded on the blockchain! </p>
        </div>
        
        <button
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium"
          onClick={onPlayAgain}
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
