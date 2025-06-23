import { Balance } from "@/components/casino/Balance";
import { DiceGame } from "@/components/casino/DiceGame";
import { GameStats } from "@/components/casino/GameStats";

export function Index() {
  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <Balance />
        <DiceGame />
        <GameStats />
      </div>
    </div>
  );
}
