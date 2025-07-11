import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { ethers } from 'ethers';
import { CONTRACTS, CRYPTO_SWAP_ABI } from '@/config/contracts';
import ContractDebugPanel from './ContractDebugPanel';

const AdminPanel: React.FC = () => {
  const { provider, signer, account, isConnected, isCorrectNetwork } = useWeb3();
  const [isOwner, setIsOwner] = useState(false);
  const [isCheckingOwner, setIsCheckingOwner] = useState(true);
  const [contractOwner, setContractOwner] = useState<string>('');

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
        setContractOwner(owner);
        
        const userIsOwner = owner.toLowerCase() === account.toLowerCase();
        setIsOwner(userIsOwner);
        
        console.log('Owner check:', {
          contractOwner: owner,
          currentUser: account,
          isOwner: userIsOwner
        });
      } catch (error) {
        console.error('Error checking ownership:', error);
        setIsOwner(false);
      } finally {
        setIsCheckingOwner(false);
      }
    };

    checkOwnership();
  }, [provider, account, isConnected, isCorrectNetwork]);

  // Don't render anything if not connected
  if (!isConnected || !isCorrectNetwork) {
    return null;
  }

  // Show loading while checking ownership
  if (isCheckingOwner) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Checking permissions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show access denied if not owner
  if (!isOwner) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8 border-red-200">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Lock className="w-6 h-6 text-red-600" />
            <CardTitle className="text-red-800">Access Restricted</CardTitle>
          </div>
          <Badge variant="destructive" className="mx-auto">
            Admin Only
          </Badge>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <p className="text-sm text-gray-600">
            This admin panel is only accessible to the contract owner.
          </p>
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-xs text-red-700">
              <strong>Contract Owner:</strong><br/>
              {contractOwner ? `${contractOwner.slice(0, 6)}...${contractOwner.slice(-4)}` : 'Unknown'}
            </p>
            <p className="text-xs text-red-700 mt-1">
              <strong>Your Address:</strong><br/>
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show admin panel for owner
  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card className="w-full max-w-4xl mx-auto border-green-200">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="w-6 h-6 text-green-600" />
            <CardTitle className="text-green-800">Admin Panel</CardTitle>
          </div>
          <Badge variant="default" className="mx-auto bg-green-100 text-green-800">
            Contract Owner
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-semibold text-blue-800">Contract Address</p>
              <p className="text-xs text-blue-600 font-mono">
                {CONTRACTS.CRYPTO_SWAP.slice(0, 6)}...{CONTRACTS.CRYPTO_SWAP.slice(-4)}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-semibold text-green-800">Your Status</p>
              <p className="text-xs text-green-600">Contract Owner ✅</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm font-semibold text-purple-800">Network</p>
              <p className="text-xs text-purple-600">Sepolia Testnet</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tools */}
      <div className="w-full max-w-4xl mx-auto">
        <ContractDebugPanel />
      </div>

      {/* Admin Instructions */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">📋 Admin Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">💧 Liquidity Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Monitor token balances in contract</li>
                <li>• Add liquidity when levels are low</li>
                <li>• Ensure all tokens have sufficient reserves</li>
                <li>• Minimum recommended: 500+ tokens each</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">🔍 Diagnostics</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Run diagnostics to check system health</li>
                <li>• Test swaps before users encounter issues</li>
                <li>• Monitor for insufficient liquidity warnings</li>
                <li>• Verify token support and pricing</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Security Notice:</strong> Only you (the contract owner) can see this panel. 
              Regular users will see an "Access Restricted" message if they try to access admin functions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
