import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCasino } from "@/components/casino/CasinoProvider";

export function Balance() {
  const { isConnected, address, formatBalance } = useCasino();

  return (
    <Card className="bg-gray-900 text-white border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl">Balance</CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected && address ? (
          <>
            <p className="text-5xl font-bold text-green-400">{formatBalance()}</p>
            <p className="text-gray-500 truncate text-sm mt-1">{address}</p>
          </>
        ) : (
          <p className="text-gray-400">Please connect your wallet.</p>
        )}
      </CardContent>
    </Card>
  );
} 