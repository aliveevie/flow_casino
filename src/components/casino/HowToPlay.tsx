import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HowToPlay() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How to Play</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-2">
            <li>Choose a number from 1 to 6</li>
            <li>Set your bet amount (0.01 - 0.1 FLOW)</li>
            <li>Click "ROLL DICE" to play</li>
            <li>Win 6x your bet if you guess correctly!</li>
        </ol>
        <p className="text-xs text-gray-400 mt-4">
            Powered by Flow EVM VRF for provably fair randomness
        </p>
      </CardContent>
    </Card>
  );
} 