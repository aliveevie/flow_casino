import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCasino } from "@/components/casino/CasinoProvider";
import { RainbowKitWalletButton } from "@/components/RainbowKitWalletButton";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { flowCasinoAddress, flowCasinoAbi } from "@/lib/flow-casino";
import { parseEther, formatEther } from "ethers";
import { decodeEventLog, Abi } from "viem";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Dice = ({ result, rolling }: { result: number | null, rolling: boolean }) => {
    const getTransform = (face: number) => {
        switch (face) {
            case 1: return 'translateZ(50px)';
            case 2: return 'rotateX(-180deg) translateZ(50px)';
            case 3: return 'rotateY(-90deg) translateZ(50px)';
            case 4: return 'rotateY(90deg) translateZ(50px)';
            case 5: return 'rotateX(-90deg) translateZ(50px)';
            case 6: return 'rotateX(90deg) translateZ(50px)';
            default: return '';
        }
    };

    const getResultTransform = (res: number | null) => {
        if (!res) return 'rotateX(0deg) rotateY(0deg)';
        switch (res) {
            case 1: return 'rotateX(0deg) rotateY(0deg)';
            case 2: return 'rotateX(180deg)';
            case 3: return 'rotateY(90deg)';
            case 4: return 'rotateY(-90deg)';
            case 5: return 'rotateX(90deg)';
            case 6: return 'rotateX(-90deg)';
            default: return '';
        }
    };
    

    return (
        <div className="flex justify-center items-center perspective-[800px] w-24 h-24 mx-auto my-4">
            <div
                className={cn("relative w-24 h-24 transition-transform duration-1000", { "animate-dice-roll": rolling })}
                style={{ transformStyle: "preserve-3d", transform: getResultTransform(result) }}
            >
                {[1, 2, 3, 4, 5, 6].map(face => (
                    <div
                        key={face}
                        className="absolute w-24 h-24 bg-white border-2 border-gray-800 rounded-lg flex items-center justify-center text-5xl font-bold text-gray-800"
                        style={{ transform: getTransform(face) }}
                    >
                        {face}
                    </div>
                ))}
            </div>
        </div>
    );
};


const ResultModal = ({ win, payout, onClose }: { win: boolean, payout: string, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className={`text-center p-8 rounded-lg ${win ? 'bg-green-500' : 'bg-red-500'}`}>
            <h2 className="text-4xl font-bold text-white mb-4">{win ? 'You Won!' : 'You Lost'}</h2>
            {win && <p className="text-xl text-white">Payout: {payout} FLOW</p>}
            <Button onClick={onClose} className="mt-4">Play Again</Button>
        </div>
    </div>
);

export function DiceGame() {
    const [selectedNumber, setSelectedNumber] = useState<number>(1);
    const [betAmount, setBetAmount] = useState<string>("0.01");
    const [rolling, setRolling] = useState(false);
    const [diceResult, setDiceResult] = useState<number | null>(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [winInfo, setWinInfo] = useState({ win: false, payout: "0" });

    const { isConnected, refetchStats, address, chain } = useCasino();
    const { data: hash, writeContract, isPending } = useWriteContract();

    const handleRollDice = async () => {
        if (!isConnected) return;
        setRolling(true);
        setDiceResult(null);
        writeContract({
            address: flowCasinoAddress as `0x${string}`,
            abi: flowCasinoAbi as Abi,
            functionName: 'rollDice',
            args: [selectedNumber],
            value: parseEther(betAmount),
            account: address as `0x${string}`,
            chain: chain,
        });
    };

    const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } =
        useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isConfirmed && receipt) {
            for (const log of receipt.logs) {
                try {
                    const decodedLog = decodeEventLog({
                        abi: flowCasinoAbi as Abi,
                        data: log.data,
                        topics: log.topics,
                    });

                    if (decodedLog.eventName === "DiceRolled" && (decodedLog.args as any).player === address) {
                        const { result, win, payout } = decodedLog.args as any;
                        setRolling(false);
                        setTimeout(() => {
                            setDiceResult(result);
                            setWinInfo({ win, payout: formatEther(payout) });
                            setShowResultModal(true);
                        }, 1000); // Delay to show final dice face

                        toast[win ? 'success' : 'error'](
                            win ? `You won! ${formatEther(payout)} FLOW has been sent to your wallet.` : "You lost this round. Better luck next time!",
                            { id: "dice-roll" }
                        );
                    }
                } catch (error) { /* Ignore other events */ }
            }
            refetchStats();
        }
    }, [isConfirmed, receipt, refetchStats, address]);
    
    useEffect(() => {
        if (isPending) {
            toast.loading("Rolling the dice...", { id: 'dice-roll' });
        }
    }, [isPending]);

    const isLoading = isPending || isConfirming;

    return (
        <Card className="w-full max-w-md bg-gray-900 text-white border-gray-700">
            <CardHeader>
                <CardTitle className="text-center text-2xl font-bold">
                    <span role="img" aria-label="dice" className="mr-2">🎲</span> Dice Roll Game
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Dice result={diceResult} rolling={rolling || isLoading} />

                <div className="mb-4">
                    <p className="text-center font-medium mb-2">Choose your expectations</p>
                    <div className="grid grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                            <Button
                                key={num}
                                variant={selectedNumber === num ? "secondary" : "outline"}
                                className={cn("border-gray-600 hover:bg-gray-700 text-lg font-semibold", { "bg-purple-600 text-white": selectedNumber === num })}
                                onClick={() => setSelectedNumber(num)}
                                disabled={!isConnected || isLoading}
                            >
                                {num}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-center font-medium mb-2">Bet Amount (FLOW)</p>
                    <div className="grid grid-cols-3 gap-2">
                        {["0.01", "0.05", "0.1"].map((amount) => (
                            <Button
                                key={amount}
                                variant={betAmount === amount ? "secondary" : "outline"}
                                className={cn("border-gray-600 hover:bg-gray-700 text-lg font-semibold", { "bg-purple-600 text-white": betAmount === amount })}
                                onClick={() => setBetAmount(amount)}
                                disabled={!isConnected || isLoading}
                            >
                                {amount}
                            </Button>
                        ))}
                    </div>
                </div>

                {isConnected ? (
                    <Button className="w-full text-lg font-bold bg-purple-600 hover:bg-purple-700" size="lg" onClick={handleRollDice} disabled={isLoading}>
                        {isLoading ? "Rolling..." : "ROLL DICE"}
                    </Button>
                ) : (
                    <div className="w-full">
                        <RainbowKitWalletButton />
                    </div>
                )}

                <div className="flex justify-between text-sm mt-2 text-gray-400">
                    <span>Payout (6x): <span className="font-bold text-green-400">{parseFloat(betAmount) * 6} FLOW</span></span>
                    <span>House Edge: <span className="font-bold">2.5%</span></span>
                </div>

                {showResultModal && (
                    <ResultModal
                        win={winInfo.win}
                        payout={winInfo.payout}
                        onClose={() => {
                            setShowResultModal(false);
                            setDiceResult(null); 
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
} 