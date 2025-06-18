import { ArrowRight, Sparkles, Blockchain } from 'lucide-react';
import { FlowStatus } from './FlowStatus';

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2 bg-muted/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
            <Blockchain className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Powered by Flow Blockchain</span>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          React Craft
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent block">
            Flow Integration
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          A modern React application with seamless Flow blockchain integration. 
          Connect your wallet and explore the future of decentralized applications.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-300 flex items-center space-x-2 group">
            <span>Connect Wallet</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-muted/50 transition-all duration-300">
            Learn More
          </button>
        </div>

        {/* Flow Status Card */}
        <div className="flex justify-center mb-16">
          <FlowStatus />
        </div>
        
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-foreground">React 18</div>
            <div className="text-muted-foreground">Latest version</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">Flow</div>
            <div className="text-muted-foreground">Blockchain</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">TypeScript</div>
            <div className="text-muted-foreground">Type safety</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">Tailwind</div>
            <div className="text-muted-foreground">Utility-first CSS</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
