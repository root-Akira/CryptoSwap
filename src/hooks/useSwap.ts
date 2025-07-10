import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, CRYPTO_SWAP_ABI, MOCK_TOKEN_ABI } from '@/config/contracts';
import { useWeb3 } from './useWeb3';
import { useTokens } from './useTokens';
import { useToast } from './use-toast';

export interface SwapQuote {
  amountOut: string;
  fee: string;
  priceImpact: string;
}

export function useSwap() {
  const { signer, isConnected, isCorrectNetwork } = useWeb3();
  const { loadBalances } = useTokens();
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const { toast } = useToast();

  const getSwapQuote = async (
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: string
  ): Promise<SwapQuote | null> => {
    if (!signer || !isConnected || !isCorrectNetwork) return null;

    try {
      const contract = new ethers.Contract(CONTRACTS.CRYPTO_SWAP, CRYPTO_SWAP_ABI, signer);
      const amountInWei = ethers.parseEther(amountIn);
      
      const [amountOut, fee] = await contract.getSwapQuote(
        tokenInAddress,
        tokenOutAddress,
        amountInWei
      );

      return {
        amountOut: ethers.formatEther(amountOut),
        fee: ethers.formatEther(fee),
        priceImpact: '0.3', // Trading fee from contract
      };
    } catch (error) {
      console.error('Error getting swap quote:', error);
      return null;
    }
  };

  const checkAllowance = async (
    tokenAddress: string,
    userAddress: string,
    amount: string
  ): Promise<boolean> => {
    if (!signer) return false;

    try {
      const contract = new ethers.Contract(tokenAddress, MOCK_TOKEN_ABI, signer);
      const allowance = await contract.allowance(userAddress, CONTRACTS.CRYPTO_SWAP);
      const amountWei = ethers.parseEther(amount);
      
      return allowance >= amountWei;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return false;
    }
  };

  const approveToken = async (tokenAddress: string, amount: string): Promise<boolean> => {
    if (!signer || !isConnected || !isCorrectNetwork) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to Sepolia network",
        variant: "destructive",
      });
      return false;
    }

    setIsApproving(true);
    try {
      const contract = new ethers.Contract(tokenAddress, MOCK_TOKEN_ABI, signer);
      const amountWei = ethers.parseEther(amount);
      
      const tx = await contract.approve(CONTRACTS.CRYPTO_SWAP, amountWei);
      
      toast({
        title: "Approval Submitted",
        description: "Approving token spending... Please wait for confirmation.",
      });

      await tx.wait();
      
      toast({
        title: "Approval Successful",
        description: "Token spending approved!",
      });

      return true;
    } catch (error: any) {
      console.error('Error approving token:', error);
      
      let errorMessage = "Failed to approve token";
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Approval Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  const executeSwap = async (
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: string,
    userAddress: string
  ): Promise<boolean> => {
    if (!signer || !isConnected || !isCorrectNetwork) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to Sepolia network",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      // Check if approval is needed
      const hasAllowance = await checkAllowance(tokenInAddress, userAddress, amountIn);
      
      if (!hasAllowance) {
        toast({
          title: "Approval Required",
          description: "You need to approve token spending first",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      // Execute swap
      const contract = new ethers.Contract(CONTRACTS.CRYPTO_SWAP, CRYPTO_SWAP_ABI, signer);
      const amountInWei = ethers.parseEther(amountIn);
      
      const tx = await contract.swapTokens(tokenInAddress, tokenOutAddress, amountInWei);
      
      toast({
        title: "Swap Submitted",
        description: "Executing swap... Please wait for confirmation.",
      });

      const receipt = await tx.wait();
      
      toast({
        title: "Swap Successful!",
        description: `Successfully swapped tokens! Transaction: ${receipt.hash.slice(0, 10)}...`,
      });

      // Reload balances
      await loadBalances();
      
      return true;
    } catch (error: any) {
      console.error('Error executing swap:', error);
      
      let errorMessage = "Failed to execute swap";
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Swap Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const canSwap = async (
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: string,
    userAddress: string
  ): Promise<{ possible: boolean; reason: string }> => {
    if (!signer || !isConnected || !isCorrectNetwork) {
      return { possible: false, reason: "Wallet not connected" };
    }

    try {
      const contract = new ethers.Contract(CONTRACTS.CRYPTO_SWAP, CRYPTO_SWAP_ABI, signer);
      const amountInWei = ethers.parseEther(amountIn);
      
      const [possible, reason] = await contract.canSwap(
        tokenInAddress,
        tokenOutAddress,
        amountInWei,
        userAddress
      );

      return { possible, reason };
    } catch (error) {
      console.error('Error checking swap possibility:', error);
      return { possible: false, reason: "Error checking swap conditions" };
    }
  };

  return {
    isLoading,
    isApproving,
    getSwapQuote,
    checkAllowance,
    approveToken,
    executeSwap,
    canSwap,
  };
}
