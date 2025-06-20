import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FlowProvider } from "@/components/FlowProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { CasinoProvider } from "./components/casino/CasinoProvider";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FlowProvider>
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
    </FlowProvider>
  </QueryClientProvider>
);

export default App;
