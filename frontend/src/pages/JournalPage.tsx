import { useState } from "react";
import { useJournal } from "@/hooks/useJournal";
import { MOOD_OPTIONS } from "@/constants/data";
import type { MoodType } from "@/types";
import { Plus, X, Trash2, Search, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export default function JournalPage() {
  const { entries, addEntry, deleteEntry, isAnalyzing, isLoading } = useJournal();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<MoodType>("calm");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) { toast.error("Please fill in the title and content"); return; }
    const opt = MOOD_OPTIONS.find((m) => m.type === mood)!;
    await addEntry({
      date: new Date().toISOString().split("T")[0],
      title: title.trim(),
      content: content.trim(),
      mood,
      moodScore: opt.score,
      tags: [],
    });
    toast.success("Journal saved with AI insights ✨");
    setTitle("");
    setContent("");
    setMood("calm");
    setShowForm(false);
  };

  const filtered = entries.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-indigo-950">My Journal</h1>
          <p className="text-gray-400 text-sm mt-1">{entries.length} entries · AI-analyzed</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl wellness-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "New Entry"}
        </button>
      </div>

      {/* New Entry Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-violet-100 shadow-md p-6 animate-fade-in">
          <h2 className="font-serif font-semibold text-indigo-900 text-lg mb-4">New Journal Entry</h2>

          {/* Mood */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">How are you feeling?</p>
            <div className="flex gap-2 flex-wrap">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setMood(opt.type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                    mood === opt.type ? "border-violet-400 bg-violet-50" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <span>{opt.emoji}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this entry a title..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all font-medium"
            />
          </div>

          <div className="mb-5">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely... there's no judgment here. Let your thoughts flow."
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all resize-none text-gray-700 leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={isAnalyzing}
              className="flex-1 py-3 rounded-xl wellness-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Save with AI Insights
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your journal..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all"
        />
      </div>

      {/* Entries */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 animate-shimmer" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-100 rounded w-1/3 animate-shimmer" />
                    <div className="h-3 bg-gray-50 rounded w-1/4 animate-shimmer" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-50 rounded w-full animate-shimmer" />
                  <div className="h-3 bg-gray-50 rounded w-5/6 animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white/50 rounded-3xl border border-dashed border-violet-200">
            <div className="w-24 h-24 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-6">
              <BookOpenIcon className="w-10 h-10 text-violet-300" />
            </div>
            <h3 className="text-lg font-serif font-bold text-indigo-900 mb-2">
              {searchQuery ? "No entries found" : "Your mind is a blank canvas"}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
              {searchQuery 
                ? "Try adjusting your search terms to find what you're looking for." 
                : "Take a deep breath and let your thoughts flow. Your private journal is a safe space for reflection and growth."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline"
              >
                Write your first entry →
              </button>
            )}
          </div>
        ) : (
          filtered.map((entry) => {
            const opt = MOOD_OPTIONS.find((m) => m.type === entry.mood)!;
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:border-violet-200 transition-colors">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl flex-shrink-0 bg-gray-50 w-12 h-12 flex items-center justify-center rounded-xl">{opt.emoji}</span>
                      <div className="min-w-0">
                        <h3 className="font-serif font-semibold text-indigo-900 text-base leading-tight truncate">
                          {entry.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            weekday: "long", month: "long", day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { deleteEntry(entry.id); toast.success("Entry deleted"); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className={`text-gray-600 text-sm leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}>
                    {entry.content}
                  </p>

                  {isExpanded && entry.aiInsight && (
                    <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 animate-fade-in relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                      <div className="flex items-center gap-2 mb-2 relative">
                        <Sparkles className="w-4 h-4 text-violet-500" />
                        <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">AI Insight</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed italic relative z-10">"{entry.aiInsight}"</p>
                    </div>
                  )}

                  {entry.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-4">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-indigo-50/50 text-indigo-600 text-xs font-medium border border-indigo-100">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}
