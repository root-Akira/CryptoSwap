import { ethers } from 'ethers';
import { CONTRACTS, CRYPTO_SWAP_ABI, MOCK_TOKEN_ABI } from '@/config/contracts';

export const testContractConnectivity = async (signer: ethers.Signer) => {
  console.log('🧪 Testing contract connectivity...');
  
  try {
    // Test CryptoSwap contract
    const swapContract = new ethers.Contract(CONTRACTS.CRYPTO_SWAP, CRYPTO_SWAP_ABI, signer);
    
    console.log('✅ CryptoSwap contract created');
    console.log('📍 Address:', CONTRACTS.CRYPTO_SWAP);
    
    // Test token contracts
    for (const [tokenName, tokenAddress] of Object.entries(CONTRACTS.TOKENS)) {
      try {
        const tokenContract = new ethers.Contract(tokenAddress, MOCK_TOKEN_ABI, signer);
        const symbol = await tokenContract.symbol();
        const decimals = await tokenContract.decimals();
        
        console.log(`✅ ${tokenName} contract working:`, {
          address: tokenAddress,
          symbol,
          decimals: decimals.toString()
        });
      } catch (error) {
        console.error(`❌ ${tokenName} contract failed:`, error);
      }
    }
    
    // Test swap quote functionality
    try {
      const testAmount = ethers.parseEther('1');
      const quote = await swapContract.getSwapQuote(
        CONTRACTS.TOKENS.USDC,
        CONTRACTS.TOKENS.USDT,
        testAmount
      );
      
      console.log('✅ Swap quote test successful:', {
        amountOut: ethers.formatEther(quote[0]),
        fee: ethers.formatEther(quote[1])
      });
    } catch (error) {
      console.error('❌ Swap quote test failed:', error);
    }
    
    console.log('🧪 Contract connectivity test completed');
    
  } catch (error) {
    console.error('❌ Contract connectivity test failed:', error);
  }
};

export const debugSwapIssue = async (
  signer: ethers.Signer,
  tokenInAddress: string,
  tokenOutAddress: string,
  amountIn: string,
  userAddress: string
) => {
  console.log('🔍 Debugging swap issue...');
  
  try {
    // Step 1: Check user balance
    const tokenInContract = new ethers.Contract(tokenInAddress, MOCK_TOKEN_ABI, signer);
    const userBalance = await tokenInContract.balanceOf(userAddress);
    const amountInWei = ethers.parseEther(amountIn);
    
    console.log('1️⃣ Balance check:', {
      userBalance: ethers.formatEther(userBalance),
      requiredAmount: amountIn,
      sufficient: userBalance >= amountInWei
    });
    
    // Step 2: Check allowance
    const allowance = await tokenInContract.allowance(userAddress, CONTRACTS.CRYPTO_SWAP);
    console.log('2️⃣ Allowance check:', {
      allowance: ethers.formatEther(allowance),
      requiredAmount: amountIn,
      sufficient: allowance >= amountInWei
    });
    
    // Step 3: Test swap quote
    const swapContract = new ethers.Contract(CONTRACTS.CRYPTO_SWAP, CRYPTO_SWAP_ABI, signer);
    try {
      const quote = await swapContract.getSwapQuote(tokenInAddress, tokenOutAddress, amountInWei);
      console.log('3️⃣ Quote check:', {
        amountOut: ethers.formatEther(quote[0]),
        fee: ethers.formatEther(quote[1])
      });
    } catch (error) {
      console.error('3️⃣ Quote failed:', error);
    }
    
    // Step 4: Check if swap is possible
    try {
      const canSwapResult = await swapContract.canSwap(tokenInAddress, tokenOutAddress, amountInWei, userAddress);
      console.log('4️⃣ Can swap check:', {
        possible: canSwapResult[0],
        reason: canSwapResult[1]
      });
    } catch (error) {
      console.error('4️⃣ Can swap check failed:', error);
    }
    
  } catch (error) {
    console.error('🔍 Debug failed:', error);
  }
};

export const checkTokenDecimals = async (signer: ethers.Signer) => {
  console.log('🔢 Checking token decimals...');
  
  for (const [tokenName, tokenAddress] of Object.entries(CONTRACTS.TOKENS)) {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, MOCK_TOKEN_ABI, signer);
      const decimals = await tokenContract.decimals();
      const name = await tokenContract.name();
      const symbol = await tokenContract.symbol();
      
      console.log(`${tokenName}:`, {
        name,
        symbol,
        decimals: decimals.toString(),
        address: tokenAddress
      });
    } catch (error) {
      console.error(`Failed to get ${tokenName} info:`, error);
    }
  }
};
