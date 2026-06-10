import { useNavigate } from "react-router-dom";
import { Sparkles, MessageCircleHeart, Smile, BookOpen, BarChart3, ShieldCheck, Brain, ArrowRight, Star, Heart } from "lucide-react";
import aiAvatar from "@/assets/ai-avatar.svg";

const FEATURES = [
  { icon: MessageCircleHeart, title: "AI Therapist Chat", desc: "24/7 empathetic AI that listens, understands, and responds to your emotional state with care.", color: "from-violet-500 to-purple-600" },
  { icon: Smile, title: "Mood Tracking", desc: "Log daily emotions with emoji-based tracking. Understand your patterns across weeks and months.", color: "from-amber-400 to-orange-500" },
  { icon: BookOpen, title: "Personal Journal", desc: "Private diary with AI-generated insights that help you understand your emotional triggers.", color: "from-emerald-400 to-teal-500" },
  { icon: BarChart3, title: "Wellness Analytics", desc: "Beautiful charts showing mood trends, stress levels, and your overall emotional progress.", color: "from-blue-400 to-indigo-500" },
  { icon: Brain, title: "Emotion Analysis", desc: "AI detects stress, anxiety, and burnout patterns from your conversations and journal entries.", color: "from-pink-400 to-rose-500" },
  { icon: ShieldCheck, title: "Crisis Detection", desc: "Intelligent safety system that offers immediate support and helpline resources when needed.", color: "from-indigo-400 to-violet-500" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Share Your Feelings", desc: "Chat with our emotionally intelligent AI or write in your private journal." },
  { step: "02", title: "Gain Insights", desc: "Our AI analyzes your emotions, identifying patterns in your stress and anxiety levels." },
  { step: "03", title: "Grow & Heal", desc: "Receive personalized coping strategies and watch your emotional well-being improve over time." }
];

const TESTIMONIALS = [
  { name: "Priya S.", role: "Engineering Student", text: "MindEase helped me through exam season. The AI actually felt like it understood my anxiety.", avatar: "P", mood: "😊" },
  { name: "Rahul M.", role: "Software Engineer", text: "The journal insights are incredible. It spotted my burnout patterns before I even realized.", avatar: "R", mood: "😌" },
  { name: "Ananya K.", role: "MBA Student", text: "I've tried many wellness apps. This one actually feels personal and intelligent.", avatar: "A", mood: "✨" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between glass rounded-2xl px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl wellness-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-semibold text-indigo-900 text-lg">MindEase</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-indigo-700 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-indigo-700 transition-colors">Stories</a>
            <a href="#disclaimer" className="hover:text-indigo-700 transition-colors">Safety</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/auth")} className="text-sm font-medium text-indigo-700 hover:text-indigo-900 transition-colors hidden sm:block">
              Sign In
            </button>
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="px-4 py-2 rounded-xl wellness-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[110vh] flex items-center justify-center overflow-hidden pt-20 bg-animated-gradient">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/30 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-400/30 rounded-full blur-[100px] animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[90px] animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border border-white/10 text-violet-200 text-sm font-medium mb-8 animate-fade-in shadow-2xl">
              <img src={aiAvatar} alt="AI" className="w-5 h-5 rounded-full ring-2 ring-violet-500/50" />
              Next-Gen AI Mental Wellness
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.1] mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Your mind deserves <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 italic">gentle care.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed mb-10 animate-fade-in font-light" style={{ animationDelay: "0.2s" }}>
              A startup-quality mental health companion. Chat, track, and heal with an emotionally intelligent AI designed for students and professionals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-900 font-semibold text-base hover:bg-violet-50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 group"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="px-8 py-4 rounded-2xl glass-dark border border-white/20 text-white font-semibold text-base hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Live AI Preview */}
          <div className="relative w-full max-w-md mx-auto animate-fade-in lg:ml-auto" style={{ animationDelay: "0.5s" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 blur-2xl opacity-30 rounded-[2.5rem]"></div>
            <div className="relative glass-dark border border-white/20 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-full wellness-gradient flex items-center justify-center relative shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1e1b4b]"></div>
                </div>
                <div>
                  <h3 className="text-white font-semibold leading-tight">MindEase AI</h3>
                  <p className="text-emerald-400 text-xs font-medium">Always here for you</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-4">
                <div className="flex justify-end">
                  <div className="bg-indigo-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-md">
                    I've been feeling really overwhelmed with work lately.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] shadow-md border border-white/5">
                    <p className="mb-2">I hear you. It's completely valid to feel overwhelmed when you have a lot on your plate. Take a deep breath with me.</p>
                    <p className="opacity-80">Would you like to break down what's causing the most stress right now?</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 opacity-60">
                <div className="h-10 flex-1 rounded-full bg-white/5 border border-white/10 px-4 flex items-center">
                  <span className="text-white/40 text-sm">Type a message...</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-500/50 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in text-white/50">
          <span className="text-xs font-medium tracking-widest uppercase">Explore</span>
          <div className="w-[2px] h-8 bg-gradient-to-b from-white/50 to-transparent rounded-full animate-pulse" />
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-10 border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Trusted by students & professionals worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale">
            <div className="text-xl font-bold font-serif text-gray-700 flex items-center gap-1"><Sparkles className="w-5 h-5"/> Stanford</div>
            <div className="text-xl font-bold font-serif text-gray-700 flex items-center gap-1"><Sparkles className="w-5 h-5"/> MIT</div>
            <div className="text-xl font-bold font-serif text-gray-700 flex items-center gap-1"><Sparkles className="w-5 h-5"/> Google</div>
            <div className="text-xl font-bold font-serif text-gray-700 flex items-center gap-1"><Sparkles className="w-5 h-5"/> Microsoft</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 bg-[#f8f9ff]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-bold tracking-wide mb-4">
              FEATURES
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-indigo-950 mb-6">
              Built for real emotional well-being
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto leading-relaxed text-lg">
              Not just an app — a thoughtful companion designed around how your mind actually works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <div key={i} className="group p-8 rounded-[2rem] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-serif font-bold text-indigo-950 text-xl mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
             <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold tracking-wide mb-4">
              PROCESS
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-indigo-950 mb-6">
              How MindEase works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <div key={i} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative h-full p-8 bg-white rounded-3xl border border-gray-100">
                  <div className="text-5xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-200 to-gray-400 mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    {step}
                  </div>
                  <h3 className="text-2xl font-bold text-indigo-950 mb-3">{title}</h3>
                  <p className="text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 wellness-gradient">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-white mb-4">
              Real stories, real growth
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              See how students and professionals use MindEase to navigate life's challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, avatar, mood }, i) => (
              <div key={i} className="glass rounded-2xl p-6">
                <div className="text-2xl mb-3">{mood}</div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full wellness-gradient flex items-center justify-center text-white font-bold text-sm">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-indigo-900 text-sm">{name}</p>
                    <p className="text-gray-500 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section id="disclaimer" className="py-14 px-4 bg-amber-50 border-y border-amber-100">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-amber-800">Important Notice</span>
          </div>
          <p className="text-amber-700 text-sm leading-relaxed">
            MindEase is an AI-powered wellness support tool and is <strong>not a replacement for professional medical or psychological help</strong>. If you are experiencing a mental health crisis, please contact a licensed mental health professional or call your local emergency services immediately.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <Heart className="w-10 h-10 text-violet-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-indigo-950 mb-4">
            Begin your wellness journey today
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Free to get started. No credit card. Just you, your mind, and an AI that truly listens.
          </p>
          <button
            onClick={() => navigate("/auth?mode=signup")}
            className="px-10 py-4 rounded-2xl wellness-gradient text-white font-semibold text-base hover:opacity-90 transition-opacity shadow-xl"
          >
            Start for Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="font-serif font-semibold text-indigo-900">MindEase</span>
        </div>
        <p className="text-gray-400 text-xs">© 2024 MindEase · Your AI Mental Wellness Companion</p>
      </footer>
    </div>
  );
}
