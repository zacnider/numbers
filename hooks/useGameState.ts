// hooks/useGameState.ts
// Oyun durumu yönetimi için hook

import { useState, useEffect, useCallback } from 'react';
import { GAME_TIME_LIMIT } from '@/lib/constants';
import { useWalletManager } from './useWalletManager';
import { useContract } from './useContract';

// Oyun mantığı yardımcı fonksiyonları
const generateSolvablePuzzle = (size: number) => {
  // Çözülebilir bir bulmaca ile başla
  const board: number[][] = [];
  let counter = 1;
  
  for (let row = 0; row < size; row++) {
    board[row] = [];
    for (let col = 0; col < size; col++) {
      if (row === size - 1 && col === size - 1) {
        board[row][col] = 0; // Boş karo
      } else {
        board[row][col] = counter++;
      }
    }
  }
  
  // Bulmacayı rastgele geçerli hamlelerle karıştır
  const emptyTile = { row: size - 1, col: size - 1 };
  const directions = [
    { row: -1, col: 0 }, // Yukarı
    { row: 1, col: 0 },  // Aşağı
    { row: 0, col: -1 }, // Sol
    { row: 0, col: 1 }   // Sağ
  ];
  
  // Rastgele geçerli hamleler yap
  for (let i = 0; i < 200; i++) {
    const possibleMoves = [];
    
    for (const dir of directions) {
      const newRow = emptyTile.row + dir.row;
      const newCol = emptyTile.col + dir.col;
      
      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
        possibleMoves.push({ row: newRow, col: newCol });
      }
    }
    
    // Rastgele bir hamle seç
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    
    // Karoları değiştir
    board[emptyTile.row][emptyTile.col] = board[randomMove.row][randomMove.col];
    board[randomMove.row][randomMove.col] = 0;
    
    // Boş karo pozisyonunu güncelle
    emptyTile.row = randomMove.row;
    emptyTile.col = randomMove.col;
  }
  
  return { board, emptyTile };
};

// Bulmaca çözüldü mü kontrolü
const isSolved = (board: number[][], size: number) => {
  let expectedValue = 1;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const value = board[row][col];
      
      // Boş karoyu kontrol et (en son pozisyonda olmalı)
      if (row === size - 1 && col === size - 1) {
        return value === 0;
      }
      
      // Şu anki karonun beklenen değere sahip olup olmadığını kontrol et
      if (value !== expectedValue) {
        return false;
      }
      
      expectedValue++;
    }
  }
  
  return true;
};

export const useGameState = (size = 4) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [emptyTile, setEmptyTile] = useState({ row: size - 1, col: size - 1 });
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(GAME_TIME_LIMIT);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  const { currentWallet, walletBalance } = useWalletManager();
  const { startGame: startGameOnChain, makeMove, completeGame } = useContract();

  // Zamanlayıcı güncellemesi
  useEffect(() => {
    if (!isGameActive || !startTime) return;

    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, GAME_TIME_LIMIT - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        handleGameOver();
      }
    };

    const timer = setInterval(updateTimer, 1000);
    setTimerId(timer);

    return () => {
      clearInterval(timer);
      setTimerId(null);
    };
  }, [isGameActive, startTime]);

  // Oyun bittiğinde temizlik
  useEffect(() => {
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [timerId]);

  // Yeni oyun başlat
  const startGame = useCallback(async () => {
    if (!currentWallet || parseFloat(walletBalance) === 0) {
      alert("Oyun oynamak için MON tokenleri olan bir cüzdana ihtiyacınız var");
      return;
    }

    try {
      // Blockchain'de oyunu başlat
      await startGameOnChain();
      
      // Oyun durumunu sıfırla
      const { board: newBoard, emptyTile: newEmptyTile } = generateSolvablePuzzle(size);
      setBoard(newBoard);
      setEmptyTile(newEmptyTile);
      setMoves(0);
      setStartTime(Date.now());
      setTimeRemaining(GAME_TIME_LIMIT);
      setIsGameActive(true);
      setIsSolved(false);
      setIsGameOver(false);
    } catch (error) {
      console.error("Oyun başlatılamadı:", error);
      alert("Oyun başlatılamadı. Lütfen tekrar deneyin.");
    }
  }, [currentWallet, walletBalance, size, startGameOnChain]);

  // Karo tıklama işleyicisi
  const handleTileClick = useCallback(async (row: number, col: number) => {
    if (!isGameActive) return;

    // Karonun kaydırılabilir olup olmadığını kontrol et
    const isTileSlidable = 
      (Math.abs(row - emptyTile.row) === 1 && col === emptyTile.col) ||
      (Math.abs(col - emptyTile.col) === 1 && row === emptyTile.row);

    if (!isTileSlidable) return;

    try {
      // Blockchain'de hamleyi kaydet
      await makeMove();
      
      // Yeni tahtayı oluştur
      const newBoard = [...board.map(r => [...r])];
      newBoard[emptyTile.row][emptyTile.col] = newBoard[row][col];
      newBoard[row][col] = 0;
      
      // Durumu güncelle
      setBoard(newBoard);
      setEmptyTile({ row, col });
      setMoves(prev => prev + 1);
      
      // Bulmaca çözüldü mü kontrol et
      if (isSolved(newBoard, size)) {
        handleGameCompletion();
      }
    } catch (error) {
      console.error("Hamle yapılamadı:", error);
      // Hata durumunda oyunu sürdür, kullanıcıya gösterme
    }
  }, [board, emptyTile, isGameActive, size, makeMove]);

  // Oyun tamamlama işleyicisi
  const handleGameCompletion = useCallback(async () => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    
    setIsGameActive(false);
    setIsSolved(true);
    
    try {
      // Blockchain'de oyun tamamlamayı kaydet
      await completeGame();
    } catch (error) {
      console.error("Oyun tamamlama kaydedilemedi:", error);
      // Hatayı görmezden gel, kullanıcı yine de ödülünü görebilmeli
    }
  }, [timerId, completeGame]);

  // Oyun bitti işleyicisi
  const handleGameOver = useCallback(() => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    
    setIsGameActive(false);
    setTimeRemaining(0);
    setIsGameOver(true);
  }, [timerId]);

  // Oyunu sıfırla
  const resetGame = useCallback(() => {
    setBoard([]);
    setEmptyTile({ row: size - 1, col: size - 1 });
    setMoves(0);
    setStartTime(null);
    setTimeRemaining(GAME_TIME_LIMIT);
    setIsGameActive(false);
    setIsSolved(false);
    setIsGameOver(false);
    
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
  }, [size, timerId]);

  // İpucu göster
  const showHint = useCallback(() => {
    // TODO: İpucu mantığı eklenebilir
    console.log("İpucu gösteriliyor");
  }, []);

  return {
    board,
    emptyTile,
    moves,
    timeRemaining,
    isGameActive,
    isSolved,
    isGameOver,
    startGame,
    handleTileClick,
    resetGame,
    showHint
  };
};
