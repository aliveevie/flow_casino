import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCasino } from "@/components/casino/CasinoProvider";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export function Balance() {
  const { isConnected, address, provider } = useCasino();
  const [balance, setBalance] = useState<string>("0");

  useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && provider && address) {
        const userBalance = await provider.getBalance(address);
        setBalance(ethers.formatEther(userBalance));
      }
    };

    fetchBalance();
  }, [isConnected, provider, address]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Balance</CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected && address ? (
          <>
            <p className="text-3xl font-bold">{parseFloat(balance).toFixed(4)} FLOW</p>
            <p className="text-gray-400 truncate text-sm">{address}</p>
          </>
        ) : (
          <p>Please connect your wallet.</p>
        )}
      </CardContent>
    </Card>
  );
} 