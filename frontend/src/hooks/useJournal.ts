import { useState, useEffect } from "react";
import type { JournalEntry, MoodType } from "@/types";
import { MOCK_JOURNAL_ENTRIES } from "@/constants/data";
import { supabase } from "@/lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mindease-chat`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getUserId(): string {
  const storedUser = localStorage.getItem("mindease_user");
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      if (u && u.id) {
        return u.id;
      }
    } catch (e) {
      console.error("Error parsing user ID in useJournal:", e);
    }
  }
  let id = localStorage.getItem("mindease_device_id");
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("mindease_device_id", id);
  }
  return id;
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userId = getUserId();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_identifier", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load journal error:", error);
      // Fallback to mock data
      const stored = localStorage.getItem("mindease_journals");
      const isDemo = userId === "user_001" || userId.includes("demo") || userId.includes("alex");
      setEntries(stored ? JSON.parse(stored) : (isDemo ? MOCK_JOURNAL_ENTRIES : []));
    } else if (data && data.length > 0) {
      const mapped: JournalEntry[] = data.map((e) => ({
        id: e.id,
        date: e.entry_date,
        title: e.title,
        content: e.content,
        mood: e.mood as MoodType,
        moodScore: e.mood_score,
        aiInsight: e.ai_insight || undefined,
        tags: e.tags || [],
      }));
      setEntries(mapped);
    } else {
      // New user — show mock entries locally only if demo/mock account
      const isDemo = userId === "user_001" || userId.includes("demo") || userId.includes("alex");
      setEntries(isDemo ? MOCK_JOURNAL_ENTRIES : []);
    }
    setIsLoading(false);
  };

  const generateAIInsight = async (
    title: string,
    content: string,
    mood: string
  ): Promise<string> => {
    const resp = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ action: "journal_insight", title, content, mood }),
    });

    if (!resp.ok) {
      throw new Error("AI insight generation failed");
    }
    const data = await resp.json();
    return data.insight || "";
  };

  const addEntry = async (data: Omit<JournalEntry, "id" | "aiInsight">) => {
    setIsAnalyzing(true);

    let aiInsight = "";
    try {
      aiInsight = await generateAIInsight(data.title, data.content, data.mood);
    } catch (err) {
      console.error("AI insight error:", err);
      // Use mood-based fallback
      const fallbacks: Record<string, string> = {
        happy: "Your writing radiates positive energy. Capture what's making you feel this way — it's a resource to return to. 🌟",
        calm: "The groundedness in your writing reflects a regulated nervous system. Your mindfulness is clearly working. 🌿",
        sad: "Expressing sadness through writing is a powerful form of emotional processing. This emotion, like all emotions, is temporary. 💙",
        anxious: "I notice signs of heightened stress in your writing. Try to anchor in the now: what is actually true and safe right now? 🫁",
        tired: "Be gentle with yourself today. Rest is productive — your body and mind are communicating a need. 🌙",
        angry: "Your anger is valid — it's often a signal that a need went unmet. Writing it out is healthy. 🔥",
      };
      aiInsight = fallbacks[data.mood] || fallbacks.calm;
    }

    // Save to Supabase
    const { data: inserted, error } = await supabase
      .from("journal_entries")
      .insert({
        user_identifier: userId,
        title: data.title,
        content: data.content,
        mood: data.mood,
        mood_score: data.moodScore,
        ai_insight: aiInsight,
        tags: data.tags,
        entry_date: data.date,
      })
      .select()
      .single();

    if (error) {
      console.error("Save journal error:", error);
      // Still add locally
      const entry: JournalEntry = {
        ...data,
        id: `local_${Date.now()}`,
        aiInsight,
      };
      setEntries((prev) => [entry, ...prev]);
      setIsAnalyzing(false);
      return entry;
    }

    const entry: JournalEntry = {
      id: inserted.id,
      date: inserted.entry_date,
      title: inserted.title,
      content: inserted.content,
      mood: inserted.mood as MoodType,
      moodScore: inserted.mood_score,
      aiInsight: inserted.ai_insight || undefined,
      tags: inserted.tags || [],
    };

    setEntries((prev) => [entry, ...prev]);
    setIsAnalyzing(false);
    return entry;
  };

  const deleteEntry = async (id: string) => {
    if (!id.startsWith("local_")) {
      await supabase.from("journal_entries").delete().eq("id", id);
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return { entries, addEntry, deleteEntry, isAnalyzing, isLoading };
}
