// components/wallet/TransactionList.tsx
// İşlem listesi bileşeni

import React from "react";

interface Transaction {
  hash: string;
  type: string;
  status: string;
  amount?: string;
  timestamp: number;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-bold mb-3">İşlem Geçmişi</h2>
      
      <div className="bg-gray-50 p-3 rounded max-h-[180px] overflow-y-auto">
        {transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((tx, index) => (
              <div key={index} className="flex justify-between items-center p-2 text-sm border-b border-gray-200 last:border-0">
                <div className="flex flex-col">
                  <a 
                    href={`https://testnet.monadexplorer.com/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 truncate max-w-[150px]"
                  >
                    {tx.type}: {tx.hash.substring(0, 8)}...
                  </a>
                  <span className="text-xs text-gray-500">{formatDate(tx.timestamp)}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  tx.status === 'onaylandı' 
                    ? 'bg-green-100 text-green-800' 
                    : tx.status === 'beklemede' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                }`}>
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Henüz işlem yok.</p>
        )}
      </div>
    </div>
  );
};
