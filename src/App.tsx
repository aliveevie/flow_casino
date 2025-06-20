import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RainbowKitProvider } from "@/components/RainbowKitProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { CasinoProvider } from "./components/casino/CasinoProvider";
import Hero from "./components/Hero";

const App = () => (
  <RainbowKitProvider>
    <TooltipProvider>
      <CasinoProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Hero />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CasinoProvider>
    </TooltipProvider>
  </RainbowKitProvider>
);

export default App;
