// components/game/Board.tsx
// Oyun tahtası bileşeni

import React from "react";
import { Tile } from "./Tile";

interface BoardProps {
  board: number[][];
  emptyTile: { row: number; col: number };
  onTileClick: (row: number, col: number) => void;
  size: number;
  isActive: boolean;
}

export const Board: React.FC<BoardProps> = ({ 
  board, 
  emptyTile, 
  onTileClick, 
  size, 
  isActive 
}) => {
  // Bir karonun kaydırılabilir olup olmadığını kontrol et (boş kareye komşu mu)
  const isTileSlidable = (row: number, col: number) => {
    return (
      (Math.abs(row - emptyTile.row) === 1 && col === emptyTile.col) ||
      (Math.abs(col - emptyTile.col) === 1 && row === emptyTile.row)
    );
  };

  return (
    <div 
      className="game-board mx-auto mb-6 aspect-square w-full max-w-md"
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`
      }}
    >
      {board.map((row, rowIndex) => 
        row.map((value, colIndex) => (
          <Tile
            key={`${rowIndex}-${colIndex}`}
            value={value}
            isEmpty={value === 0}
            isSlidable={isTileSlidable(rowIndex, colIndex)}
            onClick={() => isActive && onTileClick(rowIndex, colIndex)}
            row={rowIndex}
            col={colIndex}
          />
        ))
      )}
    </div>
  );
};
