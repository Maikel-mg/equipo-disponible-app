
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { HolidayManager } from "@/components/HolidayManager";
import { UserManagement } from "@/components/UserManagement";
import { TeamManagement } from "@/components/TeamManagement";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LeaveRequestsPage from "@/components/LeaveRequestsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/requests" element={<LeaveRequestsPage />} />
              <Route path="/calendar" element={<HolidayManager />} />
              <Route path="/team" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Equipo</h2><p className="text-gray-600 mt-2">En desarrollo...</p></div>} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/teams" element={<TeamManagement />} />
              <Route path="/reports" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Reportes</h2><p className="text-gray-600 mt-2">En desarrollo...</p></div>} />
              <Route path="/settings" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Configuración</h2><p className="text-gray-600 mt-2">En desarrollo...</p></div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
