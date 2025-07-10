
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
import { useTokens } from '@/hooks/useTokens';
import { Token } from '@/hooks/useWeb3';

interface TokenSelectorProps {
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  label: string;
  excludeToken?: string; // Exclude this token from selection
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken,
  onTokenSelect,
  label,
  excludeToken
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { tokens, getTokenBalance, formatBalance } = useTokens();

  const availableTokens = excludeToken 
    ? tokens.filter(token => token.address.toLowerCase() !== excludeToken.toLowerCase())
    : tokens;

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
              <span className="text-2xl">{selectedToken?.icon || '?'}</span>
              <div className="text-left">
                <div className="font-semibold">{selectedToken?.symbol || 'Select Token'}</div>
                <div className="text-xs text-gray-500">{selectedToken?.name || 'Choose a token'}</div>
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
            {availableTokens.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tokens available</p>
                <p className="text-sm">Please connect your wallet</p>
              </div>
            ) : (
              availableTokens.map((token) => {
                const balance = getTokenBalance(token.address);
                return (
                  <Button
                    key={token.address}
                    variant="ghost"
                    className="w-full justify-between h-16 px-4 hover:bg-gray-50"
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
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatBalance(balance)}</div>
                      <div className="text-xs text-gray-500">Balance</div>
                    </div>
                  </Button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TokenSelector;
