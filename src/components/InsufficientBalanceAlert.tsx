import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Gift } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { useWeb3, Token } from '@/hooks/useWeb3';

interface InsufficientBalanceAlertProps {
  requiredToken?: Token | null;
  requiredAmount?: string;
  onTokenClaimed?: () => void;
}

const InsufficientBalanceAlert: React.FC<InsufficientBalanceAlertProps> = ({
  requiredToken,
  requiredAmount,
  onTokenClaimed
}) => {
  const { isConnected, isCorrectNetwork } = useWeb3();
  const { getTokenBalance, formatBalance, claimTokens } = useTokens();
  const [isClaiming, setIsClaiming] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (requiredToken && requiredAmount && isConnected && isCorrectNetwork) {
      const currentBalance = parseFloat(getTokenBalance(requiredToken.address));
      const needed = parseFloat(requiredAmount);
      
      // Show alert if user doesn't have enough balance
      setShowAlert(currentBalance < needed && needed > 0);
    } else {
      setShowAlert(false);
    }
  }, [requiredToken, requiredAmount, isConnected, isCorrectNetwork, getTokenBalance]);

  const handleClaimTokens = async () => {
    if (!requiredToken) return;

    setIsClaiming(true);
    try {
      await claimTokens(requiredToken.address);
      setShowAlert(false); // Hide alert after successful claim
      onTokenClaimed?.(); // Callback to parent component
    } catch (error) {
      console.error('Error claiming tokens:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (!showAlert || !requiredToken || !requiredAmount) {
    return null;
  }

  const currentBalance = getTokenBalance(requiredToken.address);
  const needed = parseFloat(requiredAmount);
  const shortfall = needed - parseFloat(currentBalance);

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <Alert className="border-orange-200 bg-transparent">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-3">
              <div>
                <p className="font-medium mb-1">Insufficient {requiredToken.symbol} Balance</p>
                <div className="text-sm space-y-1">
                  <p>Current balance: <span className="font-medium">{formatBalance(currentBalance)} {requiredToken.symbol}</span></p>
                  <p>Required: <span className="font-medium">{formatBalance(requiredAmount)} {requiredToken.symbol}</span></p>
                  <p>Need: <span className="font-medium text-red-600">{formatBalance(shortfall.toString())} {requiredToken.symbol} more</span></p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-green-700">
                  <Gift className="h-4 w-4 mr-1" />
                  <span>Get free tokens to continue</span>
                </div>
                <Button
                  onClick={handleClaimTokens}
                  disabled={isClaiming}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isClaiming ? 'Claiming...' : `Claim 1,000 ${requiredToken.symbol}`}
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default InsufficientBalanceAlert;
