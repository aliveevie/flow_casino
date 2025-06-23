import { Balance } from "@/components/casino/Balance";
import { DiceGame } from "@/components/casino/DiceGame";
import { GameStats } from "@/components/casino/GameStats";
import { GameHistory } from "@/components/casino/GameHistory";

export function Index() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex justify-center">
          <DiceGame />
        </div>
        <div className="space-y-8">
          <Balance />
          <GameStats />
          <GameHistory />
        </div>
      </div>
    </div>
  );
}
