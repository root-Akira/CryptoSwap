
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Wallet, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WalletConnection from '@/components/WalletConnection';
import TokenSelector from '@/components/TokenSelector';
import SwapInterface from '@/components/SwapInterface';

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    checkWalletConnection();
    
    // Listen for account changes if ethereum is available
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setAccount('');
        } else {
          setIsConnected(true);
          setAccount(accounts[0]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Cleanup listener on component unmount
      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]);
          console.log('Wallet already connected:', accounts[0]);
        } else {
          console.log('No accounts found - wallet not connected');
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
        toast({
          title: "Error",
          description: "Failed to check wallet connection",
          variant: "destructive"
        });
      }
    } else {
      console.log('MetaMask not detected');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">CryptoSwap</h1>
          </div>
          <WalletConnection 
            isConnected={isConnected}
            account={account}
            setIsConnected={setIsConnected}
            setAccount={setAccount}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Swap Tokens</h2>
            <p className="text-gray-600">Trade tokens in an instant</p>
          </div>

          <SwapInterface isConnected={isConnected} />
        </div>
      </main>
    </div>
  );
};

export default Index;
