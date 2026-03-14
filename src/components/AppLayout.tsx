import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, Building2, Layers, Users, MapPin,
  FolderTree, Tag, Bell, Settings, Menu, X, ChevronLeft, User, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Cases", icon: FileText, path: "/cases" },
  { label: "Companies", icon: Building2, path: "/companies" },
  { label: "Units", icon: Layers, path: "/units" },
  { label: "Users", icon: Users, path: "/users" },
  { label: "Locations", icon: MapPin, path: "/locations" },
  { label: "Categories", icon: FolderTree, path: "/case-categories" },
  { label: "Case Types", icon: Tag, path: "/case-types" },
  { label: "Notifications", icon: Bell, path: "/notifications" },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300 md:relative md:z-auto",
          collapsed ? "md:w-[72px]" : "md:w-60",
          sidebarOpen ? "w-60 translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <span className="text-lg font-bold text-foreground">
              Report<span className="text-primary">Sys</span>
            </span>
          )}
          {collapsed && <span className="text-lg font-bold text-primary mx-auto">R</span>}
          <button onClick={() => setSidebarOpen(false)} className="p-1 text-muted-foreground md:hidden">
            <X className="h-5 w-5" />
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden p-1 text-muted-foreground hover:text-foreground md:block">
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        {!collapsed && user && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-primary-foreground text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.role}</p>
              </div>
              <button onClick={handleLogout} className="p-1 text-muted-foreground hover:text-destructive" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-muted-foreground hover:text-foreground md:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};
