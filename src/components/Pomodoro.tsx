import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Flame, Settings, Volume2, VolumeX, Sparkles, 
  Clock, Zap, Coffee, Check, CheckCircle2, AlertCircle
} from 'lucide-react';

interface PomodoroProps {
  gainXp: (amount: number) => void;
}

export default function Pomodoro({ gainXp }: PomodoroProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [muteSound, setMuteSound] = useState(false);

  // Stats config
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Settings configs
  const [focusLength, setFocusLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const [showSettings, setShowSettings] = useState(false);

  // Custom Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
          // Play a light tick sound sometimes (quietly)
          if (!muteSound && seconds % 2 === 0) {
            playSynthesizedTone(350, 'triangle', 0.01);
          }
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer Finished!
            handleSessionComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, minutes]);

  const handleSessionComplete = () => {
    setIsActive(false);
    
    // Play celebratory bell sound
    if (!muteSound) {
      playSynthesizedTone(523.25, 'sine', 0.2); // C5
      setTimeout(() => playSynthesizedTone(659.25, 'sine', 0.2), 150); // E5
      setTimeout(() => playSynthesizedTone(783.99, 'sine', 0.4), 300); // G5
    }

    if (mode === 'focus') {
      setMode('break');
      setMinutes(breakLength);
      setSeconds(0);
      setSessionsCompleted(prev => prev + 1);
      gainXp(40); // Generous reward for complete focus!
      showToast("🎉 FOCUS BLOCK COMPLETED! Awesome job. Take a 5-minute break. +40 XP");
    } else {
      setMode('focus');
      setMinutes(focusLength);
      setSeconds(0);
      gainXp(10); // Reward for resuming!
      showToast("⏱️ Break over! Let's get back into the Focus Zone.");
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    // Initialize audio context on first click if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Small click sound
    playSynthesizedTone(600, 'sine', 0.05);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode('focus');
    setMinutes(focusLength);
    setSeconds(0);
    playSynthesizedTone(200, 'sawtooth', 0.1);
    showToast("⏱️ Timer reset successfully.");
  };

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setFocusLength(focusLength);
    setBreakLength(breakLength);
    setMinutes(mode === 'focus' ? focusLength : breakLength);
    setSeconds(0);
    setShowSettings(false);
    gainXp(5);
    showToast("⚙️ Study intervals updated successfully!");
  };

  const playSynthesizedTone = (frequency: number, type: OscillatorType, duration: number) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (err) {
      // Audio fallback silent
    }
  };

  // Progress calculations
  const totalDuration = (mode === 'focus' ? focusLength : breakLength) * 60;
  const currentSecondsLeft = (minutes * 60) + seconds;
  const percentageCompleted = ((totalDuration - currentSecondsLeft) / totalDuration) * 100;

  return (
    <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3.5 rounded-2xl shadow-lg border border-slate-800 flex items-center gap-2 animate-fade-in text-xs font-semibold max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Absolute background patterns */}
      <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] text-indigo-600 rotate-12 pointer-events-none">
        <Clock className="w-48 h-48 stroke-[1]" />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
            Pomodoro Session Zones
          </h4>
          <p className="text-xs font-medium text-slate-400">
            Use focused intervals of high cognitive concentration followed by scientific pauses.
          </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button
            id="btn-toggle-sound"
            onClick={() => {
              setMuteSound(!muteSound);
              gainXp(2);
            }}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
            title={muteSound ? "Unmute sounds" : "Mute sounds"}
          >
            {muteSound ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <button
            id="btn-toggle-pomo-settings"
            onClick={() => {
              setShowSettings(!showSettings);
              gainXp(2);
            }}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Configure intervals"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSettings ? (
        <form onSubmit={saveSettings} className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-fade-in mb-4">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Timer Interval Parameters</span>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Focus Duration (Mins)</label>
              <input
                id="pomo-focus-length"
                type="number"
                min={1}
                max={120}
                required
                value={focusLength}
                onChange={(e) => setFocusLength(parseInt(e.target.value) || 25)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Break Duration (Mins)</label>
              <input
                id="pomo-break-length"
                type="number"
                min={1}
                max={60}
                required
                value={breakLength}
                onChange={(e) => setBreakLength(parseInt(e.target.value) || 5)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              id="btn-close-pomo-settings"
              type="button"
              onClick={() => setShowSettings(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-pomo-settings"
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Apply Intervals
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center py-4 relative">
          
          {/* Active Mode Tag */}
          <div className={`px-4 py-1.5 font-bold uppercase text-[10px] tracking-wider rounded-lg mb-6 flex items-center gap-1.5 ${
            mode === 'focus' 
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
          }`}>
            {mode === 'focus' ? (
              <>
                <Zap className="w-3.5 h-3.5" /> <span>In Focus Block</span>
              </>
            ) : (
              <>
                <Coffee className="w-3.5 h-3.5" /> <span>Take a Break</span>
              </>
            )}
          </div>

          {/* Premium Ring Clock Face */}
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* SVG Ring Background & Progress Bar */}
            <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                className="stroke-slate-50"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                className={`transition-all duration-1000 ${
                  mode === 'focus' ? 'stroke-indigo-600' : 'stroke-emerald-500'
                }`}
                strokeWidth="4"
                strokeDasharray="282.7"
                strokeDashoffset={282.7 - (282.7 * percentageCompleted) / 100}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Clock Card */}
            <div className="z-10 text-center flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {mode === 'focus' ? "FOCUS TIMER" : "BREAK TIMER"}
              </span>
              
              {/* Countdown display */}
              <div className="font-extrabold text-5xl tracking-tighter text-slate-900 tabular-nums leading-none">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>

              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                {isActive ? "● TICKS ACTIVE" : "○ TIMER STOPPED"}
              </span>
            </div>
          </div>

          {/* Action Button Controls */}
          <div className="flex gap-2.5 justify-center mt-8 w-full max-w-[280px]">
            <button
              id="btn-toggle-pomo"
              onClick={toggleTimer}
              className={`flex-1 py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                isActive 
                  ? 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/15'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Start
                </>
              )}
            </button>

            <button
              id="btn-reset-pomo"
              onClick={resetTimer}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3.5 rounded-xl font-semibold transition-all flex items-center justify-center cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* Bottom Sessions Scoreboard */}
          <div className="mt-8 pt-4 border-t border-slate-100 w-full flex justify-between items-center text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-100 animate-pulse" /> Focus Block Goal:
            </span>
            <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg border border-indigo-100">
              {sessionsCompleted} Completed Today
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
