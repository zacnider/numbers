// hooks/useContract.ts
// Kontrat etkileşimleri için hook

import { useState, useCallback } from 'react';
import { useWalletManager } from './useWalletManager';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contracts';
import { useAccount, useContractWrite } from 'wagmi';

export const useContract = () => {
  const { currentWallet } = useWalletManager();
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Oyun başlatma işlemi
  const { writeAsync: startGameWrite } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'startGame',
  });

  // Hamle yapma işlemi
  const { writeAsync: makeMoveWrite } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'makeMove',
  });

  // Oyun tamamlama işlemi
  const { writeAsync: completeGameWrite } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'completeGame',
  });

  // Oyun başlatma
  const startGame = useCallback(async () => {
    if (!currentWallet || !address) {
      throw new Error('Cüzdan bağlı değil');
    }

    if (isProcessing) {
      throw new Error('İşlem zaten devam ediyor');
    }

    try {
      setIsProcessing(true);
      const tx = await startGameWrite();
      return tx;
    } catch (error) {
      console.error('Oyun başlatılamadı:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [currentWallet, address, isProcessing, startGameWrite]);

  // Hamle yapma
  const makeMove = useCallback(async () => {
    if (!currentWallet || !address) {
      throw new Error('Cüzdan bağlı değil');
    }

    try {
      const tx = await makeMoveWrite();
      return tx;
    } catch (error) {
      console.error('Hamle yapılamadı:', error);
      throw error;
    }
  }, [currentWallet, address, makeMoveWrite]);

  // Oyun tamamlama
  const completeGame = useCallback(async () => {
    if (!currentWallet || !address) {
      throw new Error('Cüzdan bağlı değil');
    }

    if (isProcessing) {
      throw new Error('İşlem zaten devam ediyor');
    }

    try {
      setIsProcessing(true);
      const tx = await completeGameWrite();
      return tx;
    } catch (error) {
      console.error('Oyun tamamlanamadı:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [currentWallet, address, isProcessing, completeGameWrite]);

  return {
    startGame,
    makeMove,
    completeGame,
    isProcessing
  };
};
