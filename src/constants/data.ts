import type { MoodOption, User, MoodEntry, JournalEntry, WeeklyMoodData, Recommendation } from "@/types";

export const MOOD_OPTIONS: MoodOption[] = [
  { type: "happy", emoji: "😊", label: "Happy", color: "#f59e0b", score: 90 },
  { type: "calm", emoji: "😌", label: "Calm", color: "#10b981", score: 80 },
  { type: "tired", emoji: "😴", label: "Tired", color: "#6366f1", score: 50 },
  { type: "sad", emoji: "😔", label: "Sad", color: "#3b82f6", score: 30 },
  { type: "anxious", emoji: "😰", label: "Anxious", color: "#f97316", score: 20 },
  { type: "angry", emoji: "😡", label: "Angry", color: "#ef4444", score: 10 },
];

export const MOCK_USER: User = {
  id: "user_001",
  name: "Alex Johnson",
  email: "alex@example.com",
  joinedAt: "2024-11-01",
  wellnessScore: 72,
};

export const INITIAL_MESSAGES = [
  {
    id: "msg_001",
    role: "assistant" as const,
    content: "Hello! I'm MindEase, your AI wellness companion 🌿 I'm here to listen, support, and help you navigate your emotions. How are you feeling today?",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    emotion: "calm" as const,
  },
];

export const SMART_PROMPTS = [
  "I'm feeling stressed about work",
  "I can't sleep well lately",
  "I feel anxious and overwhelmed",
  "I need motivation today",
  "I'm feeling lonely",
  "Help me calm down",
];

export const AI_RESPONSES: Record<string, { content: string; emotion: string }[]> = {
  stress: [
    {
      content: "I hear you — stress can feel incredibly heavy, especially when it builds up. Let's take a moment together. Try this: breathe in slowly for 4 counts, hold for 4, then exhale for 6. Repeat this 3 times. 🫁 How long have you been feeling this way?",
      emotion: "calm",
    },
    {
      content: "Stress is your mind's way of telling you something needs attention. You're not alone in this. Can you tell me more about what's been weighing on you? Sometimes just naming it can ease the pressure a little. 💙",
      emotion: "neutral",
    },
  ],
  anxiety: [
    {
      content: "Anxiety can feel like your mind is racing ahead of you. I want you to know — you're safe right now, in this moment. Let's ground ourselves: name 5 things you can see around you right now. Take your time. 🌿",
      emotion: "calm",
    },
    {
      content: "It's completely understandable to feel anxious. Our nervous system is just trying to protect us, even when it's overdoing it. What's the main thing worrying you the most right now?",
      emotion: "neutral",
    },
  ],
  sleep: [
    {
      content: "Poor sleep affects everything — mood, focus, emotional resilience. Let's work on this together. A few things that help: avoid screens 30 min before bed, keep a consistent sleep time, and try progressive muscle relaxation. 🌙 What does your bedtime routine look like currently?",
      emotion: "neutral",
    },
  ],
  motivation: [
    {
      content: "You reached out today — that itself shows strength and self-awareness. 🌟 Remember: you don't need to feel motivated to start. Sometimes starting creates the motivation. What's one small thing you could do in the next 10 minutes that would move you forward?",
      emotion: "motivated",
    },
  ],
  sad: [
    {
      content: "I'm really glad you told me. Sadness is a valid, human emotion — it deserves space. You don't have to push it away. I'm here to sit with you in this. 💙 Would you like to talk about what's making you feel sad, or would you prefer some gentle comfort right now?",
      emotion: "neutral",
    },
  ],
  lonely: [
    {
      content: "Loneliness can be one of the hardest feelings to sit with. Even reaching out here shows courage. You matter, and your feelings matter. 🤍 Can you tell me more about what's been making you feel disconnected?",
      emotion: "neutral",
    },
  ],
  calm: [
    {
      content: "That's wonderful to hear. Calm is a precious state — your nervous system is at ease. 🌸 What's been going well for you today? I'd love to help you build on this feeling.",
      emotion: "happy",
    },
  ],
  default: [
    {
      content: "Thank you for sharing that with me. I want to make sure I understand you fully. Can you tell me a bit more about what you're experiencing? I'm here to listen without judgment. 💙",
      emotion: "neutral",
    },
    {
      content: "I appreciate you opening up. Every feeling you have is valid. Let's explore this together — there's no rush, no pressure. What feels most important to focus on right now?",
      emotion: "calm",
    },
  ],
};

