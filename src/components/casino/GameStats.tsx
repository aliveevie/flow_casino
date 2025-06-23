import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCasino } from "@/components/casino/CasinoProvider";
import { Button } from "@/components/ui/button";

export function GameStats() {
  const { gamesPlayed, gamesWon, totalWagered, totalWon, losses, refetchStats } = useCasino();

  const winRate = gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(2) : "0.00";

  return (
    <Card className="bg-gray-900 text-white border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Game Stats</CardTitle>
        <Button variant="ghost" size="sm" onClick={refetchStats} className="text-gray-400 hover:bg-gray-700">Refresh</Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="text-center">
                <p className="text-sm text-gray-400">Games Played</p>
                <p className="text-3xl font-bold">{gamesPlayed}</p>
            </div>
            <div className="text-center">
                <p className="text-sm text-gray-400">Games Won</p>
                <p className="text-3xl font-bold text-green-400">{gamesWon}</p>
            </div>
            <div className="text-center">
                <p className="text-sm text-gray-400">Games Lost</p>
                <p className="text-3xl font-bold text-red-400">{losses}</p>
            </div>
            <div className="text-center">
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-3xl font-bold">{winRate}%</p>
            </div>
            <div className="text-center col-span-2">
                <p className="text-sm text-gray-400">Total Wagered</p>
                <p className="text-3xl font-bold">{totalWagered} FLOW</p>
            </div>
            <div className="text-center col-span-2">
                <p className="text-sm text-gray-400">Total Won</p>
                <p className="text-3xl font-bold text-green-400">{totalWon} FLOW</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
} 