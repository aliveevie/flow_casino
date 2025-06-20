import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers, BrowserProvider, Contract } from 'ethers';
import FlowCasino from '@/../contracts/artifacts/FlowCasino_metadata.json';

const contractAddress = process.env.VITE_CONTRACT_ADDRESS || '0x3C40F3B7488a80D6Cf06697f4537Fb73D3B8d27F'; // Address is read from environment variables
const contractABI = FlowCasino.output.abi;

interface CasinoContextType {
    contract: Contract | null;
    provider: BrowserProvider | null;
    signer: ethers.Signer | null;
    isConnected: boolean;
    connect: () => Promise<void>;
    address: string | null;
    gamesPlayed: number;
    gamesWon: number;
    totalWagered: bigint;
    losses: number;
}

const CasinoContext = createContext<CasinoContextType | undefined>(undefined);

export function CasinoProvider({ children }: { children: ReactNode }) {
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [contract, setContract] = useState<Contract | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [gamesPlayed, setGamesPlayed] = useState(0);
    const [gamesWon, setGamesWon] = useState(0);
    const [totalWagered, setTotalWagered] = useState(BigInt(0));
    const [losses, setLosses] = useState(0);


    const setupEthers = async () => {
        if (window.ethereum) {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await web3Provider.listAccounts();
            if (accounts.length > 0) {
                setProvider(web3Provider);
                const signer = await web3Provider.getSigner();
                setSigner(signer);
                const userAddress = await signer.getAddress();
                setAddress(userAddress);

                const casinoContract = new ethers.Contract(contractAddress, contractABI, signer);
                setContract(casinoContract);
                setIsConnected(true);
            } else {
                // This will reset the state if the user disconnects all accounts
                setIsConnected(false);
                setAddress(null);
                setSigner(null);
                setContract(null);
                setProvider(null);
            }
        }
    };

    useEffect(() => {
        setupEthers();
        if (window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length === 0) {
                  // User disconnected
                  setIsConnected(false);
                  setAddress(null);
                  setSigner(null);
                  setContract(null);
                  setProvider(null);
                }
                setupEthers();
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                if (window.ethereum.removeListener) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                }
            }
        }
    }, []);
    
    useEffect(() => {
        if (contract && address) {
            const onDiceRolled = (gameId: any, player: string, guess: any, result: any, win: boolean, payout: any, event: any) => {
                if(player.toLowerCase() === address.toLowerCase()){
                    setGamesPlayed(p => p + 1);
                    if(win) setGamesWon(p => p + 1);
                    else setLosses(p => p + 1);
                    setTotalWagered(w => w + event.args.betAmount);
                }
            };
    
            contract.on("DiceRolled", onDiceRolled);
    
            return () => {
                contract.off("DiceRolled", onDiceRolled);
            };
        }
    }, [contract, address]);

    const connect = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                await setupEthers();
            } catch (error) {
                console.error("Failed to connect wallet", error);
            }
        } else {
            console.error("No EVM wallet found. Please install MetaMask or another EVM-compatible wallet.");
        }
    };

    const value = { contract, provider, signer, isConnected, connect, address, gamesPlayed, gamesWon, totalWagered, losses };

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