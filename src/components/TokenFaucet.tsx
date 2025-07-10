import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTokens } from '@/hooks/useTokens';
import { useWeb3 } from '@/hooks/useWeb3';

const TokenFaucet: React.FC = () => {
  const { tokens, getTokenBalance, formatBalance, claimTokens } = useTokens();
  const { isConnected, isCorrectNetwork } = useWeb3();
  const [claiming, setClaiming] = useState<{[key: string]: boolean}>({});

  const handleClaim = async (tokenAddress: string, symbol: string) => {
    setClaiming(prev => ({ ...prev, [symbol]: true }));
    
    try {
      await claimTokens(tokenAddress);
    } finally {
      setClaiming(prev => ({ ...prev, [symbol]: false }));
    }
  };

  if (!isConnected || !isCorrectNetwork) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">🎁 Get Free Test Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">
            Connect your wallet to Sepolia network to claim free tokens
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">🎁 Get Free Test Tokens</CardTitle>
        <p className="text-sm text-gray-600 text-center">
          Claim free tokens to start trading on our platform
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {tokens.map((token) => {
          const balance = getTokenBalance(token.address);
          const isClaimingToken = claiming[token.symbol];
          
          return (
            <div key={token.address} className="flex justify-between items-center p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{token.icon}</span>
                <div>
                  <p className="font-medium">{token.name}</p>
                  <p className="text-sm text-gray-500">
                    Balance: {formatBalance(balance)} {token.symbol}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleClaim(token.address, token.symbol)}
                disabled={isClaimingToken}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {isClaimingToken ? 'Claiming...' : 'Claim 1,000'}
              </Button>
            </div>
          );
        })}
        
        <div className="bg-blue-50 p-3 rounded-lg mt-4">
          <p className="text-xs text-blue-700 text-center">
            💡 These are test tokens on Sepolia network - completely free and safe for learning!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenFaucet;
