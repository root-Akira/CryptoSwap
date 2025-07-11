import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Shield, Settings } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { ethers } from 'ethers';
import { CONTRACTS, CRYPTO_SWAP_ABI } from '@/config/contracts';
import ContractDebugPanel from './ContractDebugPanel';

const AdminButton: React.FC = () => {
  const { provider, account, isConnected, isCorrectNetwork } = useWeb3();
  const [isOwner, setIsOwner] = useState(false);
  const [isCheckingOwner, setIsCheckingOwner] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Check if current user is the contract owner
  useEffect(() => {
    const checkOwnership = async () => {
      if (!provider || !account || !isConnected || !isCorrectNetwork) {
        setIsOwner(false);
        setIsCheckingOwner(false);
        return;
      }

      try {
        const contract = new ethers.Contract(CONTRACTS.CRYPTO_SWAP, CRYPTO_SWAP_ABI, provider);
        const owner = await contract.owner();
        const userIsOwner = owner.toLowerCase() === account.toLowerCase();
        setIsOwner(userIsOwner);
      } catch (error) {
        console.error('Error checking ownership:', error);
        setIsOwner(false);
      } finally {
        setIsCheckingOwner(false);
      }
    };

    checkOwnership();
  }, [provider, account, isConnected, isCorrectNetwork]);

  // Don't render if not connected or not owner
  if (!isConnected || !isCorrectNetwork || isCheckingOwner || !isOwner) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <Shield className="w-4 h-4" />
          <span>Admin</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <DialogTitle className="text-xl">Admin Panel</DialogTitle>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                Contract Owner
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Manage your CryptoSwap contract liquidity and diagnostics
          </p>
        </DialogHeader>
        
        <div className="mt-4">
          <ContractDebugPanel />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminButton;
