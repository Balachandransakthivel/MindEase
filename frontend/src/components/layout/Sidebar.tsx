import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  MessageCircleHeart,
  BarChart3,
  BookOpen,
  Smile,
  Settings,
  LogOut,
  X,
  Sparkles,
  Wind,
  Sun,
  Moon,
} from "lucide-react";
import aiAvatar from "@/assets/ai-avatar.png";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/chat", label: "AI Therapist", icon: MessageCircleHeart },
  { to: "/app/mood", label: "Mood Tracker", icon: Smile },
  { to: "/app/journal", label: "My Journal", icon: BookOpen },
  { to: "/app/breathing", label: "Breathing Space", icon: Wind },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 lg:z-auto flex flex-col
          wellness-gradient transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-semibold text-white text-xl">MindEase</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-300 to-indigo-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user?.name?.[0] || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-white font-medium text-sm truncate">{user?.name}</p>
                <p className="text-white/60 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all ml-2 flex-shrink-0 flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Wellness Score */}
        <div className="px-4 py-3">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70 text-xs font-medium">Wellness Score</span>
              <span className="text-white font-bold text-sm">{user?.wellnessScore || 72}/100</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-300 to-emerald-300 rounded-full transition-all duration-700"
                style={{ width: `${user?.wellnessScore || 72}%` }}
              />
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-white text-indigo-800 shadow-lg"
                  : "text-white/75 hover:bg-white/15 hover:text-white"
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0 w-[18px] h-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-6 space-y-1">
          <div className="glass-dark rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <img src={aiAvatar} alt="AI" className="w-5 h-5 rounded-full" />
              <span className="text-violet-300 text-xs font-semibold">AI Status</span>
            </div>
            <p className="text-white/60 text-xs">Therapist AI is online and ready 🟢</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
