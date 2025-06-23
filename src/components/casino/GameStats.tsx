import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCasino } from "@/components/casino/CasinoProvider";
import { Button } from "@/components/ui/button";

export function GameStats() {
  const { gamesPlayed, gamesWon, totalWagered, totalWon, losses, refetchStats } = useCasino();

  const winRate = gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(2) : "0.00";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Game Stats</CardTitle>
        <Button variant="ghost" size="sm" onClick={refetchStats}>Refresh</Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
                <p className="text-xs text-muted-foreground">Games Played</p>
                <p className="text-2xl font-bold">{gamesPlayed}</p>
            </div>
            <div className="text-center">
                <p className="text-xs text-muted-foreground">Games Won</p>
                <p className="text-2xl font-bold">{gamesWon}</p>
            </div>
            <div className="text-center">
                <p className="text-xs text-muted-foreground">Games Lost</p>
                <p className="text-2xl font-bold">{losses}</p>
            </div>
            <div className="text-center">
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{winRate}%</p>
            </div>
            <div className="text-center col-span-2">
                <p className="text-xs text-muted-foreground">Total Wagered</p>
                <p className="text-2xl font-bold">{totalWagered} FLOW</p>
            </div>
            <div className="text-center col-span-2">
                <p className="text-xs text-muted-foreground">Total Won</p>
                <p className="text-2xl font-bold text-green-400">{totalWon} FLOW</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
} 