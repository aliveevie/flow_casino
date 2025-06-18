import { config } from "@onflow/fcl";

// Configure Flow client
config({
  "accessNode.api": "https://rest-testnet.onflow.org", // Testnet access node
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn", // Discovery service for testnet
  "discovery.wallet.method": "POP/RPC",
  "fcl.network": "testnet",
  "app.detail.title": "React Craft Flow App",
  "app.detail.icon": "https://placekitten.com/g/200/200",
  // WalletConnect Project ID - Get from https://cloud.walletconnect.com/
  "fcl.walletConnect.projectId": import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "YOUR_WALLETCONNECT_PROJECT_ID_HERE",
});

export default config; 