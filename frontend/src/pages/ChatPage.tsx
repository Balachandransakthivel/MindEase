import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import type { Conversation } from "@/hooks/useChat";
import { SMART_PROMPTS } from "@/constants/data";
import {
  Send, RefreshCw, Sparkles, ShieldAlert, Mic, MicOff,
  MessageSquarePlus, History, Trash2, ChevronLeft, X,
} from "lucide-react";
import aiAvatar from "@/assets/ai-avatar.svg";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const EMOTION_COLORS: Record<string, string> = {
  stressed: "#f97316", anxious: "#eab308", happy: "#22c55e",
  sad: "#3b82f6", motivated: "#8b5cf6", calm: "#10b981", neutral: "#6366f1",
};
const EMOTION_LABELS: Record<string, string> = {
  stressed: "Stress Detected", anxious: "Anxiety Detected", happy: "Positive Mood",
  sad: "Feeling Sad", motivated: "Motivated", calm: "Calm State", neutral: "Neutral",
};

// ── Voice input hook ──────────────────────────────────────────────────────────
function useVoiceInput(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const supported = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

  const start = useCallback(() => {
    if (!supported) { toast.error("Voice input not supported in this browser"); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onTranscript(transcript);
    };
    recognition.onerror = () => { setIsListening(false); toast.error("Voice recognition failed"); };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }, [supported, onTranscript]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, start, stop, supported };
}

