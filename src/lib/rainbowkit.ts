import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, createConfig } from 'wagmi';

// Flow EVM Testnet configuration
const flowEVMTestnet = {
  id: 545, // Correct chain ID for Flow EVM testnet
  name: 'Flow EVM Testnet',
  network: 'flow-evm-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'FLOW',
    symbol: 'FLOW',
  },
  rpcUrls: {
    public: { http: ['https://testnet.evm.nodes.onflow.org'] },
    default: { http: ['https://testnet.evm.nodes.onflow.org'] },
  },
  blockExplorers: {
    default: { 
      name: 'Flow EVM Testnet Explorer', 
      url: 'https://evm-testnet.flowscan.io' 
    },
  },
} as const;

const config = getDefaultConfig({
  appName: 'React Craft Flow Casino',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [flowEVMTestnet],
  transports: {
    [flowEVMTestnet.id]: http(),
  },
});

export { config }; 