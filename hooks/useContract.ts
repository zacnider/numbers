// hooks/useContract.ts
// Wagmi v2 API'sına tamamen uyumlu hale getirildi

import { useState, useCallback } from 'react';
import { useWalletManager } from './useWalletManager';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contracts';
import { useAccount, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { ethers } from 'ethers';

export const useContract = () => {
  const { currentWallet } = useWalletManager();
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Oyun başlatma işlemi
  const { writeContractAsync: startGameWriteAsync } = useContractWrite();

  // Hamle yapma işlemi
  const { writeContractAsync: makeMoveWriteAsync } = useContractWrite();

  // Oyun tamamlama işlemi
  const { writeContractAsync: completeGameWriteAsync } = useContractWrite();

  // İşlem durumunu takip etmek için
  const waitForTransaction = useWaitForTransactionReceipt();

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
      const result = await startGameWriteAsync({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'startGame',
      });
      
      // İşlem onayını bekle
      await waitForTransaction.waitForTransactionReceipt({
        hash: result,
      });
      
      return result;
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [currentWallet, address, isProcessing, startGameWriteAsync, waitForTransaction]);

  // Hamle yapma
  const makeMove = useCallback(async () => {
    if (!currentWallet || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await makeMoveWriteAsync({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'makeMove',
      });
      
      // İşlem onayını bekle
      await waitForTransaction.waitForTransactionReceipt({
        hash: result,
      });
      
      return result;
    } catch (error) {
      console.error('Failed to make move:', error);
      throw error;
    }
  }, [currentWallet, address, makeMoveWriteAsync, waitForTransaction]);

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
      const result = await completeGameWriteAsync({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'completeGame',
      });
      
      // İşlem onayını bekle
      await waitForTransaction.waitForTransactionReceipt({
        hash: result,
      });
      
      return result;
    } catch (error) {
      console.error('Failed to complete game:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [currentWallet, address, isProcessing, completeGameWriteAsync, waitForTransaction]);

  return {
    startGame,
    makeMove,
    completeGame,
    isProcessing
  };
};
