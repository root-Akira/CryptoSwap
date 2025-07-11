import { ethers } from 'ethers';
import { CONTRACTS, CRYPTO_SWAP_ABI, MOCK_TOKEN_ABI } from '@/config/contracts';

export class ContractDebugger {
  private provider: ethers.BrowserProvider;
  private signer: ethers.JsonRpcSigner;

  constructor(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer;
  }

  // Check contract liquidity for all tokens
  async checkContractLiquidity() {
    console.log('=== CONTRACT LIQUIDITY CHECK ===');
    
    const tokens = [
      { name: 'mUSDC', address: CONTRACTS.TOKENS.USDC },
      { name: 'mUSDT', address: CONTRACTS.TOKENS.USDT },
      { name: 'mDAI', address: CONTRACTS.TOKENS.DAI }
    ];

    for (const token of tokens) {
      try {
        const contract = new ethers.Contract(token.address, MOCK_TOKEN_ABI, this.provider);
        const balance = await contract.balanceOf(CONTRACTS.CRYPTO_SWAP);
        const formattedBalance = ethers.formatEther(balance);
        
        console.log(`${token.name} liquidity in contract: ${formattedBalance}`);
        
        if (parseFloat(formattedBalance) < 1000) {
          console.warn(`⚠️ LOW LIQUIDITY: ${token.name} has only ${formattedBalance} tokens in contract!`);
        }
      } catch (error) {
        console.error(`Error checking ${token.name} liquidity:`, error);
      }
    }
  }

  // Check if tokens are supported in the contract
  async checkSupportedTokens() {
    console.log('=== SUPPORTED TOKENS CHECK ===');
    
    try {
      const contract = new ethers.Contract(CONTRACTS.CRYPTO_SWAP, CRYPTO_SWAP_ABI, this.provider);
      
      const supportedTokens = await contract.getSupportedTokens();
      console.log('Supported tokens in contract:', supportedTokens);
      
      // Check each token's configuration
      for (const tokenAddress of supportedTokens) {
        const [name, symbol, decimals, price, contractBalance, supported] = await contract.getTokenInfo(tokenAddress);
        
        console.log(`Token: ${symbol}`);
        console.log(`  - Address: ${tokenAddress}`);
        console.log(`  - Name: ${name}`);
        console.log(`  - Decimals: ${decimals}`);
        console.log(`  - Price: ${ethers.formatEther(price)} ETH`);
        console.log(`  - Contract Balance: ${ethers.formatEther(contractBalance)}`);
        console.log(`  - Supported: ${supported}`);
      }
    } catch (error) {
      console.error('Error checking supported tokens:', error);
    }
  }

  // Test a specific swap to see detailed execution
  async debugSwap(tokenInAddress: string, tokenOutAddress: string, amountIn: string, userAddress: string) {
    console.log('=== SWAP DEBUG ===');
    console.log('Input params:', { tokenInAddress, tokenOutAddress, amountIn, userAddress });
    
    try {
      const contract = new ethers.Contract(CONTRACTS.CRYPTO_SWAP, CRYPTO_SWAP_ABI, this.signer);
      
      // 1. Check if swap is possible
      const [possible, reason] = await contract.canSwap(tokenInAddress, tokenOutAddress, ethers.parseEther(amountIn), userAddress);
      console.log(`Can swap: ${possible}, Reason: ${reason}`);
      
      if (!possible) {
        console.error('❌ Swap not possible:', reason);
        return;
      }
      
      // 2. Get quote
      const [amountOut, fee] = await contract.getSwapQuote(tokenInAddress, tokenOutAddress, ethers.parseEther(amountIn));
      console.log(`Quote - Amount Out: ${ethers.formatEther(amountOut)}, Fee: ${ethers.formatEther(fee)}`);
      
      // 3. Check user balances BEFORE
      const tokenInContract = new ethers.Contract(tokenInAddress, MOCK_TOKEN_ABI, this.provider);
      const tokenOutContract = new ethers.Contract(tokenOutAddress, MOCK_TOKEN_ABI, this.provider);
      
      const userBalanceInBefore = await tokenInContract.balanceOf(userAddress);
      const userBalanceOutBefore = await tokenOutContract.balanceOf(userAddress);
      const contractBalanceOutBefore = await tokenOutContract.balanceOf(CONTRACTS.CRYPTO_SWAP);
      
      console.log('BEFORE SWAP:');
      console.log(`  User ${await tokenInContract.symbol()}: ${ethers.formatEther(userBalanceInBefore)}`);
      console.log(`  User ${await tokenOutContract.symbol()}: ${ethers.formatEther(userBalanceOutBefore)}`);
      console.log(`  Contract ${await tokenOutContract.symbol()}: ${ethers.formatEther(contractBalanceOutBefore)}`);
      
      // 4. Check allowance
      const allowance = await tokenInContract.allowance(userAddress, CONTRACTS.CRYPTO_SWAP);
      console.log(`Allowance: ${ethers.formatEther(allowance)}`);
      
      if (allowance < ethers.parseEther(amountIn)) {
        console.log('❌ Insufficient allowance. Need to approve first.');
        return;
      }
      
      // 5. Execute swap
      console.log('Executing swap...');
      const tx = await contract.swapTokens(tokenInAddress, tokenOutAddress, ethers.parseEther(amountIn));
      console.log('Transaction hash:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed. Gas used:', receipt.gasUsed.toString());
      
      // 6. Check balances AFTER
      const userBalanceInAfter = await tokenInContract.balanceOf(userAddress);
      const userBalanceOutAfter = await tokenOutContract.balanceOf(userAddress);
      const contractBalanceOutAfter = await tokenOutContract.balanceOf(CONTRACTS.CRYPTO_SWAP);
      
      console.log('AFTER SWAP:');
      console.log(`  User ${await tokenInContract.symbol()}: ${ethers.formatEther(userBalanceInAfter)}`);
      console.log(`  User ${await tokenOutContract.symbol()}: ${ethers.formatEther(userBalanceOutAfter)}`);
      console.log(`  Contract ${await tokenOutContract.symbol()}: ${ethers.formatEther(contractBalanceOutAfter)}`);
      
      // 7. Calculate actual changes
      const actualIn = userBalanceInBefore - userBalanceInAfter;
      const actualOut = userBalanceOutAfter - userBalanceOutBefore;
      
      console.log('ACTUAL CHANGES:');
      console.log(`  ${await tokenInContract.symbol()} deducted: ${ethers.formatEther(actualIn)}`);
      console.log(`  ${await tokenOutContract.symbol()} received: ${ethers.formatEther(actualOut)}`);
      
      // 8. Check transaction logs
      console.log('Transaction logs:');
      receipt.logs.forEach((log, index) => {
        console.log(`  Log ${index}:`, log);
      });
      
    } catch (error) {
      console.error('Swap debug error:', error);
    }
  }

