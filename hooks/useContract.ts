// hooks/useContract.ts
// Wagmi v2 API'sına tamamen uyumlu - useWaitForTransactionReceipt düzeltildi

import { useState, useCallback } from 'react';
import { useWalletManager } from './useWalletManager';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contracts';
import { useAccount, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';

export const useContract = () => {
  const { currentWallet } = useWalletManager();
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Kontrat yazma işlemleri
  const { writeContractAsync: startGameWriteAsync } = useContractWrite();
  const { writeContractAsync: makeMoveWriteAsync } = useContractWrite();
  const { writeContractAsync: completeGameWriteAsync } = useContractWrite();
  
  // İşlem durumunu takip etmek için - doğru kullanım
  const { waitForTransactionReceipt } = useWaitForTransactionReceipt();

  // Oyun başlatma
  const startGame = useCallback(async () => {
    if (!currentWallet || !address) {
      throw new Error('Wallet not connected');
    }

    if (isProcessing) {
      throw new Error('A transaction is already in progress');
    }

    try {
      setIsProcessing(true);
      const hash = await startGameWriteAsync({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'startGame',
      });
      
      // İşlem onayını bekle - doğru kullanım
      const receipt = await waitForTransactionReceipt({
        hash,
      });
      
      return receipt;
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [currentWallet, address, isProcessing, startGameWriteAsync, waitForTransactionReceipt]);

  // Hamle yapma
  const makeMove = useCallback(async () => {
    if (!currentWallet || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      const hash = await makeMoveWriteAsync({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'makeMove',
      });
      
      // İşlem onayını bekle - doğru kullanım
      const receipt = await waitForTransactionReceipt({
        hash,
      });
      
      return receipt;
    } catch (error) {
      console.error('Failed to make move:', error);
      throw error;
    }
  }, [currentWallet, address, makeMoveWriteAsync, waitForTransactionReceipt]);

  // Oyun tamamlama
  const completeGame = useCallback(async () => {
    if (!currentWallet || !address) {
      throw new Error('Wallet not connected');
    }

    if (isProcessing) {
      throw new Error('A transaction is already in progress');
    }

    try {
      setIsProcessing(true);
      const hash = await completeGameWriteAsync({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'completeGame',
      });
      
      // İşlem onayını bekle - doğru kullanım
      const receipt = await waitForTransactionReceipt({
        hash,
      });
      
      return receipt;
    } catch (error) {
      console.error('Failed to complete game:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [currentWallet, address, isProcessing, completeGameWriteAsync, waitForTransactionReceipt]);

  return {
    startGame,
    makeMove,
    completeGame,
    isProcessing
  };
};
