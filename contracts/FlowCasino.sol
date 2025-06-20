// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Flow Casino - Provably Fair Decentralized Casino
 * @author Your Name
 * @notice A decentralized casino with dice rolls, coin flips, and roulette using Flow EVM VRF
 * @dev Built on Flow blockchain with Cadence Arch VRF integration
 */

contract FlowCasino is ReentrancyGuard, Ownable, Pausable {
   
    // ============ CONSTANTS ============
    
    address constant public CADENCE_ARCH = 0x0000000000000000000000010000000000000001;
    uint256 constant public HOUSE_EDGE_BASIS_POINTS = 250; // 2.5%
    uint256 constant public BASIS_POINTS = 10000;
    
    // ============ ENUMS ============
    
    enum GameType { DICE_ROLL, COIN_FLIP, ROULETTE }
    enum RouletteBetType { NUMBER, COLOR, RANGE, EVEN_ODD }
    enum CoinSide { HEADS, TAILS }
    
    // ============ STRUCTS ============
    
    struct Game {
        uint256 gameId;
        address player;
        GameType gameType;
        uint256 betAmount;
        uint256 payout;
        bool isCompleted;
        bool isWon;
        uint256 timestamp;
        bytes gameData; // Encoded game-specific data
        uint256 randomNumber;
        uint256 requestId;
    }
    
    struct PlayerStats {
        uint256 totalGames;
        uint256 totalWins;
        uint256 totalLosses;
        uint256 totalWagered;
        uint256 totalWon;
        uint256 lastPlayed;
    }
    
    struct RouletteBet {
        RouletteBetType betType;
        uint8 number; // 0-36 for number bets
        bool isRed; // true for red, false for black
        uint8 rangeStart; // for range bets
        uint8 rangeEnd; // for range bets
        bool isEven; // true for even, false for odd
    }
    
    // ============ STATE VARIABLES ============
    
    uint256 public gameCounter;
    uint256 public minBet = 0.01 ether;
    uint256 public maxBet = 5 ether;
    uint256 public maxPayout = 100 ether;
    
    mapping(uint256 => Game) public games;
    mapping(address => PlayerStats) public playerStats;
    mapping(uint256 => uint256) public requestIdToGameId;
    
    // Roulette configuration
    uint8[] public rouletteNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    bool[] public redNumbers = [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false];
    
    // ============ EVENTS ============
    
    event GameStarted(
        uint256 indexed gameId,
        address indexed player,
        GameType gameType,
        uint256 betAmount,
        uint256 timestamp
    );
    
    event GameCompleted(
        uint256 indexed gameId,
        address indexed player,
        GameType gameType,
        bool isWon,
        uint256 payout,
        uint256 randomNumber
    );
    
    event DiceRolled(
        uint256 indexed gameId,
        address indexed player,
        uint8 guess,
        uint8 result,
        bool win,
        uint256 payout
    );
    
    event CoinFlipped(
        uint256 indexed gameId,
        address indexed player,
        CoinSide guess,
        CoinSide result,
        bool win,
        uint256 payout
    );
    
    event RouletteSpun(
        uint256 indexed gameId,
        address indexed player,
        RouletteBetType betType,
        uint8 result,
        bool win,
        uint256 payout
    );
    
    event BetLimitsUpdated(uint256 minBet, uint256 maxBet);
    event MaxPayoutUpdated(uint256 maxPayout);
    event HouseEdgeUpdated(uint256 newEdge);
    
    // ============ MODIFIERS ============
    
    modifier validBetAmount() {
        require(msg.value >= minBet && msg.value <= maxBet, "Invalid bet amount");
        _;
    }
    
    modifier sufficientLiquidity(uint256 betAmount, uint256 maxMultiplier) {
        require(address(this).balance >= betAmount * maxMultiplier, "Insufficient contract liquidity");
        _;
    }
    
    modifier gameExists(uint256 gameId) {
        require(gameId < gameCounter, "Game does not exist");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() payable Ownable(msg.sender) {
        require(msg.value >= 1 ether, "Contract must be funded with at least 1 ETH");
        gameCounter = 0;
    }
    
    // ============ DICE ROLL GAME ============
    
    /**
     * @dev Play dice roll game
     * @param guess Number between 1-6
     * @return gameId The game ID
     */
    function rollDice(uint8 guess) external payable nonReentrant whenNotPaused validBetAmount sufficientLiquidity(msg.value, 6) returns (uint256) {
        require(guess >= 1 && guess <= 6, "Guess must be between 1 and 6");
        
        uint256 gameId = gameCounter++;
        Game storage game = games[gameId];
        
        game.gameId = gameId;
        game.player = msg.sender;
        game.gameType = GameType.DICE_ROLL;
        game.betAmount = msg.value;
        game.timestamp = block.timestamp;
        game.gameData = abi.encode(guess);
        
        // Update player stats
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalGames++;
        stats.totalWagered += msg.value;
        stats.lastPlayed = block.timestamp;
        
        emit GameStarted(gameId, msg.sender, GameType.DICE_ROLL, msg.value, block.timestamp);
        
        // Get random number and complete game
        _completeDiceGame(gameId, guess);
        
        return gameId;
    }
    
    /**
     * @dev Complete dice game with random number
     * @param gameId The game ID
     * @param guess The player's guess
     */
    function _completeDiceGame(uint256 gameId, uint8 guess) internal {
        Game storage game = games[gameId];
        
        uint8 diceResult = _getRandomDiceNumber();
        bool win = guess == diceResult;
        
        uint256 payout = 0;
        if (win) {
            payout = (game.betAmount * 6 * (BASIS_POINTS - HOUSE_EDGE_BASIS_POINTS)) / BASIS_POINTS;
            payout = payout > maxPayout ? maxPayout : payout;
            
            payable(game.player).transfer(payout);
        }
        
        game.payout = payout;
        game.isCompleted = true;
        game.isWon = win;
        game.randomNumber = diceResult;
        
        // Update player stats
        PlayerStats storage stats = playerStats[game.player];
        if (win) {
            stats.totalWins++;
            stats.totalWon += payout;
        } else {
            stats.totalLosses++;
        }
        
        emit DiceRolled(gameId, game.player, guess, diceResult, win, payout);
        emit GameCompleted(gameId, game.player, GameType.DICE_ROLL, win, payout, diceResult);
    }
    
    // ============ COIN FLIP GAME ============
    
    /**
     * @dev Play coin flip game
     * @param guess HEADS or TAILS
     * @return gameId The game ID
     */
    function flipCoin(CoinSide guess) external payable nonReentrant whenNotPaused validBetAmount sufficientLiquidity(msg.value, 2) returns (uint256) {
        uint256 gameId = gameCounter++;
        Game storage game = games[gameId];
        
        game.gameId = gameId;
        game.player = msg.sender;
        game.gameType = GameType.COIN_FLIP;
        game.betAmount = msg.value;
        game.timestamp = block.timestamp;
        game.gameData = abi.encode(guess);
        
        // Update player stats
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalGames++;
        stats.totalWagered += msg.value;
        stats.lastPlayed = block.timestamp;
        
        emit GameStarted(gameId, msg.sender, GameType.COIN_FLIP, msg.value, block.timestamp);
        
        // Get random number and complete game
        _completeCoinGame(gameId, guess);
        
        return gameId;
    }
    
    /**
     * @dev Complete coin flip game with random number
     * @param gameId The game ID
     * @param guess The player's guess
     */
    function _completeCoinGame(uint256 gameId, CoinSide guess) internal {
        Game storage game = games[gameId];
        
        CoinSide result = _getRandomCoinSide();
        bool win = guess == result;
        
        uint256 payout = 0;
        if (win) {
            payout = (game.betAmount * 2 * (BASIS_POINTS - HOUSE_EDGE_BASIS_POINTS)) / BASIS_POINTS;
            payout = payout > maxPayout ? maxPayout : payout;
            
            payable(game.player).transfer(payout);
        }
        
        game.payout = payout;
        game.isCompleted = true;
        game.isWon = win;
        game.randomNumber = uint256(result);
        
        // Update player stats
        PlayerStats storage stats = playerStats[game.player];
        if (win) {
            stats.totalWins++;
            stats.totalWon += payout;
        } else {
            stats.totalLosses++;
        }
        
        emit CoinFlipped(gameId, game.player, guess, result, win, payout);
        emit GameCompleted(gameId, game.player, GameType.COIN_FLIP, win, payout, uint256(result));
    }
    
    // ============ ROULETTE GAME ============
    
    /**
     * @dev Play roulette game
     * @param betType Type of bet (NUMBER, COLOR, RANGE, EVEN_ODD)
     * @param betData Encoded bet data
     * @return gameId The game ID
     */
    function playRoulette(RouletteBetType betType, bytes calldata betData) external payable nonReentrant whenNotPaused validBetAmount sufficientLiquidity(msg.value, 36) returns (uint256) {
        uint256 gameId = gameCounter++;
        Game storage game = games[gameId];
        
        game.gameId = gameId;
        game.player = msg.sender;
        game.gameType = GameType.ROULETTE;
        game.betAmount = msg.value;
        game.timestamp = block.timestamp;
        game.gameData = abi.encode(betType, betData);
        
        // Update player stats
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalGames++;
        stats.totalWagered += msg.value;
        stats.lastPlayed = block.timestamp;
        
        emit GameStarted(gameId, msg.sender, GameType.ROULETTE, msg.value, block.timestamp);
        
        // Get random number and complete game
        _completeRouletteGame(gameId, betType, betData);
        
        return gameId;
    }
    
    /**
     * @dev Complete roulette game with random number
     * @param gameId The game ID
     * @param betType Type of bet
     * @param betData Encoded bet data
     */
    function _completeRouletteGame(uint256 gameId, RouletteBetType betType, bytes calldata betData) internal {
        Game storage game = games[gameId];
        
        uint8 result = _getRandomRouletteNumber();
        bool win = _checkRouletteWin(betType, betData, result);
        
        uint256 payout = 0;
        if (win) {
            uint256 multiplier = _getRouletteMultiplier(betType);
            payout = (game.betAmount * multiplier * (BASIS_POINTS - HOUSE_EDGE_BASIS_POINTS)) / BASIS_POINTS;
            payout = payout > maxPayout ? maxPayout : payout;
            
            payable(game.player).transfer(payout);
        }
        
        game.payout = payout;
        game.isCompleted = true;
        game.isWon = win;
        game.randomNumber = result;
        
        // Update player stats
        PlayerStats storage stats = playerStats[game.player];
        if (win) {
            stats.totalWins++;
            stats.totalWon += payout;
        } else {
            stats.totalLosses++;
        }
        
        emit RouletteSpun(gameId, game.player, betType, result, win, payout);
        emit GameCompleted(gameId, game.player, GameType.ROULETTE, win, payout, result);
    }
    
    // ============ RANDOM NUMBER GENERATION ============
    
    /**
     * @dev Get random dice number (1-6) using Flow EVM VRF
     * @return Random number between 1 and 6
     */
    function _getRandomDiceNumber() internal view returns (uint8) {
        (bool success, bytes memory data) = CADENCE_ARCH.staticcall(
            abi.encodeWithSignature("revertibleRandom()")
        );
        require(success, "VRF call failed");
        
        uint64 rawRandom = abi.decode(data, (uint64));
        return uint8((rawRandom % 6) + 1);
    }
    
    /**
     * @dev Get random coin side using Flow EVM VRF
     * @return HEADS or TAILS
     */
    function _getRandomCoinSide() internal view returns (CoinSide) {
        (bool success, bytes memory data) = CADENCE_ARCH.staticcall(
            abi.encodeWithSignature("revertibleRandom()")
        );
        require(success, "VRF call failed");
        
        uint64 rawRandom = abi.decode(data, (uint64));
        return rawRandom % 2 == 0 ? CoinSide.HEADS : CoinSide.TAILS;
    }
    
    /**
     * @dev Get random roulette number (0-36) using Flow EVM VRF
     * @return Random number between 0 and 36
     */
    function _getRandomRouletteNumber() internal view returns (uint8) {
        (bool success, bytes memory data) = CADENCE_ARCH.staticcall(
            abi.encodeWithSignature("revertibleRandom()")
        );
        require(success, "VRF call failed");
        
        uint64 rawRandom = abi.decode(data, (uint64));
        return uint8(rawRandom % 37); // 0-36
    }
    
    // ============ ROULETTE HELPER FUNCTIONS ============
    
    /**
     * @dev Check if roulette bet wins
     * @param betType Type of bet
     * @param betData Encoded bet data
     * @param result Roulette result
     * @return True if bet wins
     */
    function _checkRouletteWin(RouletteBetType betType, bytes calldata betData, uint8 result) internal view returns (bool) {
        if (betType == RouletteBetType.NUMBER) {
            uint8 betNumber = abi.decode(betData, (uint8));
            return result == betNumber;
        } else if (betType == RouletteBetType.COLOR) {
            bool betIsRed = abi.decode(betData, (bool));
            return result != 0 && redNumbers[result] == betIsRed;
        } else if (betType == RouletteBetType.RANGE) {
            (uint8 start, uint8 end) = abi.decode(betData, (uint8, uint8));
            return result >= start && result <= end;
        } else if (betType == RouletteBetType.EVEN_ODD) {
            bool betIsEven = abi.decode(betData, (bool));
            return result != 0 && (result % 2 == 0) == betIsEven;
        }
        return false;
    }
    
    /**
     * @dev Get roulette bet multiplier
     * @param betType Type of bet
     * @return Multiplier for payout calculation
     */
    function _getRouletteMultiplier(RouletteBetType betType) internal pure returns (uint256) {
        if (betType == RouletteBetType.NUMBER) {
            return 36; // Single number bet
        } else if (betType == RouletteBetType.COLOR) {
            return 2; // Red/Black bet
        } else if (betType == RouletteBetType.RANGE) {
            return 3; // Dozen bet (1-12, 13-24, 25-36)
        } else if (betType == RouletteBetType.EVEN_ODD) {
            return 2; // Even/Odd bet
        }
        return 1;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get game details
     * @param gameId The game ID
     * @return Game details
     */
    function getGame(uint256 gameId) external view gameExists(gameId) returns (Game memory) {
        return games[gameId];
    }
    
    /**
     * @dev Get player statistics
     * @param player Player address
     * @return Player statistics
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }
    
    /**
     * @dev Get player win rate
     * @param player Player address
     * @return Win rate as percentage (0-10000)
     */
    function getPlayerWinRate(address player) external view returns (uint256) {
        PlayerStats memory stats = playerStats[player];
        if (stats.totalGames == 0) return 0;
        return (stats.totalWins * BASIS_POINTS) / stats.totalGames;
    }
    
    /**
     * @dev Get contract balance
     * @return Contract balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update bet limits
     * @param _minBet Minimum bet amount
     * @param _maxBet Maximum bet amount
     */
    function setBetLimits(uint256 _minBet, uint256 _maxBet) external onlyOwner {
        require(_minBet < _maxBet, "Invalid bet limits");
        minBet = _minBet;
        maxBet = _maxBet;
        emit BetLimitsUpdated(_minBet, _maxBet);
    }
    
    /**
     * @dev Update maximum payout
     * @param _maxPayout Maximum payout amount
     */
    function setMaxPayout(uint256 _maxPayout) external onlyOwner {
        maxPayout = _maxPayout;
        emit MaxPayoutUpdated(_maxPayout);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    /**
     * @dev Fund the contract with ETH
     */
    function fundContract() external payable onlyOwner {
        require(msg.value > 0, "Must send some ETH");
    }
    
    // ============ RECEIVE FUNCTION ============
    
    /**
     * @dev Accept deposits for funding the casino
     */
    receive() external payable {}
} 