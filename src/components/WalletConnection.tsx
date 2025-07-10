
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletConnectionProps {
  isConnected: boolean;
  account: string;
  setIsConnected: (connected: boolean) => void;
  setAccount: (account: string) => void;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({
  isConnected,
  account,
  setIsConnected,
  setAccount
}) => {
  const { toast } = useToast();

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to use this application.",
        variant: "destructive"
      });
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        setIsConnected(true);
        setAccount(accounts[0]);
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to MetaMask!",
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount('');
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from MetaMask",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {formatAddress(account)}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={disconnectWallet}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">
      <Wallet className="w-4 h-4 mr-2" />
      Connect MetaMask
    </Button>
  );
};

export default WalletConnection;
