import { useState, useEffect } from "react";
import type { MoodEntry, MoodType } from "@/types";
import { MOCK_MOOD_ENTRIES } from "@/constants/data";
import { supabase } from "@/lib/supabase";

function getUserId(): string {
  const storedUser = localStorage.getItem("mindease_user");
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      if (u && u.id) {
        return u.id;
      }
    } catch (e) {
      console.error("Error parsing user ID in useMoodTracker:", e);
    }
  }
  let id = localStorage.getItem("mindease_device_id");
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("mindease_device_id", id);
  }
  return id;
}

export function useMoodTracker() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = getUserId();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_identifier", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load mood error:", error);
      const stored = localStorage.getItem("mindease_moods");
      const isDemo = userId === "user_001" || userId.includes("demo") || userId.includes("alex");
      setEntries(stored ? JSON.parse(stored) : (isDemo ? MOCK_MOOD_ENTRIES : []));
    } else if (data && data.length > 0) {
      const mapped: MoodEntry[] = data.map((e) => ({
        id: e.id,
        date: e.entry_date,
        mood: e.mood as MoodType,
        moodScore: e.mood_score,
        stressLevel: e.stress_level,
        sleepHours: parseFloat(e.sleep_hours),
        energyLevel: e.energy_level,
        notes: e.notes || "",
      }));
      setEntries(mapped);
    } else {
      const isDemo = userId === "user_001" || userId.includes("demo") || userId.includes("alex");
      setEntries(isDemo ? MOCK_MOOD_ENTRIES : []);
    }
    setIsLoading(false);
  };

  const addEntry = async (data: Omit<MoodEntry, "id">) => {
    const { data: inserted, error } = await supabase
      .from("mood_entries")
      .insert({
        user_identifier: userId,
        mood: data.mood,
        mood_score: data.moodScore,
        stress_level: data.stressLevel,
        sleep_hours: data.sleepHours,
        energy_level: data.energyLevel,
        notes: data.notes,
        entry_date: data.date,
      })
      .select()
      .single();

    if (error) {
      console.error("Save mood error:", error);
      // Fallback local
      const entry: MoodEntry = { ...data, id: `local_${Date.now()}` };
      setEntries((prev) => [entry, ...prev]);
      return entry;
    }

    const entry: MoodEntry = {
      id: inserted.id,
      date: inserted.entry_date,
      mood: inserted.mood as MoodType,
      moodScore: inserted.mood_score,
      stressLevel: inserted.stress_level,
      sleepHours: parseFloat(inserted.sleep_hours),
      energyLevel: inserted.energy_level,
      notes: inserted.notes || "",
    };

    setEntries((prev) => [entry, ...prev]);
    return entry;
  };

  const todayEntry = entries.find(
    (e) => e.date === new Date().toISOString().split("T")[0]
  );

  const averageMoodScore = entries.length
    ? Math.round(
        entries.slice(0, 7).reduce((sum, e) => sum + e.moodScore, 0) /
          Math.min(entries.length, 7)
      )
    : 0;

  const averageStress = entries.length
    ? Math.round(
        entries.slice(0, 7).reduce((sum, e) => sum + e.stressLevel, 0) /
          Math.min(entries.length, 7)
      )
    : 0;

  return { entries, addEntry, todayEntry, averageMoodScore, averageStress, isLoading };
}
