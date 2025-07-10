import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, CRYPTO_SWAP_ABI, MOCK_TOKEN_ABI, TOKEN_INFO } from '@/config/contracts';
import { useWeb3, Token } from './useWeb3';
import { useToast } from './use-toast';

export function useTokens() {
  const { provider, signer, account, isConnected, isCorrectNetwork } = useWeb3();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize tokens
  useEffect(() => {
    const tokenList: Token[] = Object.entries(CONTRACTS.TOKENS).map(([key, address]) => ({
      address,
      symbol: TOKEN_INFO[address].symbol,
      name: TOKEN_INFO[address].name,
      decimals: TOKEN_INFO[address].decimals,
      icon: TOKEN_INFO[address].icon,
    }));
    setTokens(tokenList);
  }, []);

  // Load balances when connected
  useEffect(() => {
    if (isConnected && isCorrectNetwork && account && provider) {
      loadBalances();
    }
  }, [isConnected, isCorrectNetwork, account, provider]);

  const loadBalances = async () => {
    if (!provider || !account) return;

    setIsLoading(true);
    try {
      const newBalances: Record<string, string> = {};
      
      for (const token of tokens) {
        const contract = new ethers.Contract(token.address, MOCK_TOKEN_ABI, provider);
        const balance = await contract.balanceOf(account);
        newBalances[token.address] = ethers.formatEther(balance);
      }
      
      setBalances(newBalances);
    } catch (error) {
      console.error('Error loading balances:', error);
      toast({
        title: "Error Loading Balances",
        description: "Failed to load token balances",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const claimTokens = async (tokenAddress: string) => {
    if (!signer || !isConnected || !isCorrectNetwork) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to Sepolia network",
        variant: "destructive",
      });
      return;
    }

    try {
      const contract = new ethers.Contract(tokenAddress, MOCK_TOKEN_ABI, signer);
      const tx = await contract.faucet();
      
      toast({
        title: "Transaction Submitted",
        description: "Claiming tokens... Please wait for confirmation.",
      });

      await tx.wait();
      
      const tokenInfo = TOKEN_INFO[tokenAddress];
      toast({
        title: "Tokens Claimed!",
        description: `Successfully claimed 1,000 ${tokenInfo.symbol} tokens`,
      });

      // Reload balances
      await loadBalances();
      
    } catch (error: any) {
      console.error('Error claiming tokens:', error);
      
      let errorMessage = "Failed to claim tokens";
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Claim Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getTokenBalance = (tokenAddress: string): string => {
    return balances[tokenAddress] || '0';
  };

  const getTokenByAddress = (address: string): Token | undefined => {
    return tokens.find(token => token.address.toLowerCase() === address.toLowerCase());
  };

  const formatBalance = (balance: string, decimals: number = 4): string => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(decimals);
  };

  return {
    tokens,
    balances,
    isLoading,
    loadBalances,
    claimTokens,
    getTokenBalance,
    getTokenByAddress,
    formatBalance,
  };
}
