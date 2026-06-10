import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen wellness-gradient flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-5xl font-bold text-white mb-3">404</h1>
      <h2 className="text-xl font-serif font-semibold text-white mb-2">Page not found</h2>
      <p className="text-white/60 mb-8 max-w-sm">
        Looks like this space is still taking a deep breath. Let's get you back to your journey.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-8 py-3 rounded-xl bg-white text-indigo-800 font-semibold hover:bg-violet-50 transition-colors"
      >
        Go Home
      </button>
    </div>
  );
}
