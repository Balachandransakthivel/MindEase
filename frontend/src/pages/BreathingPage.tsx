import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Wind, Info, Award } from "lucide-react";
import { toast } from "sonner";

interface BreathingPattern {
  name: string;
  description: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  bgGradient: string;
  orbColor: string;
}

const PATTERNS: BreathingPattern[] = [
  {
    name: "Box Breathing",
    description: "Used by professionals to clear the mind, relieve stress, and improve concentration.",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    bgGradient: "from-violet-500/10 via-indigo-500/10 to-purple-500/10",
    orbColor: "bg-gradient-to-tr from-violet-500 to-indigo-500 shadow-violet-500/50",
  },
  {
    name: "Calm 4-7-8",
    description: "Acts as a natural tranquilizer for the nervous system. Great for easing anxiety and sleep.",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    bgGradient: "from-emerald-500/10 via-teal-500/10 to-cyan-500/10",
    orbColor: "bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-teal-500/50",
  },
  {
    name: "Equal Breathing (5-5)",
    description: "Harmonizes the nervous system, increases lung capacity, and grounds your focus.",
    inhale: 5,
    hold1: 0,
    exhale: 5,
    hold2: 0,
    bgGradient: "from-sky-500/10 via-blue-500/10 to-indigo-500/10",
    orbColor: "bg-gradient-to-tr from-sky-500 to-blue-500 shadow-blue-500/50",
  },
];

type BreathPhase = "inhale" | "hold1" | "exhale" | "hold2";

