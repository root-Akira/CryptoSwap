// Manual Liquidity Addition Script
// Run this in browser console after connecting wallet

async function addDAILiquidity() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  // Contract addresses
  const CRYPTO_SWAP = '0xf657d812E93667FA5f437d42C4641d51c050ba45';
  const DAI_TOKEN = '0x51abb9aCe666a53d569e88efD1b428Db3D59Ed10';
  
  // Contract ABIs (simplified)
  const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function faucet() external"
  ];
  
  const SWAP_ABI = [
    "function addLiquidity(address token, uint256 amount) external"
  ];
  
  try {
    // 1. Get DAI contract
    const daiContract = new ethers.Contract(DAI_TOKEN, ERC20_ABI, signer);
    
    // 2. Check your DAI balance
    const userAddress = await signer.getAddress();
    const balance = await daiContract.balanceOf(userAddress);
    console.log('Your mDAI balance:', ethers.formatEther(balance));
    
    // 3. If balance is low, claim from faucet
    if (balance < ethers.parseEther("500")) {
      console.log('Claiming mDAI from faucet...');
      const faucetTx = await daiContract.faucet();
      await faucetTx.wait();
      console.log('✅ mDAI claimed!');
    }
    
    // 4. Approve CryptoSwap to spend your DAI
    const approveAmount = ethers.parseEther("500");
    console.log('Approving mDAI spending...');
    const approveTx = await daiContract.approve(CRYPTO_SWAP, approveAmount);
    await approveTx.wait();
    console.log('✅ mDAI approved!');
    
    // 5. Add liquidity
    const swapContract = new ethers.Contract(CRYPTO_SWAP, SWAP_ABI, signer);
    console.log('Adding liquidity...');
    const liquidityTx = await swapContract.addLiquidity(DAI_TOKEN, approveAmount);
    await liquidityTx.wait();
    console.log('✅ Liquidity added successfully!');
    
    console.log('🎉 mDAI liquidity has been added to the contract!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
addDAILiquidity();
