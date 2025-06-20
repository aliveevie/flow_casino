import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCasino } from "@/components/casino/CasinoProvider";

export function Balance() {
  const { isConnected, address, formatBalance } = useCasino();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Balance</CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected && address ? (
          <>
            <p className="text-3xl font-bold">{formatBalance()}</p>
            <p className="text-gray-400 truncate text-sm">{address}</p>
          </>
        ) : (
          <p>Please connect your wallet.</p>
        )}
      </CardContent>
    </Card>
  );
} 