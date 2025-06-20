import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCasino } from "./CasinoProvider";

export function GameStats() {
    const { gamesPlayed, gamesWon, totalWagered, losses } = useCasino();

    const winRate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0;

    const formatWagered = () => {
        return `${Number(totalWagered) / 1e18} FLOW`;
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{gamesPlayed}</p>
            <p className="text-gray-400">Games Played</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{gamesWon}</p>
            <p className="text-gray-400">Games Won</p>
          </div>
        </div>
        <div className="mt-4 text-center">
            <p className="text-lg">Win Rate: <span className="font-bold text-green-400">{winRate.toFixed(1)}%</span></p>
        </div>
        <div className="mt-4 border-t border-gray-700 pt-4">
            <div className="flex justify-between">
                <span>Total Wagered:</span>
                <span>{formatWagered()}</span>
            </div>
            <div className="flex justify-between text-red-400">
                <span>Losses:</span>
                <span>{losses}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
} 