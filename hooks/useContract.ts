// hooks/useContract.ts
// Mevcut kontrat işlevlerini kullanmak için yeniden düzenlendi

import { useState, useCallback } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contracts';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

export const useContract = () => {
  // Warpcast/Wagmi bağlantıları için useAccount hook'unu kullanmaya devam ediyoruz
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  // Kontrat örneği oluşturma helper fonksiyonu
  const getContract = useCallback(() => {
    // Provider oluştur
    const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
    
    // Salt-okunur kontrat örneği (cüzdan olmadan)
    const readOnlyContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    // Eğer ethereum ve signer varsa, yazma yetkili kontrat döndür
    if (window.ethereum) {
      try {
        const injectedProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = injectedProvider.getSigner();
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      } catch (error) {
        console.error('Signer erişilemedi:', error);
        return readOnlyContract; // Fallback olarak salt-okunur kontrat kullan
      }
    }
    
    return readOnlyContract;
  }, []);
  
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
    if (!address) {
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
  }, [address, isProcessing, getContract]);

  // Hamle yapma
  const makeMove = useCallback(async () => {
    if (!address) {
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
  }, [address, getContract]);

  // Oyun tamamlama
  const completeGame = useCallback(async () => {
    if (!address) {
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
  }, [address, isProcessing, getContract]);

  // Cüzdan işlemleri için fonksiyonlar
  
  // Cüzdan sayısını al
  const getWalletCount = useCallback(async () => {
    try {
      const contract = getContract();
      const count = await contract.getWalletCount();
      return count.toNumber();
    } catch (error) {
      console.error('Failed to get wallet count:', error);
      return 0;
    }
  }, [getContract]);
  
  // Tüm cüzdanları al
  const getAllWallets = useCallback(async () => {
    try {
      const contract = getContract();
      const walletData = await contract.getAllWallets();
      return walletData;
    } catch (error) {
      console.error('Failed to get all wallets:', error);
      return [[], [], []]; // Boş dizi üçlüsü döndür (privateKeys, mnemonics, activeStates)
    }
  }, [getContract]);
  
  // Belirli bir cüzdanı al
  const getWallet = useCallback(async (index: number) => {
    try {
      const contract = getContract();
      const walletData = await contract.getWallet(index);
      return walletData;
    } catch (error) {
      console.error(`Failed to get wallet at index ${index}:`, error);
      throw error;
    }
  }, [getContract]);
  
  // Yeni cüzdan oluştur
  const createWalletOnChain = useCallback(async (encryptedPrivateKey: string, encryptedMnemonic: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (isProcessing) {
      throw new Error('A transaction is already in progress');
    }

    try {
      setIsProcessing(true);
      
      // Kontrat al
      const contract = getContract();
      
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
  const removeWalletOnChain = useCallback(async (index: number) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (isProcessing) {
      throw new Error('A transaction is already in progress');
    }

    try {
      setIsProcessing(true);
      
      // Kontrat al
      const contract = getContract();
      
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
  const setActiveWalletOnChain = useCallback(async (index: number) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (isProcessing) {
      throw new Error('A transaction is already in progress');
    }

    try {
      setIsProcessing(true);
      
      // Kontrat al
      const contract = getContract();
      
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
