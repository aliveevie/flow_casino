import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCasino } from "@/components/casino/CasinoProvider";
import { ethers } from "ethers";

export function DiceGame() {
  const [selectedNumber, setSelectedNumber] = useState<number>(1);
  const [betAmount, setBetAmount] = useState<string>("0.01");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  
  const { contract, isConnected, connect } = useCasino();

  useEffect(() => {
    if(contract) {
        const onDiceRolled = (gameId: any, player: any, guess: any, result: any, win: any, payout: any) => {
            console.log("DiceRolled event:", { gameId, player, guess, result, win, payout });
            setDiceResult(result);
        };

        contract.on("DiceRolled", onDiceRolled);

        return () => {
            contract.off("DiceRolled", onDiceRolled);
        };
    }
  }, [contract]);

  const handleRollDice = async () => {
    if (!contract) {
      setError("Contract not connected");
      return;
    }
    setLoading(true);
    setError(null);
    setDiceResult(null);
    try {
      const betAmountWei = ethers.parseEther(betAmount);
      const tx = await contract.rollDice(selectedNumber, { value: betAmountWei });
      await tx.wait();
      // The result will be set by the event listener
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

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
                disabled={!isConnected || loading}
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
              disabled={!isConnected || loading}
            />
            <Button variant="outline" size="sm" onClick={() => setBetAmount("0.01")} disabled={!isConnected || loading}>0.01</Button>
            <Button variant="outline" size="sm" className="mx-1" onClick={() => setBetAmount("0.05")} disabled={!isConnected || loading}>0.05</Button>
            <Button variant="outline" size="sm" onClick={() => setBetAmount("0.1")} disabled={!isConnected || loading}>0.1</Button>
          </div>
        </div>
        
        {isConnected ? (
          <Button className="w-full text-lg font-bold" size="lg" onClick={handleRollDice} disabled={loading}>
            {loading ? "Rolling..." : "ROLL DICE"}
          </Button>
        ) : (
          <Button className="w-full text-lg font-bold" size="lg" onClick={connect}>
            Connect Wallet
          </Button>
        )}

        {error && <p className="text-red-500 mt-2">{error}</p>}
        
        <div className="flex justify-between text-sm mt-4">
          <span>Payout (6x): <span className="font-bold text-green-400">... FLOW</span></span>
          <span>House Edge: <span className="font-bold">2.5%</span></span>
        </div>
      </CardContent>
    </Card>
  );
} 