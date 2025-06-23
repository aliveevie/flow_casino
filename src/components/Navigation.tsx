import { RainbowKitWalletButton } from './RainbowKitWalletButton';

const Navigation = () => {
  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Flow Casino
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <RainbowKitWalletButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
