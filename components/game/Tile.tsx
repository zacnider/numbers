// components/game/Tile.tsx
// Oyun karosu bileşeni

import React, { useState } from "react";

interface TileProps {
  value: number;
  isEmpty: boolean;
  isSlidable: boolean;
  onClick: () => void;
  row: number;
  col: number;
}

export const Tile: React.FC<TileProps> = ({ 
  value, 
  isEmpty, 
  isSlidable, 
  onClick, 
  row, 
  col 
}) => {
  const [isSliding, setIsSliding] = useState(false);

  const handleClick = () => {
    if (isEmpty || !isSlidable) return;
    
    setIsSliding(true);
    onClick();
    
    // Animasyon tamamlandıktan sonra kayma durumunu sıfırla
    setTimeout(() => {
      setIsSliding(false);
    }, 300);
  };

  const tileClasses = `game-tile ${isEmpty ? 'empty' : ''} ${isSlidable && !isEmpty ? 'slidable' : ''} ${isSliding ? 'sliding' : ''}`;

  return (
    <div 
      className={tileClasses}
      onClick={handleClick}
      data-row={row}
      data-col={col}
    >
      {!isEmpty && value}
    </div>
  );
};