  // Check if contract owner has added liquidity
  async checkOwnerAndLiquidity() {
    console.log('=== OWNER & LIQUIDITY CHECK ===');
    
    try {
      const contract = new ethers.Contract(CONTRACTS.CRYPTO_SWAP, CRYPTO_SWAP_ABI, this.provider);
      
      const owner = await contract.owner();
      const tradingFee = await contract.tradingFee();
      
      console.log('Contract owner:', owner);
      console.log('Trading fee:', tradingFee.toString(), '(0.3% = 30)');
      
      // Check if current user is owner
      const currentUser = await this.signer.getAddress();
      console.log('Current user:', currentUser);
      console.log('Is current user owner?', owner.toLowerCase() === currentUser.toLowerCase());
      
    } catch (error) {
      console.error('Error checking owner:', error);
    }
  }

  // Add liquidity (only if you're the owner)
  async addLiquidityToContract(tokenAddress: string, amount: string) {
    console.log('=== ADDING LIQUIDITY ===');
    
    try {
      const contract = new ethers.Contract(CONTRACTS.CRYPTO_SWAP, CRYPTO_SWAP_ABI, this.signer);
      const tokenContract = new ethers.Contract(tokenAddress, MOCK_TOKEN_ABI, this.signer);
      
      const userAddress = await this.signer.getAddress();
      const userBalance = await tokenContract.balanceOf(userAddress);
      console.log(`User balance: ${ethers.formatEther(userBalance)}`);
      
      const amountWei = ethers.parseEther(amount);
      if (userBalance < amountWei) {
        console.log('❌ Insufficient user balance to add liquidity');
        return;
      }
      
      // First approve the contract to spend tokens
      console.log('Approving tokens for liquidity...');
      const approveTx = await tokenContract.approve(CONTRACTS.CRYPTO_SWAP, amountWei);
      await approveTx.wait();
      console.log('✅ Approval confirmed');
      
      // Then add liquidity
      console.log('Adding liquidity to contract...');
      const tx = await contract.addLiquidity(tokenAddress, amountWei);
      const receipt = await tx.wait();
      
      console.log('✅ Liquidity added successfully!');
      console.log('Transaction hash:', receipt.hash);
      
      // Check new contract balance
      const newBalance = await tokenContract.balanceOf(CONTRACTS.CRYPTO_SWAP);
      console.log(`New contract balance: ${ethers.formatEther(newBalance)}`);
      
    } catch (error: any) {
      console.error('❌ Error adding liquidity:', error.reason || error.message || error);
    }
  }
}

// Helper function to create debugger instance
export const createDebugger = (provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) => {
  return new ContractDebugger(provider, signer);
};
