import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import CasesList from "./pages/CasesList";
import CreateCase from "./pages/CreateCase";
import CaseDetail from "./pages/CaseDetail";
import Companies from "./pages/Companies";
import Units from "./pages/Units";
import Users from "./pages/Users";
import Locations from "./pages/Locations";
import CaseCategories from "./pages/CaseCategories";
import CaseTypes from "./pages/CaseTypes";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/cases" element={<CasesList />} />
                      <Route path="/cases/new" element={<CreateCase />} />
                      <Route path="/cases/:id" element={<CaseDetail />} />
                      <Route path="/companies" element={<Companies />} />
                      <Route path="/units" element={<Units />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/locations" element={<Locations />} />
                      <Route path="/case-categories" element={<CaseCategories />} />
                      <Route path="/case-types" element={<CaseTypes />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
