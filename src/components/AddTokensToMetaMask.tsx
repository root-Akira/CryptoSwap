import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CONTRACTS, TOKEN_INFO } from '@/config/contracts';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/hooks/useWeb3';

const AddTokensToMetaMask: React.FC = () => {
  const { isConnected } = useWeb3();
  const { toast } = useToast();

  const addTokenToMetaMask = async (tokenAddress: string) => {
    if (!window.ethereum || !isConnected) {
      toast({
        title: "MetaMask Required",
        description: "Please connect MetaMask to add tokens",
        variant: "destructive",
      });
      return;
    }

    const tokenInfo = TOKEN_INFO[tokenAddress];
    
    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenInfo.symbol,
            decimals: tokenInfo.decimals,
            image: '', // You can add token logos here
          },
        } as any,
      });

      if (wasAdded) {
        toast({
          title: "Token Added!",
          description: `${tokenInfo.symbol} has been added to MetaMask`,
        });
      }
    } catch (error) {
      console.error('Error adding token to MetaMask:', error);
      toast({
        title: "Failed to Add Token",
        description: "Could not add token to MetaMask",
        variant: "destructive",
      });
    }
  };

  const addAllTokens = async () => {
    const tokens = Object.keys(CONTRACTS.TOKENS);
    for (const tokenKey of tokens) {
      const tokenAddress = CONTRACTS.TOKENS[tokenKey as keyof typeof CONTRACTS.TOKENS];
      await addTokenToMetaMask(tokenAddress);
      // Small delay to avoid overwhelming MetaMask
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">🦊 Add Tokens to MetaMask</CardTitle>
        <p className="text-sm text-gray-600 text-center">
          Add test tokens to your MetaMask wallet to see balances
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(CONTRACTS.TOKENS).map(([key, address]) => {
          const tokenInfo = TOKEN_INFO[address];
          return (
            <div key={address} className="flex justify-between items-center p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{tokenInfo.icon}</span>
                <div>
                  <p className="font-medium">{tokenInfo.name}</p>
                  <p className="text-sm text-gray-500">{tokenInfo.symbol}</p>
                </div>
              </div>
              <Button
                onClick={() => addTokenToMetaMask(address)}
                size="sm"
                variant="outline"
              >
                Add to MetaMask
              </Button>
            </div>
          );
        })}
        
        <div className="pt-2 border-t">
          <Button
            onClick={addAllTokens}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            Add All Tokens to MetaMask
          </Button>
        </div>
        
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-xs text-orange-700 text-center">
            💡 After adding tokens, you'll see your balances in MetaMask wallet!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddTokensToMetaMask;
