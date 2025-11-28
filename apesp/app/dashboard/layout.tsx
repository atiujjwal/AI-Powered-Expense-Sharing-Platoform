"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Wallet,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  User,
} from "lucide-react";
import useAuth from "../../src/hooks/useAuth";
import { cn } from "../../src/lib/utils";
import Button from "../../src/components/ui/Button";

const nav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Groups", href: "/dashboard/groups", icon: Users },
  { name: "Expenses", href: "/dashboard/expenses", icon: Receipt },
  { name: "Budgets", href: "/dashboard/budgets", icon: Wallet },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Feed", href: "/dashboard/feed", icon: Calendar },
  { name: "Chatbot", href: "/dashboard/chatbot", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-mono-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-mono-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-mono-200 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-mono-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-mono-900" />
            <span className="font-semibold text-mono-900">pAIse</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-mono-600 hover:text-mono-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-mono-900 text-white"
                    : "text-mono-600 hover:bg-mono-100 hover:text-mono-900"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-mono-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-mono-200 flex items-center justify-center">
              <User className="w-5 h-5 text-mono-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-mono-900 truncate">
                {isClient ? user?.name || "User" : "User"}
              </p>
              <p className="text-xs text-mono-500 truncate">
                {isClient ? user?.email || "you@example.com" : "you@example.com"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={logout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Logout
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-mono-200 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-mono-600 hover:text-mono-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 max-w-lg mx-4 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mono-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-mono-200 bg-mono-50 text-sm focus:outline-none focus:ring-2 focus:ring-mono-300"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-mono-600 hover:text-mono-900 hover:bg-mono-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
