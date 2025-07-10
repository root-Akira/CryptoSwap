
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TokenSelector from './TokenSelector';

interface Token {
  symbol: string;
  name: string;
  icon: string;
  address: string;
}

// Default tokens will be replaced with contract data
const defaultTokens = {
  from: { symbol: 'Select Token', name: 'Choose a token', icon: '?', address: '' },
  to: { symbol: 'Select Token', name: 'Choose a token', icon: '?', address: '' }
};

interface SwapInterfaceProps {
  isConnected: boolean;
}

const SwapInterface: React.FC<SwapInterfaceProps> = ({ isConnected }) => {
  const [fromToken, setFromToken] = useState<Token>(defaultTokens.from);
  const [toToken, setToToken] = useState<Token>(defaultTokens.to);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    // Real exchange rate will be fetched from smart contract
    setToAmount('');
  };

  const handleSwap = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet first.",
        variant: "destructive"
      });
      return;
    }

    if (!fromAmount || Number(fromAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap.",
        variant: "destructive"
      });
      return;
    }

    if (!fromToken.address || !toToken.address) {
      toast({
        title: "Select Tokens",
        description: "Please select both tokens to swap.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Real swap logic will be implemented here
    try {
      // Smart contract integration will be added here
      toast({
        title: "Ready for Integration",
        description: "Smart contract integration pending",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Swap Failed",
        description: "An error occurred during the swap",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-gray-900">Swap Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <TokenSelector
            selectedToken={fromToken}
            onTokenSelect={setFromToken}
            label="From"
          />
          <div className="relative">
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="text-2xl font-semibold h-16 pr-20 text-right bg-gray-50 border-2 focus:border-blue-500"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              Balance: 0.0
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapTokens}
            className="rounded-full w-10 h-10 p-0 border-4 border-white bg-gray-100 hover:bg-gray-200 shadow-lg"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <TokenSelector
            selectedToken={toToken}
            onTokenSelect={setToToken}
            label="To"
          />
          <div className="relative">
            <Input
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="text-2xl font-semibold h-16 pr-20 text-right bg-gray-50 border-2"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              Balance: 0.0
            </div>
          </div>
        </div>

        {/* Exchange Rate */}
        {fromAmount && toAmount && fromToken.address && toToken.address && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-800 text-center">
              Exchange rate will be fetched from smart contract
            </div>
          </div>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={!isConnected || !fromAmount || !fromToken.address || !toToken.address || isLoading}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : !isConnected ? 'Connect Wallet' : !fromToken.address || !toToken.address ? 'Select Tokens' : 'Swap'}
        </Button>

        {!isConnected && (
          <div className="text-center text-sm text-gray-500 mt-4">
            Connect your MetaMask wallet to start trading
          </div>
        )}
        
        {isConnected && (!fromToken.address || !toToken.address) && (
          <div className="text-center text-sm text-gray-500 mt-4">
            Select tokens from the contract to begin swapping
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SwapInterface;
