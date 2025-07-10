
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';

const WalletConnection: React.FC = () => {
  const { account, isConnected, isCorrectNetwork, isLoading, connect, disconnect, switchToSepolia } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && !isCorrectNetwork) {
    return (
      <div className="flex items-center space-x-2">
        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
          Wrong Network
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={switchToSepolia}
        >
          Switch to Sepolia
        </Button>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {formatAddress(account)}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={disconnect}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={connect} 
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isLoading ? 'Connecting...' : 'Connect MetaMask'}
    </Button>
  );
};

export default WalletConnection;
