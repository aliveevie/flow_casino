import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRainbowKitWallet } from '@/hooks/use-rainbowkit-wallet';
import { useReadContract } from 'wagmi';
import { createPublicClient, http, Abi } from 'viem';
import { flowCasinoAddress, flowCasinoAbi } from '@/lib/flow-casino';
import { formatEther } from 'ethers';

interface GameHistoryEntry {
    gameId: number;
    betAmount: bigint;
    win: boolean;
    payout: bigint;
}

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
    isOwner: boolean;
    gameHistory: GameHistoryEntry[];
}

const CasinoContext = createContext<CasinoContextType | undefined>(undefined);

export function CasinoProvider({ children }: { children: ReactNode }) {
    const { isConnected, address, balance, formatBalance, chain } = useRainbowKitWallet();
    const [gamesPlayed, setGamesPlayed] = useState(0);
    const [gamesWon, setGamesWon] = useState(0);
    const [totalWagered, setTotalWagered] = useState("0");
    const [totalWon, setTotalWon] = useState("0");
    const [losses, setLosses] = useState(0);
    const [isOwner, setIsOwner] = useState(false);
    const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!address || !chain) return;

            const publicClient = createPublicClient({
                chain: chain,
                transport: http()
            });

            const gameStartedLogs = await publicClient.getLogs({
                address: flowCasinoAddress as `0x${string}`,
                event: {
                    type: 'event',
                    name: 'GameStarted',
                    inputs: [
                        { type: 'uint256', name: 'gameId', indexed: true },
                        { type: 'address', name: 'player', indexed: true },
                        { type: 'uint8', name: 'gameType' },
                        { type: 'uint256', name: 'betAmount' },
                        { type: 'uint256', name: 'timestamp' },
                    ],
                },
                args: {
                    player: address,
                },
                fromBlock: 0n,
                toBlock: 'latest'
            });

            const betAmounts = new Map<number, bigint>();
            for (const log of gameStartedLogs) {
                const { gameId, betAmount } = (log as any).args;
                betAmounts.set(Number(gameId), betAmount);
            }

            const diceRolledLogs = await publicClient.getLogs({
                address: flowCasinoAddress as `0x${string}`,
                event: {
                    type: 'event',
                    name: 'DiceRolled',
                    inputs: [
                        { type: 'uint256', name: 'gameId', indexed: true },
                        { type: 'address', name: 'player', indexed: true },
                        { type: 'uint8', name: 'guess' },
                        { type: 'uint8', name: 'result' },
                        { type: 'bool', name: 'win' },
                        { type: 'uint256', name: 'payout' },
                    ],
                },
                args: {
                    player: address,
                },
                fromBlock: 0n,
                toBlock: 'latest'
            });

            const newHistory = diceRolledLogs.map(log => {
                const { gameId, win, payout } = (log as any).args;
                const betAmount = betAmounts.get(Number(gameId));
                return { gameId: Number(gameId), betAmount, win, payout };
            }).filter(game => game.betAmount !== undefined)
              .reverse();

            setGameHistory(newHistory as GameHistoryEntry[]);
        }
        
        if(isConnected && address && chain) {
            fetchHistory();
        }

    }, [isConnected, address, chain]);

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
        refetchStats,
        isOwner,
        gameHistory
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