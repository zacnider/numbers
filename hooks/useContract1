// hooks/useContract.ts
// Cüzdan yönetimi fonksiyonları eklendi (TypeScript versiyonu)

import { useState, useCallback } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contracts';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

export const useContract = () => {
  // Warpcast/Wagmi bağlantıları için useAccount hook'unu kullanmaya devam ediyoruz
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  // currentWallet'i kaldırıldı, döngüsel bağımlılık olmasın

  // Salt okunur contract oluşturma fonksiyonu
  const getReadOnlyContract = useCallback(() => {
    // Provider oluştur
    const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
    
    // Salt okunur kontrat
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    return contract;
  }, []);

  // Kontrat örneği oluşturma helper fonksiyonu (privateKey ile)
  const getContract = useCallback((privateKey?: string) => {
    if (!privateKey) {
      // Salt okunur contrat döndür
      return getReadOnlyContract();
    }
    
    // Provider oluştur
    const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
    
    // Signer oluştur
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Kontrat örneği oluştur
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    return contract;
  }, [getReadOnlyContract]);
  
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
  const startGame = useCallback(async (privateKey?: string) => {
    if (!privateKey || !address) {
      throw new Error('Wallet not connected');
    }

    if (isProcessing) {
      throw new Error('A transaction is already in progress');
    }

    try {
      setIsProcessing(true);
      
      // Kontrat al
      const contract = getContract(privateKey);
      
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
  }, [address, isProcessing, getContract]);

  // Hamle yapma
  const makeMove = useCallback(async (privateKey?: string) => {
    if (!privateKey || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Kontrat al
      const contract = getContract(privateKey);
      
      // makeMove fonksiyonunu çağır
      const tx = await contract.makeMove();
      
      // İşlemin tamamlanmasını bekle
      const receipt = await waitForTransaction(tx.hash);
      
      return receipt;
    } catch (error) {
      console.error('Failed to make move:', error);
      throw error;
    }
  }, [address, getContract]);

  // Oyun tamamlama
  const completeGame = useCallback(async (privateKey?: string) => {
    if (!privateKey || !address) {
      throw new Error('Wallet not connected');
    }

    if (isProcessing) {
      throw new Error('A transaction is already in progress');
    }

    try {
      setIsProcessing(true);
      
      // Kontrat al
      const contract = getContract(privateKey);
      
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
  }, [address, isProcessing, getContract]);

  // Cüzdan İşlemleri

  // Cüzdan sayısını al
  const getWalletCount = useCallback(async (): Promise<number> => {
    try {
      const contract = getReadOnlyContract();
      const count = await contract.getWalletCount();
      return count.toNumber();
    } catch (error) {
      console.error('Failed to get wallet count:', error);
      return 0;
    }
  }, [getReadOnlyContract]);
  
  // Tüm cüzdanları al
  const getAllWallets = useCallback(async (): Promise<[string[], string[], boolean[]]> => {
    try {
      const contract = getReadOnlyContract();
      const walletData = await contract.getAllWallets();
      return walletData;
    } catch (error) {
      console.error('Failed to get all wallets:', error);
      return [[], [], []]; // Boş dizi üçlüsü döndür (privateKeys, mnemonics, activeStates)
    }
  }, [getReadOnlyContract]);
  
  // Belirli bir cüzdanı al
  const getWallet = useCallback(async (index: number): Promise<[string, string, boolean]> => {
    try {
      const contract = getReadOnlyContract();
      const walletData = await contract.getWallet(index);
      return walletData;
    } catch (error) {
      console.error(`Failed to get wallet at index ${index}:`, error);
      throw error;
    }
  }, [getReadOnlyContract]);
  
  // Yeni cüzdan oluştur
  const createWalletOnChain = useCallback(async (encryptedPrivateKey: string, encryptedMnemonic: string, walletPrivateKey?: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (isProcessing) {
      throw new Error('A transaction is already in progress');
    }

    try {
      setIsProcessing(true);
      
      // Kontrat al
      const contract = getContract(walletPrivateKey);
      
      // createWallet fonksiyonunu çağır
      const tx = await contract.createWallet(encryptedPrivateKey, encryptedMnemonic);
      
      // İşlemin tamamlanmasını bekle
      const receipt = await waitForTransaction(tx.hash);
      
      return receipt;
    } catch (error) {
      console.error('Failed to create wallet on chain:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [address, isProcessing, getContract]);
  
  // Cüzdan sil
  const removeWalletOnChain = useCallback(async (index: number, walletPrivateKey?: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (isProcessing) {
      throw new Error('A transaction is already in progress');
    }

    try {
      setIsProcessing(true);
      
      // Kontrat al
      const contract = getContract(walletPrivateKey);
      
      // removeWallet fonksiyonunu çağır
      const tx = await contract.removeWallet(index);
      
      // İşlemin tamamlanmasını bekle
      const receipt = await waitForTransaction(tx.hash);
      
      return receipt;
    } catch (error) {
      console.error(`Failed to remove wallet at index ${index}:`, error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [address, isProcessing, getContract]);
  
  // Aktif cüzdanı ayarla
  const setActiveWalletOnChain = useCallback(async (index: number, walletPrivateKey?: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (isProcessing) {
      throw new Error('A transaction is already in progress');
    }

    try {
      setIsProcessing(true);
      
      // Kontrat al
      const contract = getContract(walletPrivateKey);
      
      // setActiveWallet fonksiyonunu çağır
      const tx = await contract.setActiveWallet(index);
      
      // İşlemin tamamlanmasını bekle
      const receipt = await waitForTransaction(tx.hash);
      
      return receipt;
    } catch (error) {
      console.error(`Failed to set active wallet at index ${index}:`, error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [address, isProcessing, getContract]);

  return {
    startGame,
    makeMove,
    completeGame,
    isProcessing,
    
    // Cüzdan işlemleri
    getWalletCount,
    getAllWallets,
    getWallet,
    createWalletOnChain,
    removeWalletOnChain,
    setActiveWalletOnChain
  };
};
