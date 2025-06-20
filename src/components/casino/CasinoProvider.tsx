import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRainbowKitWallet } from '@/hooks/use-rainbowkit-wallet';

interface CasinoContextType {
    isConnected: boolean;
    address: string | null;
    gamesPlayed: number;
    gamesWon: number;
    totalWagered: bigint;
    losses: number;
    balance: any;
    formatBalance: () => string;
}

const CasinoContext = createContext<CasinoContextType | undefined>(undefined);

export function CasinoProvider({ children }: { children: ReactNode }) {
    const { isConnected, address, balance, formatBalance } = useRainbowKitWallet();
    const [gamesPlayed, setGamesPlayed] = useState(0);
    const [gamesWon, setGamesWon] = useState(0);
    const [totalWagered, setTotalWagered] = useState(BigInt(0));
    const [losses, setLosses] = useState(0);

    // Reset game stats when wallet disconnects
    useEffect(() => {
        if (!isConnected) {
            setGamesPlayed(0);
            setGamesWon(0);
            setTotalWagered(BigInt(0));
            setLosses(0);
        }
    }, [isConnected]);

    // Listen for Flow EVM blockchain events related to casino games
    useEffect(() => {
        if (isConnected && address) {
            console.log('RainbowKit wallet connected:', address);
            console.log('Current balance:', formatBalance());
        }
    }, [isConnected, address, formatBalance]);

    const value = { 
        isConnected, 
        address, 
        gamesPlayed, 
        gamesWon, 
        totalWagered, 
        losses,
        balance,
        formatBalance
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