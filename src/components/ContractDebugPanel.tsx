import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWeb3 } from '@/hooks/useWeb3';
import { useTokens } from '@/hooks/useTokens';
import { createDebugger } from '@/utils/contractDebugEnhanced';
import { CONTRACTS } from '@/config/contracts';

const ContractDebugPanel: React.FC = () => {
  const { provider, signer, account, isConnected, isCorrectNetwork } = useWeb3();
  const { tokens } = useTokens();
  const [debugResults, setDebugResults] = useState<string>('');
  const [fromToken, setFromToken] = useState<string>('');
  const [toToken, setToToken] = useState<string>('');
  const [amount, setAmount] = useState<string>('1');
  const [liquidityToken, setLiquidityToken] = useState<string>('');
  const [liquidityAmount, setLiquidityAmount] = useState<string>('1000');

  const addToLog = (message: string) => {
    setDebugResults(prev => prev + message + '\n');
  };

  const clearLog = () => {
    setDebugResults('');
  };

  const runDiagnostic = async () => {
    if (!provider || !signer || !account) {
      addToLog('❌ Wallet not connected');
      return;
    }

    clearLog();
    addToLog('🔍 Starting contract diagnostic...\n');

    try {
      const contractDebugger = createDebugger(provider, signer);

      // Redirect console.log to our log
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      console.log = (...args) => addToLog(args.join(' '));
      console.warn = (...args) => addToLog('⚠️ ' + args.join(' '));
      console.error = (...args) => addToLog('❌ ' + args.join(' '));

      await contractDebugger.checkOwnerAndLiquidity();
      addToLog('');
      await contractDebugger.checkSupportedTokens();
      addToLog('');
      await contractDebugger.checkContractLiquidity();

      // Restore console methods
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;

      addToLog('\n✅ Diagnostic complete!');
    } catch (error) {
      addToLog(`❌ Diagnostic failed: ${error}`);
    }
  };

  const testSwap = async () => {
    if (!provider || !signer || !account || !fromToken || !toToken) {
      addToLog('❌ Missing required data for swap test');
      return;
    }

    addToLog('\n🔄 Testing swap...\n');

    try {
      const contractDebugger = createDebugger(provider, signer);

      // Redirect console methods
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      console.log = (...args) => addToLog(args.join(' '));
      console.warn = (...args) => addToLog('⚠️ ' + args.join(' '));
      console.error = (...args) => addToLog('❌ ' + args.join(' '));

      await contractDebugger.debugSwap(fromToken, toToken, amount, account);

      // Restore console methods
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;

      addToLog('\n✅ Swap test complete!');
    } catch (error) {
      addToLog(`❌ Swap test failed: ${error}`);
    }
  };

  const addLiquidity = async () => {
    if (!provider || !signer || !liquidityToken) {
      addToLog('❌ Missing required data for liquidity addition');
      return;
    }

    addToLog('\n💧 Adding liquidity...\n');

    try {
      const contractDebugger = createDebugger(provider, signer);

      // Redirect console methods
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      console.log = (...args) => addToLog(args.join(' '));
      console.warn = (...args) => addToLog('⚠️ ' + args.join(' '));
      console.error = (...args) => addToLog('❌ ' + args.join(' '));

      await contractDebugger.addLiquidityToContract(liquidityToken, liquidityAmount);

      // Restore console methods
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;

      addToLog('\n✅ Liquidity addition complete!');
    } catch (error) {
      addToLog(`❌ Liquidity addition failed: ${error}`);
    }
  };

  if (!isConnected || !isCorrectNetwork) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>🔧 Contract Debug Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">
            Connect your wallet to Sepolia network to use debug panel
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>🔧 Contract Debug Panel</CardTitle>
        <p className="text-sm text-gray-600">
          Debug tools to diagnose swap issues
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Diagnostic Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contract Diagnostic</h3>
          <Button onClick={runDiagnostic} className="w-full">
            🔍 Run Full Diagnostic
          </Button>
        </div>

        {/* Swap Test Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Swap</h3>
          <div className="grid grid-cols-3 gap-4">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger>
                <SelectValue placeholder="From Token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger>
                <SelectValue placeholder="To Token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button onClick={testSwap} className="w-full" disabled={!fromToken || !toToken}>
            🔄 Test Swap
          </Button>
        </div>

        {/* Add Liquidity Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Add Liquidity (Owner Only)</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select value={liquidityToken} onValueChange={setLiquidityToken}>
              <SelectTrigger>
                <SelectValue placeholder="Select Token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Amount"
              value={liquidityAmount}
              onChange={(e) => setLiquidityAmount(e.target.value)}
            />
          </div>
          <Button onClick={addLiquidity} className="w-full" disabled={!liquidityToken}>
            💧 Add Liquidity
          </Button>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Debug Results</h3>
            <Button variant="outline" size="sm" onClick={clearLog}>
              Clear Log
            </Button>
          </div>
          <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            <pre>{debugResults || 'Click "Run Full Diagnostic" to start debugging...'}</pre>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">💡 Common Issues & Solutions:</h4>
          <ul className="text-sm space-y-1">
            <li>• <strong>No balance change:</strong> Check contract liquidity</li>
            <li>• <strong>Transaction fails:</strong> Ensure token approval</li>
            <li>• <strong>Low liquidity:</strong> Add liquidity as contract owner</li>
            <li>• <strong>Token not supported:</strong> Check contract configuration</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractDebugPanel;