export const MOCK_MOOD_ENTRIES: MoodEntry[] = [
  { id: "m1", date: "2024-12-09", mood: "happy", moodScore: 85, stressLevel: 30, sleepHours: 7.5, energyLevel: 80, notes: "Had a great day!" },
  { id: "m2", date: "2024-12-08", mood: "calm", moodScore: 75, stressLevel: 25, sleepHours: 8, energyLevel: 70, notes: "Productive and peaceful." },
  { id: "m3", date: "2024-12-07", mood: "anxious", moodScore: 35, stressLevel: 75, sleepHours: 5.5, energyLevel: 40, notes: "Deadline pressure." },
  { id: "m4", date: "2024-12-06", mood: "tired", moodScore: 45, stressLevel: 55, sleepHours: 6, energyLevel: 35, notes: "Long week catching up." },
  { id: "m5", date: "2024-12-05", mood: "happy", moodScore: 80, stressLevel: 20, sleepHours: 8, energyLevel: 85, notes: "Great workout and good news." },
  { id: "m6", date: "2024-12-04", mood: "sad", moodScore: 30, stressLevel: 60, sleepHours: 5, energyLevel: 25, notes: "Missed home." },
  { id: "m7", date: "2024-12-03", mood: "calm", moodScore: 70, stressLevel: 30, sleepHours: 7, energyLevel: 65, notes: "Meditation helped a lot." },
];

export const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "j1",
    date: "2024-12-09",
    title: "Finding Peace in Small Moments",
    content: "Today I noticed how the morning light felt different. I sat with my coffee and just... breathed. No rush, no thoughts about deadlines. Just presence. I want to carry this feeling forward.",
    mood: "calm",
    moodScore: 78,
    aiInsight: "Your entry reflects a strong mindfulness practice emerging. The act of noticing small details like morning light suggests your anxiety levels are reducing. This 'present moment awareness' is a key marker of emotional resilience. Keep nurturing this. 🌱",
    tags: ["mindfulness", "peace", "gratitude"],
  },
  {
    id: "j2",
    date: "2024-12-07",
    title: "The Weight of Expectations",
    content: "Deadline was brutal today. I felt like everyone expected perfection and I kept falling short. My chest was tight all day. I know I need to breathe more, but in the moment it felt impossible.",
    mood: "anxious",
    moodScore: 30,
    aiInsight: "I notice a pattern of perfectionism and external validation affecting your wellbeing. The physical symptom (chest tightness) indicates heightened cortisol. Consider: whose expectations are truly realistic? Your worth isn't tied to output. 💙",
    tags: ["stress", "work", "anxiety"],
  },
  {
    id: "j3",
    date: "2024-12-05",
    title: "Something Shifted Today",
    content: "Got some really positive feedback on my project. For the first time in weeks I felt... proud? Like I remembered why I started this journey. Called mom after. Good day.",
    mood: "happy",
    moodScore: 85,
    aiInsight: "This entry radiates authentic joy and reconnection with purpose. The call to your mother suggests your social bonds are a key strength. Days like these are emotional anchors — revisit this entry when things feel heavy. 🌟",
    tags: ["achievement", "family", "joy"],
  },
];

export const WEEKLY_MOOD_DATA: WeeklyMoodData[] = [
  { day: "Mon", moodScore: 70, stressLevel: 30, sleepHours: 7 },
  { day: "Tue", moodScore: 55, stressLevel: 55, sleepHours: 6 },
  { day: "Wed", moodScore: 35, stressLevel: 75, sleepHours: 5.5 },
  { day: "Thu", moodScore: 45, stressLevel: 55, sleepHours: 6 },
  { day: "Fri", moodScore: 80, stressLevel: 20, sleepHours: 8 },
  { day: "Sat", moodScore: 75, stressLevel: 25, sleepHours: 8 },
  { day: "Sun", moodScore: 85, stressLevel: 30, sleepHours: 7.5 },
];

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "r1",
    type: "breathing",
    title: "Box Breathing",
    description: "4-4-4-4 breathing technique to instantly calm your nervous system",
    duration: "5 min",
    icon: "🫁",
    color: "#6366f1",
  },
  {
    id: "r2",
    type: "meditation",
    title: "Body Scan Meditation",
    description: "Progressive relaxation from head to toe for deep stress relief",
    duration: "10 min",
    icon: "🧘",
    color: "#8b5cf6",
  },
  {
    id: "r3",
    type: "motivation",
    title: "Morning Affirmations",
    description: "Start your day with positive self-talk that rewires your mindset",
    duration: "3 min",
    icon: "✨",
    color: "#f59e0b",
  },
  {
    id: "r4",
    type: "sleep",
    title: "Sleep Wind-Down",
    description: "Progressive muscle relaxation to prepare your body for deep sleep",
    duration: "15 min",
    icon: "🌙",
    color: "#3b82f6",
  },
  {
    id: "r5",
    type: "exercise",
    title: "Mood Boost Walk",
    description: "A mindful 20-minute walk shown to reduce cortisol by 30%",
    duration: "20 min",
    icon: "🚶",
    color: "#10b981",
  },
  {
    id: "r6",
    type: "music",
    title: "Theta Wave Music",
    description: "432Hz sound therapy for deep relaxation and mental clarity",
    duration: "Ongoing",
    icon: "🎵",
    color: "#ec4899",
  },
];
