import { useAccount, useBalance, useChainId } from 'wagmi';
import { useCallback } from 'react';

export const useRainbowKitWallet = () => {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const chainId = useChainId();
  
  const { data: balance } = useBalance({
    address,
  });

  const getDisplayAddress = useCallback(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const formatBalance = useCallback(() => {
    if (!balance) return "0 FLOW";
    return `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`;
  }, [balance]);

  return {
    address,
    isConnected,
    isConnecting,
    chainId,
    chain,
    balance,
    formatBalance,
    getDisplayAddress,
  };
}; 