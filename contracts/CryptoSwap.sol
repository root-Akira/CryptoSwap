// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
    function name() external view returns (string memory);
}

contract CryptoSwap {
    address public owner;
    uint256 public tradingFee = 30; // 0.3% fee (30/10000)
    
    // Token registry
    address[] public supportedTokens;
    mapping(address => bool) public isSupported;
    mapping(address => uint256) public tokenPrices; // Price in wei per token
    
    // Events
    event TokenSwapped(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );
    
    event TokenAdded(address indexed token, uint256 price);
    event PriceUpdated(address indexed token, uint256 newPrice);
    event LiquidityAdded(address indexed token, uint256 amount);
    event TradingFeeUpdated(uint256 newFee);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    // Add supported token with price
    function addToken(address _token, uint256 _priceInWei) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        require(!isSupported[_token], "Token already supported");
        
        supportedTokens.push(_token);
        isSupported[_token] = true;
        tokenPrices[_token] = _priceInWei;
        
        emit TokenAdded(_token, _priceInWei);
    }
    
    // Update token price
    function updatePrice(address _token, uint256 _newPrice) external onlyOwner {
        require(isSupported[_token], "Token not supported");
        tokenPrices[_token] = _newPrice;
        emit PriceUpdated(_token, _newPrice);
    }
    
    // Main swap function
    function swapTokens(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) external returns (uint256 amountOut) {
        require(_amountIn > 0, "Amount must be greater than 0");
        require(isSupported[_tokenIn], "Input token not supported");
        require(isSupported[_tokenOut], "Output token not supported");
        require(_tokenIn != _tokenOut, "Cannot swap same token");
        
        IERC20 tokenIn = IERC20(_tokenIn);
        IERC20 tokenOut = IERC20(_tokenOut);
        
        // Check user balance
        require(tokenIn.balanceOf(msg.sender) >= _amountIn, "Insufficient balance");
        
        // Calculate output amount based on prices
        uint256 valueInWei = (_amountIn * tokenPrices[_tokenIn]) / (10 ** tokenIn.decimals());
        uint256 grossAmountOut = (valueInWei * (10 ** tokenOut.decimals())) / tokenPrices[_tokenOut];
        
        // Calculate fee
        uint256 feeAmount = (grossAmountOut * tradingFee) / 10000;
        amountOut = grossAmountOut - feeAmount;
        
        // Check contract liquidity
        require(tokenOut.balanceOf(address(this)) >= amountOut, "Insufficient liquidity");
        
        // Execute transfers
        require(tokenIn.transferFrom(msg.sender, address(this), _amountIn), "Transfer in failed");
        require(tokenOut.transfer(msg.sender, amountOut), "Transfer out failed");
        
        emit TokenSwapped(msg.sender, _tokenIn, _tokenOut, _amountIn, amountOut, feeAmount);
        
        return amountOut;
    }
    
    // Get swap quote (view function)
    function getSwapQuote(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) external view returns (uint256 amountOut, uint256 fee) {
        require(isSupported[_tokenIn], "Input token not supported");
        require(isSupported[_tokenOut], "Output token not supported");
        require(_tokenIn != _tokenOut, "Cannot swap same token");
        
        IERC20 tokenIn = IERC20(_tokenIn);
        IERC20 tokenOut = IERC20(_tokenOut);
        
        uint256 valueInWei = (_amountIn * tokenPrices[_tokenIn]) / (10 ** tokenIn.decimals());
        uint256 grossAmountOut = (valueInWei * (10 ** tokenOut.decimals())) / tokenPrices[_tokenOut];
        
        fee = (grossAmountOut * tradingFee) / 10000;
        amountOut = grossAmountOut - fee;
    }
    
    // Get all supported tokens
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }
    
    // Get token information
    function getTokenInfo(address _token) external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        uint256 price,
        uint256 contractBalance,
        bool supported
    ) {
        IERC20 token = IERC20(_token);
        return (
            token.name(),
            token.symbol(),
            token.decimals(),
            tokenPrices[_token],
            token.balanceOf(address(this)),
            isSupported[_token]
        );
    }
    
    // Get user balance for a token
    function getUserBalance(address _token, address _user) external view returns (uint256) {
        return IERC20(_token).balanceOf(_user);
    }
    
    // Check if swap is possible
    function canSwap(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        address _user
    ) external view returns (bool possible, string memory reason) {
        if (!isSupported[_tokenIn]) return (false, "Input token not supported");
        if (!isSupported[_tokenOut]) return (false, "Output token not supported");
        if (_tokenIn == _tokenOut) return (false, "Cannot swap same token");
        if (_amountIn == 0) return (false, "Amount must be greater than 0");
        
        IERC20 tokenIn = IERC20(_tokenIn);
        IERC20 tokenOut = IERC20(_tokenOut);
        
        if (tokenIn.balanceOf(_user) < _amountIn) return (false, "Insufficient user balance");
        
        (uint256 amountOut,) = this.getSwapQuote(_tokenIn, _tokenOut, _amountIn);
        if (tokenOut.balanceOf(address(this)) < amountOut) return (false, "Insufficient liquidity");
        
        return (true, "Swap possible");
    }
    
    // Owner functions
    function addLiquidity(address _token, uint256 _amount) external onlyOwner {
        require(isSupported[_token], "Token not supported");
        require(_amount > 0, "Amount must be greater than 0");
        
        require(IERC20(_token).transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        emit LiquidityAdded(_token, _amount);
    }
    
    function withdrawToken(address _token, uint256 _amount) external onlyOwner {
        require(IERC20(_token).balanceOf(address(this)) >= _amount, "Insufficient contract balance");
        require(IERC20(_token).transfer(owner, _amount), "Transfer failed");
    }
    
    function setTradingFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee cannot exceed 10%"); // Max 10%
        tradingFee = _fee;
        emit TradingFeeUpdated(_fee);
    }
    
    function setOwner(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
    
    // Emergency functions
    function emergencyWithdraw(address _token) external onlyOwner {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        if (balance > 0) {
            IERC20(_token).transfer(owner, balance);
        }
    }
    
    function removeToken(address _token) external onlyOwner {
        require(isSupported[_token], "Token not supported");
        
        isSupported[_token] = false;
        
        // Remove from array
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            if (supportedTokens[i] == _token) {
                supportedTokens[i] = supportedTokens[supportedTokens.length - 1];
                supportedTokens.pop();
                break;
            }
        }
        
        delete tokenPrices[_token];
    }
    
    // View functions for frontend
    function getPlatformStats() external view returns (
        uint256 totalSupportedTokens,
        uint256 currentTradingFee,
        address platformOwner
    ) {
        return (supportedTokens.length, tradingFee, owner);
    }
}
