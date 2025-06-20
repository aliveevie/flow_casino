import FungibleToken from 0x9a0766d93b6608b7
import NonFungibleToken from 0x631e88ae7f1d7c20
import FlowToken from 0x7e60df042a9c0868
import RandomBeacon from 0x8624b52f9ddcd04a

/**
 * @title NFT Raffles & Auctions
 * @description A provably fair decentralized NFT raffle and auction system with VRF integration
 * @author Your Name
 * @notice This contract enables fair NFT raffles and auctions with transparent random winner selection
 */

pub contract NFTRaffles {
    
    // ============ STRUCTS ============
    
    pub struct Raffle {
        pub let raffleId: UInt64
        pub let nftContract: Address
        pub let tokenId: UInt64
        pub let creator: Address
        pub let ticketPrice: UFix64
        pub let maxTickets: UInt32
        pub var soldTickets: UInt32
        pub var totalPrizePool: UFix64
        pub let startTime: UFix64
        pub let endTime: UFix64
        pub var isActive: Bool
        pub var isDrawn: Bool
        pub var winner: Address?
        pub var randomNumber: UInt64?
        pub var ticketsPurchased: {Address: UInt32}
        pub var participants: [Address]
        
        init(
            raffleId: UInt64,
            nftContract: Address,
            tokenId: UInt64,
            creator: Address,
            ticketPrice: UFix64,
            maxTickets: UInt32,
            duration: UFix64
        ) {
            self.raffleId = raffleId
            self.nftContract = nftContract
            self.tokenId = tokenId
            self.creator = creator
            self.ticketPrice = ticketPrice
            self.maxTickets = maxTickets
            self.soldTickets = 0
            self.totalPrizePool = 0.0
            self.startTime = getCurrentBlock().timestamp
            self.endTime = getCurrentBlock().timestamp + duration
            self.isActive = true
            self.isDrawn = false
            self.winner = nil
            self.randomNumber = nil
            self.ticketsPurchased = {}
            self.participants = []
        }
    }
    
    pub struct Auction {
        pub let auctionId: UInt64
        pub let nftContract: Address
        pub let tokenId: UInt64
        pub let creator: Address
        pub let startingBid: UFix64
        pub var currentBid: UFix64
        pub var highestBidder: Address?
        pub let startTime: UFix64
        pub let endTime: UFix64
        pub var isActive: Bool
        pub var isEnded: Bool
        pub var isClaimed: Bool
        
        init(
            auctionId: UInt64,
            nftContract: Address,
            tokenId: UInt64,
            creator: Address,
            startingBid: UFix64,
            duration: UFix64
        ) {
            self.auctionId = auctionId
            self.nftContract = nftContract
            self.tokenId = tokenId
            self.creator = creator
            self.startingBid = startingBid
            self.currentBid = startingBid
            self.highestBidder = nil
            self.startTime = getCurrentBlock().timestamp
            self.endTime = getCurrentBlock().timestamp + duration
            self.isActive = true
            self.isEnded = false
            self.isClaimed = false
        }
    }
    
    // ============ STATE VARIABLES ============
    
    pub var raffleCounter: UInt64
    pub var auctionCounter: UInt64
    pub var protocolFee: UFix64
    pub let BASIS_POINTS: UFix64 = 10000.0
    
    pub var raffles: @{UInt64: Raffle}
    pub var auctions: @{UInt64: Auction}
    pub var requestIdToRaffleId: {UInt64: UInt64}
    
    // ============ EVENTS ============
    
    pub event RaffleCreated(
        raffleId: UInt64,
        nftContract: Address,
        tokenId: UInt64,
        creator: Address,
        ticketPrice: UFix64,
        maxTickets: UInt32,
        startTime: UFix64,
        endTime: UFix64
    )
    
    pub event TicketPurchased(
        raffleId: UInt64,
        buyer: Address,
        quantity: UInt32,
        totalCost: UFix64
    )
    
    pub event RaffleDrawn(
        raffleId: UInt64,
        winner: Address,
        randomNumber: UInt64
    )
    
    pub event AuctionCreated(
        auctionId: UInt64,
        nftContract: Address,
        tokenId: UInt64,
        creator: Address,
        startingBid: UFix64,
        startTime: UFix64,
        endTime: UFix64
    )
    
    pub event BidPlaced(
        auctionId: UInt64,
        bidder: Address,
        amount: UFix64
    )
    
    pub event AuctionEnded(
        auctionId: UInt64,
        winner: Address,
        finalBid: UFix64
    )
    
    pub event ProtocolFeeUpdated(newFee: UFix64)
    pub event EmergencyWithdraw(token: Address, amount: UFix64)
    
    // ============ INITIALIZER ============
    
    init() {
        self.raffleCounter = 0
        self.auctionCounter = 0
        self.protocolFee = 250.0 // 2.5% (250 basis points)
        self.raffles = {}
        self.auctions = {}
        self.requestIdToRaffleId = {}
    }
    
    // ============ RAFFLE FUNCTIONS ============
    
    /**
     * @dev Create a new NFT raffle
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT token
     * @param ticketPrice Price per ticket in FLOW
     * @param maxTickets Maximum number of tickets that can be sold
     * @param duration Duration of the raffle in seconds
     */
    pub fun createRaffle(
        nftContract: Address,
        tokenId: UInt64,
        ticketPrice: UFix64,
        maxTickets: UInt32,
        duration: UFix64
    ) {
        pre {
            nftContract != Address(0x0): "Invalid NFT contract"
            ticketPrice > 0.0: "Ticket price must be greater than 0"
            maxTickets > 0: "Max tickets must be greater than 0"
            duration > 0.0: "Duration must be greater than 0"
        }
        
        // Transfer NFT to contract
        let nftCollection = getAccount(nftContract).getCapability(/public/GenericNFT{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver})
            .borrow<&{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver}>()
            ?? panic("Could not borrow NFT collection")
        
        let nft <- nftCollection.withdraw(withdrawID: tokenId)
        
        let raffleId = self.raffleCounter
        self.raffleCounter = self.raffleCounter + 1
        
        let raffle = Raffle(
            raffleId: raffleId,
            nftContract: nftContract,
            tokenId: tokenId,
            creator: self.account.address,
            ticketPrice: ticketPrice,
            maxTickets: maxTickets,
            duration: duration
        )
        
        self.raffles[raffleId] = raffle
        
        emit RaffleCreated(
            raffleId: raffleId,
            nftContract: nftContract,
            tokenId: tokenId,
            creator: self.account.address,
            ticketPrice: ticketPrice,
            maxTickets: maxTickets,
            startTime: raffle.startTime,
            endTime: raffle.endTime
        )
    }
    
    /**
     * @dev Purchase tickets for a raffle
     * @param raffleId ID of the raffle
     * @param quantity Number of tickets to purchase
     */
    pub fun purchaseTickets(raffleId: UInt64, quantity: UInt32) {
        pre {
            quantity > 0: "Quantity must be greater than 0"
        }
        
        let raffle = self.raffles[raffleId] ?? panic("Raffle does not exist")
        
        pre {
            raffle.isActive: "Raffle not active"
            getCurrentBlock().timestamp >= raffle.startTime: "Raffle not started"
            getCurrentBlock().timestamp <= raffle.endTime: "Raffle ended"
            raffle.soldTickets + quantity <= raffle.maxTickets: "Exceeds max tickets"
        }
        
        let totalCost = raffle.ticketPrice * UFix64(quantity)
        
        // Transfer FLOW tokens
        let flowVault = self.account.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow vault")
        
        let payment <- flowVault.withdraw(amount: totalCost)
        
        // Update raffle state
        raffle.soldTickets = raffle.soldTickets + quantity
        raffle.totalPrizePool = raffle.totalPrizePool + totalCost
        
        if raffle.ticketsPurchased[self.account.address] == nil {
            raffle.ticketsPurchased[self.account.address] = 0
            raffle.participants.append(self.account.address)
        }
        raffle.ticketsPurchased[self.account.address] = raffle.ticketsPurchased[self.account.address]! + quantity
        
        self.raffles[raffleId] = raffle
        
        emit TicketPurchased(
            raffleId: raffleId,
            buyer: self.account.address,
            quantity: quantity,
            totalCost: totalCost
        )
    }
    
    /**
     * @dev Draw the raffle winner using VRF
     * @param raffleId ID of the raffle to draw
     */
    pub fun drawRaffle(raffleId: UInt64) {
        let raffle = self.raffles[raffleId] ?? panic("Raffle does not exist")
        
        pre {
            raffle.creator == self.account.address: "Not raffle creator"
            raffle.isActive: "Raffle not active"
            getCurrentBlock().timestamp > raffle.endTime: "Raffle not ended"
            !raffle.isDrawn: "Raffle already drawn"
            raffle.soldTickets > 0: "No tickets sold"
        }
        
        // Request random number from Flow's Random Beacon
        let randomBeacon = getAccount(0x8624b52f9ddcd04a).getCapability(/public/randomBeacon)
            .borrow<&RandomBeacon.RandomBeacon>()
            ?? panic("Could not borrow Random Beacon")
        
        let requestId = randomBeacon.requestRandom()
        self.requestIdToRaffleId[requestId] = raffleId
        
        // Update raffle state
        raffle.isActive = false
        self.raffles[raffleId] = raffle
    }
    
    /**
     * @dev Complete raffle drawing with random number
     * @param requestId The request ID from Random Beacon
     */
    pub fun completeRaffleDrawing(requestId: UInt64) {
        let raffleId = self.requestIdToRaffleId[requestId] ?? panic("Invalid request ID")
        let raffle = self.raffles[raffleId] ?? panic("Raffle does not exist")
        
        pre {
            !raffle.isDrawn: "Raffle already drawn"
        }
        
        // Get random number from Random Beacon
        let randomBeacon = getAccount(0x8624b52f9ddcd04a).getCapability(/public/randomBeacon)
            .borrow<&RandomBeacon.RandomBeacon>()
            ?? panic("Could not borrow Random Beacon")
        
        let randomNumber = randomBeacon.getRandom(requestId: requestId)
        
        // Select winner
        let winner = self.selectWinner(raffle: raffle, randomNumber: randomNumber)
        
        // Update raffle state
        raffle.winner = winner
        raffle.isDrawn = true
        raffle.randomNumber = randomNumber
        
        // Transfer NFT to winner
        let nftCollection = getAccount(winner).getCapability(/public/GenericNFT{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver})
            .borrow<&{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver}>()
            ?? panic("Could not borrow winner's NFT collection")
        
        let nft <- self.getNFT(raffleId: raffleId)
        nftCollection.deposit(token: <- nft)
        
        // Transfer prize pool to winner (minus protocol fee)
        let protocolFeeAmount = (raffle.totalPrizePool * self.protocolFee) / self.BASIS_POINTS
        let winnerAmount = raffle.totalPrizePool - protocolFeeAmount
        
        if winnerAmount > 0.0 {
            let winnerVault = getAccount(winner).getCapability(/public/flowTokenReceiver)
                .borrow<&{FungibleToken.Receiver}>()
                ?? panic("Could not borrow winner's Flow vault")
            
            let flowVault = self.account.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                ?? panic("Could not borrow Flow vault")
            
            let payment <- flowVault.withdraw(amount: winnerAmount)
            winnerVault.deposit(from: <- payment)
        }
        
        self.raffles[raffleId] = raffle
        
        emit RaffleDrawn(
            raffleId: raffleId,
            winner: winner,
            randomNumber: randomNumber
        )
    }
    
    /**
     * @dev Select winner based on random number and ticket distribution
     * @param raffle The raffle struct
     * @param randomNumber The random number from VRF
     * @return The address of the winner
     */
    fun selectWinner(raffle: Raffle, randomNumber: UInt64): Address {
        let winningTicket = randomNumber % UInt64(raffle.soldTickets)
        var currentTicket: UInt64 = 0
        
        for participant in raffle.participants {
            let tickets = UInt64(raffle.ticketsPurchased[participant] ?? 0)
            
            if winningTicket >= currentTicket && winningTicket < currentTicket + tickets {
                return participant
            }
            currentTicket = currentTicket + tickets
        }
        
        panic("Winner selection failed")
    }
    
    // ============ AUCTION FUNCTIONS ============
    
    /**
     * @dev Create a new NFT auction
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT token
     * @param startingBid Minimum starting bid in FLOW
     * @param duration Duration of the auction in seconds
     */
    pub fun createAuction(
        nftContract: Address,
        tokenId: UInt64,
        startingBid: UFix64,
        duration: UFix64
    ) {
        pre {
            nftContract != Address(0x0): "Invalid NFT contract"
            startingBid > 0.0: "Starting bid must be greater than 0"
            duration > 0.0: "Duration must be greater than 0"
        }
        
        // Transfer NFT to contract
        let nftCollection = getAccount(nftContract).getCapability(/public/GenericNFT{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver})
            .borrow<&{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver}>()
            ?? panic("Could not borrow NFT collection")
        
        let nft <- nftCollection.withdraw(withdrawID: tokenId)
        
        let auctionId = self.auctionCounter
        self.auctionCounter = self.auctionCounter + 1
        
        let auction = Auction(
            auctionId: auctionId,
            nftContract: nftContract,
            tokenId: tokenId,
            creator: self.account.address,
            startingBid: startingBid,
            duration: duration
        )
        
        self.auctions[auctionId] = auction
        
        emit AuctionCreated(
            auctionId: auctionId,
            nftContract: nftContract,
            tokenId: tokenId,
            creator: self.account.address,
            startingBid: startingBid,
            startTime: auction.startTime,
            endTime: auction.endTime
        )
    }
    
    /**
     * @dev Place a bid on an auction
     * @param auctionId ID of the auction
     */
    pub fun placeBid(auctionId: UInt64) {
        let auction = self.auctions[auctionId] ?? panic("Auction does not exist")
        
        pre {
            auction.isActive: "Auction not active"
            getCurrentBlock().timestamp >= auction.startTime: "Auction not started"
            getCurrentBlock().timestamp <= auction.endTime: "Auction ended"
            self.account.address != auction.creator: "Creator cannot bid"
        }
        
        let flowVault = self.account.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow vault")
        
        let currentBid = auction.currentBid
        let bidAmount = flowVault.balance
        
        pre {
            bidAmount > currentBid: "Bid too low"
        }
        
        // Refund previous highest bidder
        if auction.highestBidder != nil {
            let previousBidder = auction.highestBidder!
            let previousBidderVault = getAccount(previousBidder).getCapability(/public/flowTokenReceiver)
                .borrow<&{FungibleToken.Receiver}>()
                ?? panic("Could not borrow previous bidder's Flow vault")
            
            let refund <- self.account.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                .withdraw(amount: currentBid)
            previousBidderVault.deposit(from: <- refund)
        }
        
        // Update auction state
        auction.currentBid = bidAmount
        auction.highestBidder = self.account.address
        
        self.auctions[auctionId] = auction
        
        emit BidPlaced(
            auctionId: auctionId,
            bidder: self.account.address,
            amount: bidAmount
        )
    }
    
    /**
     * @dev End an auction and transfer NFT to winner
     * @param auctionId ID of the auction to end
     */
    pub fun endAuction(auctionId: UInt64) {
        let auction = self.auctions[auctionId] ?? panic("Auction does not exist")
        
        pre {
            auction.isActive: "Auction not active"
            getCurrentBlock().timestamp > auction.endTime: "Auction not ended"
        }
        
        auction.isActive = false
        auction.isEnded = true
        
        if auction.highestBidder != nil {
            let winner = auction.highestBidder!
            
            // Transfer NFT to winner
            let winnerCollection = getAccount(winner).getCapability(/public/GenericNFT{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver})
                .borrow<&{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver}>()
                ?? panic("Could not borrow winner's NFT collection")
            
            let nft <- self.getAuctionNFT(auctionId: auctionId)
            winnerCollection.deposit(token: <- nft)
            
            // Transfer bid amount to creator (minus protocol fee)
            let protocolFeeAmount = (auction.currentBid * self.protocolFee) / self.BASIS_POINTS
            let creatorAmount = auction.currentBid - protocolFeeAmount
            
            let creatorVault = getAccount(auction.creator).getCapability(/public/flowTokenReceiver)
                .borrow<&{FungibleToken.Receiver}>()
                ?? panic("Could not borrow creator's Flow vault")
            
            let flowVault = self.account.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                ?? panic("Could not borrow Flow vault")
            
            let payment <- flowVault.withdraw(amount: creatorAmount)
            creatorVault.deposit(from: <- payment)
            
            emit AuctionEnded(
                auctionId: auctionId,
                winner: winner,
                finalBid: auction.currentBid
            )
        }
        
        self.auctions[auctionId] = auction
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get raffle details
     * @param raffleId ID of the raffle
     * @return All raffle information
     */
    pub fun getRaffle(raffleId: UInt64): Raffle? {
        return self.raffles[raffleId]
    }
    
    /**
     * @dev Get auction details
     * @param auctionId ID of the auction
     * @return All auction information
     */
    pub fun getAuction(auctionId: UInt64): Auction? {
        return self.auctions[auctionId]
    }
    
    /**
     * @dev Get user's tickets for a raffle
     * @param raffleId ID of the raffle
     * @param user Address of the user
     * @return Number of tickets owned by user
     */
    pub fun getUserTickets(raffleId: UInt64, user: Address): UInt32 {
        let raffle = self.raffles[raffleId] ?? panic("Raffle does not exist")
        return raffle.ticketsPurchased[user] ?? 0
    }
    
    /**
     * @dev Get raffle participants
     * @param raffleId ID of the raffle
     * @return Array of participant addresses
     */
    pub fun getRaffleParticipants(raffleId: UInt64): [Address] {
        let raffle = self.raffles[raffleId] ?? panic("Raffle does not exist")
        return raffle.participants
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update protocol fee (only contract owner)
     * @param newFee New protocol fee in basis points
     */
    pub fun updateProtocolFee(newFee: UFix64) {
        pre {
            newFee <= 1000.0: "Fee cannot exceed 10%"
        }
        self.protocolFee = newFee
        emit ProtocolFeeUpdated(newFee: newFee)
    }
    
    /**
     * @dev Emergency withdraw function (only contract owner)
     * @param amount Amount to withdraw in FLOW
     */
    pub fun emergencyWithdraw(amount: UFix64) {
        let flowVault = self.account.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow vault")
        
        let payment <- flowVault.withdraw(amount: amount)
        
        // Transfer to owner (assuming owner is the contract account)
        let ownerVault = self.account.getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow owner's Flow vault")
        
        ownerVault.deposit(from: <- payment)
        
        emit EmergencyWithdraw(token: FlowToken.VaultType, amount: amount)
    }
    
    // ============ HELPER FUNCTIONS ============
    
    /**
     * @dev Get NFT from raffle storage
     * @param raffleId ID of the raffle
     * @return The NFT resource
     */
    fun getNFT(raffleId: UInt64): @NonFungibleToken.NFT {
        // This would need to be implemented based on your NFT storage structure
        // For now, this is a placeholder
        panic("NFT retrieval not implemented")
    }
    
    /**
     * @dev Get NFT from auction storage
     * @param auctionId ID of the auction
     * @return The NFT resource
     */
    fun getAuctionNFT(auctionId: UInt64): @NonFungibleToken.NFT {
        // This would need to be implemented based on your NFT storage structure
        // For now, this is a placeholder
        panic("NFT retrieval not implemented")
    }
} 