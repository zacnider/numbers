// lib/constants.ts
// Uygulama sabitleri

export const APP_URL = process.env.NEXT_PUBLIC_URL!;
if (!APP_URL) {
  throw new Error("NEXT_PUBLIC_URL is not set");
}

// Monad Testnet için yapılandırma
export const NETWORK_CONFIG = {
  rpcUrl: 'https://testnet-rpc.monad.xyz',
  chainId: 10143,
  chainName: 'Monad Testnet',
  currencySymbol: 'MON',
  blockExplorerUrl: 'https://testnet.monadexplorer.com'
};

// Sliding Puzzle oyun sözleşmesi adresi
export const CONTRACT_ADDRESS = '0x58C47b55af42A75E81Ea616732e09600F533DF7B';

// Diğer sabitler
export const MAX_WALLETS = 10;
export const GAME_TIME_LIMIT = 5 * 60 * 1000; // 5 dakika (milisaniye)
