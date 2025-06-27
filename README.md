# 🎲 Flow Casino - Provably Fair Decentralized Gaming

<div align="center">

[![Demo](https://img.shields.io/badge/🎮_Live_Demo-flowcasino.vercel.app-blue?style=for-the-badge)](https://flowcasino.vercel.app/)
[![Video](https://img.shields.io/badge/📹_Demo_Video-GitHub-black?style=for-the-badge)](https://github.com/aliveevie/flow_casino)
[![Flow](https://img.shields.io/badge/Built_on-Flow_EVM-00D4AA?style=for-the-badge&logo=flow)](https://flow.com/)
[![React](https://img.shields.io/badge/Frontend-React_+_TypeScript-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)

*A decentralized dice casino game powered by Flow blockchain with provably fair gaming*

[🎯 Play Now](https://flowcasino.vercel.app/) • [📹 Watch Demo](https://github.com/aliveevie/flow_casino) • [📚 Documentation](#documentation)

</div>

## ✨ Features

🎲 **Multiple Casino Games**
- Dice Roll (1-6 predictions)
- Coin Flip (Heads/Tails)
- Roulette (Numbers, Colors, Ranges)
- NFT Raffles & Auctions

🔒 **Provably Fair Gaming**
- Flow EVM VRF (Verifiable Random Function)
- Transparent random number generation
- On-chain verification of all outcomes

💰 **Smart Contract Security**
- ReentrancyGuard protection
- Pausable emergency controls
- Configurable betting limits
- Automated payout system

📊 **Real-time Analytics**
- Live game statistics
- Player performance tracking
- Win/loss history
- Profit/loss calculations

🌐 **Multi-Wallet Support**
- Flow native wallets
- EVM-compatible wallets (via RainbowKit)
- Seamless wallet switching

## 🏗️ Architecture

### Smart Contracts (`/contracts`)

Our casino is powered by robust smart contracts that ensure fairness and security:

#### 🎯 FlowCasino.sol (550 lines)
The main casino contract implementing multiple games with VRF integration:

```solidity
// Core VRF Implementation using Flow's Cadence Arch
address constant public CADENCE_ARCH = 0x0000000000000000000000010000000000000001;

function _getRandomDiceNumber() internal view returns (uint8) {
    (bool success, bytes memory data) = CADENCE_ARCH.staticcall(
        abi.encodeWithSignature("revertibleRandom()")
    );
    require(success, "VRF call failed");
    
    uint64 rawRandom = abi.decode(data, (uint64));
    return uint8((rawRandom % 6) + 1);
}
```

**Key Features:**
- 🎲 Dice Roll: Predict numbers 1-6 with 6x payout
- 🪙 Coin Flip: Heads/Tails with 2x payout  
- 🎰 Roulette: Multiple bet types (numbers, colors, ranges)
- 🔐 2.5% house edge with transparent calculations
- 🛡️ Reentrancy protection and emergency controls

#### 🎟️ NFT_Raffles.cdc (638 lines)
Cadence contract for NFT raffles and auctions:

```cadence
import RandomBeacon from 0x8624b52f9ddcd04a

pub contract NFTRaffles {
    // Provably fair raffle system with VRF
    // Transparent ticket sales and winner selection
    // Automated prize distribution
}
```

**Features:**
- 🎫 Fair ticket-based NFT raffles
- 🏆 English auction system
- 🎯 VRF-based winner selection
- 💎 Multi-NFT support

### Frontend Architecture

```
src/
├── components/
│   ├── casino/           # Casino game components
│   │   ├── DiceGame.tsx     # Dice roll interface
│   │   ├── Balance.tsx      # Wallet balance display
│   │   ├── GameHistory.tsx  # Game history tracking
│   │   └── GameStats.tsx    # Real-time statistics
│   ├── FlowProvider.tsx     # Flow blockchain integration
│   └── RainbowKitProvider.tsx # EVM wallet integration
├── hooks/
│   ├── use-flow-wallet.ts   # Flow wallet management
│   └── use-rainbowkit-wallet.ts # EVM wallet management
└── lib/
    ├── flow-casino.ts       # Smart contract interactions
    └── flow.ts             # Flow blockchain utilities
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (install with [nvm](https://github.com/nvm-sh/nvm))
- Flow wallet or MetaMask
- Test FLOW tokens

### Installation

```bash
# Clone the repository
git clone https://github.com/aliveevie/flow_casino.git
cd flow_casino

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env.local` file:

```env
VITE_FLOW_NETWORK=testnet
VITE_CONTRACT_ADDRESS=0x...
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 🎮 How to Play

### 🎲 Dice Roll
1. Connect your wallet
2. Choose a number (1-6)
3. Place your bet
4. Watch the provably fair roll
5. Win 6x your bet if correct!

### 🪙 Coin Flip
1. Select Heads or Tails
2. Place your wager
3. Fair coin flip using VRF
4. 2x payout for correct guess

### 🎰 Roulette
1. Choose bet type:
   - Single number (36x payout)
   - Red/Black (2x payout)
   - Even/Odd (2x payout)
   - Number ranges (3x payout)
2. Place bet and spin!

## 🔧 Technical Implementation

### VRF Integration

Flow Casino uses Flow's native VRF through the Cadence Arch precompile:

```solidity
// Secure random number generation
function _getRandomNumber() internal view returns (uint64) {
    (bool success, bytes memory data) = CADENCE_ARCH.staticcall(
        abi.encodeWithSignature("revertibleRandom()")
    );
    require(success, "VRF call failed");
    return abi.decode(data, (uint64));
}
```

### Security Features

- **Reentrancy Guards**: Prevents recursive calls
- **Access Controls**: Owner-only admin functions
- **Pausable**: Emergency stop mechanism
- **Bet Limits**: Configurable min/max betting
- **Liquidity Checks**: Ensures sufficient contract funds

### Gas Optimization

- Batch operations where possible
- Efficient storage patterns
- Minimal external calls
- Optimized random number usage

## 📊 Game Statistics

The casino tracks comprehensive statistics:

```typescript
interface PlayerStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalWagered: bigint;
  totalWon: bigint;
  winRate: number;
}
```

## 🛠️ Development

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain**: Flow EVM + Cadence
- **Wallets**: Flow FCL + RainbowKit
- **Build Tool**: Vite
- **Package Manager**: npm

### Smart Contract Development

```bash
# Compile contracts
npm run compile

# Deploy to testnet
npm run deploy:testnet

# Run tests
npm run test
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📋 Roadmap

- [x] Core dice game with VRF
- [x] Coin flip implementation
- [x] Roulette game variants
- [x] Multi-wallet support
- [x] Real-time statistics
- [ ] NFT rewards system
- [ ] Jackpot games
- [ ] Mobile app
- [ ] Mainnet deployment

## 🤝 Team

**Ibrahim Abdulkarim** - *Lead Developer*
- Email: aliveibi080@gmail.com
- GitHub: [@aliveevie](https://github.com/aliveevie)

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **🎮 Live Demo**: [flowcasino.vercel.app](https://flowcasino.vercel.app/)
- **📹 Demo Video**: [GitHub Repository](https://github.com/aliveevie/flow_casino)
- **📚 Flow Documentation**: [docs.flow.com](https://docs.flow.com/)
- **🌊 Flow EVM**: [developers.flow.com/evm](https://developers.flow.com/evm)

---

<div align="center">

**Built with ❤️ on Flow Blockchain**

*Making decentralized gaming fair, transparent, and fun!*

</div>
