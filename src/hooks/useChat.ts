import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage, EmotionType } from "@/types";
import { INITIAL_MESSAGES } from "@/constants/data";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mindease-chat`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ── helpers ───────────────────────────────────────────────────────────────────
function getUserId(): string {
  let id = localStorage.getItem("mindease_device_id");
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("mindease_device_id", id);
  }
  return id;
}

function detectEmotionFromText(text: string): EmotionType {
  const match = text.match(/EMOTION:(\w+)/i);
  if (match) {
    const raw = match[1].toLowerCase();
    const valid: EmotionType[] = ["neutral", "stressed", "anxious", "happy", "sad", "motivated", "calm"];
    if (valid.includes(raw as EmotionType)) return raw as EmotionType;
  }
  return "neutral";
}

function cleanContent(text: string): string {
  return text.replace(/\nEMOTION:\w+/gi, "").trim();
}

// ── types ─────────────────────────────────────────────────────────────────────
export interface Conversation {
  id: string;
  title: string;
  emotionSummary: EmotionType;
  messageCount: number;
  createdAt: string;
  lastMessageAt: string;
}

// ── hook ──────────────────────────────────────────────────────────────────────
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>("calm");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const userId = getUserId();

  // Load conversation list on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_identifier", userId)
      .order("last_message_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Load conversations error:", error);
      return;
    }

    const mapped: Conversation[] = (data || []).map((c) => ({
      id: c.id,
      title: c.title,
      emotionSummary: c.emotion_summary as EmotionType,
      messageCount: c.message_count,
      createdAt: c.created_at,
      lastMessageAt: c.last_message_at,
    }));
    setConversations(mapped);
  };

  const loadConversation = async (conversationId: string) => {
    setIsLoadingHistory(true);
    setActiveConversationId(conversationId);

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Load messages error:", error);
      setIsLoadingHistory(false);
      return;
    }

    const mapped: ChatMessage[] = (data || []).map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      timestamp: m.created_at,
      emotion: m.emotion as EmotionType,
    }));

    setMessages(mapped.length > 0 ? mapped : INITIAL_MESSAGES);
    setIsLoadingHistory(false);
  };

  const startNewConversation = useCallback(() => {
    abortRef.current?.abort();
    setActiveConversationId(null);
    setMessages(INITIAL_MESSAGES);
    setCurrentEmotion("calm");
    setIsTyping(false);
    setIsStreaming(false);
  }, []);

  const deleteConversation = async (conversationId: string) => {
    await supabase.from("conversations").delete().eq("id", conversationId);
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      startNewConversation();
    }
  };

  // Save a message to DB
  const saveMessage = async (
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    emotion: EmotionType = "neutral"
  ) => {
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      role,
      content,
      emotion,
    });
  };

  // Create or get conversation
  const ensureConversation = async (firstUserMessage: string): Promise<string> => {
    if (activeConversationId) return activeConversationId;

    // Create new conversation
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_identifier: userId,
        title: "New Conversation",
        emotion_summary: "neutral",
        message_count: 0,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Create conversation error:", error);
      return `local_${Date.now()}`;
    }

    const newId = data.id;
    setActiveConversationId(newId);

    // Generate title in background
    fetch(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({
        action: "generate_title",
        messages: [{ role: "user", content: firstUserMessage }],
      }),
    })
      .then((r) => r.json())
      .then(async ({ title }) => {
        if (title) {
          await supabase.from("conversations").update({ title }).eq("id", newId);
          setConversations((prev) =>
            prev.map((c) => (c.id === newId ? { ...c, title } : c))
          );
        }
      })
      .catch(console.error);

    // Add to local list
    const newConv: Conversation = {
      id: newId,
      title: "New Conversation",
      emotionSummary: "neutral",
      messageCount: 0,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);

    return newId;
  };

    const lastMessageTime = useRef<number>(0);
    const messageCount = useRef<number>(0);

    const sendMessage = useCallback(
      async (content: string) => {
        // Local Rate Limiting
        const now = Date.now();
        if (now - lastMessageTime.current < 2000) {
          toast.error("Please wait a moment before sending another message.");
          return;
        }
        if (messageCount.current >= 50) {
          toast.error("Daily message limit reached. Please try again tomorrow.");
          return;
        }
        lastMessageTime.current = now;
        messageCount.current += 1;

        const userMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          role: "user",
          content,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        // Build history (last 10 user/assistant pairs)
        const history = [...messages, userMessage]
          .filter((m) => m.role !== "assistant" || m.content !== INITIAL_MESSAGES[0].content)
          .slice(-12)
          .map((m) => ({ role: m.role, content: m.content }));

        const aiMsgId = `msg_${Date.now() + 1}`;
        const aiMessage: ChatMessage = {
          id: aiMsgId,
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          emotion: "neutral",
        };

        try {
          abortRef.current = new AbortController();

          // Ensure conversation exists in DB
          const conversationId = await ensureConversation(content);

          // Save user message
          if (!conversationId.startsWith("local_")) {
            await saveMessage(conversationId, "user", content);
          }

          // Construct emotional memory & onboarding context
          const storedUser = localStorage.getItem("mindease_user");
          let systemPrompt = "You are MindEase, an AI wellness companion. SAFETY RULES: You are NOT a licensed therapist. Do NOT diagnose, prescribe, or claim medical expertise. If a user expresses self-harm or severe crisis, gently encourage them to contact emergency services and stop the analysis. Do not be manipulative or overly prescriptive.";
          if (storedUser) {
            try {
              const u = JSON.parse(storedUser);
              if (u.onboardingData) {
                systemPrompt += `\n\nUSER CONTEXT (EMOTIONAL MEMORY):\n- Main Goal: ${u.onboardingData.goals}\n- Typical Stress Level: ${u.onboardingData.stress}\n- Typical Sleep: ${u.onboardingData.sleep}\n- Current Struggles: ${u.onboardingData.struggles}\n\nINSTRUCTION: Personalize your responses using this context. Demonstrate emotional continuity. Maintain a calm, supportive, non-robotic tone.`;
              }
            } catch (e) {}
          }

          const payloadMessages = [
            { role: "system", content: systemPrompt },
            ...history
          ];

        const response = await fetch(FUNCTION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ANON_KEY}`,
          },
          body: JSON.stringify({ messages: payloadMessages, stream: true }),
          signal: abortRef.current.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`);
        }

        setIsTyping(false);
        setIsStreaming(true);
        setMessages((prev) => [...prev, { ...aiMessage }]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                accumulated += delta;
                const visibleContent = cleanContent(accumulated);
                setMessages((prev) =>
                  prev.map((m) => (m.id === aiMsgId ? { ...m, content: visibleContent } : m))
                );
              }
            } catch {
              // skip malformed lines
            }
          }
        }

        const detectedEmotion = detectEmotionFromText(accumulated);
        const finalContent = cleanContent(accumulated);

        setCurrentEmotion(detectedEmotion);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, content: finalContent, emotion: detectedEmotion } : m
          )
        );

        // Save AI message + update conversation
        if (!conversationId.startsWith("local_")) {
          await saveMessage(conversationId, "assistant", finalContent, detectedEmotion);

          const totalMsgs = messages.filter((m) => m.role !== "assistant" || m.content !== INITIAL_MESSAGES[0].content).length + 2;
          await supabase
            .from("conversations")
            .update({
              emotion_summary: detectedEmotion,
              message_count: totalMsgs,
              last_message_at: new Date().toISOString(),
            })
            .eq("id", conversationId);

          setConversations((prev) =>
            prev.map((c) =>
              c.id === conversationId
                ? { ...c, emotionSummary: detectedEmotion, messageCount: totalMsgs, lastMessageAt: new Date().toISOString() }
                : c
            )
          );
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Chat error:", err);

        const fallback =
          "I'm here with you 💙 I had a small hiccup connecting, but I'm listening. Could you share that again? I want to make sure I understand what you're going through.";

        setMessages((prev) => {
          const exists = prev.find((m) => m.id === aiMsgId);
          if (exists) return prev.map((m) => (m.id === aiMsgId ? { ...m, content: fallback } : m));
          return [...prev, { ...aiMessage, content: fallback }];
        });
      } finally {
        setIsTyping(false);
        setIsStreaming(false);
      }
    },
    [messages, activeConversationId]
  );

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    startNewConversation();
  }, [startNewConversation]);

  return {
    messages,
    isTyping,
    isStreaming,
    currentEmotion,
    conversations,
    activeConversationId,
    isLoadingHistory,
    sendMessage,
    clearChat,
    loadConversation,
    startNewConversation,
    deleteConversation,
    loadConversations,
  };
}
