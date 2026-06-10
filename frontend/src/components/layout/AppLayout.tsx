import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-[100dvh] bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-zinc-950 text-foreground">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 glass border-b border-violet-100 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-violet-50 transition-colors"
            aria-label="Open menu"
          >
            <span className="block w-5 h-0.5 bg-indigo-700 mb-1" />
            <span className="block w-5 h-0.5 bg-indigo-700 mb-1" />
            <span className="block w-4 h-0.5 bg-indigo-700" />
          </button>
          <span className="font-serif font-semibold text-indigo-900 text-lg">MindEase</span>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl hover:bg-violet-50 dark:hover:bg-slate-800 text-indigo-900 dark:text-violet-200 transition-colors flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
