// types/index.ts
// Tip tanımları

export interface SafeAreaInsets {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface Wallet {
  address: string;
  privateKey: string;
  mnemonic: string;
}

export interface Transaction {
  hash: string;
  type: string;
  status: string;
  amount?: string;
  timestamp: number;
}

export interface WalletManagerProps {
  wallets: Wallet[];
  currentWallet: Wallet | null;
  onCreateWallet: () => void;
  onSelectWallet: (address: string) => void;
  onDeleteWallet: (address: string) => void;
  onViewDetails: () => void;
  onConnectMetaMask: () => void;
  isConnectedToMetaMask: boolean;
  metamaskAddress: string | null;
}

export interface WalletActionsProps {
  walletBalance: string;
  onDeposit: () => void;
  onWithdraw: () => void;
  hasWallet: boolean;
}

export interface TransactionListProps {
  transactions: Transaction[];
}

export interface BoardProps {
  board: number[][];
  emptyTile: { row: number; col: number };
  onTileClick: (row: number, col: number) => void;
  size: number;
  isActive: boolean;
}

export interface TileProps {
  value: number;
  isEmpty: boolean;
  isSlidable: boolean;
  onClick: () => void;
  row: number;
  col: number;
}

export interface GameControlsProps {
  onStartGame: () => void;
  onHint?: () => void;
  isGameActive: boolean;
  hasWallet: boolean;
  hasBalance: boolean;
}
