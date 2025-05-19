// components/pages/app.tsx
// loadWalletsFromBlockchain circular dependency düzeltildi

"use client";

import { SafeAreaContainer } from "@/components/safe-area-container";
import { useMiniAppContext } from "@/hooks/use-miniapp-context";
import { useState, useEffect, useCallback } from "react";
import { Board } from "@/components/game/Board";
import { GameControls } from "@/components/game/GameControls";
import { WalletManager } from "@/components/wallet/WalletManager";
import { WalletActions } from "@/components/wallet/WalletActions";
import { TransactionList } from "@/components/wallet/TransactionList";
import { GameCompleteModal } from "@/components/modals/GameCompleteModal";
import { GameOverModal } from "@/components/modals/GameOverModal";
import { CreateWalletModal } from "@/components/modals/CreateWalletModal";
import { WalletDetailsModal } from "@/components/modals/WalletDetailsModal";
import { DepositModal } from "@/components/modals/DepositModal";
import { WithdrawModal } from "@/components/modals/WithdrawModal";
import { useGameState } from "@/hooks/useGameState";
import { useWalletManager } from "@/hooks/useWalletManager";

export default function App() {
  const { context } = useMiniAppContext();
  
  const {
    wallets,
    currentWallet,
    walletBalance,
    transactions,
    createWallet,
    selectWallet,
    deleteWallet,
    depositFunds,
    withdrawFunds,
    connectMetaMask,
    isConnectedToMetaMask,
    metamaskAddress,
    // Blockchain entegrasyonu için eklenen yeni fonksiyonlar
    saveWalletsToBlockchain,
    loadWalletsFromBlockchain,
    isLoadingWallets,
    isSavingWallets,
    lastSyncTime
  } = useWalletManager();

  // useGameState hook'unu currentWallet ve walletBalance ile çağır
  const { 
    board, 
    emptyTile, 
    moves, 
    timeRemaining, 
    isGameActive, 
    isSolved, 
    isGameOver,
    startGame,
    handleTileClick,
    resetGame,
    showHint
  } = useGameState(4, currentWallet, walletBalance);

  // Modal durumları
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
  const [showWalletDetailsModal, setShowWalletDetailsModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showMessage, setShowMessage] = useState<{type: string, text: string} | null>(null);
  
  // Zamanı biçimlendir (MM:SS)
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Blockchain işlemleri için mesaj gösterme işlevi
  const showStatusMessage = (type: 'success' | 'error', text: string) => {
    setShowMessage({ type, text });
    
    // 3 saniye sonra mesajı gizle
    setTimeout(() => {
      setShowMessage(null);
    }, 3000);
  };

  // Otomatik cüzdan yüklemeyi burada yapmıyoruz
  // Bu işlem artık useWalletManager içinde gerçekleşiyor
  // Bu, circular dependency sorununu çözer

  // Cüzdan oluştur işleyicisi
  const handleCreateWallet = () => {
    try {
      const newWallet = createWallet();
      setShowCreateWalletModal(false);
      return newWallet;
    } catch (error) {
      console.error('Cüzdan oluşturulamadı:', error);
      alert('Cüzdan oluşturulamadı. Lütfen tekrar deneyin.');
      return null;
    }
  };

  // Cüzdanları blockchain'e kaydet
  const handleSaveWallets = async () => {
    try {
      await saveWalletsToBlockchain();
      showStatusMessage('success', 'Cüzdanlar blockchain\'e kaydedildi');
    } catch (error: any) {
      console.error('Cüzdanlar kaydedilemedi:', error);
      showStatusMessage('error', `Cüzdanlar kaydedilemedi: ${error.message}`);
    }
  };

  // Cüzdanları blockchain'den yükle
  const handleLoadWallets = async () => {
    try {
      const result = await loadWalletsFromBlockchain();
      if (result) {
        showStatusMessage('success', 'Cüzdanlar blockchain\'den yüklendi');
      } else {
        showStatusMessage('error', 'Blockchain\'de cüzdan bulunamadı');
      }
    } catch (error: any) {
      console.error('Cüzdanlar yüklenemedi:', error);
      showStatusMessage('error', `Cüzdanlar yüklenemedi: ${error.message}`);
    }
  };

  // Para yatırma işleyicisi
  const handleDeposit = async (amount: string) => {
    try {
      await depositFunds(amount);
      setShowDepositModal(false);
    } catch (error) {
      console.error('Para yatırılamadı:', error);
      alert('Para yatırılamadı. Lütfen tekrar deneyin.');
    }
  };

  // Para çekme işleyicisi
  const handleWithdraw = async (amount: string) => {
    try {
      await withdrawFunds(amount);
      setShowWithdrawModal(false);
    } catch (error) {
      console.error('Para çekilemedi:', error);
      alert('Para çekilemedi. Lütfen tekrar deneyin.');
    }
  };

  return (
    <SafeAreaContainer insets={context?.client?.safeAreaInsets}>
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">Number Sliding Puzzle</h1>
        <p className="text-center text-gray-500 mb-6">Powered by Monad Blockchain</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sol sütun: Cüzdan */}
          <div className="md:col-span-1 space-y-4">
            <WalletManager 
              wallets={wallets} 
              currentWallet={currentWallet}
              onCreateWallet={() => setShowCreateWalletModal(true)}
              onSelectWallet={selectWallet}
              onDeleteWallet={deleteWallet}
              onViewDetails={() => setShowWalletDetailsModal(true)}
              onConnectMetaMask={connectMetaMask}
              isConnectedToMetaMask={isConnectedToMetaMask}
              metamaskAddress={metamaskAddress}
              // Blockchain entegrasyonu için eklenen yeni prop'lar
              onSaveWallets={handleSaveWallets}
              onLoadWallets={handleLoadWallets}
              isLoadingWallets={isLoadingWallets}
              isSavingWallets={isSavingWallets}
            />
            
            <WalletActions
              walletBalance={walletBalance}
              onDeposit={() => setShowDepositModal(true)}
              onWithdraw={() => setShowWithdrawModal(true)}
              hasWallet={!!currentWallet}
            />
            
            <TransactionList transactions={transactions} />
          </div>
          
          {/* Sağ sütun: Oyun */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between mb-4">
              <div>
                <div className="text-sm font-medium">Moves: <span className="font-bold">{moves}</span></div>
                <div className="text-sm font-medium">Time Left: <span className={`font-bold ${timeRemaining < 60000 ? 'text-red-500' : ''}`}>
                  {formatTime(timeRemaining)}
                </span></div>
              </div>
              <div className="text-sm text-right">
                <div>Network: <span className="font-medium">Monad Testnet</span></div>
                {currentWallet && <div className="text-xs truncate max-w-[180px]">Wallet: {currentWallet.address.substring(0, 6)}...{currentWallet.address.substring(38)}</div>}
              </div>
            </div>
            
            <Board 
              board={board}
              emptyTile={emptyTile}
              onTileClick={handleTileClick}
              size={4}
              isActive={isGameActive}
            />
            
            <GameControls 
              onStartGame={startGame}
              onHint={showHint}
              isGameActive={isGameActive}
              hasWallet={!!currentWallet}
              hasBalance={parseFloat(walletBalance) > 0}
            />
          </div>
        </div>
        
        {/* Modaller */}
        {showCreateWalletModal && (
          <CreateWalletModal 
            onClose={() => setShowCreateWalletModal(false)} 
            onSave={handleCreateWallet}
            isMetaMaskConnected={isConnectedToMetaMask}
          />
        )}
        
        {showWalletDetailsModal && currentWallet && (
          <WalletDetailsModal 
            wallet={currentWallet}
            onClose={() => setShowWalletDetailsModal(false)} 
          />
        )}
        
        {showDepositModal && currentWallet && (
          <DepositModal 
            gameWalletAddress={currentWallet.address}
            metamaskAddress={metamaskAddress}
            onDeposit={handleDeposit}
            onClose={() => setShowDepositModal(false)}
          />
        )}
        
        {showWithdrawModal && currentWallet && (
          <WithdrawModal 
            gameWalletAddress={currentWallet.address}
            metamaskAddress={metamaskAddress}
            balance={walletBalance}
            onWithdraw={handleWithdraw}
            onClose={() => setShowWithdrawModal(false)}
          />
        )}
        
        {isSolved && (
          <GameCompleteModal 
            moves={moves}
            timeRemaining={timeRemaining}
            onPlayAgain={resetGame}
          />
        )}
        
        {isGameOver && (
          <GameOverModal 
            onTryAgain={resetGame}
          />
        )}

        {/* Durum mesajları */}
        {showMessage && (
          <div className={`message ${showMessage.type === 'success' ? 'success-message' : 'error-message'}`}>
            {showMessage.text}
          </div>
        )}
      </div>
    </SafeAreaContainer>
  );
}
