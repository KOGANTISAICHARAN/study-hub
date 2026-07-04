import { useState, useEffect } from 'react';
import { Flame, Trophy, Award, Clock, Sparkles, LogOut, User } from 'lucide-react';
import { UserStats } from '../types';

interface DashboardHeaderProps {
  stats: UserStats;
}

export default function DashboardHeader({ stats }: DashboardHeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const xpNeededForNextLevel = stats.level * 100;
  const progressPercent = Math.min(100, Math.floor((stats.xp / xpNeededForNextLevel) * 100));

  return (
    <header className="bg-white border border-slate-200/80 p-5 md:p-6 mb-8 rounded-3xl shadow-sm relative overflow-hidden">
      {/* Subtle ambient gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full filter blur-3xl opacity-40 pointer-events-none -mr-20 -mt-20"></div>
      
      <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        
        {/* Left Section: Logo & Clock */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="bg-gradient-to-tr from-indigo-600 to-indigo-500 px-5 py-3.5 rounded-2xl shadow-sm text-white">
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              STUDY HUB <Sparkles className="w-6 h-6 fill-indigo-200 text-indigo-200 animate-pulse" />
            </h1>
            <p className="text-[10px] font-semibold tracking-wider text-indigo-100 uppercase mt-0.5">
              🚀 THE ULTIMATE STUDENT CO-PILOT
            </p>
          </div>

          <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center gap-2 font-mono text-xs rounded-xl shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {time.toLocaleTimeString()} | UTC {time.toISOString().slice(0,10)}
            </span>
          </div>
        </div>

        {/* Right Section: Gamified Stats & API Key Config */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Daily Streak Indicator */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 px-4 py-2.5 rounded-2xl group hover:bg-slate-100/50 transition-all">
            <div className="relative">
              <Flame className="w-7 h-7 text-orange-500 fill-orange-500 animate-bounce group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white text-[8px] font-bold rounded-full px-1.5 py-0.5">
                STREAK
              </span>
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-slate-800 leading-none">
                {stats.streak} DAYS
              </div>
              <div className="text-[9px] font-semibold uppercase text-slate-400 tracking-wider mt-0.5">
                Active streak
              </div>
            </div>
          </div>

          {/* XP & Level Tracker */}
          <div className="flex flex-col bg-white border border-slate-200/80 p-3 min-w-[200px] rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-1 text-slate-800 font-bold text-xs">
              <span className="flex items-center gap-1 text-indigo-600">
                <Trophy className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> LEVEL {stats.level}
              </span>
              <span className="text-slate-500 font-mono text-[10px]">{stats.xp} / {xpNeededForNextLevel} XP</span>
            </div>
            
            {/* XP Progress Bar */}
            <div className="w-full h-4 bg-slate-100 rounded-full relative overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center text-[8px] font-extrabold text-slate-700">
                {progressPercent}% NEXT LEVEL
              </div>
            </div>
          </div>

          {/* User Profile Emblem */}
          <div className="flex items-center gap-2 bg-indigo-50/50 text-indigo-950 border border-indigo-100/80 p-2.5 rounded-2xl font-semibold">
            <div className="w-8 h-8 bg-white border border-indigo-100 flex items-center justify-center rounded-xl shadow-sm text-indigo-600">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left text-xs leading-none">
              <div className="font-bold uppercase tracking-wide">STUDENT</div>
              <span className="text-[9px] text-indigo-500 font-medium">Hub Member</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
