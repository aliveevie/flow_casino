import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { FlowProvider } from "@/components/FlowProvider";
import { RainbowKitProvider } from "@/components/RainbowKitProvider";
import { CasinoProvider } from "./components/casino/CasinoProvider";
import { Index } from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <FlowProvider>
      <RainbowKitProvider>
        <Toaster />
        <CasinoProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CasinoProvider>
      </RainbowKitProvider>
    </FlowProvider>
  );
}

export default App;
