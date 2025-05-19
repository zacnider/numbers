// hooks/useContract.ts düzeltilmiş versiyon - cüzdan fonksiyonları eklendi

import { useState, useCallback } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contracts';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

export const useContract = () => {
  // Warpcast/Wagmi bağlantıları için useAccount hook'unu kullanmaya devam ediyoruz
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  // İşlem bekleme fonksiyonu (geliştirilmiş versiyon)
  const waitForTransaction = async (txHash: string) => {
    const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
    
    return new Promise<any>((resolve, reject) => {
      const checkReceipt = async () => {
        try {
          const receipt = await provider.getTransactionReceipt(txHash);
          
          if (receipt) {
            console.log(`Transaction mined! Status: ${receipt.status ? 'success' : 'failed'}`);
            resolve(receipt);
          } else {
            // Henüz işlenmemiş, tekrar dene
            console.log(`Waiting for transaction ${txHash.substring(0, 10)}...`);
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

  // Cüzdan private key'i ile direkt işlem gönderen yardımcı fonksiyon (yeni)
  const sendContractTransaction = async (functionName: string, privateKey?: string) => {
    console.log(`Sending transaction: ${functionName}`);

    try {
      // JsonRPC provider oluştur
      const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
      
      // Kullanıcı cüzdanı, localStorage veya diğer yöntemlerle bulunabilir
      let userWallet = null;
      if (privateKey) {
        userWallet = new ethers.Wallet(privateKey, provider);
      } else {
        // LocalStorage'dan mevcut cüzdanı kontrol edebiliriz
        const currentWalletAddress = localStorage.getItem('slidingPuzzleCurrentWallet');
        const walletsStr = localStorage.getItem('slidingPuzzleWallets');
        
        if (currentWalletAddress && walletsStr) {
          try {
            const wallets = JSON.parse(walletsStr);
            const foundWallet = wallets.find((w: any) => w.address === currentWalletAddress);
            
            if (foundWallet && foundWallet.privateKey) {
              userWallet = new ethers.Wallet(foundWallet.privateKey, provider);
            }
          } catch (err) {
            console.error('Error parsing wallet from localStorage:', err);
          }
        }
      }
      
      if (!userWallet) {
        throw new Error('No wallet available for transaction');
      }
      
      console.log(`Using wallet: ${userWallet.address}`);
      
      // Contract ABI'den fonksiyon data'sını oluştur
      const contractInterface = new ethers.utils.Interface(CONTRACT_ABI);
      const encodedData = contractInterface.encodeFunctionData(functionName, []);
      
      // Gas tahmini ve güvenli bir limit
      const gasEstimate = 150000; // Sabit gas limit
      
      // Gas fiyatı
      const gasPrice = await provider.getGasPrice();
      const gasPriceIncreased = gasPrice.mul(120).div(100); // %20 fazla
      
      console.log(`Gas price: ${ethers.utils.formatUnits(gasPriceIncreased, 'gwei')} gwei`);
      
      // İşlemi gönder
      const tx = await userWallet.sendTransaction({
        to: CONTRACT_ADDRESS,
        data: encodedData,
        gasLimit: ethers.utils.hexlify(gasEstimate),
        gasPrice: gasPriceIncreased
      });
      
      console.log(`Transaction sent: ${tx.hash}`);
      
      // İşlemin tamamlanmasını bekle
      const receipt = await waitForTransaction(tx.hash);
      console.log(`Transaction confirmed: ${receipt.transactionHash}`);
      
      return receipt;
    } catch (error) {
      console.error(`Transaction failed (${functionName}):`, error);
      
      // Tip kontrolü ekle
      if (error instanceof Error) {
        // Eğer error bir Error nesnesi ise
        console.error('Error message:', error.message);
        
        // Error nesnesinin diğer özelliklerini kontrol et
        const anyError = error as any;
        if (anyError.code) {
          console.error('Error code:', anyError.code);
        }
        if (anyError.reason) {
          console.error('Error reason:', anyError.reason);
        }
        if (anyError.data) {
          console.error('Error data:', anyError.data);
        }
      }
      
      throw error;
    }
  };

  // Oyun başlatma
  const startGame = useCallback(async (privateKey?: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (isProcessing) {
      throw new Error('A transaction is already in progress');
    }

    try {
      setIsProcessing(true);
      return await sendContractTransaction('startGame', privateKey);
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [address, isProcessing]);

  // Hamle yapma
  const makeMove = useCallback(async (privateKey?: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('Making move on blockchain...');
      return await sendContractTransaction('makeMove', privateKey);
    } catch (error) {
      console.error('Failed to make move:', error);
      throw error;
    }
  }, [address]);

  // Oyun tamamlama
  const completeGame = useCallback(async (privateKey?: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (isProcessing) {
      throw new Error('A transaction is already in progress');
    }

    try {
      setIsProcessing(true);
      return await sendContractTransaction('completeGame', privateKey);
    } catch (error) {
      console.error('Failed to complete game:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [address, isProcessing]);

  // Salt okunur contract oluşturma fonksiyonu
  const getReadOnlyContract = useCallback(() => {
    // Provider oluştur
    const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
    
    // Salt okunur kontrat
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    return contract;
  }, []);

  // Cüzdan İşlemleri için yeni fonksiyonlar
  // Yeni cüzdan oluşturma
  const createWalletOnChain = useCallback(async (encryptedPrivateKey: string, encryptedMnemonic: string, walletPrivateKey?: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      return await sendContractTransaction('createWallet', walletPrivateKey || undefined);
    } catch (error) {
      console.error('Failed to create wallet on chain:', error);
      throw error;
    }
  }, [address]);

  // Cüzdan silme
  const removeWalletOnChain = useCallback(async (index: number, walletPrivateKey?: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      return await sendContractTransaction('removeWallet', walletPrivateKey || undefined);
    } catch (error) {
      console.error(`Failed to remove wallet at index ${index}:`, error);
      throw error;
    }
  }, [address]);

  // Aktif cüzdanı ayarlama
  const setActiveWalletOnChain = useCallback(async (index: number, walletPrivateKey?: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      return await sendContractTransaction('setActiveWallet', walletPrivateKey || undefined);
    } catch (error) {
      console.error(`Failed to set active wallet at index ${index}:`, error);
      throw error;
    }
  }, [address]);

  // Get wallet count
  const getWalletCount = useCallback(async (): Promise<number> => {
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
      const contractInterface = new ethers.utils.Interface(CONTRACT_ABI);
      const encodedData = contractInterface.encodeFunctionData("getWalletCount", []);
      
      // Burada kullanıcının address'ini from parametresi olarak belirtiliyoruz
      const result = await provider.call({
        to: CONTRACT_ADDRESS,
        data: encodedData,
        from: address as string // Bu kritik: msg.sender değerini belirtiyoruz
      });
      
      // Sonucu decode et
      const count = ethers.BigNumber.from(result).toNumber();
      return count;
    } catch (error) {
      console.error('Failed to get wallet count:', error);
      return 0;
    }
  }, [address]);
  
  // Get all wallets
  const getAllWallets = useCallback(async (): Promise<[string[], string[], boolean[]]> => {
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
      const contractInterface = new ethers.utils.Interface(CONTRACT_ABI);
      const encodedData = contractInterface.encodeFunctionData("getAllWallets", []);
      
      // Burada kullanıcının address'ini from parametresi olarak belirtiliyoruz
      const result = await provider.call({
        to: CONTRACT_ADDRESS,
        data: encodedData,
        from: address as string // Bu kritik: msg.sender değerini belirtiyoruz
      });
      
      // Sonucu decode et
      const decoded = contractInterface.decodeFunctionResult("getAllWallets", result);
      return [decoded[0] || [], decoded[1] || [], decoded[2] || []];
    } catch (error) {
      console.error('Failed to get all wallets:', error);
      return [[], [], []]; // Boş dizi üçlüsü döndür
    }
  }, [address]);

  return {
    startGame,
    makeMove,
    completeGame,
    isProcessing,
    
    // Cüzdan işlemleri
    getWalletCount,
    getAllWallets,
    getReadOnlyContract,
    createWalletOnChain,
    removeWalletOnChain,
    setActiveWalletOnChain,
    sendContractTransaction
  };
};
