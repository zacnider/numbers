// hooks/useContract.ts
// Güncellenmiş useContractWrite kullanımı - Wagmi v2 uyumlu

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
  const startGameContract = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'startGame',
  });

  // Hamle yapma işlemi
  const makeMoveContract = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'makeMove',
  });

  // Oyun tamamlama işlemi
  const completeGameContract = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'completeGame',
  });

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
      const result = await startGameContract.writeContract();
      
      // İşlem onayını bekle
      const receipt = await waitForTransaction.writeContract({
        hash: result.hash,
      });
      
      return receipt;
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [currentWallet, address, isProcessing, startGameContract, waitForTransaction]);

  // Hamle yapma
  const makeMove = useCallback(async () => {
    if (!currentWallet || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await makeMoveContract.writeContract();
      
      // İşlem onayını bekle
      const receipt = await waitForTransaction.writeContract({
        hash: result.hash,
      });
      
      return receipt;
    } catch (error) {
      console.error('Failed to make move:', error);
      throw error;
    }
  }, [currentWallet, address, makeMoveContract, waitForTransaction]);

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
      const result = await completeGameContract.writeContract();
      
      // İşlem onayını bekle
      const receipt = await waitForTransaction.writeContract({
        hash: result.hash,
      });
      
      return receipt;
    } catch (error) {
      console.error('Failed to complete game:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [currentWallet, address, isProcessing, completeGameContract, waitForTransaction]);

  return {
    startGame,
    makeMove,
    completeGame,
    isProcessing
  };
};
