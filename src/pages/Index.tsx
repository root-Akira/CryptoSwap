
import React from 'react';
import WalletConnection from '@/components/WalletConnection';
import SwapInterface from '@/components/SwapInterface';
import TokenFaucet from '@/components/TokenFaucet';
import TokenBalanceDisplay from '@/components/TokenBalanceDisplay';
import ContractDebugPanel from '@/components/ContractDebugPanel';
import { useWeb3 } from '@/hooks/useWeb3';

const Index = () => {
  const { isConnected, isCorrectNetwork } = useWeb3();

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
          
          {/* Token Balance Display in Navbar */}
          <div className="flex items-center space-x-4">
            <TokenBalanceDisplay />
            <WalletConnection />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Decentralized Token Swap</h2>
            <p className="text-gray-600">Trade tokens instantly on Sepolia testnet</p>
          </div>

          <div className={`${(!isConnected || !isCorrectNetwork) ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : 'flex justify-center'}`}>
            {/* Swap Interface */}
            <div className={`${(!isConnected || !isCorrectNetwork) ? '' : 'w-full max-w-md'}`}>
              <SwapInterface />
            </div>

            {/* Getting Started Guide */}
            {(!isConnected || !isCorrectNetwork) && (
              <div className="space-y-6">
                <div className="p-6 bg-white rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">🚀 Getting Started</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium">Connect Your Wallet</h4>
                        <p className="text-sm text-gray-600">Connect MetaMask to Sepolia testnet</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium">Get Free Test Tokens</h4>
                        <p className="text-sm text-gray-600">Claim free mUSDC, mUSDT, and mDAI tokens</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium">Start Swapping</h4>
                        <p className="text-sm text-gray-600">Exchange tokens with low fees (0.3%)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Platform Stats */}
          {isConnected && isCorrectNetwork && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-600">Supported Tokens</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <div className="text-2xl font-bold text-green-600">0.3%</div>
                <div className="text-sm text-gray-600">Trading Fee</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <div className="text-2xl font-bold text-purple-600">∞</div>
                <div className="text-sm text-gray-600">Free Test Tokens</div>
              </div>
            </div>
          )}

          {/* Token Faucet Section - Moved to Bottom */}
          {isConnected && isCorrectNetwork && (
            <div className="mt-12 flex justify-center">
              <TokenFaucet />
            </div>
          )}

          {/* Debug Panel - For testing contract issues */}
          {isConnected && isCorrectNetwork && (
            <ContractDebugPanel />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
