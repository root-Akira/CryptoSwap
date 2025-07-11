import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { ethers } from 'ethers';
import { CONTRACTS, CRYPTO_SWAP_ABI } from '@/config/contracts';

const AdminAccess: React.FC = () => {
  const { provider, account, isConnected, isCorrectNetwork } = useWeb3();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!provider || !account || !isConnected || !isCorrectNetwork) {
        setIsOwner(false);
        return;
      }

      try {
        const contract = new ethers.Contract(CONTRACTS.CRYPTO_SWAP, CRYPTO_SWAP_ABI, provider);
        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === account.toLowerCase());
      } catch (error) {
        setIsOwner(false);
      }
    };

    checkOwnership();
  }, [provider, account, isConnected, isCorrectNetwork]);

  if (!isOwner) {
    return null;
  }

  return (
    <Link 
      to="/admin"
      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
      title="Admin Panel"
    >
      <Shield className="w-4 h-4" />
      <span>Admin</span>
    </Link>
  );
};

export default AdminAccess;
