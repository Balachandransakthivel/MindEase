# MindEase 🌿

An emotionally intelligent, AI-powered wellness companion and personal analytics platform.

![MindEase Preview](https://via.placeholder.com/1200x600/1e1b4b/ffffff?text=MindEase+-+AI+Wellness+Companion)

MindEase bridges the gap between basic mood trackers and expensive therapy apps by offering a personalized, privacy-first, continuously adapting AI companion. It features intelligent journaling, robust analytics, and a seamlessly calm UI.

## 📸 Interface Previews

| Landing Page | Dashboard Analytics |
|---|---|
| ![Landing Page](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop) | ![Dashboard Analytics](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop) |

| AI Therapy Chat | Emotional Heatmap |
|---|---|
| ![Chat](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop) | ![Analytics](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop) |

## 🌟 Core Features

- **Streaming AI Companion:** Real-time, emotionally aware AI that remembers your onboarding goals, typical stress levels, and historical struggles.
- **Wellness Analytics Dashboard:** 28-day emotional heatmaps, sleep vs. mood correlation charts, and dynamic wellness radars.
- **Smart Journaling:** AI-assisted journaling that provides gentle insights and auto-detects emotional undertones.
- **Premium UX/UI:** Fluid spring animations, glowing orb gradients, accessible contrast, and full mobile optimization (using dynamic viewport heights).
- **Offline-First Resilience:** Gracefully falls back to local storage during network interruptions and syncs when back online.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Framer Motion (via native CSS Springs), Lucide Icons
- **State Management:** Custom Hooks + React Context + LocalStorage Fallback
- **Data Visualization:** Recharts (Radar, Area, Bar, Scatter)
- **Backend & Database:** Supabase (PostgreSQL, Edge Functions)
- **AI/LLM Integration:** Supabase Edge Functions streaming to client

## 🏗️ Architecture & Folder Structure

```text
mindease/
├── src/
│   ├── assets/       # Static files, icons, illustrations
│   ├── components/   # Reusable UI components
│   │   ├── layout/   # AppLayout, Sidebar, Navigation
│   │   └── ui/       # Buttons, Modals, Cards
│   ├── constants/    # Hardcoded data, mockups, themes
│   ├── hooks/        # Custom React hooks (useAuth, useChat, etc)
│   ├── lib/          # Utility functions and API clients (supabase.ts)
│   ├── pages/        # Main route views (Dashboard, Analytics, etc)
│   └── types/        # TypeScript interfaces and types
├── supabase/
│   ├── functions/    # Edge Functions for AI Streaming
│   └── schema.sql    # PostgreSQL schema & RLS definitions
└── package.json      # Dependencies and scripts
```

### Data Flow
graph TD
    Client[React Client] --> Auth[Auth & Onboarding]
    Client --> Offline[Local Storage Cache]
    Client --> DB[(Supabase PostgreSQL)]
    Client --> Edge[Supabase Edge Functions]
    
    Auth --> UserContext[User Emotional Context]
    UserContext --> Edge
    
    Edge --> LLM[OpenAI/LLM API]
    LLM --> Edge
    Edge -. Streams .-> Client
    
    DB --> Analytics[Wellness Data]
    Analytics --> Client
```

## 🚀 Setup & Deployment

### Quick Start (Demo Credentials)
If you are a reviewer or recruiter, you can quickly test the application using the following demo credentials:
- **Email:** `demo@mindease.ai`
- **Password:** `demo123`

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mindease.git
   cd mindease
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

### Database Setup

Run the SQL script provided in `supabase/schema.sql` within your Supabase SQL Editor to generate the necessary tables:
- `conversations`
- `chat_messages`
- `journal_entries`
- `mood_entries`

*(Note: Row Level Security (RLS) is enabled. If deploying to production with Supabase Auth, update the RLS policies in `schema.sql` to restrict access strictly to `auth.uid()`)*.

## 🔒 Security & AI Safety

- **Rate Limiting:** Client-side rate limiting ensures a maximum of 50 AI messages per session and a 2-second cooldown between prompts to prevent endpoint abuse.
- **Prompt Safety:** The AI is strictly bounded by a system prompt instructing it *never* to diagnose or claim medical expertise, and to gracefully redirect severe crisis scenarios to emergency services.
- **Row Level Security (RLS):** Enabled on all Supabase tables to ensure users only access their own encrypted journal and mood data.

## 📄 Legal & Trust

MindEase is designed as a wellness companion, *not* a replacement for professional therapy.
If you are deploying this for public use, please ensure you update the Privacy Policy and Terms of Service (placeholders exist in the app).

---
*Built with 💙 for emotional well-being.*
