import { useMoodTracker } from "@/hooks/useMoodTracker";
import { useJournal } from "@/hooks/useJournal";
import { useNavigate } from "react-router-dom";
import { WEEKLY_MOOD_DATA, MOOD_OPTIONS, RECOMMENDATIONS } from "@/constants/data";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ScatterChart,
  Scatter,
} from "recharts";
import { TrendingUp, Award, Target, Zap, Sparkles, BarChart3 as BarChartIcon } from "lucide-react";
import { useState, useEffect } from "react";

function AnimatedCounter({ value, suffix = "", decimals = 0 }: { value: number, suffix?: string, decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const steps = duration / 16;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toFixed(decimals)}{suffix}</span>;
}

const RADAR_DATA = [
  { subject: "Mood", value: 72 },
  { subject: "Sleep", value: 65 },
  { subject: "Energy", value: 58 },
  { subject: "Focus", value: 70 },
  { subject: "Social", value: 50 },
  { subject: "Calm", value: 80 },
];

export default function AnalyticsPage() {
  const { entries, averageMoodScore, averageStress, isLoading: isMoodLoading } = useMoodTracker();
  const { entries: journals, isLoading: isJournalLoading } = useJournal();
  const navigate = useNavigate();

  const isLoading = isMoodLoading || isJournalLoading;

  const chartData = entries.length > 0
    ? [...entries]
        .slice(0, 7)
        .reverse()
        .map((e) => ({
          day: new Date(e.date).toLocaleDateString("en-US", { weekday: "short" }),
          moodScore: e.moodScore,
          stressLevel: e.stressLevel,
          sleepHours: e.sleepHours,
        }))
    : WEEKLY_MOOD_DATA;

  const avgSleepHours = entries.length
    ? entries.reduce((s, e) => s + e.sleepHours, 0) / entries.length
    : 7.5;
  const avgEnergyLevel = entries.length
    ? entries.reduce((s, e) => s + e.energyLevel, 0) / entries.length
    : 70;
  
  const radarData = entries.length > 0
    ? [
        { subject: "Mood", value: averageMoodScore },
        { subject: "Sleep", value: Math.min(100, Math.round((avgSleepHours / 8) * 100)) },
        { subject: "Energy", value: Math.round(avgEnergyLevel) },
        { subject: "Focus", value: Math.round((averageMoodScore + (100 - averageStress)) / 2) },
        { subject: "Social", value: Math.round(averageMoodScore * 0.9) },
        { subject: "Calm", value: 100 - averageStress },
      ]
    : RADAR_DATA;

  const moodDist = MOOD_OPTIONS.map((opt) => ({
    name: `${opt.emoji} ${opt.label}`,
    count: entries.filter((e) => e.mood === opt.type).length,
    color: opt.color,
  })).filter((d) => d.count > 0);

  const sleepAvg = entries.length
    ? (entries.slice(0, 7).reduce((s, e) => s + e.sleepHours, 0) / Math.min(entries.length, 7)).toFixed(1)
    : "—";

  const journalStreak = journals.length;

  const heatmapData = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const dateStr = d.toISOString().split("T")[0];
    const entry = entries.find(e => e.date === dateStr);
    return {
      date: dateStr,
      level: entry ? Math.max(1, Math.ceil(entry.moodScore / 25)) : 0,
      mood: entry?.mood || "none"
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-indigo-950">Wellness Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Your emotional progress at a glance · Last 7 days</p>
      </div>

      {/* AI Wellness Summary */}
      {!isLoading && entries.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h2 className="font-serif font-semibold text-lg">AI Wellness Insights</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Summary Status Card */}
              <div className="glass-dark rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-white/60 uppercase tracking-widest font-semibold">Weekly Outlook</span>
                  <p className="text-lg font-bold mt-1 font-serif">
                    {averageMoodScore > 60 ? "Positive & Balanced 🌿" : "Elevated Stress ⚡"}
                  </p>
                </div>
                <p className="text-xs text-white/70 mt-4 leading-relaxed font-light">
                  {averageMoodScore > 60 
                    ? "Your emotional trends show strong resilience and self-regulation this week."
                    : "Your indicators suggest a demanding week with high cognitive load."}
                </p>
              </div>

              {/* Insights List */}
              <div className="glass-dark rounded-xl p-4 md:col-span-2 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-white/60 uppercase tracking-widest font-semibold">Key Highlights</span>
                  <ul className="space-y-2 text-xs text-white/90 mt-2.5">
                    {averageMoodScore > 60 ? (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-300 font-bold">✓</span>
                          <span>Stress levels are well-managed and within optimal boundaries.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-300 font-bold">✓</span>
                          <span>Sleep and mood correlate positively; sleep habits are paying off.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-300 font-bold">✓</span>
                          <span>Consistent self-tracking suggests strong habit loop formation.</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-300 font-bold">!</span>
                          <span>Noticing elevated stress patterns over multiple consecutive logs.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-300 font-bold">!</span>
                          <span>Sleep durations have dropped, directly impacting mood resilience.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-300 font-bold">!</span>
                          <span>Energy levels are fluctuating; consider prioritizing mental recovery.</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/60 uppercase font-semibold">Recommended Action:</span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-white/20 rounded-full">
                      {averageMoodScore > 60 ? "Maintain Routine 🧘" : "Try Box Breathing 🫁"}
                    </span>
                  </div>
                  <button 
                    onClick={() => navigate(averageMoodScore > 60 ? "/app/journal" : "/app/breathing")}
                    className="text-xs font-semibold text-amber-200 hover:text-white hover:underline flex items-center gap-1 transition-colors"
                  >
                    Start Session →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-[116px] animate-shimmer" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/50 rounded-3xl border border-dashed border-violet-200">
           <div className="w-20 h-20 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-4">
             <BarChartIcon className="w-8 h-8 text-violet-300" />
           </div>
           <h3 className="text-lg font-serif font-bold text-indigo-900 mb-2">No data yet</h3>
           <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
             Start logging your mood and journals to unlock personalized wellness insights and AI analysis.
           </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg Mood Score", value: averageMoodScore, suffix: "%", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50", note: "vs 58% last week" },
          { label: "Avg Stress", value: averageStress, suffix: "%", icon: Zap, color: "text-orange-500", bg: "bg-orange-50", note: averageStress < 50 ? "Under control 🎯" : "High — breathe 🫁" },
          { label: "Avg Sleep", value: parseFloat(sleepAvg as string) || 0, decimals: 1, suffix: "h", icon: Target, color: "text-blue-600", bg: "bg-blue-50", note: "Goal: 7–8h" },
          { label: "Journal Entries", value: journalStreak, suffix: "", icon: Award, color: "text-emerald-600", bg: "bg-emerald-50", note: "Keep writing ✍️" },
        ].map(({ label, value, suffix, decimals = 0, icon: Icon, color, bg, note }, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${color} w-[18px] h-[18px]`} />
            </div>
            <p className="text-xs text-gray-400 font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${color}`}>
              <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
            </p>
            <p className="text-xs text-gray-400 mt-1">{note}</p>
          </div>
        ))}
      </div>

      {/* Mood Trend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-serif font-semibold text-indigo-900 text-xl mb-1">Weekly Mood Trend</h2>
        <p className="text-gray-400 text-xs mb-5">Mood score and stress levels over the past 7 days</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontSize: 12 }}
            />
            <Area type="monotone" dataKey="moodScore" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#moodGrad)" name="Mood Score" />
            <Area type="monotone" dataKey="stressLevel" stroke="#f97316" strokeWidth={2} fill="url(#stressGrad)" name="Stress Level" strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-3 justify-center">
          {[{ color: "#8b5cf6", label: "Mood Score" }, { color: "#f97316", label: "Stress Level" }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-0.5 rounded" style={{ backgroundColor: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="font-serif font-semibold text-indigo-900 text-lg mb-1">Emotional Heatmap</h2>
          <p className="text-gray-400 text-xs mb-4">Your mood intensity over the last 28 days</p>
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-rows-4 grid-flow-col gap-1.5">
              {heatmapData.map((day, i) => (
                <div 
                  key={i} 
                  title={`${day.date} - ${day.mood}`}
                  className={`w-[18px] h-[18px] rounded-sm transition-all duration-300 hover:scale-125 cursor-pointer ${
                    day.level === 0 ? 'bg-gray-100' :
                    day.level === 1 ? 'bg-violet-200' :
                    day.level === 2 ? 'bg-violet-300' :
                    day.level === 3 ? 'bg-violet-400' : 'bg-violet-500'
                  }`} 
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-gray-400 font-medium">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-gray-100"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-violet-200"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-violet-300"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-violet-400"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-violet-500"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Correlation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-serif font-semibold text-indigo-900 text-lg mb-1">Sleep vs Mood Correlation</h2>
          <p className="text-gray-400 text-xs mb-4">How your rest affects your emotions</p>
          <ResponsiveContainer width="100%" height={180}>
            <ScatterChart margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" dataKey="sleepHours" name="Sleep" unit="h" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
              <YAxis type="number" dataKey="moodScore" name="Mood" unit="%" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12, padding: "8px 12px" }} />
              <Scatter name="Correlation" data={chartData} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-serif font-semibold text-indigo-900 text-lg mb-1">Sleep Analysis</h2>
          <p className="text-gray-400 text-xs mb-4">Hours slept per night</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 12]} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }}
                formatter={(v) => [`${v}h`, "Sleep"]}
              />
              <Bar dataKey="sleepHours" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Sleep Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Wellness Radar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-serif font-semibold text-indigo-900 text-lg mb-1">Wellness Radar</h2>
          <p className="text-gray-400 text-xs mb-4">Overall emotional balance score</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Radar name="Wellness" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mood Distribution */}
      {moodDist.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-serif font-semibold text-indigo-900 text-xl mb-1">Mood Distribution</h2>
          <p className="text-gray-400 text-xs mb-5">How often you've felt each emotion</p>
          <div className="space-y-3">
            {moodDist.map(({ name, count, color }) => {
              const pct = Math.round((count / entries.length) * 100);
              return (
                <div key={name} className="flex items-center gap-4">
                  <span className="w-28 text-sm text-gray-600 flex-shrink-0">{name}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 w-12 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-serif font-semibold text-indigo-900 text-xl mb-1">AI Recommendations</h2>
        <p className="text-gray-400 text-xs mb-5">Personalized based on your mood patterns</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RECOMMENDATIONS.map((rec) => (
            <div key={rec.id} className="group p-4 rounded-2xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${rec.color}18` }}>
                  {rec.icon}
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: rec.color, backgroundColor: `${rec.color}18` }}>
                  {rec.duration}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{rec.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
