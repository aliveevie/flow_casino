import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFlowWallet } from '@/hooks/use-flow-wallet';
import * as fcl from "@onflow/fcl";

interface CasinoContextType {
    isConnected: boolean;
    address: string | null;
    gamesPlayed: number;
    gamesWon: number;
    totalWagered: bigint;
    losses: number;
    user: any;
}

const CasinoContext = createContext<CasinoContextType | undefined>(undefined);

export function CasinoProvider({ children }: { children: ReactNode }) {
    const { user, isConnected, address } = useFlowWallet();
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

    // TODO: Add Flow blockchain event listeners for game events
    // This would replace the Ethereum contract event listeners
    useEffect(() => {
        if (isConnected && address) {
            // Listen for Flow blockchain events related to casino games
            // This is a placeholder for Flow-specific event handling
            console.log('Flow wallet connected:', address);
        }
    }, [isConnected, address]);

    const value = { 
        isConnected, 
        address, 
        gamesPlayed, 
        gamesWon, 
        totalWagered, 
        losses,
        user 
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