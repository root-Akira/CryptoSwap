
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Token {
  symbol: string;
  name: string;
  icon: string;
  address: string;
}

// Tokens will be fetched from the smart contract
const popularTokens: Token[] = [];

interface TokenSelectorProps {
  selectedToken: Token;
  onTokenSelect: (token: Token) => void;
  label: string;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken,
  onTokenSelect,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between h-12 px-4 bg-white hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{selectedToken.icon || '?'}</span>
              <div className="text-left">
                <div className="font-semibold">{selectedToken.symbol}</div>
                <div className="text-xs text-gray-500">{selectedToken.name}</div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a token</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {popularTokens.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tokens available</p>
                <p className="text-sm">Connect to load supported tokens</p>
              </div>
            ) : (
              popularTokens.map((token) => (
                <Button
                  key={token.address}
                  variant="ghost"
                  className="w-full justify-start h-16 px-4 hover:bg-gray-50"
                  onClick={() => {
                    onTokenSelect(token);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{token.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold">{token.symbol}</div>
                      <div className="text-sm text-gray-500">{token.name}</div>
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TokenSelector;
