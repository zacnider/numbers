// hooks/useContract.ts
// Hibrit yaklaşım: Wagmi için temel cüzdan etkileşimleri + saf ethers.js için kontrat çağrıları

import { useState, useCallback } from 'react';
import { useWalletManager } from './useWalletManager';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contracts';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

export const useContract = () => {
  // Warpcast/Wagmi bağlantıları için useAccount hook'unu kullanmaya devam ediyoruz
  const { address } = useAccount();
  const { currentWallet } = useWalletManager();
  const [isProcessing, setIsProcessing] = useState(false);

  // Kontrat örneği oluşturma helper fonksiyonu
  const getContract = useCallback(() => {
    if (!currentWallet) {
      throw new Error('Wallet not connected');
    }
    
    // Provider oluştur
    const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
    
    // Signer oluştur
    const wallet = new ethers.Wallet(currentWallet.privateKey, provider);
    
    // Kontrat örneği oluştur
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    return contract;
  }, [currentWallet]);
  
  // İşlem bekleme fonksiyonu
  const waitForTransaction = async (txHash: string) => {
    const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
    
    return new Promise<any>((resolve, reject) => {
      const checkReceipt = async () => {
        try {
          const receipt = await provider.getTransactionReceipt(txHash);
          
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
      
      // Kontrat al
      const contract = getContract();
      
      // startGame fonksiyonunu çağır
      const tx = await contract.startGame();
      
      // İşlemin tamamlanmasını bekle
      const receipt = await waitForTransaction(tx.hash);
      
      return receipt;
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [currentWallet, address, isProcessing, getContract]);

  // Hamle yapma
  const makeMove = useCallback(async () => {
    if (!currentWallet || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Kontrat al
      const contract = getContract();
      
      // makeMove fonksiyonunu çağır
      const tx = await contract.makeMove();
      
      // İşlemin tamamlanmasını bekle
      const receipt = await waitForTransaction(tx.hash);
      
      return receipt;
    } catch (error) {
      console.error('Failed to make move:', error);
      throw error;
    }
  }, [currentWallet, address, getContract]);

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
      
      // Kontrat al
      const contract = getContract();
      
      // completeGame fonksiyonunu çağır
      const tx = await contract.completeGame();
      
      // İşlemin tamamlanmasını bekle
      const receipt = await waitForTransaction(tx.hash);
      
      return receipt;
    } catch (error) {
      console.error('Failed to complete game:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [currentWallet, address, isProcessing, getContract]);

  return {
    startGame,
    makeMove,
    completeGame,
    isProcessing
  };
};
