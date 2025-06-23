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

export function DiceGame() {
  const [selectedNumber, setSelectedNumber] = useState<number>(1);
  const [betAmount, setBetAmount] = useState<string>("0.01");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  
  const { isConnected, refetchStats, address, chain } = useCasino();
  const { data: hash, writeContract } = useWriteContract();

  const handleRollDice = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    setLoading(true);
    setError(null);
    setDiceResult(null);
    
    try {
      writeContract({
        address: flowCasinoAddress as `0x${string}`,
        abi: flowCasinoAbi as Abi,
        functionName: 'rollDice',
        args: [selectedNumber],
        value: parseEther(betAmount),
        account: address as `0x${string}`,
        chain: chain,
      });
      
    } catch (err: any) {
      setError(err.message || "An error occurred while rolling dice.");
      setLoading(false);
    }
  };

  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    if (isConfirmed && receipt) {
      for (const log of receipt.logs) {
        try {
          const decodedLog = decodeEventLog({
            abi: flowCasinoAbi as Abi,
            data: log.data,
            topics: log.topics,
          });

          if (
            decodedLog.eventName === "DiceRolled" &&
            (decodedLog.args as any).player === address
          ) {
            const { result, win, payout } = decodedLog.args as any;
            setDiceResult(result);

            if (win) {
                const payoutInFlow = formatEther(payout);
                toast.success(`You won! ${payoutInFlow} FLOW has been sent to your wallet.`, {
                    id: "dice-roll",
                });
            } else {
                toast.error("You lost this round. Better luck next time!", {
                    id: "dice-roll",
                });
            }
          }
        } catch (error) {
          // This log might not be from our contract, so we can ignore the error
        }
      }
      refetchStats();
    }
  }, [isConfirmed, receipt, refetchStats, address]);

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Rolling the dice...", {
        id: 'dice-roll'
      });
    }

    if (isConfirmed) {
      setLoading(false);
      toast.success("Transaction confirmed!", {
        id: 'dice-roll'
      });
    }
  }, [isConfirming, isConfirmed])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          <span role="img" aria-label="dice" className="mr-2">🎲</span> Dice Roll Game
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-5xl">{diceResult ?? "?"}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Choose Your Number (1-6)</p>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <Button
                key={num}
                variant={selectedNumber === num ? "default" : "outline"}
                onClick={() => setSelectedNumber(num)}
                disabled={!isConnected || loading || isConfirming}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="bet-amount" className="text-sm font-medium mb-2 block">Bet Amount (FLOW)</label>
          <div className="flex items-center">
            <Input 
              id="bet-amount" 
              type="number" 
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="mr-2"
              disabled={!isConnected || loading || isConfirming}
            />
            <Button variant="outline" size="sm" onClick={() => setBetAmount("0.01")} disabled={!isConnected || loading || isConfirming}>0.01</Button>
            <Button variant="outline" size="sm" className="mx-1" onClick={() => setBetAmount("0.05")} disabled={!isConnected || loading || isConfirming}>0.05</Button>
            <Button variant="outline" size="sm" onClick={() => setBetAmount("0.1")} disabled={!isConnected || loading || isConfirming}>0.1</Button>
          </div>
        </div>
        
        {isConnected ? (
          <Button className="w-full text-lg font-bold" size="lg" onClick={handleRollDice} disabled={loading || isConfirming}>
            {loading || isConfirming ? "Rolling..." : "ROLL DICE"}
          </Button>
        ) : (
          <div className="w-full">
            <RainbowKitWalletButton />
          </div>
        )}

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {hash && <p className="text-sm mt-2">Transaction: {hash}</p>}
        
        <div className="flex justify-between text-sm mt-4">
          <span>Payout (6x): <span className="font-bold text-green-400">... FLOW</span></span>
          <span>House Edge: <span className="font-bold">2.5%</span></span>
        </div>
      </CardContent>
    </Card>
  );
} 