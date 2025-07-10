import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, CRYPTO_SWAP_ABI, MOCK_TOKEN_ABI, SEPOLIA_NETWORK } from '@/config/contracts';
import { useToast } from './use-toast';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance?: string;
  icon: string;
}

export function useWeb3() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      checkConnection();
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        const isCorrect = parseInt(chainId, 16) === SEPOLIA_NETWORK.chainId;
        setIsCorrectNetwork(isCorrect);
        if (!isCorrect) {
          toast({
            title: "Wrong Network",
            description: "Please switch to Sepolia testnet",
            variant: "destructive",
          });
        }
      });
    }

    return () => {
      // Cleanup listeners on unmount
      if (window.ethereum) {
        try {
          window.ethereum.removeListener('accountsChanged', () => {});
          window.ethereum.removeListener('chainChanged', () => {});
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          
          setProvider(provider);
          setSigner(signer);
          setAccount(address);
          setIsConnected(true);
          
          // Check network
          const network = await provider.getNetwork();
          const isCorrect = Number(network.chainId) === SEPOLIA_NETWORK.chainId;
          setIsCorrectNetwork(isCorrect);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to use this application.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setIsConnected(true);

      // Check and switch to Sepolia network
      const network = await provider.getNetwork();
      const isCorrect = Number(network.chainId) === SEPOLIA_NETWORK.chainId;
      
      if (!isCorrect) {
        await switchToSepolia();
      } else {
        setIsCorrectNetwork(true);
      }

      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });

    } catch (error: any) {
      console.error('Connection error:', error);
      let errorMessage = "Failed to connect wallet";
      
      if (error.code === 4001) {
        errorMessage = "User rejected the connection request";
      } else if (error.code === -32002) {
        errorMessage = "Connection request already pending";
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_NETWORK.chainIdHex }],
      });
      setIsCorrectNetwork(true);
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_NETWORK.chainIdHex,
              chainName: SEPOLIA_NETWORK.name,
              nativeCurrency: SEPOLIA_NETWORK.nativeCurrency,
              rpcUrls: SEPOLIA_NETWORK.rpcUrls,
              blockExplorerUrls: SEPOLIA_NETWORK.blockExplorerUrls,
            }],
          });
          setIsCorrectNetwork(true);
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast({
            title: "Network Error",
            description: "Failed to add Sepolia network",
            variant: "destructive",
          });
        }
      } else {
        console.error('Error switching network:', error);
        toast({
          title: "Network Error", 
          description: "Failed to switch to Sepolia network",
          variant: "destructive",
        });
      }
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount('');
    setIsConnected(false);
    setIsCorrectNetwork(false);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return {
    provider,
    signer,
    account,
    isConnected,
    isCorrectNetwork,
    isLoading,
    connect,
    disconnect,
    switchToSepolia,
  };
}
