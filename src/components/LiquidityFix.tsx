import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWeb3 } from '@/hooks/useWeb3';
import { useTokens } from '@/hooks/useTokens';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';
import { CONTRACTS, CRYPTO_SWAP_ABI, MOCK_TOKEN_ABI } from '@/config/contracts';

const LiquidityFix: React.FC = () => {
  const { provider, signer, account, isConnected, isCorrectNetwork } = useWeb3();
  const { getTokenBalance, loadBalances } = useTokens();
  const { toast } = useToast();
  const [isFixing, setIsFixing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  const addDAILiquidity = async () => {
    if (!signer || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsFixing(true);
    setCurrentStep('Starting liquidity fix...');

    try {
      const daiAddress = CONTRACTS.TOKENS.DAI;
      const daiContract = new ethers.Contract(daiAddress, MOCK_TOKEN_ABI, signer);
      const swapContract = new ethers.Contract(CONTRACTS.CRYPTO_SWAP, CRYPTO_SWAP_ABI, signer);

      // Step 1: Check current DAI balance
      setCurrentStep('Checking your mDAI balance...');
      const userBalance = await daiContract.balanceOf(account);
      const balanceFormatted = ethers.formatEther(userBalance);
      
      console.log('Current mDAI balance:', balanceFormatted);

      // Step 2: Claim DAI if needed
      if (parseFloat(balanceFormatted) < 500) {
        setCurrentStep('Claiming mDAI from faucet...');
        toast({
          title: "Claiming mDAI",
          description: "Getting free mDAI tokens from faucet...",
        });

        const faucetTx = await daiContract.faucet();
        await faucetTx.wait();
        
        toast({
          title: "mDAI Claimed!",
          description: "Successfully claimed 1,000 mDAI tokens",
        });
      }

      // Step 3: Approve contract to spend DAI
      setCurrentStep('Approving mDAI spending...');
      const approveAmount = ethers.parseEther("500");
      
      toast({
        title: "Approval Required",
        description: "Approving CryptoSwap to spend your mDAI...",
      });

      const approveTx = await daiContract.approve(CONTRACTS.CRYPTO_SWAP, approveAmount);
      await approveTx.wait();

      toast({
        title: "Approval Confirmed",
        description: "CryptoSwap can now spend your mDAI",
      });

      // Step 4: Add liquidity to contract
      setCurrentStep('Adding mDAI liquidity to contract...');
      
      toast({
        title: "Adding Liquidity",
        description: "Adding 500 mDAI to the swap contract...",
      });

      const liquidityTx = await swapContract.addLiquidity(daiAddress, approveAmount);
      await liquidityTx.wait();

      // Step 5: Verify the fix
      setCurrentStep('Verifying liquidity...');
      const contractBalance = await daiContract.balanceOf(CONTRACTS.CRYPTO_SWAP);
      const contractBalanceFormatted = ethers.formatEther(contractBalance);

      toast({
        title: "✅ Liquidity Added Successfully!",
        description: `Contract now has ${contractBalanceFormatted} mDAI tokens`,
      });

      setCurrentStep('✅ mDAI liquidity problem solved!');

      // Refresh balances
      setTimeout(() => {
        loadBalances();
      }, 2000);

    } catch (error: any) {
      console.error('Error fixing liquidity:', error);
      
      let errorMessage = "Failed to add liquidity";
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Fix Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      setCurrentStep('❌ Fix failed - see error above');
    } finally {
      setIsFixing(false);
    }
  };

  if (!isConnected || !isCorrectNetwork) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>🔧 mDAI Liquidity Fix</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">
            Connect your wallet to Sepolia network to fix liquidity
          </p>
        </CardContent>
      </Card>
    );
  }

  const daiBalance = getTokenBalance(CONTRACTS.TOKENS.DAI);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🔧 Fix mDAI Liquidity Problem</CardTitle>
        <p className="text-sm text-gray-600">
          Your contract has no mDAI tokens. This will fix swaps to mDAI.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <Alert>
          <AlertDescription>
            <strong>Issue:</strong> Contract has 0 mDAI tokens<br/>
            <strong>Solution:</strong> Add 500 mDAI to contract<br/>
            <strong>Your mDAI:</strong> {parseFloat(daiBalance).toFixed(2)} tokens
          </AlertDescription>
        </Alert>

        {/* Fix Button */}
        <Button 
          onClick={addDAILiquidity} 
          disabled={isFixing}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isFixing ? '🔄 Fixing...' : '🔧 Fix mDAI Liquidity'}
        </Button>

        {/* Progress */}
        {currentStep && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">{currentStep}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 p-3 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-1">What this does:</h4>
          <ol className="text-xs text-yellow-700 space-y-1">
            <li>1. Claims 1,000 mDAI from faucet (if needed)</li>
            <li>2. Approves contract to spend your mDAI</li>
            <li>3. Adds 500 mDAI to the contract</li>
            <li>4. Enables swaps TO mDAI</li>
          </ol>
        </div>

        {/* Warning */}
        {parseFloat(daiBalance) < 500 && (
          <Alert>
            <AlertDescription className="text-sm">
              ℹ️ You have {daiBalance} mDAI. The fix will automatically claim more from the faucet.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default LiquidityFix;
