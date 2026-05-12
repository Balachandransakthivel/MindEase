import { useState } from "react";
import { useMoodTracker } from "@/hooks/useMoodTracker";
import { MOOD_OPTIONS } from "@/constants/data";
import type { MoodType } from "@/types";
import { Check, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { toast } from "sonner";

export default function MoodTrackerPage() {
  const { entries, addEntry, todayEntry, averageMoodScore, averageStress, isLoading } = useMoodTracker();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(todayEntry?.mood || null);
  const [stressLevel, setStressLevel] = useState(todayEntry?.stressLevel || 30);
  const [sleepHours, setSleepHours] = useState(todayEntry?.sleepHours || 7);
  const [energyLevel, setEnergyLevel] = useState(todayEntry?.energyLevel || 60);
  const [notes, setNotes] = useState(todayEntry?.notes || "");
  const [submitted, setSubmitted] = useState(!!todayEntry);

  const handleSubmit = () => {
    if (!selectedMood) { toast.error("Please select a mood"); return; }
    const opt = MOOD_OPTIONS.find((m) => m.type === selectedMood)!;
    addEntry({
      date: new Date().toISOString().split("T")[0],
      mood: selectedMood,
      moodScore: opt.score,
      stressLevel,
      sleepHours,
      energyLevel,
      notes,
    });
    toast.success("Mood logged! Keep tracking your journey 🌿");
    setSubmitted(true);
  };

  const trend = averageMoodScore > 60 ? "up" : averageMoodScore > 40 ? "flat" : "down";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-indigo-950">Mood Tracker</h1>
        <p className="text-gray-400 text-sm mt-1">How are you feeling today? Tracking takes only 60 seconds.</p>
      </div>

      {/* Stats row */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-24 animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "7-Day Avg Mood", value: `${averageMoodScore}%`, trend, icon: averageMoodScore > 60 ? TrendingUp : averageMoodScore > 40 ? Minus : TrendingDown },
            { label: "Avg Stress", value: `${averageStress}%`, color: averageStress > 60 ? "text-red-500" : "text-emerald-600" },
            { label: "Entries Logged", value: `${entries.length}`, color: "text-violet-600" },
          ].map(({ label, value, color, trend, icon: Icon }, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color || "text-indigo-900"}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Today's Log Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-serif font-semibold text-indigo-900 text-xl mb-5">
          {submitted ? "Today's Mood Logged ✓" : "Log Today's Mood"}
        </h2>

        {/* Mood Selection */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-3">How are you feeling right now?</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => !submitted && setSelectedMood(opt.type)}
                disabled={submitted}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${
                  selectedMood === opt.type
                    ? "border-violet-400 bg-violet-50 shadow-md scale-105"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                } disabled:cursor-default`}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <span className="text-xs font-medium text-gray-600">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[
            { label: "Stress Level", value: stressLevel, setter: setStressLevel, color: stressLevel > 60 ? "#ef4444" : "#6366f1", unit: "%", emoji: "😤" },
            { label: "Sleep Last Night", value: sleepHours, setter: setSleepHours, color: "#3b82f6", min: 2, max: 12, step: 0.5, unit: "hrs", emoji: "🌙" },
            { label: "Energy Level", value: energyLevel, setter: setEnergyLevel, color: "#f59e0b", unit: "%", emoji: "⚡" },
          ].map(({ label, value, setter, color, min = 0, max = 100, step = 1, unit, emoji }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                  <span>{emoji}</span> {label}
                </label>
                <span className="text-sm font-bold" style={{ color }}>{value}{unit}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => !submitted && setter(Number(e.target.value))}
                disabled={submitted}
                className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:cursor-default"
                style={{ accentColor: color }}
              />
              <div className="flex justify-between text-xs text-gray-300 mt-1">
                <span>{min}{unit}</span>
                <span>{max}{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 mb-2">📝 Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => !submitted && setNotes(e.target.value)}
            disabled={submitted}
            placeholder="What's on your mind? Any specific events affecting your mood..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all disabled:bg-gray-50 disabled:cursor-default"
          />
        </div>

        {!submitted ? (
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl wellness-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Log My Mood
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 font-medium text-sm">Today's entry saved. See you tomorrow! 🌿</span>
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-serif font-semibold text-indigo-900 text-xl mb-4">Mood History</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-100 animate-shimmer" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-10 px-4">
             <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-4">
               <span className="text-3xl">🌱</span>
             </div>
             <p className="text-gray-500 text-sm">No mood logs yet. Start tracking to see your emotional patterns over time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const opt = MOOD_OPTIONS.find((m) => m.type === entry.mood)!;
              return (
                <div key={entry.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="text-2xl">{opt.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-gray-800 text-sm">{opt.label}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(entry.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>Stress <strong className={entry.stressLevel > 60 ? "text-red-500" : "text-emerald-600"}>{entry.stressLevel}%</strong></span>
                      <span>Sleep <strong className="text-blue-600">{entry.sleepHours}h</strong></span>
                      <span>Energy <strong className="text-amber-500">{entry.energyLevel}%</strong></span>
                    </div>
                    {entry.notes && <p className="text-xs text-gray-400 truncate mt-1 italic">"{entry.notes}"</p>}
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: opt.color }}
                  >
                    {entry.moodScore}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
