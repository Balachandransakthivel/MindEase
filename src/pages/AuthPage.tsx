import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Eye, EyeOff, ArrowLeft, Heart } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/app", { replace: true });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    login(email, password, mode === "signup" ? name : undefined);
    toast.success(mode === "signup" ? "Welcome to MindEase! 🌿" : "Welcome back! 💙");
    navigate("/app");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex wellness-gradient">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-indigo-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-serif font-semibold text-white mb-4">
            Your mind deserves gentle care
          </h2>
          <p className="text-white/65 leading-relaxed">
            Join thousands of students and professionals who've found clarity, calm, and growth through MindEase.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { emoji: "🧘", text: "AI therapy available 24/7" },
              { emoji: "📊", text: "Track your emotional growth" },
              { emoji: "📓", text: "Journal with AI insights" },
            ].map(({ emoji, text }, i) => (
              <div key={i} className="flex items-center gap-3 glass-dark rounded-xl px-4 py-3">
                <span className="text-xl">{emoji}</span>
                <span className="text-white/80 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white lg:rounded-l-3xl">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-violet-500" />
            <h1 className="text-2xl font-serif font-semibold text-indigo-950">
              {mode === "login" ? "Welcome back" : "Start your journey"}
            </h1>
          </div>
          <p className="text-gray-500 text-sm mb-8">
            {mode === "login"
              ? "Sign in to continue your wellness journey"
              : "Create your account — it's free and private"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl wellness-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-gray-400 text-xs">or try a demo</span>
            </div>
          </div>

          <button
            onClick={() => {
              login("demo@mindease.app", "demo", "Alex Johnson");
              toast.success("Demo mode activated! 🌿");
              navigate("/app");
            }}
            className="w-full py-3 rounded-xl border-2 border-violet-100 text-violet-700 text-sm font-semibold hover:bg-violet-50 transition-colors"
          >
            ✨ Try Demo Account
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-violet-600 font-semibold hover:underline"
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
            MindEase is not a replacement for professional medical help.<br />
            In crisis, call your local emergency services.
          </p>
        </div>
      </div>
    </div>
  );
}
