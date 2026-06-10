-- MindEase Supabase Schema & Row Level Security (RLS) Policies
-- Run this in your Supabase SQL Editor
-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 2. Create Tables
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_identifier TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    emotion_summary TEXT DEFAULT 'neutral',
    message_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    emotion TEXT DEFAULT 'neutral',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_identifier TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT NOT NULL,
    mood_score INTEGER NOT NULL,
    ai_insight TEXT,
    tags TEXT [] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.mood_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_identifier TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    mood TEXT NOT NULL,
    mood_score INTEGER NOT NULL,
    stress_level INTEGER NOT NULL,
    sleep_hours NUMERIC NOT NULL,
    energy_level INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 3. Enable Row Level Security (CRITICAL FOR PRIVACY)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
-- 4. Create RLS Policies
-- Note: MindEase currently uses a 'user_identifier' string (like a device_id or email) 
-- instead of Supabase Auth UUIDs. 
-- For production, replace 'user_identifier' checks with auth.uid() when using Supabase Auth.
-- Conversations
CREATE POLICY "Users can manage their own conversations" ON public.conversations FOR ALL USING (
    (
        auth.role() = 'authenticated'
        AND user_identifier = auth.uid()::text
    )
    OR (
        auth.role() = 'anon'
        AND (
            user_identifier = 'user_001'
            OR user_identifier LIKE 'device_%'
            OR user_identifier LIKE 'local_%'
        )
    )
);
-- Chat Messages
CREATE POLICY "Users can manage their own chat messages" ON public.chat_messages FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.conversations c
        WHERE c.id = chat_messages.conversation_id
            AND (
                (
                    auth.role() = 'authenticated'
                    AND c.user_identifier = auth.uid()::text
                )
                OR (auth.role() = 'anon')
            )
    )
);
-- Journal Entries
CREATE POLICY "Users can manage their own journal entries" ON public.journal_entries FOR ALL USING (
    (
        auth.role() = 'authenticated'
        AND user_identifier = auth.uid()::text
    )
    OR (
        auth.role() = 'anon'
        AND (
            user_identifier = 'user_001'
            OR user_identifier LIKE 'device_%'
            OR user_identifier LIKE 'local_%'
        )
    )
);
-- Mood Entries
CREATE POLICY "Users can manage their own mood entries" ON public.mood_entries FOR ALL USING (
    (
        auth.role() = 'authenticated'
        AND user_identifier = auth.uid()::text
    )
    OR (
        auth.role() = 'anon'
        AND (
            user_identifier = 'user_001'
            OR user_identifier LIKE 'device_%'
            OR user_identifier LIKE 'local_%'
        )
    )
);
-- 5. Rate Limiting Function Example (Optional)
-- You can create a function to prevent spamming the database
-- CREATE OR REPLACE FUNCTION check_rate_limit() ...