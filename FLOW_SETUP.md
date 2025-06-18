# Flow Wallet Integration Setup

## WalletConnect Project ID Configuration

To enable proper wallet connectivity, you need to register for a WalletConnect project ID and add it to your Flow configuration.

### Step 1: Get Your WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in to your account
3. Create a new project
4. Copy your project ID

### Step 2: Configure Your Project ID

1. Open `src/lib/flow.ts`
2. Replace `YOUR_WALLETCONNECT_PROJECT_ID_HERE` with your actual project ID:

```typescript
"fcl.walletConnect.projectId": "your-actual-project-id-here",
```

### Step 3: Environment Variables (Recommended)

For better security, you can use environment variables:

1. Create a `.env` file in your project root
2. Add your project ID:

```env
VITE_WALLETCONNECT_PROJECT_ID=your-actual-project-id-here
```

3. Update `src/lib/flow.ts`:

```typescript
"fcl.walletConnect.projectId": import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
```

### Supported Wallets

With the WalletConnect project ID configured, your dApp will support:
- Blocto
- Dapper Wallet
- Flow Wallet
- Ledger
- And other WalletConnect-compatible wallets

### Testing

After configuring your project ID:
1. Run `npm run dev`
2. Click "Connect Flow Wallet" in the header
3. Choose your preferred wallet
4. Approve the connection

### Resources

- [Flow FCL Configuration Guide](https://developers.flow.com/tools/clients/fcl-js/configure-fcl)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [Flow Documentation](https://developers.flow.com/) 