// hooks/useWalletManager.ts
// Blockchain entegrasyonu için güncellendi (Parça 1)

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useWalletClient, useSendTransaction } from 'wagmi';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { ethers } from 'ethers';
import { parseEther, formatEther } from 'viem';
import { monadTestnet } from 'wagmi/chains';
import { MAX_WALLETS } from '@/lib/constants';
import { useContract } from './useContract';

// Wallet ve Transaction için interface tanımlamaları
interface Wallet {
  address: string;
  privateKey: string;
  mnemonic: string;
}

interface Transaction {
  hash: string;
  type: 'Deposit' | 'Withdraw';
  status: 'pending' | 'confirmed' | 'failed';
  amount: string;
  timestamp: number;
}

// Basit şifreleme fonksiyonları
const encryptWalletData = (data: string, userAddress: string): string => {
  try {
    // Basit şifreleme algoritması
    const key = userAddress.slice(2, 10);
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return Buffer.from(result).toString('base64');
  } catch (error) {
    console.error('Şifreleme hatası:', error);
    return '';
  }
};

const decryptWalletData = (encryptedData: string, userAddress: string): string => {
  try {
    // Basit şifre çözme algoritması
    const key = userAddress.slice(2, 10);
    const data = Buffer.from(encryptedData, 'base64').toString();
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (error) {
    console.error('Şifre çözme hatası:', error);
    return '';
  }
};

// Hook'un dönüş tipini tanımlama
interface WalletManagerReturn {
  // Cüzdan durumu
  wallets: Wallet[];
  currentWallet: Wallet | null;
  walletBalance: string;
  transactions: Transaction[];
  isLoadingWallets: boolean;

  // Cüzdan yönetimi
  createWallet: () => Promise<Wallet>;
  selectWallet: (walletAddress: string) => Promise<void>;
  deleteWallet: (walletAddress: string) => Promise<void>;

  // Para işlemleri
  depositFunds: (amount: string) => Promise<string>;
  withdrawFunds: (amount: string) => Promise<string>;

  // Bağlantı durumu
  isConnectedToMetaMask: boolean;
  metamaskAddress: string | null;
  chainId: number | undefined;

  // Bağlantı işlemleri
  connectMetaMask: () => Promise<boolean>;
  disconnectMetaMask: () => void;

  // Oyun işlevleri
  startGame: () => Promise<boolean>;
  makeMove: () => Promise<boolean>;
  completeGame: () => Promise<boolean>;
}

export const useWalletManager = (): WalletManagerReturn => {
  // Warpcast/MetaMask bağlantı durumu
  const { address, chainId, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { sendTransaction } = useSendTransaction();
  
  // Kontrat fonksiyonları
  const { 
    startGame: startGameContract, 
    makeMove: makeMoveContract, 
    completeGame: completeGameContract,
    getWalletCount, 
    getAllWallets, 
    getWallet, 
    createWalletOnChain, 
    removeWalletOnChain, 
    setActiveWalletOnChain 
  } = useContract();
  
  // Cüzdan durumu
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [isLoadingWallets, setIsLoadingWallets] = useState<boolean>(false);
  
  // Blockchain'den cüzdanları yükle
  const loadWalletsFromBlockchain = useCallback(async (): Promise<void> => {
    if (!isConnected || !address) return;
    
    setIsLoadingWallets(true);
    
    try {
      // Kontrat'tan cüzdan sayısını al
      const count = await getWalletCount();
      console.log(`Blockchain'de ${count} cüzdan bulundu`);
      
      // Hiç cüzdan yoksa ve yerel cüzdanlar varsa, yerel cüzdanları blockchain'e kaydet
      if (count === 0 && wallets.length > 0) {
        console.log('Yerel cüzdanları blockchain\'e kaydediyorum...');
        
        // İlk cüzdandan işlem yapabilmek için
        const firstWallet = wallets[0];
        
        for (const wallet of wallets) {
          const encryptedPrivateKey = encryptWalletData(wallet.privateKey, address);
          const encryptedMnemonic = encryptWalletData(wallet.mnemonic, address);
          
          await createWalletOnChain(encryptedPrivateKey, encryptedMnemonic, firstWallet.privateKey);
        }
        
        // İlk cüzdanı aktif olarak ayarla
        if (wallets.length > 0) {
          await setActiveWalletOnChain(0, wallets[0].privateKey);
        }
        
        setIsLoadingWallets(false);
        return;
      }
      
      // Cüzdan yoksa ve yerel de yoksa, durumu temizle
      if (count === 0) {
        setWallets([]);
        setCurrentWallet(null);
        setIsLoadingWallets(false);
        return;
      }
      
      // Blockchain'den cüzdan verilerini al
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
      
      // Cüzdanları güncelle
      setWallets(loadedWallets);
      
      // Aktif cüzdan belirle
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
  }, [address, isConnected, getWalletCount, getAllWallets, createWalletOnChain, setActiveWalletOnChain, wallets]);

  // Cüzdanları yerel depolamadan yükle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWallets = localStorage.getItem('slidingPuzzleWallets');
      const savedCurrentWallet = localStorage.getItem('slidingPuzzleCurrentWallet');
      const savedTransactions = localStorage.getItem('slidingPuzzleTransactions');
      
      if (savedWallets) {
        try {
          const parsedWallets = JSON.parse(savedWallets) as Wallet[];
          setWallets(parsedWallets);
        } catch (error) {
          console.error('Cüzdanlar yüklenemedi:', error);
        }
      }
      
      if (savedCurrentWallet && savedWallets) {
        try {
          const parsedWallets = JSON.parse(savedWallets) as Wallet[];
          const wallet = parsedWallets.find((w) => w.address === savedCurrentWallet);
          if (wallet) {
            setCurrentWallet(wallet);
          }
        } catch (error) {
          console.error('Mevcut cüzdan yüklenemedi:', error);
        }
      }
      
      if (savedTransactions) {
        try {
          const parsedTransactions = JSON.parse(savedTransactions) as Transaction[];
          setTransactions(parsedTransactions);
        } catch (error) {
          console.error('İşlemler yüklenemedi:', error);
        }
      }
    }
  }, []);
  
  // Kullanıcı bağlandığında cüzdanları blockchain'den yükle
  useEffect(() => {
    if (isConnected && address) {
      loadWalletsFromBlockchain();
    }
  }, [isConnected, address, loadWalletsFromBlockchain]);
  
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
    const updateBalance = async (): Promise<void> => {
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
  const connectMetaMask = useCallback(async (): Promise<boolean> => {
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
  
  // Yeni cüzdan oluştur - hem yerel hem blockchain'e kaydet
  const createWallet = useCallback(async (): Promise<Wallet> => {
    if (wallets.length >= MAX_WALLETS) {
      throw new Error(`Maksimum cüzdan sayısına (${MAX_WALLETS}) ulaşıldı`);
    }
    
    try {
      // Rastgele mnemonic oluştur
      const mnemonic = ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(16));
      
      // Mnemonic'ten cüzdan oluştur
      const wallet = ethers.Wallet.fromMnemonic(mnemonic);
      
      const newWallet: Wallet = {
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
      
      // Blockchain'e kaydet (arka planda)
      if (isConnected && address) {
        (async () => {
          try {
            // Şifrele
            const encryptedPrivateKey = encryptWalletData(newWallet.privateKey, address);
            const encryptedMnemonic = encryptWalletData(newWallet.mnemonic, address);
            
            // İlk cüzdan yoksa, kendisinden işlem yapamayız
            // Varsa mevcut cüzdanla işlem yap
            const signerWallet = updatedWallets.length > 1 ? updatedWallets[0] : newWallet;
            
            // Blockchain'e kaydet
            await createWalletOnChain(encryptedPrivateKey, encryptedMnemonic, signerWallet.privateKey);
            
            // İlk cüzdansa, aktif yap
            if (updatedWallets.length === 1) {
              await setActiveWalletOnChain(0, newWallet.privateKey);
            }
            
            console.log('Cüzdan blockchain\'e kaydedildi.');
          } catch (error) {
            console.error('Cüzdan blockchain\'e kaydedilemedi (ama yerel depolamada):', error);
          }
        })();
      }
      
      return newWallet;
    } catch (error) {
      console.error('Cüzdan oluşturulamadı:', error);
      throw error;
    }
  }, [wallets, isConnected, address, createWalletOnChain, setActiveWalletOnChain]);
  
  // Cüzdan seç - yerel ve blockchain
  const selectWallet = useCallback(async (walletAddress: string): Promise<void> => {
    const walletIndex = wallets.findIndex(w => w.address === walletAddress);
    if (walletIndex === -1) {
      throw new Error('Cüzdan bulunamadı');
    }
    
    // Yerel state'i güncelle
    const wallet = wallets[walletIndex];
    setCurrentWallet(wallet);
    
    // Blockchain'de de güncelle (arka planda)
    if (isConnected && address) {
      (async () => {
        try {
          await setActiveWalletOnChain(walletIndex, wallet.privateKey);
          console.log('Aktif cüzdan blockchain\'de güncellendi.');
        } catch (error) {
          console.error('Aktif cüzdan blockchain\'de güncellenemedi:', error);
        }
      })();
    }
  }, [wallets, isConnected, address, setActiveWalletOnChain]);
  
  // Cüzdan sil - yerel ve blockchain
  const deleteWallet = useCallback(async (walletAddress: string): Promise<void> => {
    const walletIndex = wallets.findIndex(w => w.address === walletAddress);
    if (walletIndex === -1) {
      throw new Error('Cüzdan bulunamadı');
    }
    
    // Yerel değişiklikleri yap
    const deletedWallet = wallets[walletIndex];
    const updatedWallets = wallets.filter(w => w.address !== walletAddress);
    
    setWallets(updatedWallets);
    
    // Silinen cüzdan mevcut cüzdansa, başka birini seç veya null yap
    if (currentWallet && currentWallet.address === walletAddress) {
      setCurrentWallet(updatedWallets.length > 0 ? updatedWallets[0] : null);
    }
    
    // Blockchain'den de sil (arka planda)
    if (isConnected && address && updatedWallets.length > 0) {
      (async () => {
        try {
          // Kalan cüzdanlardan birini kullan
          const signerWallet = updatedWallets[0];
          
          await removeWalletOnChain(walletIndex, signerWallet.privateKey);
          console.log('Cüzdan blockchain\'den silindi.');
          
          // Eğer silinen cüzdan aktifse, yeni aktif cüzdan ata
          if (currentWallet && currentWallet.address === walletAddress) {
            await setActiveWalletOnChain(0, signerWallet.privateKey);
          }
        } catch (error) {
          console.error('Cüzdan blockchain\'den silinemedi:', error);
        }
      })();
    }
  }, [wallets, currentWallet, isConnected, address, removeWalletOnChain, setActiveWalletOnChain]);
  
  // İşlem durumunu güncelle
  const updateTransactionStatus = useCallback((hash: string, status: 'pending' | 'confirmed' | 'failed'): void => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.hash === hash ? { ...tx, status } : tx
      )
    );
  }, []);
  
  // İşlemi güncelle
  const updateTransaction = useCallback((oldHash: string, updates: Partial<Transaction>): void => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.hash === oldHash ? { ...tx, ...updates } : tx
      )
    );
  }, []);
  
  // Para yatır
  const depositFunds = useCallback(async (amount: string): Promise<string> => {
    if (!isConnected || !address || !currentWallet) {
      throw new Error('Cüzdan bağlı değil');
    }
    
    try {
      // Geçici bir işlem hash'i oluştur
      const tempHash = `0x${Math.random().toString(16).substring(2)}${Date.now().toString(16)}`;
      
      // İşlemi listeye ekle
      const newTransaction: Transaction = {
        hash: tempHash,
        type: 'Deposit',
        status: 'pending',
        amount,
        timestamp: Date.now()
      };
      
      setTransactions(prev => [newTransaction, ...prev].slice(0, 20)); // Maks 20 işlem tut
      
      // Asenkron olarak işlemi gönder, sonucu beklemeden
      try {
        // sendTransaction'ı çağır
        sendTransaction({
          to: currentWallet.address,
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
  }, [isConnected, address, currentWallet, sendTransaction, updateTransactionStatus]);
  
  // Para çek
  const withdrawFunds = useCallback(async (amount: string): Promise<string> => {
    if (!isConnected || !address || !currentWallet) {
      throw new Error('Cüzdan bağlı değil');
    }
    
    try {
      // Geçici bir işlem hash'i oluştur
      const tempHash = `0x${Math.random().toString(16).substring(2)}${Date.now().toString(16)}`;
      
      // İşlemi listeye ekle
      const newTransaction: Transaction = {
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
  }, [isConnected, address, currentWallet, updateTransaction, updateTransactionStatus]);

  // Tüm işlemler için durumları kontrol et
  useEffect(() => {
    const checkTransactionStatuses = async (): Promise<void> => {
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

  // Oyun işlevleri - Blockchain çağrılarını arka planda yap
  const startGame = useCallback(async (): Promise<boolean> => {
    if (!currentWallet || parseFloat(walletBalance) === 0) {
      alert("You need a wallet with MON tokens to play the game");
      return false;
    }
    
    try {
      // Blockchain'de oyunu arka planda başlat
      (async () => {
        try {
          await startGameContract(currentWallet.privateKey);
          console.log('Oyun blockchain\'de başlatıldı');
        } catch (error) {
          console.error('Oyun blockchain\'de başlatılamadı:', error);
        }
      })();
      
      // Başarılı dönüş, UI oyun durumunu hemen güncelleyebilir
      return true;
    } catch (error) {
      console.error('Oyun başlatılamadı:', error);
      throw error;
    }
  }, [currentWallet, walletBalance, startGameContract]);
  
  const makeGameMove = useCallback(async (): Promise<boolean> => {
    if (!currentWallet) {
      throw new Error('Cüzdan bağlı değil');
    }
    
    try {
      // Blockchain'de hamleyi arka planda yap
      (async () => {
        try {
          await makeMoveContract(currentWallet.privateKey);
          console.log('Hamle blockchain\'de kaydedildi');
        } catch (error) {
          console.error('Hamle blockchain\'de kaydedilemedi:', error);
        }
      })();
      
      // Başarılı dönüş, UI oyun durumunu hemen güncelleyebilir
      return true;
    } catch (error) {
      console.error('Hamle yapılamadı:', error);
      throw error;
    }
  }, [currentWallet, makeMoveContract]);
  
  const completeGame = useCallback(async (): Promise<boolean> => {
    if (!currentWallet) {
      throw new Error('Cüzdan bağlı değil');
    }
    
    try {
      // Blockchain'de oyun tamamlama işlemini arka planda yap
      (async () => {
        try {
          await completeGameContract(currentWallet.privateKey);
          console.log('Oyun tamamlama blockchain\'de kaydedildi');
        } catch (error) {
          console.error('Oyun tamamlama blockchain\'de kaydedilemedi:', error);
        }
      })();
      
      // Başarılı dönüş, UI oyun durumunu hemen güncelleyebilir
      return true;
    } catch (error) {
      console.error('Oyun tamamlanamadı:', error);
      throw error;
    }
  }, [currentWallet, completeGameContract]);

  // metamaskAddress tipini string | null olarak döndür
  const formattedMetamaskAddress = address ? address : null;

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
    disconnectMetaMask: disconnect,
    
    // Oyun işlevleri
    startGame,
    makeMove: makeGameMove,
    completeGame
  };
};
