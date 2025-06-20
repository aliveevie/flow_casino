// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

/**
 * @title NFT Raffles & Auctions
 * @dev A provably fair decentralized NFT raffle and auction system with VRF integration
 * @author Your Name
 * @notice This contract enables fair NFT raffles and auctions with transparent random winner selection
 */
contract NFTRaffles is ReentrancyGuard, Ownable, VRFConsumerBaseV2 {
    
    // ============ STRUCTS ============
    
    struct Raffle {
        uint256 raffleId;
        address nftContract;
        uint256 tokenId;
        address creator;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 soldTickets;
        uint256 totalPrizePool;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isDrawn;
        address winner;
        uint256 requestId;
        uint256 randomNumber;
        mapping(address => uint256) ticketsPurchased;
        address[] participants;
    }
    
    struct Auction {
        uint256 auctionId;
        address nftContract;
        uint256 tokenId;
        address creator;
        uint256 startingBid;
        uint256 currentBid;
        address highestBidder;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isEnded;
        bool isClaimed;
    }
    
    // ============ STATE VARIABLES ============
    
    VRFCoordinatorV2Interface private immutable COORDINATOR;
    bytes32 private immutable KEY_HASH;
    uint64 private immutable SUBSCRIPTION_ID;
    uint16 private immutable REQUEST_CONFIRMATIONS;
    uint32 private immutable CALLBACK_GAS_LIMIT;
    
    uint256 public raffleCounter;
    uint256 public auctionCounter;
    uint256 public protocolFee = 250; // 2.5% (250 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    
    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => uint256) public requestIdToRaffleId;
    
    // ============ EVENTS ============
    
    event RaffleCreated(
        uint256 indexed raffleId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address creator,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 startTime,
        uint256 endTime
    );
    
    event TicketPurchased(
        uint256 indexed raffleId,
        address indexed buyer,
        uint256 quantity,
        uint256 totalCost
    );
    
    event RaffleDrawn(
        uint256 indexed raffleId,
        address indexed winner,
        uint256 randomNumber
    );
    
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address creator,
        uint256 startingBid,
        uint256 startTime,
        uint256 endTime
    );
    
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    
    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 finalBid
    );
    
    event ProtocolFeeUpdated(uint256 newFee);
    event EmergencyWithdraw(address indexed token, uint256 amount);
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint16 _requestConfirmations,
        uint32 _callbackGasLimit
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        KEY_HASH = _keyHash;
        SUBSCRIPTION_ID = _subscriptionId;
        REQUEST_CONFIRMATIONS = _requestConfirmations;
        CALLBACK_GAS_LIMIT = _callbackGasLimit;
    }
    
    // ============ MODIFIERS ============
    
    modifier onlyRaffleCreator(uint256 _raffleId) {
        require(raffles[_raffleId].creator == msg.sender, "Not raffle creator");
        _;
    }
    
    modifier onlyAuctionCreator(uint256 _auctionId) {
        require(auctions[_auctionId].creator == msg.sender, "Not auction creator");
        _;
    }
    
    modifier raffleExists(uint256 _raffleId) {
        require(_raffleId < raffleCounter, "Raffle does not exist");
        _;
    }
    
    modifier auctionExists(uint256 _auctionId) {
        require(_auctionId < auctionCounter, "Auction does not exist");
        _;
    }
    
    modifier raffleActive(uint256 _raffleId) {
        require(raffles[_raffleId].isActive, "Raffle not active");
        require(block.timestamp >= raffles[_raffleId].startTime, "Raffle not started");
        require(block.timestamp <= raffles[_raffleId].endTime, "Raffle ended");
        _;
    }
    
    modifier auctionActive(uint256 _auctionId) {
        require(auctions[_auctionId].isActive, "Auction not active");
        require(block.timestamp >= auctions[_auctionId].startTime, "Auction not started");
        require(block.timestamp <= auctions[_auctionId].endTime, "Auction ended");
        _;
    }
    
    // ============ RAFFLE FUNCTIONS ============
    
    /**
     * @dev Create a new NFT raffle
     * @param _nftContract Address of the NFT contract
     * @param _tokenId ID of the NFT token
     * @param _ticketPrice Price per ticket in wei
     * @param _maxTickets Maximum number of tickets that can be sold
     * @param _duration Duration of the raffle in seconds
     */
    function createRaffle(
        address _nftContract,
        uint256 _tokenId,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _duration
    ) external nonReentrant {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_maxTickets > 0, "Max tickets must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        // Transfer NFT to contract
        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);
        
        uint256 raffleId = raffleCounter++;
        Raffle storage raffle = raffles[raffleId];
        
        raffle.raffleId = raffleId;
        raffle.nftContract = _nftContract;
        raffle.tokenId = _tokenId;
        raffle.creator = msg.sender;
        raffle.ticketPrice = _ticketPrice;
        raffle.maxTickets = _maxTickets;
        raffle.startTime = block.timestamp;
        raffle.endTime = block.timestamp + _duration;
        raffle.isActive = true;
        
        emit RaffleCreated(
            raffleId,
            _nftContract,
            _tokenId,
            msg.sender,
            _ticketPrice,
            _maxTickets,
            raffle.startTime,
            raffle.endTime
        );
    }
    
    /**
     * @dev Purchase tickets for a raffle
     * @param _raffleId ID of the raffle
     * @param _quantity Number of tickets to purchase
     */
    function purchaseTickets(
        uint256 _raffleId,
        uint256 _quantity
    ) external payable nonReentrant raffleExists(_raffleId) raffleActive(_raffleId) {
        Raffle storage raffle = raffles[_raffleId];
        
        require(_quantity > 0, "Quantity must be greater than 0");
        require(raffle.soldTickets + _quantity <= raffle.maxTickets, "Exceeds max tickets");
        require(msg.value == raffle.ticketPrice * _quantity, "Incorrect payment amount");
        
        // Update raffle state
        raffle.soldTickets += _quantity;
        raffle.totalPrizePool += msg.value;
        raffle.ticketsPurchased[msg.sender] += _quantity;
        
        // Add to participants if not already included
        if (raffle.ticketsPurchased[msg.sender] == _quantity) {
            raffle.participants.push(msg.sender);
        }
        
        emit TicketPurchased(_raffleId, msg.sender, _quantity, msg.value);
    }
    
    /**
     * @dev Draw the raffle winner using VRF
     * @param _raffleId ID of the raffle to draw
     */
    function drawRaffle(
        uint256 _raffleId
    ) external nonReentrant raffleExists(_raffleId) onlyRaffleCreator(_raffleId) {
        Raffle storage raffle = raffles[_raffleId];
        
        require(raffle.isActive, "Raffle not active");
        require(block.timestamp > raffle.endTime, "Raffle not ended");
        require(!raffle.isDrawn, "Raffle already drawn");
        require(raffle.soldTickets > 0, "No tickets sold");
        
        // Request random number from VRF
        uint256 requestId = COORDINATOR.requestRandomWords(
            KEY_HASH,
            SUBSCRIPTION_ID,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            1
        );
        
        raffle.requestId = requestId;
        requestIdToRaffleId[requestId] = _raffleId;
    }
    
    /**
     * @dev VRF callback function to receive random number and select winner
     * @param _requestId The request ID from VRF
     * @param _randomWords Array of random words (we only use the first one)
     */
    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        uint256 raffleId = requestIdToRaffleId[_requestId];
        require(raffleId != 0, "Invalid request ID");
        
        Raffle storage raffle = raffles[raffleId];
        require(!raffle.isDrawn, "Raffle already drawn");
        
        uint256 randomNumber = _randomWords[0];
        raffle.randomNumber = randomNumber;
        
        // Select winner based on random number
        address winner = selectWinner(raffle, randomNumber);
        raffle.winner = winner;
        raffle.isDrawn = true;
        raffle.isActive = false;
        
        // Transfer NFT to winner
        IERC721(raffle.nftContract).transferFrom(address(this), winner, raffle.tokenId);
        
        // Transfer prize pool to winner (minus protocol fee)
        uint256 protocolFeeAmount = (raffle.totalPrizePool * protocolFee) / BASIS_POINTS;
        uint256 winnerAmount = raffle.totalPrizePool - protocolFeeAmount;
        
        if (winnerAmount > 0) {
            payable(winner).transfer(winnerAmount);
        }
        
        emit RaffleDrawn(raffleId, winner, randomNumber);
    }
    
    /**
     * @dev Select winner based on random number and ticket distribution
     * @param _raffle The raffle struct
     * @param _randomNumber The random number from VRF
     * @return The address of the winner
     */
    function selectWinner(
        Raffle storage _raffle,
        uint256 _randomNumber
    ) internal view returns (address) {
        uint256 winningTicket = _randomNumber % _raffle.soldTickets;
        uint256 currentTicket = 0;
        
        for (uint256 i = 0; i < _raffle.participants.length; i++) {
            address participant = _raffle.participants[i];
            uint256 tickets = _raffle.ticketsPurchased[participant];
            
            if (winningTicket >= currentTicket && winningTicket < currentTicket + tickets) {
                return participant;
            }
            currentTicket += tickets;
        }
        
        revert("Winner selection failed");
    }
    
    // ============ AUCTION FUNCTIONS ============
    
    /**
     * @dev Create a new NFT auction
     * @param _nftContract Address of the NFT contract
     * @param _tokenId ID of the NFT token
     * @param _startingBid Minimum starting bid in wei
     * @param _duration Duration of the auction in seconds
     */
    function createAuction(
        address _nftContract,
        uint256 _tokenId,
        uint256 _startingBid,
        uint256 _duration
    ) external nonReentrant {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_startingBid > 0, "Starting bid must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        // Transfer NFT to contract
        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);
        
        uint256 auctionId = auctionCounter++;
        Auction storage auction = auctions[auctionId];
        
        auction.auctionId = auctionId;
        auction.nftContract = _nftContract;
        auction.tokenId = _tokenId;
        auction.creator = msg.sender;
        auction.startingBid = _startingBid;
        auction.currentBid = _startingBid;
        auction.startTime = block.timestamp;
        auction.endTime = block.timestamp + _duration;
        auction.isActive = true;
        
        emit AuctionCreated(
            auctionId,
            _nftContract,
            _tokenId,
            msg.sender,
            _startingBid,
            auction.startTime,
            auction.endTime
        );
    }
    
    /**
     * @dev Place a bid on an auction
     * @param _auctionId ID of the auction
     */
    function placeBid(
        uint256 _auctionId
    ) external payable nonReentrant auctionExists(_auctionId) auctionActive(_auctionId) {
        Auction storage auction = auctions[_auctionId];
        
        require(msg.value > auction.currentBid, "Bid too low");
        require(msg.sender != auction.creator, "Creator cannot bid");
        
        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.currentBid);
        }
        
        auction.currentBid = msg.value;
        auction.highestBidder = msg.sender;
        
        emit BidPlaced(_auctionId, msg.sender, msg.value);
    }
    
    /**
     * @dev End an auction and transfer NFT to winner
     * @param _auctionId ID of the auction to end
     */
    function endAuction(
        uint256 _auctionId
    ) external nonReentrant auctionExists(_auctionId) {
        Auction storage auction = auctions[_auctionId];
        
        require(auction.isActive, "Auction not active");
        require(block.timestamp > auction.endTime, "Auction not ended");
        
        auction.isActive = false;
        auction.isEnded = true;
        
        if (auction.highestBidder != address(0)) {
            // Transfer NFT to winner
            IERC721(auction.nftContract).transferFrom(
                address(this),
                auction.highestBidder,
                auction.tokenId
            );
            
            // Transfer bid amount to creator (minus protocol fee)
            uint256 protocolFeeAmount = (auction.currentBid * protocolFee) / BASIS_POINTS;
            uint256 creatorAmount = auction.currentBid - protocolFeeAmount;
            
            payable(auction.creator).transfer(creatorAmount);
            
            emit AuctionEnded(_auctionId, auction.highestBidder, auction.currentBid);
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get raffle details
     * @param _raffleId ID of the raffle
     * @return All raffle information
     */
    function getRaffle(
        uint256 _raffleId
    ) external view raffleExists(_raffleId) returns (
        uint256 raffleId,
        address nftContract,
        uint256 tokenId,
        address creator,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 soldTickets,
        uint256 totalPrizePool,
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        bool isDrawn,
        address winner,
        uint256 randomNumber
    ) {
        Raffle storage raffle = raffles[_raffleId];
        return (
            raffle.raffleId,
            raffle.nftContract,
            raffle.tokenId,
            raffle.creator,
            raffle.ticketPrice,
            raffle.maxTickets,
            raffle.soldTickets,
            raffle.totalPrizePool,
            raffle.startTime,
            raffle.endTime,
            raffle.isActive,
            raffle.isDrawn,
            raffle.winner,
            raffle.randomNumber
        );
    }
    
    /**
     * @dev Get auction details
     * @param _auctionId ID of the auction
     * @return All auction information
     */
    function getAuction(
        uint256 _auctionId
    ) external view auctionExists(_auctionId) returns (
        uint256 auctionId,
        address nftContract,
        uint256 tokenId,
        address creator,
        uint256 startingBid,
        uint256 currentBid,
        address highestBidder,
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        bool isEnded,
        bool isClaimed
    ) {
        Auction storage auction = auctions[_auctionId];
        return (
            auction.auctionId,
            auction.nftContract,
            auction.tokenId,
            auction.creator,
            auction.startingBid,
            auction.currentBid,
            auction.highestBidder,
            auction.startTime,
            auction.endTime,
            auction.isActive,
            auction.isEnded,
            auction.isClaimed
        );
    }
    
    /**
     * @dev Get user's tickets for a raffle
     * @param _raffleId ID of the raffle
     * @param _user Address of the user
     * @return Number of tickets owned by user
     */
    function getUserTickets(
        uint256 _raffleId,
        address _user
    ) external view raffleExists(_raffleId) returns (uint256) {
        return raffles[_raffleId].ticketsPurchased[_user];
    }
    
    /**
     * @dev Get raffle participants
     * @param _raffleId ID of the raffle
     * @return Array of participant addresses
     */
    function getRaffleParticipants(
        uint256 _raffleId
    ) external view raffleExists(_raffleId) returns (address[] memory) {
        return raffles[_raffleId].participants;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update protocol fee (only owner)
     * @param _newFee New protocol fee in basis points
     */
    function updateProtocolFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee cannot exceed 10%");
        protocolFee = _newFee;
        emit ProtocolFeeUpdated(_newFee);
    }
    
    /**
     * @dev Emergency withdraw function (only owner)
     * @param _token Address of token to withdraw (address(0) for ETH)
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(
        address _token,
        uint256 _amount
    ) external onlyOwner {
        if (_token == address(0)) {
            payable(owner()).transfer(_amount);
        } else {
            IERC20(_token).transfer(owner(), _amount);
        }
        emit EmergencyWithdraw(_token, _amount);
    }
    
    // ============ RECEIVE FUNCTION ============
    
    receive() external payable {
        // Allow contract to receive ETH
    }
} 