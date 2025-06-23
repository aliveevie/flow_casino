import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRainbowKitWallet } from '@/hooks/use-rainbowkit-wallet';
import { useReadContract } from 'wagmi';
import { flowCasinoAddress, flowCasinoAbi } from '@/lib/flow-casino';
import { formatEther } from 'ethers';
import { Abi } from 'viem';

interface CasinoContextType {
    isConnected: boolean;
    address: string | null;
    chain: any;
    gamesPlayed: number;
    gamesWon: number;
    totalWagered: string;
    totalWon: string;
    losses: number;
    balance: any;
    formatBalance: () => string;
    refetchStats: () => void;
}

const CasinoContext = createContext<CasinoContextType | undefined>(undefined);

export function CasinoProvider({ children }: { children: ReactNode }) {
    const { isConnected, address, balance, formatBalance, chain } = useRainbowKitWallet();
    const [gamesPlayed, setGamesPlayed] = useState(0);
    const [gamesWon, setGamesWon] = useState(0);
    const [totalWagered, setTotalWagered] = useState("0");
    const [totalWon, setTotalWon] = useState("0");
    const [losses, setLosses] = useState(0);

    const { data: playerStats, refetch: refetchStats } = useReadContract({
        address: flowCasinoAddress as `0x${string}`,
        abi: flowCasinoAbi as Abi,
        functionName: 'playerStats',
        args: [address as `0x${string}`],
        query: {
            enabled: isConnected && !!address,
        }
    });

    useEffect(() => {
        if (playerStats && Array.isArray(playerStats)) {
            setGamesPlayed(Number(playerStats[0]));
            setGamesWon(Number(playerStats[1]));
            setLosses(Number(playerStats[2]));
            setTotalWagered(formatEther(playerStats[3]));
            setTotalWon(formatEther(playerStats[4]));
        }
    }, [playerStats]);


    // Reset game stats when wallet disconnects
    useEffect(() => {
        if (!isConnected) {
            setGamesPlayed(0);
            setGamesWon(0);
            setTotalWagered("0");
            setTotalWon("0");
            setLosses(0);
        }
    }, [isConnected]);

    // Refetch stats when the user connects
    useEffect(() => {
        if (isConnected && address) {
            refetchStats();
        }
    }, [isConnected, address, refetchStats]);

    const value = { 
        isConnected, 
        address, 
        chain,
        gamesPlayed, 
        gamesWon, 
        totalWagered,
        totalWon,
        losses,
        balance,
        formatBalance,
        refetchStats
    };

    return <CasinoContext.Provider value={value}>{children}</CasinoContext.Provider>;
}

export function useCasino() {
    const context = useContext(CasinoContext);
    if (context === undefined) {
        throw new Error('useCasino must be used within a CasinoProvider');
    }
    return context;
}

declare global {
    interface Window {
        ethereum?: any;
    }
} 