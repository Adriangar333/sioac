import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Users,
  Search,
  FileText,
  Settings,
  Download,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/searches", label: "Búsquedas", icon: Search },
  { href: "/results", label: "Resultados", icon: FileText },
  { href: "/rules", label: "Reglas", icon: Shield },
  { href: "/exports", label: "Exportaciones", icon: Download },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background" data-testid="app-layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-50 h-full flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200
          ${collapsed ? "w-16" : "w-60"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        data-testid="sidebar"
      >
        {/* Logo area */}
        <div className={`flex items-center h-14 border-b border-sidebar-border px-3 ${collapsed ? "justify-center" : "gap-2"}`}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            S
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-sidebar-foreground leading-tight">SIOAC</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Reputación Online</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden h-7 w-7"
            onClick={() => setMobileOpen(false)}
            data-testid="close-mobile-sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav items */}
        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-0.5 px-2">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              const navLink = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
                >
                  <div
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                      ${active
                        ? "bg-sidebar-accent text-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }
                      ${collapsed ? "justify-center px-2" : ""}
                    `}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-primary" : ""}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }
              return navLink;
            })}
          </nav>
        </ScrollArea>

        {/* Bottom actions */}
        <div className={`border-t border-sidebar-border p-2 space-y-1 ${collapsed ? "items-center" : ""}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={`w-full ${collapsed ? "justify-center px-2" : "justify-start"}`}
            data-testid="toggle-theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!collapsed && <span className="ml-2 text-xs">{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>}
          </Button>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className={`w-full text-destructive hover:text-destructive ${collapsed ? "justify-center px-2" : "justify-start"}`}
              data-testid="logout-button"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="ml-2 text-xs">Cerrar sesión</span>}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex w-full h-7 justify-center"
            onClick={() => setCollapsed(!collapsed)}
            data-testid="toggle-collapse"
          >
            {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center h-14 border-b border-border px-4 bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            data-testid="open-mobile-sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 ml-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground font-bold text-xs">S</div>
            <span className="font-semibold text-sm">SIOAC</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 max-w-[1400px]">
            {children}
          </div>
          <footer className="px-6 py-3 border-t border-border">
            <PerplexityAttribution />
          </footer>
        </main>
      </div>
    </div>
  );
}
