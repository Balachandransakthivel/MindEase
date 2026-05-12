import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50">
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
          <div className="w-9" />
        </div>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
