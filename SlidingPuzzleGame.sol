// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SlidingPuzzleGame {
    // Game state
    struct Game {
        address player;
        uint256 moves;
        uint256 startTime;
        uint256 endTime;
        bool completed;
    }
    
    // Wallet structure
    struct Wallet {
        string encryptedPrivateKey;
        string encryptedMnemonic;
        bool isActive;
    }
    
    // Mapping of games to players
    mapping(address => Game) public games;
    
    // Mapping to track high scores (lowest moves)
    mapping(address => uint256) public highScores;
    
    // Mapping for user wallets
    mapping(address => Wallet[]) private userWallets;
    
    // Mapping to track wallet count per user
    mapping(address => uint256) public walletCount;
    
    // Total games played
    uint256 public totalGames;
    
    // Maximum wallets per user
    uint256 public constant MAX_WALLETS = 10;
    
    // Events
    event GameStarted(address indexed player, uint256 timestamp);
    event MoveMade(address indexed player, uint256 moveNumber);
    event GameCompleted(address indexed player, uint256 moves, uint256 timeSpent);
    event WalletCreated(address indexed owner, uint256 walletIndex);
    event WalletRemoved(address indexed owner, uint256 walletIndex);
    
    // Start a new game
    function startGame() external {
        // Reset or create a new game for the player
        games[msg.sender] = Game({
            player: msg.sender,
            moves: 0,
            startTime: block.timestamp,
            endTime: 0,
            completed: false
        });
        
        // Increment total games
        totalGames++;
        
        // Emit event
        emit GameStarted(msg.sender, block.timestamp);
    }
    
    // Record a move
    function makeMove() external {
        // Get the player's current game
        Game storage game = games[msg.sender];
        
        // Ensure game is in progress
        require(game.player == msg.sender, "No active game found");
        require(!game.completed, "Game already completed");
        
        // Increment move counter
        game.moves++;
        
        // Emit event
        emit MoveMade(msg.sender, game.moves);
    }
    
    // Complete the game
    function completeGame() external {
        // Get the player's current game
        Game storage game = games[msg.sender];
        
        // Ensure game is in progress
        require(game.player == msg.sender, "No active game found");
        require(!game.completed, "Game already completed");
        
        // Mark game as completed
        game.completed = true;
        game.endTime = block.timestamp;
        
        // Update high score if this game has fewer moves or is first game
        if (highScores[msg.sender] == 0 || game.moves < highScores[msg.sender]) {
            highScores[msg.sender] = game.moves;
        }
        
        // Calculate time spent
        uint256 timeSpent = game.endTime - game.startTime;
        
        // Emit event
        emit GameCompleted(msg.sender, game.moves, timeSpent);
    }
    
    // Get player's current game stats
    function getGameStats(address player) external view returns (
        uint256 moves,
        uint256 startTime,
        uint256 endTime,
        bool completed
    ) {
        Game memory game = games[player];
        return (
            game.moves,
            game.startTime,
            game.endTime,
            game.completed
        );
    }
    
    // Get player's high score (lowest moves)
    function getHighScore(address player) external view returns (uint256) {
        return highScores[player];
    }
    
    // Create a new in-app wallet for the user
    function createWallet(string calldata encryptedPrivateKey, string calldata encryptedMnemonic) external {
        require(walletCount[msg.sender] < MAX_WALLETS, "Maximum wallet limit reached");
        
        // Create new wallet
        Wallet memory newWallet = Wallet({
            encryptedPrivateKey: encryptedPrivateKey,
            encryptedMnemonic: encryptedMnemonic,
            isActive: walletCount[msg.sender] == 0 // First wallet is active by default
        });
        
        // Add wallet to user's wallets
        userWallets[msg.sender].push(newWallet);
        
        // Increment wallet count
        walletCount[msg.sender]++;
        
        // Emit event
        emit WalletCreated(msg.sender, walletCount[msg.sender] - 1);
    }
    
    // Remove wallet at specific index
    function removeWallet(uint256 index) external {
        require(index < userWallets[msg.sender].length, "Wallet index out of bounds");
        
        // Check if there's only one wallet
        if (userWallets[msg.sender].length == 1) {
            delete userWallets[msg.sender][0];
        } else {
            // Move the last element to the position of the removed wallet
            userWallets[msg.sender][index] = userWallets[msg.sender][userWallets[msg.sender].length - 1];
            
            // Remove the last element
            userWallets[msg.sender].pop();
        }
        
        // Decrement wallet count
        walletCount[msg.sender]--;
        
        // Emit event
        emit WalletRemoved(msg.sender, index);
    }
    
    // Set active wallet
    function setActiveWallet(uint256 index) external {
        require(index < userWallets[msg.sender].length, "Wallet index out of bounds");
        
        // Set all wallets to inactive
        for (uint i = 0; i < userWallets[msg.sender].length; i++) {
            userWallets[msg.sender][i].isActive = false;
        }
        
        // Set specified wallet to active
        userWallets[msg.sender][index].isActive = true;
    }
    
    // Get wallet details
    function getWallet(uint256 index) external view returns (
        string memory encryptedPrivateKey,
        string memory encryptedMnemonic,
        bool isActive
    ) {
        require(index < userWallets[msg.sender].length, "Wallet index out of bounds");
        
        Wallet memory wallet = userWallets[msg.sender][index];
        return (
            wallet.encryptedPrivateKey,
            wallet.encryptedMnemonic,
            wallet.isActive
        );
    }
    
    // Get all wallets for user
    function getAllWallets() external view returns (
        string[] memory encryptedPrivateKeys,
        string[] memory encryptedMnemonics,
        bool[] memory activeStates
    ) {
        uint256 count = userWallets[msg.sender].length;
        
        encryptedPrivateKeys = new string[](count);
        encryptedMnemonics = new string[](count);
        activeStates = new bool[](count);
        
        for (uint i = 0; i < count; i++) {
            Wallet memory wallet = userWallets[msg.sender][i];
            encryptedPrivateKeys[i] = wallet.encryptedPrivateKey;
            encryptedMnemonics[i] = wallet.encryptedMnemonic;
            activeStates[i] = wallet.isActive;
        }
        
        return (encryptedPrivateKeys, encryptedMnemonics, activeStates);
    }
    
    // Get wallet count
    function getWalletCount() external view returns (uint256) {
        return userWallets[msg.sender].length;
    }
}
