import React from 'react';
import { useTokens } from '@/hooks/useTokens';
import { useWeb3 } from '@/hooks/useWeb3';

const TokenBalanceDisplay: React.FC = () => {
  const { tokens, getTokenBalance, formatBalance } = useTokens();
  const { isConnected, isCorrectNetwork } = useWeb3();

  if (!isConnected || !isCorrectNetwork) {
    return null;
  }

  return (
    <div className="hidden lg:flex items-center space-x-3">
      {tokens.map((token) => {
        const balance = getTokenBalance(token.address);
        const formattedBalance = formatBalance(balance, 2);
        
        return (
          <div 
            key={token.address} 
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 px-3 py-2 rounded-lg"
            title={`${token.name}: ${formattedBalance} ${token.symbol}`}
          >
            <span className="text-lg">{token.icon}</span>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-700">{token.symbol}</span>
              <span className="text-sm font-bold text-gray-900">{formattedBalance}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TokenBalanceDisplay;
