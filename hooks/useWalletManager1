// hooks/useWalletManager.ts
// Warpcast ağ geçişi için güncellenmiş versiyon

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance, useWalletClient, useSendTransaction } from 'wagmi';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { ethers } from 'ethers';
import { parseEther, formatEther } from 'viem';
import { monadTestnet } from 'wagmi/chains';
import { MAX_WALLETS } from '@/lib/constants';
import { Wallet, Transaction } from '@/types';

export const useWalletManager = () => {
  // Warpcast/MetaMask bağlantı durumu
  const { address, chainId, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { sendTransaction } = useSendTransaction();
  
  // Cüzdan durumu
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  
  // Cüzdanları yerel depolamadan yükle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWallets = localStorage.getItem('slidingPuzzleWallets');
      const savedCurrentWallet = localStorage.getItem('slidingPuzzleCurrentWallet');
      const savedTransactions = localStorage.getItem('slidingPuzzleTransactions');
      
      if (savedWallets) {
        try {
          const parsedWallets = JSON.parse(savedWallets);
          setWallets(parsedWallets);
        } catch (error) {
          console.error('Cüzdanlar yüklenemedi:', error);
        }
      }
      
      if (savedCurrentWallet && savedWallets) {
        try {
          const parsedWallets = JSON.parse(savedWallets);
          const wallet = parsedWallets.find((w: Wallet) => w.address === savedCurrentWallet);
          if (wallet) {
            setCurrentWallet(wallet);
          }
        } catch (error) {
          console.error('Mevcut cüzdan yüklenemedi:', error);
        }
      }
      
      if (savedTransactions) {
        try {
          const parsedTransactions = JSON.parse(savedTransactions);
          setTransactions(parsedTransactions);
        } catch (error) {
          console.error('İşlemler yüklenemedi:', error);
        }
      }
    }
  }, []);
  
  // Cüzdanları yerel depolamaya kaydet
  useEffect(() => {
    if (typeof window !== 'undefined' && wallets.length > 0) {
      localStorage.setItem('slidingPuzzleWallets', JSON.stringify(wallets));
    }
  }, [wallets]);
  
  // Mevcut cüzdanı yerel depolamaya kaydet
  useEffect(() => {
    if (typeof window !== 'undefined' && currentWallet) {
      localStorage.setItem('slidingPuzzleCurrentWallet', currentWallet.address);
    }
  }, [currentWallet]);
  
  // İşlemleri yerel depolamaya kaydet
  useEffect(() => {
    if (typeof window !== 'undefined' && transactions.length > 0) {
      localStorage.setItem('slidingPuzzleTransactions', JSON.stringify(transactions));
    }
  }, [transactions]);
  
  // Bakiyeyi güncelle
  useEffect(() => {
    const updateBalance = async () => {
      if (!currentWallet) {
        setWalletBalance('0');
        return;
      }
      
      try {
        const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
        const balance = await provider.getBalance(currentWallet.address);
        setWalletBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error('Bakiye alınamadı:', error);
        setWalletBalance('0');
      }
    };
    
    updateBalance();
    
    // Her 10 saniyede bir bakiyeyi güncelle
    const interval = setInterval(updateBalance, 10000);
    return () => clearInterval(interval);
  }, [currentWallet]);
  
  // Ağ durumu değiştiğinde kontrol et ve gerekirse Monad'a geçiş yap
  useEffect(() => {
    if (isConnected && chainId !== monadTestnet.id) {
      console.log('Bağlı ama yanlış ağda, Monad Testnet\'e geçiş yapılıyor...');
      (async () => {
        try {
          await switchChain({ chainId: monadTestnet.id });
        } catch (error) {
          console.error('Otomatik ağ geçişi başarısız:', error);
        }
      })();
    }
  }, [isConnected, chainId, switchChain]);
  
  // Warpcast/MetaMask cüzdanını bağla ve otomatik olarak Monad Test ağına geçiş yap
  const connectMetaMask = useCallback(async () => {
    if (isConnected) {
      // Zaten bağlıysa, sadece ağı kontrol edip gerekirse değiştir
      if (chainId !== monadTestnet.id) {
        try {
          console.log('Switching to Monad Testnet...');
          await switchChain({ chainId: monadTestnet.id });
        } catch (error) {
          console.error('Monad Testnet ağına geçiş yapılamadı:', error);
        }
      }
      return true;
    }
    
    try {
      // Önce Warpcast'e bağlan
      console.log('Connecting to Warpcast...');
      await connect({ connector: farcasterFrame() });
      
      // Kısa bir bekleme süresi ekle (bağlantının tamamlanması için)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Monad Testnet'e geçiş yap
      if (chainId !== monadTestnet.id) {
        console.log('Switching to Monad Testnet after connection...');
        await switchChain({ chainId: monadTestnet.id });
      }
      
      return true;
    } catch (error) {
      console.error('Warpcast bağlantısı veya ağ değişimi sırasında hata:', error);
      return false;
    }
  }, [isConnected, connect, chainId, switchChain]);
  
  // Yeni cüzdan oluştur
  const createWallet = useCallback(() => {
    if (wallets.length >= MAX_WALLETS) {
      throw new Error(`Maksimum cüzdan sayısına (${MAX_WALLETS}) ulaşıldı`);
    }
    
    try {
      // Rastgele mnemonic oluştur
      const mnemonic = ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(16));
      
      // Mnemonic'ten cüzdan oluştur
      const wallet = ethers.Wallet.fromMnemonic(mnemonic);
      
      const newWallet = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic
      };
      
      // Cüzdanlar listesine ekle
      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      
      // İlk cüzdansa, mevcut olarak ayarla
      if (updatedWallets.length === 1) {
        setCurrentWallet(newWallet);
      }
      
      return newWallet;
    } catch (error) {
      console.error('Cüzdan oluşturulamadı:', error);
      throw error;
    }
  }, [wallets]);
  
  // Cüzdan seç
  const selectWallet = useCallback((address: string) => {
    const wallet = wallets.find(w => w.address === address);
    if (wallet) {
      setCurrentWallet(wallet);
    }
  }, [wallets]);
  
  // Cüzdan sil
  const deleteWallet = useCallback((address: string) => {
    const updatedWallets = wallets.filter(w => w.address !== address);
    setWallets(updatedWallets);
    
    // Silinen cüzdan mevcut cüzdansa, başka birini seç veya null yap
    if (currentWallet && currentWallet.address === address) {
      setCurrentWallet(updatedWallets.length > 0 ? updatedWallets[0] : null);
    }
  }, [wallets, currentWallet]);
  
  // Para yatır - En basit yaklaşım
  const depositFunds = useCallback(async (amount: string) => {
    if (!isConnected || !address || !currentWallet) {
      throw new Error('Cüzdan bağlı değil');
    }
    
    try {
      // Geçici bir işlem hash'i oluştur
      const tempHash = `0x${Math.random().toString(16).substring(2)}${Date.now().toString(16)}`;
      
      // İşlemi listeye ekle
      const newTransaction = {
        hash: tempHash,
        type: 'Deposit',
        status: 'pending',
        amount,
        timestamp: Date.now()
      };
      
      setTransactions(prev => [newTransaction, ...prev].slice(0, 20)); // Maks 20 işlem tut
      
      // Asenkron olarak işlemi gönder, sonucu beklemeden
      try {
        // sendTransaction'ı çağır, ancak Promise döndürmediği için try/catch içinde ele al
        sendTransaction({
          to: currentWallet.address as `0x${string}`,
          value: parseEther(amount),
        });
      } catch (sendError) {
        console.error('İşlem gönderimi sırasında hata:', sendError);
        // İşlem durumunu güncelle
        updateTransactionStatus(tempHash, 'failed');
        throw sendError;
      }
      
      return tempHash;
    } catch (error) {
      console.error('Yatırma işlemi başarısız:', error);
      throw error;
    }
  }, [isConnected, address, currentWallet, sendTransaction]);
  
  // Para çek - Asenkron işlemi arka planda yapacak şekilde güncellendi
  const withdrawFunds = useCallback(async (amount: string) => {
    if (!isConnected || !address || !currentWallet) {
      throw new Error('Cüzdan bağlı değil');
    }
    
    try {
      // Geçici bir işlem hash'i oluştur
      const tempHash = `0x${Math.random().toString(16).substring(2)}${Date.now().toString(16)}`;
      
      // İşlemi listeye ekle
      const newTransaction = {
        hash: tempHash,
        type: 'Withdraw',
        status: 'pending',
        amount,
        timestamp: Date.now()
      };
      
      setTransactions(prev => [newTransaction, ...prev].slice(0, 20)); // Maks 20 işlem tut
      
      // Arka planda işlemi gönder
      (async () => {
        try {
          // Oyun içi cüzdandan MetaMask'e para çekme mantığı
          const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
          const wallet = new ethers.Wallet(currentWallet.privateKey, provider);
          
          const tx = await wallet.sendTransaction({
            to: address,
            value: ethers.utils.parseEther(amount),
          });
          
          // Gerçek işlem hash'i ile güncelle
          updateTransaction(tempHash, {
            hash: tx.hash,
            status: 'pending'
          });
          
        } catch (error) {
          console.error('Çekme işlemi başarısız:', error);
          // İşlem durumunu güncelle
          updateTransactionStatus(tempHash, 'failed');
        }
      })();
      
      return tempHash;
    } catch (error) {
      console.error('Çekme işlemi başarısız:', error);
      throw error;
    }
  }, [isConnected, address, currentWallet]);

  // İşlem durumunu güncelle
  const updateTransactionStatus = useCallback((hash: string, status: string) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.hash === hash ? { ...tx, status } : tx
      )
    );
  }, []);
  
  // İşlemi güncelle
  const updateTransaction = useCallback((oldHash: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.hash === oldHash ? { ...tx, ...updates } : tx
      )
    );
  }, []);
  
  // Tüm işlemler için durumları kontrol et
  useEffect(() => {
    const checkTransactionStatuses = async () => {
      const pendingTransactions = transactions.filter(tx => tx.status === 'pending');
      
      if (pendingTransactions.length === 0) return;
      
      const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
      
      for (const tx of pendingTransactions) {
        try {
          // Geçici hash'ler için kontrolü atla
          if (tx.hash.includes('random')) continue;
          
          const receipt = await provider.getTransactionReceipt(tx.hash);
          
          if (receipt) {
            updateTransactionStatus(
              tx.hash, 
              receipt.status ? 'confirmed' : 'failed'
            );
          }
        } catch (error) {
          console.error(`İşlem durumu kontrol edilemedi ${tx.hash}:`, error);
        }
      }
    };
    
    checkTransactionStatuses();
    
    // Her 15 saniyede bir kontrol et
    const interval = setInterval(checkTransactionStatuses, 15000);
    return () => clearInterval(interval);
  }, [transactions, updateTransactionStatus]);

  // metamaskAddress tipini string | null olarak döndür
  const formattedMetamaskAddress = address ? address as string : null;

  return {
    // Cüzdan durumu
    wallets,
    currentWallet,
    walletBalance,
    transactions,
    
    // Cüzdan yönetimi
    createWallet,
    selectWallet,
    deleteWallet,
    
    // Para işlemleri
    depositFunds,
    withdrawFunds,
    
    // Bağlantı durumu
    isConnectedToMetaMask: isConnected,
    metamaskAddress: formattedMetamaskAddress, // Tip düzeltildi: `0x${string} | undefined` yerine string | null
    chainId,
    
    // Bağlantı işlemleri
    connectMetaMask,
    disconnectMetaMask: disconnect
  };
};
