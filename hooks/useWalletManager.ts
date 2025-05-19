// hooks/useWalletManager.ts
// Mevcut SlidingPuzzleGame kontratını kullanarak cihazlar arası cüzdan erişimi

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useWalletClient, useSendTransaction } from 'wagmi';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { ethers } from 'ethers';
import { parseEther } from 'viem';
import { monadTestnet } from 'wagmi/chains';
import { MAX_WALLETS } from '@/lib/constants';
import { Wallet, Transaction } from '@/types';
import { useContract } from './useContract';

// Cüzdan şifreleme fonksiyonları (basit uygulama için - gerçek uygulamada daha güçlü şifreleme kullanın)
const encryptWalletData = (data: string, userAddress: string): string => {
  try {
    // Not: Bu basit bir uygulamadır, gerçek projede daha güvenli bir yöntem kullanın
    // Bu örnek, şifreleme kütüphanesi olmadan basit bir şifreleme yapıyor
    const key = userAddress.slice(2, 10); // Adresten 8 karakter anahtar
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return Buffer.from(result).toString('base64');
  } catch (error) {
    console.error('Şifreleme hatası:', error);
    return '';
  }
};

const decryptWalletData = (encryptedData: string, userAddress: string): string => {
  try {
    // Şifrelenmiş veriyi çöz
    const key = userAddress.slice(2, 10);
    const buffer = Buffer.from(encryptedData, 'base64').toString();
    let result = '';
    for (let i = 0; i < buffer.length; i++) {
      const charCode = buffer.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (error) {
    console.error('Şifre çözme hatası:', error);
    return '';
  }
};

export const useWalletManager = () => {
  // Warpcast/MetaMask bağlantı durumu
  const { address, chainId, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { sendTransaction } = useSendTransaction();
  
  // Kontrat fonksiyonları
  const { 
    getWalletCount, getAllWallets, getWallet, 
    createWalletOnChain, removeWalletOnChain, setActiveWalletOnChain 
  } = useContract();
  
  // Cüzdan durumu
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);
  
  // İşlem hash'lerini korumak için state
  const [pendingTransactionMap, setPendingTransactionMap] = useState<Record<string, { 
    realHash?: string, 
    type: string, 
    amount: string 
  }>>({});
  
  // Bakiye referansı
  const previousBalanceRef = useRef(walletBalance);
  
  // Blockchain'den cüzdanları yükle
  const loadWalletsFromBlockchain = useCallback(async () => {
    if (!isConnected || !address) return;
    
    setIsLoadingWallets(true);
    
    try {
      // Kontrat'tan cüzdan sayısını al
      const count = await getWalletCount();
      
      // Cüzdan yoksa, durumu temizle
      if (count === 0) {
        setWallets([]);
        setCurrentWallet(null);
        setIsLoadingWallets(false);
        return;
      }
      
      // Cüzdan verilerini al
      const walletData = await getAllWallets();
      const [encryptedPrivateKeys, encryptedMnemonics, activeStates] = walletData;
      
      const loadedWallets: Wallet[] = [];
      let activeWallet: Wallet | null = null;
      
      for (let i = 0; i < encryptedPrivateKeys.length; i++) {
        try {
          // Şifrelenmiş verileri çöz
          const privateKey = decryptWalletData(encryptedPrivateKeys[i], address);
          const mnemonic = decryptWalletData(encryptedMnemonics[i], address);
          
          // Özel anahtardan cüzdan adresi hesapla
          const wallet = new ethers.Wallet(privateKey);
          
          const walletData: Wallet = {
            address: wallet.address,
            privateKey,
            mnemonic
          };
          
          loadedWallets.push(walletData);
          
          // Aktif cüzdanı belirle
          if (activeStates[i]) {
            activeWallet = walletData;
          }
        } catch (error) {
          console.error(`Cüzdan ${i} yüklenemedi:`, error);
        }
      }
      
      setWallets(loadedWallets);
      
      // Aktif cüzdan belirle, aktif yoksa ilk cüzdanı seç
      if (activeWallet) {
        setCurrentWallet(activeWallet);
      } else if (loadedWallets.length > 0) {
        setCurrentWallet(loadedWallets[0]);
      } else {
        setCurrentWallet(null);
      }
      
    } catch (error) {
      console.error('Cüzdanlar blockchain\'den yüklenemedi:', error);
    } finally {
      setIsLoadingWallets(false);
    }
  }, [address, isConnected, getWalletCount, getAllWallets]);
  
  // İşlemleri yerel depolamadan yükle
  useEffect(() => {
    if (typeof window !== 'undefined' && address) {
      const storageKey = `slidingPuzzleTransactions_${address}`;
      const savedTransactions = localStorage.getItem(storageKey);
      const savedPendingMap = localStorage.getItem(`${storageKey}_pendingMap`);
      
      if (savedTransactions) {
        try {
          const parsedTransactions = JSON.parse(savedTransactions);
          setTransactions(parsedTransactions);
        } catch (error) {
          console.error('İşlemler yüklenemedi:', error);
        }
      }
      
      if (savedPendingMap) {
        try {
          const parsedPendingMap = JSON.parse(savedPendingMap);
          setPendingTransactionMap(parsedPendingMap);
        } catch (error) {
          console.error('Bekleyen işlem haritası yüklenemedi:', error);
        }
      }
    }
  }, [address]);
  
  // Kullanıcı bağlandığında cüzdanları yükle
  useEffect(() => {
    if (isConnected && address) {
      loadWalletsFromBlockchain();
    } else {
      // Bağlantı kesildiğinde cüzdanları temizle
      setWallets([]);
      setCurrentWallet(null);
    }
  }, [isConnected, address, loadWalletsFromBlockchain]);
  
  // İşlemleri yerel depolamaya kaydet
  useEffect(() => {
    if (typeof window !== 'undefined' && address && transactions.length > 0) {
      const storageKey = `slidingPuzzleTransactions_${address}`;
      localStorage.setItem(storageKey, JSON.stringify(transactions));
    }
  }, [transactions, address]);
  
  // Bekleyen işlem haritasını kaydet
  useEffect(() => {
    if (typeof window !== 'undefined' && address && Object.keys(pendingTransactionMap).length > 0) {
      const storageKey = `slidingPuzzleTransactions_${address}_pendingMap`;
      localStorage.setItem(storageKey, JSON.stringify(pendingTransactionMap));
    }
  }, [pendingTransactionMap, address]);
  
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
      
      // Cüzdanları yükle
      await loadWalletsFromBlockchain();
      
      return true;
    } catch (error) {
      console.error('Warpcast bağlantısı veya ağ değişimi sırasında hata:', error);
      return false;
    }
  }, [isConnected, connect, chainId, switchChain, loadWalletsFromBlockchain]);
  
  // Yeni cüzdan oluştur
  const createWallet = useCallback(async () => {
    if (!isConnected || !address) {
      throw new Error('Warpcast cüzdanı bağlı değil');
    }
    
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
      
      // Cüzdan verilerini şifrele
      const encryptedPrivateKey = encryptWalletData(newWallet.privateKey, address);
      const encryptedMnemonic = encryptWalletData(newWallet.mnemonic, address);
      
      // Kontrata şifrelenmiş cüzdan verilerini kaydet
      await createWalletOnChain(encryptedPrivateKey, encryptedMnemonic);
      
      // Cüzdanları yeniden yükle
      await loadWalletsFromBlockchain();
      
      return newWallet;
    } catch (error) {
      console.error('Cüzdan oluşturulamadı:', error);
      throw error;
    }
  }, [isConnected, address, wallets.length, createWalletOnChain, loadWalletsFromBlockchain]);
  
  // Cüzdan seç
  const selectWallet = useCallback(async (walletAddress: string) => {
    const walletIndex = wallets.findIndex(w => w.address === walletAddress);
    if (walletIndex === -1) {
      throw new Error('Cüzdan bulunamadı');
    }
    
    try {
      // Kontrata aktif cüzdan bilgisini kaydet
      await setActiveWalletOnChain(walletIndex);
      
      // Cüzdanları yeniden yükle
      await loadWalletsFromBlockchain();
      
    } catch (error) {
      console.error('Cüzdan seçilemedi:', error);
      throw error;
    }
  }, [wallets, setActiveWalletOnChain, loadWalletsFromBlockchain]);
  
  // Cüzdan sil
  const deleteWallet = useCallback(async (walletAddress: string) => {
    const walletIndex = wallets.findIndex(w => w.address === walletAddress);
    if (walletIndex === -1) {
      throw new Error('Cüzdan bulunamadı');
    }
    
    try {
      // Kontrata cüzdan silme isteği gönder
      await removeWalletOnChain(walletIndex);
      
      // Cüzdanları yeniden yükle
      await loadWalletsFromBlockchain();
      
    } catch (error) {
      console.error('Cüzdan silinemedi:', error);
      throw error;
    }
  }, [wallets, removeWalletOnChain, loadWalletsFromBlockchain]);
  
  // İşlemleri yönetme fonksiyonları
  const addTransaction = useCallback((tx: Transaction, pendingInfo?: { realHash?: string }) => {
    setTransactions(prev => [tx, ...prev].slice(0, 20)); // Maks 20 işlem tut
    
    if (pendingInfo) {
      setPendingTransactionMap(prev => ({
        ...prev,
        [tx.hash]: {
          realHash: pendingInfo.realHash,
          type: tx.type,
          amount: tx.amount || '0'
        }
      }));
    }
  }, []);
  
  const updateTransactionStatus = useCallback((hash: string, status: string) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.hash === hash ? { ...tx, status } : tx
      )
    );
  }, []);
  
  const updateTransactionHash = useCallback((tempHash: string, realHash: string) => {
    // İşlem haritasını güncelle
    setPendingTransactionMap(prev => {
      const updatedMap = { ...prev };
      if (updatedMap[tempHash]) {
        updatedMap[tempHash].realHash = realHash;
      }
      return updatedMap;
    });
    
    // İşlem listesini güncelle
    setTransactions(prev => 
      prev.map(tx => 
        tx.hash === tempHash ? { ...tx, hash: realHash } : tx
      )
    );
  }, []);
  
  // Para yatır
  const depositFunds = useCallback(async (amount: string) => {
    if (!isConnected || !address || !currentWallet) {
      throw new Error('Cüzdan bağlı değil');
    }
    
    try {
      // Geçici bir işlem hash'i oluştur
      const tempHash = `temp_${Date.now()}_${Math.random().toString(16).substring(2)}`;
      
      // İşlemi listeye ekle
      const newTransaction = {
        hash: tempHash,
        type: 'Deposit',
        status: 'pending',
        amount,
        timestamp: Date.now()
      };
      
      addTransaction(newTransaction);
      
      // Asenkron olarak işlemi gönder ve izle
      (async () => {
        try {
          // Provider ve signer oluştur
          if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            // İşlemi gönder
            const tx = await signer.sendTransaction({
              to: currentWallet.address,
              value: ethers.utils.parseEther(amount)
            });
            
            console.log('Deposit transaction sent:', tx.hash);
            
            // Gerçek hash ile güncelle
            updateTransactionHash(tempHash, tx.hash);
            
            // İşlem onayını bekle
            const receipt = await tx.wait();
            
            // İşlem durumunu güncelle
            updateTransactionStatus(tx.hash, receipt.status ? 'confirmed' : 'failed');
            
          } else {
            // Fallback - Wagmi sendTransaction kullan
            sendTransaction({
              to: currentWallet.address as `0x${string}`,
              value: parseEther(amount),
            });
          }
        } catch (sendError) {
          console.error('İşlem gönderimi sırasında hata:', sendError);
          // İşlem durumunu güncelle
          updateTransactionStatus(tempHash, 'failed');
        }
      })();
      
      return tempHash;
    } catch (error) {
      console.error('Yatırma işlemi başarısız:', error);
      throw error;
    }
  }, [isConnected, address, currentWallet, addTransaction, updateTransactionHash, updateTransactionStatus, sendTransaction]);
  
  // Para çek
  const withdrawFunds = useCallback(async (amount: string) => {
    if (!isConnected || !address || !currentWallet) {
      throw new Error('Cüzdan bağlı değil');
    }
    
    try {
      // Geçici bir işlem hash'i oluştur
      const tempHash = `temp_${Date.now()}_${Math.random().toString(16).substring(2)}`;
      
      // İşlemi listeye ekle
      const newTransaction = {
        hash: tempHash,
        type: 'Withdraw',
        status: 'pending',
        amount,
        timestamp: Date.now()
      };
      
      addTransaction(newTransaction);
      
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
          
          console.log('Withdraw transaction sent:', tx.hash);
          
          // Gerçek hash ile güncelle
          updateTransactionHash(tempHash, tx.hash);
          
          // İşlem onayını bekle
          const receipt = await tx.wait();
          
          // İşlem durumunu güncelle
          updateTransactionStatus(tx.hash, receipt.status ? 'confirmed' : 'failed');
          
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
  }, [isConnected, address, currentWallet, addTransaction, updateTransactionHash, updateTransactionStatus]);
  
  // Tüm işlemler için durumları kontrol et
  useEffect(() => {
    if (!transactions.length) return;
    
    const checkTransactionStatuses = async () => {
      const pendingTransactions = transactions.filter(tx => tx.status === 'pending');
      
      if (pendingTransactions.length === 0) return;
      
      const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
      
      for (const tx of pendingTransactions) {
        try {
          // Geçici hash'se, bekleyen haritada gerçek hash var mı kontrol et
          const pendingInfo = pendingTransactionMap[tx.hash];
          
          // Gerçek hash varsa, onunla kontrol et
          if (pendingInfo && pendingInfo.realHash) {
            const receipt = await provider.getTransactionReceipt(pendingInfo.realHash);
            
            if (receipt) {
              // Önce hash'i güncelle (eğer hala geçici hash kullanıyorsa)
              if (tx.hash !== pendingInfo.realHash) {
                updateTransactionHash(tx.hash, pendingInfo.realHash);
              }
              
              // Sonra durumu güncelle
              updateTransactionStatus(
                pendingInfo.realHash, 
                receipt.status ? 'confirmed' : 'failed'
              );
            }
          }
          // Geçici hash ise ve 5 dakikadan eskiyse, başarısız olarak işaretle
          else if (tx.hash.startsWith('temp_') && (Date.now() - tx.timestamp > 5 * 60 * 1000)) {
            updateTransactionStatus(tx.hash, 'failed');
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
  }, [transactions, pendingTransactionMap, updateTransactionStatus, updateTransactionHash]);
  
  // Bakiye değişimini izleyerek işlem durumlarını güncelle
  useEffect(() => {
    // Bakiye değiştiyse, bekleyen işlemleri kontrol et
    if (walletBalance !== previousBalanceRef.current && currentWallet) {
      const pendingDeposits = transactions.filter(tx => 
        tx.status === 'pending' && tx.type === 'Deposit'
      );
      
      const pendingWithdraws = transactions.filter(tx => 
        tx.status === 'pending' && tx.type === 'Withdraw'
      );
      
      // Bakiye artmışsa, bekleyen para yatırma işlemlerinden birini onayla
      if (parseFloat(walletBalance) > parseFloat(previousBalanceRef.current) && pendingDeposits.length > 0) {
        // En eski bekleyen para yatırma işlemini onayla
        const oldestPendingDeposit = pendingDeposits[pendingDeposits.length - 1];
        console.log(`Bakiye arttı, en eski bekleyen para yatırma işlemi onaylandı: ${oldestPendingDeposit.hash}`);
        updateTransactionStatus(oldestPendingDeposit.hash, 'confirmed');
      }
      
      // Bakiye azalmışsa, bekleyen para çekme işlemlerinden birini onayla
      if (parseFloat(walletBalance) < parseFloat(previousBalanceRef.current) && pendingWithdraws.length > 0) {
        // En eski bekleyen para çekme işlemini onayla
        const oldestPendingWithdraw = pendingWithdraws[pendingWithdraws.length - 1];
        console.log(`Bakiye azaldı, en eski bekleyen para çekme işlemi onaylandı: ${oldestPendingWithdraw.hash}`);
        updateTransactionStatus(oldestPendingWithdraw.hash, 'confirmed');
      }
    }
    
    // Mevcut bakiyeyi sakla
    previousBalanceRef.current = walletBalance;
  }, [walletBalance, transactions, currentWallet, updateTransactionStatus]);

  // metamaskAddress tipini string | null olarak döndür
  const formattedMetamaskAddress = address ? address as string : null;

  return {
    // Cüzdan durumu
    wallets,
    currentWallet,
    walletBalance,
    transactions,
    isLoadingWallets,
    
    // Cüzdan yönetimi
    createWallet,
    selectWallet,
    deleteWallet,
    
    // Para işlemleri
    depositFunds,
    withdrawFunds,
    
    // Bağlantı durumu
    isConnectedToMetaMask: isConnected,
    metamaskAddress: formattedMetamaskAddress,
    chainId,
    
    // Bağlantı işlemleri
    connectMetaMask,
    disconnectMetaMask: disconnect
  };
};
