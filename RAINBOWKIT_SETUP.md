# RainbowKit Setup for Flow EVM Casino

This project now uses RainbowKit for wallet connection with Flow EVM testnet.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install @rainbow-me/rainbowkit wagmi viem
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
   ```

3. **Get WalletConnect Project ID**
   - Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy the Project ID
   - Add it to your `.env` file

## Configuration

The RainbowKit is configured for Flow EVM testnet:
- **Network**: Flow EVM Testnet
- **RPC URL**: https://testnet.evm.nodes.onflow.org
- **Chain ID**: 123456789 (custom)
- **Currency**: FLOW

## Components Updated

- ✅ `CasinoProvider` - Now uses RainbowKit wallet connection
- ✅ `DiceGame` - Updated to use RainbowKit wallet button
- ✅ `Balance` - Shows FLOW balance from RainbowKit
- ✅ `GameStats` - Removed ethers dependency
- ✅ `Navigation` - Uses RainbowKit wallet button
- ✅ `App.tsx` - Wrapped with RainbowKit provider

## Features

- 🔗 Multi-wallet support (MetaMask, WalletConnect, etc.)
- 💰 Real-time FLOW balance display
- 🎲 Casino games integrated with Flow EVM
- 📱 Mobile-friendly wallet connection
- 🌈 Beautiful RainbowKit UI

## Usage

1. Connect your wallet using the RainbowKit button
2. Ensure you're on Flow EVM testnet
3. Play casino games with FLOW tokens
4. View your balance and game statistics

## Next Steps

- Implement actual Flow EVM smart contract interactions
- Add transaction signing for game actions
- Integrate with Flow EVM VRF for provably fair randomness 