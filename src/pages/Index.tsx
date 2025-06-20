import { Balance } from "@/components/casino/Balance";
import { DiceGame } from "@/components/casino/DiceGame";
import { GameStats } from "@/components/casino/GameStats";
import { HowToPlay } from "@/components/casino/HowToPlay";
import { QuickActions } from "@/components/casino/QuickActions";

export default function Index() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DiceGame />
        </div>
        <div className="space-y-8">
          <Balance />
          <GameStats />
          <QuickActions />
          <HowToPlay />
        </div>
      </div>
    </div>
  );
}