// ── Conversation list panel ───────────────────────────────────────────────────
function ConversationPanel({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onClose,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const emotionEmoji: Record<string, string> = {
    stressed: "😰", anxious: "😨", happy: "😊", sad: "😔",
    motivated: "✨", calm: "😌", neutral: "💬",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="font-serif font-semibold text-indigo-900 text-base">Conversations</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors lg:hidden">
          <X className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={onNew}
        className="mx-3 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl wellness-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        <MessageSquarePlus className="w-4 h-4" />
        New Conversation
      </button>

      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5">
        {conversations.length === 0 && (
          <p className="text-center text-gray-400 text-xs py-8">No conversations yet.<br />Start chatting!</p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
              activeId === conv.id
                ? "bg-violet-50 border border-violet-200"
                : "hover:bg-gray-50 border border-transparent"
            }`}
          >
            <span className="text-lg flex-shrink-0 mt-0.5">{emotionEmoji[conv.emotionSummary] || "💬"}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${activeId === conv.id ? "text-violet-900" : "text-gray-800"}`}>
                {conv.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(conv.lastMessageAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" · "}
                {conv.messageCount} msgs
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderMessageContent(content: string, isUser: boolean) {
  const lines = content.split("\n");
  let inList = false;
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const parseInlineMarkdown = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <strong key={index} className={`font-semibold ${isUser ? "text-white" : "text-indigo-950 font-bold"}`}>
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    const bulletMatch = trimmed.match(/^[*+-]\s+(.*)$/);
    const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);

    if (bulletMatch) {
      if (!inList) {
        inList = true;
      }
      const itemContent = bulletMatch[1];
      listItems.push(
        <li key={lineIndex} className="list-disc ml-5 mt-1 leading-relaxed">
          {parseInlineMarkdown(itemContent)}
        </li>
      );
    } else if (numberMatch) {
      if (!inList) {
        inList = true;
      }
      const itemContent = numberMatch[2];
      const num = numberMatch[1];
      listItems.push(
        <li key={lineIndex} className="list-decimal ml-5 mt-1 leading-relaxed" value={parseInt(num)}>
          {parseInlineMarkdown(itemContent)}
        </li>
      );
    } else {
      if (inList) {
        elements.push(
          <ul key={`list-${lineIndex}`} className="space-y-1.5 my-2">
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }

      if (trimmed) {
        elements.push(
          <p key={lineIndex} className="mb-2 last:mb-0 leading-relaxed">
            {parseInlineMarkdown(trimmed)}
          </p>
        );
      } else {
        elements.push(<div key={lineIndex} className="h-2" />);
      }
    }
  });

  if (inList && listItems.length > 0) {
    elements.push(
      <ul key="list-end" className="space-y-1.5 my-2">
        {listItems}
      </ul>
    );
  }

  return elements;
}

// ── Main ChatPage ─────────────────────────────────────────────────────────────
export default function ChatPage() {
  const {
    messages, isTyping, isStreaming, currentEmotion,
    conversations, activeConversationId, isLoadingHistory,
    sendMessage, clearChat, loadConversation, startNewConversation, deleteConversation,
  } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [crisisAlert, setCrisisAlert] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, start: startVoice, stop: stopVoice, supported: voiceSupported } =
    useVoiceInput((transcript) => {
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
      textareaRef.current?.focus();
    });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const lower = input.toLowerCase();
    const crisis = ["hurt myself", "end my life", "suicide", "self-harm", "kill myself", "can't go on"].some(
      (k) => lower.includes(k)
    );
    setCrisisAlert(crisis);
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isTyping || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleSelectConversation = (id: string) => {
    loadConversation(id);
    setShowHistory(false);
  };

  const emotionColor = EMOTION_COLORS[currentEmotion] || EMOTION_COLORS.neutral;
  const lastAiMsgId = messages.filter((m) => m.role === "assistant").at(-1)?.id;

  return (
    <div className="max-w-6xl mx-auto flex gap-0 lg:gap-6 h-[calc(100dvh-120px)] lg:h-[calc(100dvh-80px)] animate-fade-in">
      {/* Conversation History Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 shadow-xl transition-transform duration-300
          lg:static lg:z-auto lg:w-64 lg:flex-shrink-0 lg:rounded-2xl lg:border lg:shadow-sm lg:translate-x-0 lg:transition-none
          ${showHistory ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Mobile overlay */}
        {showHistory && (
          <div
            className="fixed inset-0 bg-black/20 z-[1] lg:hidden"
            onClick={() => setShowHistory(false)}
          />
        )}
        <div className="relative z-10 h-full bg-white">
          <ConversationPanel
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={handleSelectConversation}
            onNew={() => { startNewConversation(); setShowHistory(false); }}
            onDelete={deleteConversation}
            onClose={() => setShowHistory(false)}
          />
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Chat history"
            >
              <History className="w-5 h-5" />
            </button>
            <div className="relative">
              <img src={aiAvatar} alt="AI" className="w-11 h-11 rounded-2xl shadow-md" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <h1 className="font-serif font-semibold text-indigo-900 text-lg leading-tight">MindEase AI</h1>
              <p className="text-emerald-600 text-xs font-medium">
                {isLoadingHistory
                  ? "Loading history..."
                  : isStreaming
                  ? "Responding..."
                  : isTyping
                  ? "Thinking..."
                  : "Online · Ready to listen"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border"
              style={{ color: emotionColor, borderColor: `${emotionColor}30`, backgroundColor: `${emotionColor}10` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: emotionColor }} />
              {EMOTION_LABELS[currentEmotion]}
            </div>
            <button
              onClick={() => { clearChat(); toast.success("New conversation started"); }}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="New conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Crisis Alert */}
        {crisisAlert && (
          <div className="mb-3 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 animate-fade-in">
            <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-semibold text-sm">You seem to be in distress</p>
              <p className="text-red-600 text-xs mt-1">
                If you're having thoughts of self-harm, please reach out immediately:
                <strong> iCall India: 9152987821</strong> ·{" "}
                <strong>Vandrevala: 1860-2662-345</strong>
              </p>
            </div>
          </div>
        )}

        {/* Loading History */}
        {isLoadingHistory && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex-shrink-0 animate-shimmer" />
                <div className={`max-w-[70%] rounded-2xl p-4 bg-gray-50 border border-gray-100 w-full animate-shimmer ${i % 2 === 0 ? "rounded-tr-sm" : "rounded-tl-sm"}`}>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2 animate-shimmer"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        {!isLoadingHistory && (
          <div className="flex-1 overflow-y-auto chat-scroll space-y-4 py-2 px-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 animate-fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "assistant" ? (
                  <img src={aiAvatar} alt="AI" className="w-8 h-8 rounded-xl flex-shrink-0 mt-0.5" />
                ) : (
                  <div className="w-8 h-8 rounded-xl wellness-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {user?.name?.[0] || "U"}
                  </div>
                )}
                <div className={`max-w-[78%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "wellness-gradient text-white rounded-tr-sm"
                        : "bg-white border border-gray-100 shadow-sm text-gray-700 rounded-tl-sm"
                    }`}
                  >
                    {renderMessageContent(msg.content, msg.role === "user")}
                    {isStreaming && msg.role === "assistant" && msg.id === lastAiMsgId && (
                      <span className="inline-block w-0.5 h-3.5 bg-violet-400 ml-0.5 animate-pulse align-middle" />
                    )}
                  </div>
                  <span className="text-gray-400 text-xs px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <img src={aiAvatar} alt="AI" className="w-8 h-8 rounded-xl flex-shrink-0" />
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="typing-dot w-2 h-2 rounded-full bg-violet-400" />
                  <span className="typing-dot w-2 h-2 rounded-full bg-violet-400" />
                  <span className="typing-dot w-2 h-2 rounded-full bg-violet-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Smart Prompts */}
        {messages.length <= 1 && !isLoadingHistory && (
          <div className="py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {SMART_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => { setInput(prompt); textareaRef.current?.focus(); }}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl border border-violet-200 text-violet-700 text-xs font-medium hover:bg-violet-50 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="pt-3 border-t border-gray-100">
          {isListening && (
            <div className="flex items-center gap-2 px-4 py-2 mb-2 rounded-xl bg-red-50 border border-red-100 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-600 text-xs font-medium">Listening... speak now</span>
              <button onClick={stopVoice} className="ml-auto text-red-400 hover:text-red-600 text-xs">Stop</button>
            </div>
          )}
          <div className="flex items-end gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              rows={1}
              className="flex-1 resize-none border-none outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent max-h-28"
            />
            {voiceSupported && (
              <button
                onClick={isListening ? stopVoice : startVoice}
                disabled={isTyping || isStreaming}
                className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 ${
                  isListening
                    ? "bg-red-100 text-red-500 animate-pulse"
                    : "text-gray-400 hover:bg-gray-100 hover:text-violet-600"
                }`}
                title={isListening ? "Stop recording" : "Voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || isStreaming}
              className="flex-shrink-0 w-9 h-9 rounded-xl wellness-gradient flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Sparkles className="w-3 h-3 text-gray-300" />
            <p className="text-center text-xs text-gray-400">
              AI responses are for support only · Not medical advice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