export default function BreathingPage() {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(PATTERNS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(selectedPattern.inhale);
  const [totalCompletedCycles, setTotalCompletedCycles] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(120); // default 2 minutes (120s)
  const [selectedSessionLength, setSelectedSessionLength] = useState(120); // 2 mins

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Reset phase when pattern changes
  useEffect(() => {
    setIsPlaying(false);
    setPhase("inhale");
    setPhaseSecondsLeft(selectedPattern.inhale);
    setSessionTimeLeft(selectedSessionLength);
  }, [selectedPattern, selectedSessionLength]);

  // Web Audio Synth to play calm chime tones on phase transitions
  const playPhaseSound = (phaseType: BreathPhase) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      
      // We play a harmonic chord based on the phase
      const playTone = (freq: number, duration: number, delay: number = 0) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + delay);
        
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + delay);
        osc.stop(now + delay + duration);
      };

      if (phaseType === "inhale") {
        // Upward chord (Major)
        playTone(261.63, 1.2, 0); // C4
        playTone(329.63, 1.2, 0.15); // E4
        playTone(392.00, 1.2, 0.3); // G4
      } else if (phaseType === "hold1") {
        // Flat comforting tone
        playTone(329.63, 1.5, 0); // E4
        playTone(440.00, 1.5, 0.1); // A4
      } else if (phaseType === "exhale") {
        // Downward chord
        playTone(392.00, 1.2, 0); // G4
        playTone(329.63, 1.2, 0.15); // E4
        playTone(261.63, 1.2, 0.3); // C4
      } else {
        // Grounding deep tone
        playTone(220.00, 1.5, 0); // A3
        playTone(261.63, 1.5, 0.2); // C4
      }
    } catch (e) {
      console.warn("Audio Context failed to play chime:", e);
    }
  };

  // Main countdown timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        // 1. Session Countdown
        setSessionTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setTotalCompletedCycles((c) => c + 1);
            toast.success("Breathing session completed! 🌿 Great job breathing mindfully.");
            playPhaseSound("inhale"); // play completion sound
            return selectedSessionLength;
          }
          return prev - 1;
        });

        // 2. Phase Countdown
        setPhaseSecondsLeft((prevSeconds) => {
          if (prevSeconds <= 1) {
            // Transition to next phase
            let nextPhase: BreathPhase = "inhale";
            let nextDuration = selectedPattern.inhale;

            if (phase === "inhale") {
              if (selectedPattern.hold1 > 0) {
                nextPhase = "hold1";
                nextDuration = selectedPattern.hold1;
              } else {
                nextPhase = "exhale";
                nextDuration = selectedPattern.exhale;
              }
            } else if (phase === "hold1") {
              nextPhase = "exhale";
              nextDuration = selectedPattern.exhale;
            } else if (phase === "exhale") {
              if (selectedPattern.hold2 > 0) {
                nextPhase = "hold2";
                nextDuration = selectedPattern.hold2;
              } else {
                nextPhase = "inhale";
                nextDuration = selectedPattern.inhale;
                setTotalCompletedCycles((c) => c + 1);
              }
            } else if (phase === "hold2") {
              nextPhase = "inhale";
              nextDuration = selectedPattern.inhale;
              setTotalCompletedCycles((c) => c + 1);
            }

            setPhase(nextPhase);
            playPhaseSound(nextPhase);
            return nextDuration;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isPlaying, phase, selectedPattern, selectedSessionLength]);

  // Audio activation helper
  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      toast.info("Ambient synthesizer cues enabled! 🎵");
    }
  };

  // Display labels and instruction details
  const getPhaseInstructions = () => {
    switch (phase) {
      case "inhale":
        return { text: "Breathe In", desc: "Fill your lungs slowly with air.", scale: 1.6 };
      case "hold1":
        return { text: "Hold", desc: "Suspend the air in your chest.", scale: 1.6 };
      case "exhale":
        return { text: "Breathe Out", desc: "Release the air gently.", scale: 1.0 };
      case "hold2":
        return { text: "Hold / Rest", desc: "Relax before the next breath.", scale: 1.0 };
    }
  };

  const currentInstructions = getPhaseInstructions();

  const handleReset = () => {
    setIsPlaying(false);
    setPhase("inhale");
    setPhaseSecondsLeft(selectedPattern.inhale);
    setSessionTimeLeft(selectedSessionLength);
    setTotalCompletedCycles(0);
  };

  // Format session time (e.g. 1:20)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-6 animate-fade-in min-h-[85vh] flex flex-col justify-between transition-colors duration-1000 p-4 md:p-6 rounded-3xl bg-gradient-to-br ${selectedPattern.bgGradient}`}>
      
      {/* Top Header Section */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-600">
            <Wind className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Breathing Space</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-indigo-950 mt-1">Guided Mindful Breathing</h1>
          <p className="text-gray-400 text-sm mt-0.5">Pause for a moment to calm your nervous system</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className={`p-3 rounded-2xl border transition-all ${
              soundEnabled
                ? "bg-violet-100 border-violet-200 text-violet-700"
                : "bg-white border-gray-100 text-gray-400 hover:text-gray-600"
            }`}
            title="Toggle synthesizer sounds"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch flex-1">
        
        {/* Left Side: Select Patterns */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
              <Info className="w-4.5 h-4.5 text-indigo-500 w-[18px] h-[18px]" />
              <h2 className="font-semibold text-sm text-indigo-950">Select Breath Pattern</h2>
            </div>
            
            <div className="space-y-2.5">
              {PATTERNS.map((pattern) => (
                <button
                  key={pattern.name}
                  onClick={() => setSelectedPattern(pattern)}
                  disabled={isPlaying}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex flex-col gap-1.5 ${
                    selectedPattern.name === pattern.name
                      ? "border-violet-500 bg-violet-50/50"
                      : "border-gray-50 bg-white/50 hover:bg-white hover:border-violet-200"
                  } ${isPlaying ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-semibold text-sm text-indigo-900">{pattern.name}</span>
                    <span className="text-xs text-gray-400 font-mono">
                      {pattern.inhale}-{pattern.hold1}-{pattern.exhale}-{pattern.hold2}s
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">{pattern.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Session Length Setting */}
          <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-sm text-indigo-950 mb-3">Session Length</h3>
            <div className="grid grid-cols-3 gap-2">
              {[60, 120, 300].map((length) => (
                <button
                  key={length}
                  disabled={isPlaying}
                  onClick={() => {
                    setSelectedSessionLength(length);
                    setSessionTimeLeft(length);
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedSessionLength === length
                      ? "bg-indigo-600 text-white border-transparent"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  } ${isPlaying ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {length / 60} Min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: Guided Breathing Ring & Orb */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md rounded-2xl border border-gray-100 flex flex-col items-center justify-center p-8 relative shadow-sm min-h-[450px]">
          
          {/* Top Session Status */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-xs font-medium text-gray-500">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
              <span>{isPlaying ? `Time Remaining: ${formatTime(sessionTimeLeft)}` : "Session Ready"}</span>
            </div>
            
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-50 border border-violet-100 rounded-full text-xs font-medium text-violet-700">
              <Award className="w-4 h-4" />
              <span>{totalCompletedCycles} Cycles</span>
            </div>
          </div>

          {/* Glowing Animated Orb Container */}
          <div className="relative w-72 h-72 flex items-center justify-center">
            
            {/* Outer static breathing ring path */}
            <div className="absolute inset-0 rounded-full border border-dashed border-indigo-200/60 animate-[spin_120s_linear_infinite]" />

            {/* Glowing Backdrop Ring (indicates maximum state size) */}
            <div className="absolute w-60 h-60 rounded-full bg-violet-200/10 border border-dashed border-violet-500/20" />

            {/* Expanding/Contracting Breathing Orb */}
            <motion.div
              className={`absolute w-36 h-36 rounded-full blur-[2px] shadow-lg opacity-80 ${selectedPattern.orbColor}`}
              animate={{
                scale: isPlaying ? currentInstructions.scale : 1.0,
              }}
              transition={{
                duration: isPlaying ? phaseSecondsLeft : 0.8,
                ease: "easeInOut",
              }}
            />

            {/* Inner Glassmorphic core */}
            <div className="absolute w-28 h-28 rounded-full bg-white/35 backdrop-blur-md flex flex-col items-center justify-center border border-white/50 shadow-inner select-none pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phase}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs uppercase tracking-widest text-indigo-700 font-bold"
                >
                  {phase === "hold2" ? "Rest" : phase === "hold1" ? "Hold" : phase}
                </motion.span>
              </AnimatePresence>
              
              <span className="text-3xl font-bold text-indigo-950 font-mono mt-1">
                {phaseSecondsLeft}
              </span>
            </div>
          </div>

          {/* Lower Instruction Text */}
          <div className="text-center mt-6 max-w-sm space-y-1">
            <h3 className="font-serif font-semibold text-indigo-900 text-lg">
              {isPlaying ? currentInstructions.text : "Take a Deep Breath"}
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              {isPlaying ? currentInstructions.desc : "Click play to start your visual guided breathing exercise."}
            </p>
          </div>

          {/* Controls Footer */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={handleReset}
              className="p-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 rounded-2xl transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Reset session"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                if (!isPlaying) {
                  playPhaseSound(phase);
                }
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-semibold text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" /> Start Guided Breath
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
