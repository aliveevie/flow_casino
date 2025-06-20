import { Button } from "./ui/button";
import { useCasino } from "@/components/casino/CasinoProvider";
import { RainbowKitWalletButton } from "./RainbowKitWalletButton";

const Hero = () => {
  const { isConnected, address } = useCasino();

  return (
    <div className="text-center py-16">
      <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl text-yellow-300">
        FLOW CASINO
      </h1>
      <p className="mt-4 text-lg text-gray-400">
        Provably Fair Decentralized Gaming
      </p>
      <div className="mt-6">
        {isConnected && address ? (
           <Button variant="secondary">Connected: {address}</Button>
        ) : (
          <RainbowKitWalletButton />
        )}
      </div>
    </div>
  );
};

export default Hero;
