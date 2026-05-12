import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMoodTracker } from "@/hooks/useMoodTracker";
import { useJournal } from "@/hooks/useJournal";
import { MessageCircleHeart, Smile, BookOpen, BarChart3, ArrowRight, TrendingUp, Flame, Moon } from "lucide-react";
import { MOOD_OPTIONS, RECOMMENDATIONS } from "@/constants/data";

const QUICK_ACTIONS = [
  { label: "Chat with AI", icon: MessageCircleHeart, to: "/app/chat", color: "from-violet-500 to-purple-600", desc: "Talk to your AI therapist" },
  { label: "Log Mood", icon: Smile, to: "/app/mood", color: "from-amber-400 to-orange-500", desc: "How are you feeling?" },
  { label: "Write Journal", icon: BookOpen, to: "/app/journal", color: "from-emerald-400 to-teal-500", desc: "Capture your thoughts" },
  { label: "View Analytics", icon: BarChart3, to: "/app/analytics", color: "from-blue-400 to-indigo-500", desc: "See your progress" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { entries, todayEntry, averageMoodScore, averageStress } = useMoodTracker();
  const { entries: journals } = useJournal();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const latestMood = entries[0];
  const moodOption = latestMood ? MOOD_OPTIONS.find((m) => m.type === latestMood.mood) : null;

  const streak = entries.length >= 3 ? 7 : entries.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-gray-400 text-sm font-medium">{greeting} ✨</p>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-indigo-950 mt-0.5">
            {user?.name?.split(" ")[0] || "Friend"}, how are you today?
          </h1>
        </div>
        {todayEntry && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <span className="text-sm">{MOOD_OPTIONS.find((m) => m.type === todayEntry.mood)?.emoji}</span>
            <span className="text-emerald-700 text-sm font-medium">Today logged ✓</span>
          </div>
        )}
      </div>

      {/* Wellness Score + Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-2 p-5 rounded-2xl wellness-gradient text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <p className="text-white/70 text-xs font-medium mb-1">Wellness Score</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold">{user?.wellnessScore || 72}</span>
            <span className="text-white/60 text-sm mb-1">/100</span>
            <span className="text-emerald-300 text-xs mb-1 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +4 this week
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-300 to-emerald-300 rounded-full"
              style={{ width: `${user?.wellnessScore || 72}%` }}
            />
          </div>
          <p className="text-white/60 text-xs mt-2">You're doing great — keep going 💙</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-semibold text-gray-500">Streak</span>
          </div>
          <div>
            <span className="text-3xl font-bold text-indigo-900">{streak}</span>
            <span className="text-gray-400 text-sm ml-1">days</span>
          </div>
          <p className="text-gray-400 text-xs mt-1">Keep it going! 🔥</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Moon className="w-4 h-4" />
            <span className="text-xs font-semibold text-gray-500">Avg Sleep</span>
          </div>
          <div>
            <span className="text-3xl font-bold text-indigo-900">
              {entries.length ? (entries.slice(0, 7).reduce((s, e) => s + e.sleepHours, 0) / Math.min(entries.length, 7)).toFixed(1) : "—"}
            </span>
            <span className="text-gray-400 text-sm ml-1">hrs</span>
          </div>
          <p className="text-gray-400 text-xs mt-1">7–8h recommended</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ label, icon: Icon, to, color, desc }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="group p-5 rounded-2xl bg-white border border-gray-100 shadow-sm card-hover text-left"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-indigo-900 text-sm">{label}</p>
              <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Mood */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-semibold text-indigo-900 text-lg">Recent Moods</h2>
            <button onClick={() => navigate("/app/mood")} className="text-violet-600 text-xs font-semibold flex items-center gap-1 hover:underline">
              Track Today <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2.5">
            {entries.slice(0, 4).map((entry) => {
              const opt = MOOD_OPTIONS.find((m) => m.type === entry.mood);
              return (
                <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <span className="text-xl">{opt?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{opt?.label}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(entry.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${entry.moodScore}%`, backgroundColor: opt?.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Recommendation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-semibold text-indigo-900 text-lg">AI Recommendations</h2>
            <span className="text-xs text-gray-400">Based on your mood</span>
          </div>
          <div className="space-y-3">
            {RECOMMENDATIONS.slice(0, 3).map((rec) => (
              <div key={rec.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: `${rec.color}20` }}
                >
                  {rec.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{rec.title}</p>
                  <p className="text-gray-400 text-xs truncate">{rec.description}</p>
                </div>
                <div className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: rec.color, backgroundColor: `${rec.color}15` }}>
                  {rec.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Journal */}
      {journals[0] && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif font-semibold text-indigo-900 text-lg">Latest Journal</h2>
            <button onClick={() => navigate("/app/journal")} className="text-violet-600 text-xs font-semibold flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <span>{MOOD_OPTIONS.find((m) => m.type === journals[0].mood)?.emoji}</span>
              <h3 className="font-semibold text-indigo-900 text-sm">{journals[0].title}</h3>
              <span className="ml-auto text-xs text-gray-400">
                {new Date(journals[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{journals[0].content}</p>
            {journals[0].aiInsight && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-white border border-indigo-100">
                <span className="text-violet-500 text-xs font-bold mt-0.5">AI</span>
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{journals[0].aiInsight}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-center text-xs text-gray-400 py-2">
        MindEase is not a substitute for professional medical help. In crisis, call your local emergency services.
      </div>
    </div>
  );
}
