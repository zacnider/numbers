// hooks/useContract.ts
// Wagmi v2 API doğru kullanım - tam işlevsellik ile

import { useState, useCallback } from 'react';
import { useWalletManager } from './useWalletManager';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contracts';
import { useAccount, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { ethers } from 'ethers';

export const useContract = () => {
  const { currentWallet } = useWalletManager();
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Kontrat yazma işlemleri
  const startGameWrite = useContractWrite({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'startGame',
  });

  const makeMoveWrite = useContractWrite({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'makeMove',
  });

  const completeGameWrite = useContractWrite({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'completeGame',
  });
  
  // İşlem durumunu takip etmek için - manuel bekleme kullanacağız
  const manualWaitForReceipt = async (hash: `0x${string}`) => {
    // Basit bir manuel bekleme fonksiyonu
    return new Promise<any>((resolve, reject) => {
      const checkReceipt = async () => {
        try {
          // Ethers.js kullanarak transaction receipt alma
          const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
          const receipt = await provider.getTransactionReceipt(hash);
          
          if (receipt) {
            resolve(receipt);
          } else {
            // Henüz işlenmemiş, tekrar dene
            setTimeout(checkReceipt, 2000); // 2 saniye sonra tekrar kontrol et
          }
        } catch (error) {
          console.error('Error checking receipt:', error);
          // Hata durumunda da devam et, belki geçici bir ağ sorunu
          setTimeout(checkReceipt, 2000);
        }
      };
      
      // İlk kontrolü başlat
      checkReceipt();
      
      // 60 saniye sonra timeout
      setTimeout(() => {
        reject(new Error('Transaction confirmation timeout'));
      }, 60000);
    });
  };

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
      
      // Yazma işlemi
      const result = await startGameWrite.writeContract();
      
      // Manuel işlem bekleme
      const receipt = await manualWaitForReceipt(result);
      
      return receipt;
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [currentWallet, address, isProcessing, startGameWrite]);

  // Hamle yapma
  const makeMove = useCallback(async () => {
    if (!currentWallet || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Yazma işlemi
      const result = await makeMoveWrite.writeContract();
      
      // Manuel işlem bekleme
      const receipt = await manualWaitForReceipt(result);
      
      return receipt;
    } catch (error) {
      console.error('Failed to make move:', error);
      throw error;
    }
  }, [currentWallet, address, makeMoveWrite]);

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
      
      // Yazma işlemi
      const result = await completeGameWrite.writeContract();
      
      // Manuel işlem bekleme
      const receipt = await manualWaitForReceipt(result);
      
      return receipt;
    } catch (error) {
      console.error('Failed to complete game:', error);
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
