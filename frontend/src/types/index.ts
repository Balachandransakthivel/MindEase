export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
  wellnessScore: number;
  onboardingCompleted?: boolean;
  onboardingData?: Record<string, string>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  emotion?: EmotionType;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodType;
  moodScore: number;
  stressLevel: number;
  sleepHours: number;
  energyLevel: number;
  notes: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: MoodType;
  moodScore: number;
  aiInsight?: string;
  tags: string[];
}

export type MoodType = "happy" | "sad" | "angry" | "anxious" | "tired" | "calm";

export type EmotionType =
  | "neutral"
  | "stressed"
  | "anxious"
  | "happy"
  | "sad"
  | "motivated"
  | "calm";

export interface MoodOption {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
  score: number;
}

export interface WeeklyMoodData {
  day: string;
  moodScore: number;
  stressLevel: number;
  sleepHours: number;
}

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export interface Recommendation {
  id: string;
  type: "meditation" | "breathing" | "motivation" | "sleep" | "music" | "exercise";
  title: string;
  description: string;
  duration: string;
  icon: string;
  color: string;
}
