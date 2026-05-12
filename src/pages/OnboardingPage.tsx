import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, ArrowRight, Check } from "lucide-react";

const STEPS = [
  {
    id: "goals",
    title: "What brings you to MindEase?",
    subtitle: "We'll customize your AI and recommendations based on your focus.",
    options: ["Reduce Stress", "Better Sleep", "Emotional Balance", "Productivity"],
  },
  {
    id: "stress",
    title: "How would you rate your typical stress levels?",
    subtitle: "Be honest—it helps us provide the right level of support.",
    options: ["Low & Manageable", "Moderate", "High", "Overwhelming"],
  },
  {
    id: "sleep",
    title: "How many hours of sleep do you typically get?",
    subtitle: "Rest is the foundation of emotional resilience.",
    options: ["Less than 5 hours", "5-6 hours", "7-8 hours", "9+ hours"],
  },
  {
    id: "struggles",
    title: "Any specific struggles right now?",
    subtitle: "Your AI therapist will keep this context in mind.",
    options: ["Overthinking", "Burnout", "Loneliness", "Lack of Motivation", "None right now"],
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinishing, setIsFinishing] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [STEPS[currentStep].id]: option });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsFinishing(true);
      setTimeout(() => {
        updateUser({
          onboardingCompleted: true,
          onboardingData: answers,
        });
        window.location.href = "/app";
      }, 2500); // Simulate AI personalization
    }
  };

  if (isFinishing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100 p-4">
        <div className="w-16 h-16 rounded-2xl wellness-gradient flex items-center justify-center mb-6 animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-indigo-900 mb-2 animate-fade-in">Personalizing your experience...</h2>
        <p className="text-gray-500 animate-fade-in text-center max-w-sm">
          Configuring your AI therapist and tailoring wellness insights based on your profile.
        </p>
      </div>
    );
  }

  const step = STEPS[currentStep];
  const selected = answers[step.id];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100 p-4">
      <div className="w-full max-w-xl bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-10">
          {STEPS.map((_, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden bg-gray-100">
              <div 
                className={`h-full bg-violet-500 transition-all duration-500 ${i <= currentStep ? 'w-full' : 'w-0'}`} 
              />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="animate-fade-in" key={currentStep}>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-indigo-950 mb-3">
            {step.title}
          </h1>
          <p className="text-gray-500 mb-8">{step.subtitle}</p>

          <div className="space-y-3">
            {step.options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  selected === option
                    ? "border-violet-500 bg-violet-50 text-violet-900"
                    : "border-gray-100 hover:border-violet-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="font-medium">{option}</span>
                {selected === option && (
                  <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center animate-scale-in">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            className={`text-gray-400 hover:text-gray-600 font-medium transition-opacity ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!selected}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all ${
              selected 
                ? "wellness-gradient shadow-lg shadow-violet-200 hover:shadow-xl hover:-translate-y-0.5" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {currentStep === STEPS.length - 1 ? "Complete Setup" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
