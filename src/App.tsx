import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoomProvider } from "@/contexts/RoomContext";
import Lobby from "./pages/Lobby";
import WaitingRoom from "./pages/WaitingRoom";
import OnlineGameBoard from "./pages/OnlineGameBoard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RoomProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/room" element={<WaitingRoom />} />
            <Route path="/game" element={<OnlineGameBoard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RoomProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
