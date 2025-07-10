import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Wallet, CheckCircle } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useTokens } from '@/hooks/useTokens';

const WelcomeDialog: React.FC = () => {
  const { isConnected, isCorrectNetwork, account } = useWeb3();
  const { tokens, getTokenBalance, claimTokens } = useTokens();
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasCheckedBalances, setHasCheckedBalances] = useState(false);
  const [needsTokens, setNeedsTokens] = useState(false);
  const [claimingStatus, setClaimingStatus] = useState<{[key: string]: boolean}>({});
  const [claimedTokens, setClaimedTokens] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (isConnected && isCorrectNetwork && !hasCheckedBalances) {
      checkUserBalances();
    }
  }, [isConnected, isCorrectNetwork, hasCheckedBalances]);

  const checkUserBalances = async () => {
    if (!account) return;

    let hasAnyTokens = false;
    
    for (const token of tokens) {
      const balance = parseFloat(getTokenBalance(token.address));
      if (balance > 0) {
        hasAnyTokens = true;
        break;
      }
    }

    setNeedsTokens(!hasAnyTokens);
    setHasCheckedBalances(true);
    
    // Show welcome dialog if user is new (no tokens)
    if (!hasAnyTokens) {
      setShowWelcome(true);
    }
  };

  const handleClaimToken = async (tokenAddress: string, symbol: string) => {
    setClaimingStatus(prev => ({ ...prev, [symbol]: true }));
    
    try {
      await claimTokens(tokenAddress);
      setClaimedTokens(prev => ({ ...prev, [symbol]: true }));
      
      // Check if all tokens have been claimed
      const allClaimed = tokens.every(token => 
        claimedTokens[token.symbol] || token.address === tokenAddress
      );
      
      if (allClaimed) {
        setTimeout(() => {
          setShowWelcome(false);
          setNeedsTokens(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error claiming token:', error);
    } finally {
      setClaimingStatus(prev => ({ ...prev, [symbol]: false }));
    }
  };

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  if (!showWelcome || !needsTokens) {
    return null;
  }

  return (
    <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Welcome to CryptoSwap! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <Wallet className="h-12 w-12 mx-auto text-blue-600 mb-2" />
            <p className="text-gray-600">
              You're connected, but you'll need some test tokens to start trading.
            </p>
          </div>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <Gift className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">Get Free Test Tokens</h3>
              </div>
              
              <div className="space-y-3">
                {tokens.map((token) => {
                  const isClaiming = claimingStatus[token.symbol];
                  const isClaimed = claimedTokens[token.symbol];
                  const balance = parseFloat(getTokenBalance(token.address));
                  const hasBalance = balance > 0;

                  return (
                    <div key={token.address} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{token.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{token.name}</p>
                          <p className="text-xs text-gray-500">
                            {hasBalance ? `Balance: ${balance.toFixed(2)}` : 'No balance'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        {isClaimed || hasBalance ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">Ready</span>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleClaimToken(token.address, token.symbol)}
                            disabled={isClaiming}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-xs"
                          >
                            {isClaiming ? 'Claiming...' : 'Claim 1K'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              💡 These are test tokens on Sepolia network - completely free and safe for learning!
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleCloseWelcome} 
              variant="outline" 
              className="flex-1"
            >
              Skip for now
            </Button>
            <Button 
              onClick={handleCloseWelcome} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={tokens.some(token => 
                !claimedTokens[token.symbol] && 
                parseFloat(getTokenBalance(token.address)) === 0
              )}
            >
              Start Trading!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;
