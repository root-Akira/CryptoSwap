import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWeb3, Token } from '@/hooks/useWeb3';
import { useTokens } from '@/hooks/useTokens';
import { useSwap, SwapQuote } from '@/hooks/useSwap';
import TokenSelector from './TokenSelector';
import InsufficientBalanceAlert from './InsufficientBalanceAlert';

const SwapInterface: React.FC = () => {
  const { account, isConnected, isCorrectNetwork } = useWeb3();
  const { getTokenBalance, formatBalance } = useTokens();
  const { getSwapQuote, checkAllowance, approveToken, executeSwap, isLoading, isApproving } = useSwap();
  const { toast } = useToast();

  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);

  // Get quote when inputs change
  useEffect(() => {
    const getQuote = async () => {
      if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
        const newQuote = await getSwapQuote(fromToken.address, toToken.address, fromAmount);
        setQuote(newQuote);
        
        // Check if approval is needed
        if (account && fromAmount) {
          const hasAllowance = await checkAllowance(fromToken.address, account, fromAmount);
          setNeedsApproval(!hasAllowance);
        }
      } else {
        setQuote(null);
        setNeedsApproval(false);
      }
    };

    const debounce = setTimeout(getQuote, 500);
    return () => clearTimeout(debounce);
  }, [fromToken, toToken, fromAmount, account]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(quote ? formatBalance(quote.amountOut, 6) : '');
    setQuote(null);
  };

  const handleFromAmountChange = (value: string) => {
    // Only allow numeric input with decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
    }
  };

  const handleMaxClick = () => {
    if (fromToken) {
      const balance = getTokenBalance(fromToken.address);
      setFromAmount(balance);
    }
  };

  const handleApprove = async () => {
    if (!fromToken || !fromAmount) return;
    
    const success = await approveToken(fromToken.address, fromAmount);
    if (success) {
      setNeedsApproval(false);
    }
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || !account) {
      toast({
        title: "Invalid Swap",
        description: "Please select tokens and enter an amount",
        variant: "destructive",
      });
      return;
    }

    if (!isConnected || !isCorrectNetwork) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to Sepolia network",
        variant: "destructive",
      });
      return;
    }

    const userBalance = parseFloat(getTokenBalance(fromToken.address));
    const swapAmount = parseFloat(fromAmount);

    if (swapAmount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${fromToken.symbol}`,
        variant: "destructive",
      });
      return;
    }

    const success = await executeSwap(fromToken.address, toToken.address, fromAmount, account);
    
    if (success) {
      setFromAmount('');
      setQuote(null);
      setNeedsApproval(false);
    }
  };

  const handleTokenClaimed = () => {
    // Refresh quote and allowance after claiming tokens
    setQuote(null);
    setNeedsApproval(false);
  };

  const canSwapTokens = fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0 && isConnected && isCorrectNetwork;
  const swapButtonText = needsApproval ? 'Approve Required' : isLoading ? 'Swapping...' : 'Swap';

  // Check if user has insufficient balance
  const hasInsufficientBalance = fromToken && fromAmount && 
    parseFloat(getTokenBalance(fromToken.address)) < parseFloat(fromAmount);

  return (
    <div className="space-y-4">
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
              excludeToken={toToken?.address}
            />
            <div className="relative">
              <Input
                type="text"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                className="text-2xl font-semibold h-16 pr-20 text-right bg-gray-50 border-2 focus:border-blue-500"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-end">
                {fromToken && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-auto p-1 text-blue-600 hover:text-blue-800"
                      onClick={handleMaxClick}
                    >
                      MAX
                    </Button>
                    <div className="text-xs text-gray-500">
                      Balance: {formatBalance(getTokenBalance(fromToken.address))}
                    </div>
                  </>
                )}
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
              disabled={!fromToken || !toToken}
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
              excludeToken={fromToken?.address}
            />
            <div className="relative">
              <Input
                type="text"
                placeholder="0.0"
                value={quote ? formatBalance(quote.amountOut, 6) : ''}
                readOnly
                className="text-2xl font-semibold h-16 pr-20 text-right bg-gray-50 border-2"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                {toToken && `Balance: ${formatBalance(getTokenBalance(toToken.address))}`}
              </div>
            </div>
          </div>

          {/* Quote Information */}
          {quote && fromToken && toToken && (
            <div className="bg-blue-50 p-3 rounded-lg space-y-1">
              <div className="flex justify-between text-sm">
                <span>You'll receive:</span>
                <span className="font-medium">{formatBalance(quote.amountOut, 6)} {toToken.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Trading fee:</span>
                <span>{formatBalance(quote.fee, 6)} {toToken.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Price impact:</span>
                <span className="text-green-600">{quote.priceImpact}%</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {needsApproval && canSwapTokens && !hasInsufficientBalance && (
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                className="w-full h-14 text-lg font-semibold bg-yellow-600 hover:bg-yellow-700"
              >
                {isApproving ? 'Approving...' : `Approve ${fromToken?.symbol}`}
              </Button>
            )}
            
            <Button
              onClick={needsApproval ? handleApprove : handleSwap}
              disabled={!canSwapTokens || isLoading || (needsApproval && isApproving) || hasInsufficientBalance}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {!isConnected ? 'Connect Wallet' : 
               !isCorrectNetwork ? 'Switch to Sepolia' :
               !fromToken || !toToken ? 'Select Tokens' :
               !fromAmount ? 'Enter Amount' :
               hasInsufficientBalance ? 'Insufficient Balance' :
               swapButtonText}
            </Button>
          </div>

          {/* Help Text */}
          {!isConnected && (
            <div className="text-center text-sm text-gray-500 mt-4">
              Connect your MetaMask wallet to start trading
            </div>
          )}
          
          {isConnected && !isCorrectNetwork && (
            <div className="text-center text-sm text-gray-500 mt-4">
              Please switch to Sepolia testnet to continue
            </div>
          )}
          
          {isConnected && isCorrectNetwork && (!fromToken || !toToken) && (
            <div className="text-center text-sm text-gray-500 mt-4">
              Select tokens to begin swapping
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insufficient Balance Alert */}
      {hasInsufficientBalance && (
        <InsufficientBalanceAlert
          requiredToken={fromToken}
          requiredAmount={fromAmount}
          onTokenClaimed={handleTokenClaimed}
        />
      )}
    </div>
  );
};

export default SwapInterface;
