import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Clock, MapPin, Sparkles, BookOpen } from 'lucide-react';
import { TimetableEntry } from '../types';

interface TimetableProps {
  entries: TimetableEntry[];
  onAddEntry: (entry: TimetableEntry) => void;
  onDeleteEntry: (id: string) => void;
  gainXp: (amount: number) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = [
  'bg-cyan-300', 'bg-yellow-300', 'bg-emerald-300', 'bg-rose-300', 
  'bg-violet-300', 'bg-amber-300', 'bg-teal-300', 'bg-orange-300'
];

// Modern color mapper to transform raw neubrutalist colors into premium soft pastels
const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  'bg-cyan-300': { bg: 'bg-sky-50/70', border: 'border-sky-100', text: 'text-sky-800', icon: 'text-sky-500' },
  'bg-yellow-300': { bg: 'bg-amber-50/70', border: 'border-amber-100', text: 'text-amber-800', icon: 'text-amber-500' },
  'bg-emerald-300': { bg: 'bg-emerald-50/70', border: 'border-emerald-100', text: 'text-emerald-800', icon: 'text-emerald-500' },
  'bg-rose-300': { bg: 'bg-rose-50/70', border: 'border-rose-100', text: 'text-rose-800', icon: 'text-rose-500' },
  'bg-violet-300': { bg: 'bg-violet-50/70', border: 'border-violet-100', text: 'text-violet-800', icon: 'text-violet-500' },
  'bg-amber-300': { bg: 'bg-amber-50/70', border: 'border-amber-100', text: 'text-amber-800', icon: 'text-amber-500' },
  'bg-teal-300': { bg: 'bg-teal-50/70', border: 'border-teal-100', text: 'text-teal-800', icon: 'text-teal-500' },
  'bg-orange-300': { bg: 'bg-orange-50/70', border: 'border-orange-100', text: 'text-orange-800', icon: 'text-orange-500' },
};

export default function Timetable({ entries, onAddEntry, onDeleteEntry, gainXp }: TimetableProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form states
  const [subject, setSubject] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const newEntry: TimetableEntry = {
      id: 'tt_' + Date.now(),
      subject: subject.trim(),
      dayOfWeek,
      startTime,
      endTime,
      room: room.trim() || undefined,
      notes: notes.trim() || undefined,
      color
    };

    onAddEntry(newEntry);
    gainXp(25); // Reward student with XP!
    
    // Reset Form
    setSubject('');
    setRoom('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    onDeleteEntry(id);
    gainXp(5); // Small interaction XP
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
            📅 Academic Planner & Timetable
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Design your perfect weekly curriculum. Keep track of lectures, labs, and study sessions.
          </p>
        </div>

        <button
          id="btn-toggle-add-schedule-form"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/10 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Class Schedule
        </button>
      </div>

      {/* Add Entry Form Modal */}
      {showAddForm && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-md relative transition-all animate-fade-in">
          <div className="bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider inline-block mb-4">
            ⚡ New Class Schedule
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Subject Name *</label>
              <input
                id="form-class-subject"
                type="text"
                required
                placeholder="e.g., Computer Systems"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-950 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Day of the Week</label>
              <select
                id="form-class-day"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-950 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                {DAYS.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Start Time</label>
                <input
                  id="form-class-start-time"
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-950 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">End Time</label>
                <input
                  id="form-class-end-time"
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-950 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Room / Virtual Link</label>
              <input
                id="form-class-room"
                type="text"
                placeholder="e.g., Block C - Room 304"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-950 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Additional Notes</label>
              <input
                id="form-class-notes"
                type="text"
                placeholder="e.g., Professor Miller, Bring laptop"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-950 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Visual Color Theme</label>
              <div className="flex gap-1.5 py-1.5 flex-wrap">
                {COLORS.map(c => {
                  const resolvedColor = colorMap[c] || { bg: 'bg-slate-100', border: 'border-slate-300' };
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`${resolvedColor.bg} w-7 h-7 rounded-lg border ${resolvedColor.border} hover:scale-105 active:scale-95 transition-all cursor-pointer ${color === c ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                    ></button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                id="btn-cancel-schedule-add"
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-submit-schedule-add"
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-sm shadow-slate-950/10 transition-colors"
              >
                Add Class +25 XP
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid Layout of the Week */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {DAYS.map(day => {
          const dayEntries = entries
            .filter(e => e.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div 
              key={day} 
              className="bg-white border border-slate-200/85 p-4 rounded-2xl shadow-sm flex flex-col min-h-[250px] relative hover:border-slate-300/60 transition-colors"
            >
              {/* Day Header Badge */}
              <div className="text-slate-800 border-b border-slate-100 pb-2 mb-3 font-bold text-sm tracking-wide">
                {day}
              </div>

              {dayEntries.length === 0 ? (
                <div className="flex-1 border border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                  <BookOpen className="w-5 h-5 text-slate-300 mb-1.5" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Free Day</span>
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {dayEntries.map(entry => {
                    const c = colorMap[entry.color] || { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-800', icon: 'text-slate-400' };
                    return (
                      <div
                        key={entry.id}
                        className={`${c.bg} ${c.text} ${c.border} border rounded-xl p-3 relative group hover:shadow-sm transition-all duration-150`}
                      >
                        {/* Subject Name */}
                        <div className="font-bold text-xs leading-tight pr-5 mb-1.5 break-words">
                          {entry.subject}
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-1 text-[10px] font-medium opacity-80 mb-1">
                          <Clock className={`w-3.5 h-3.5 shrink-0 ${c.icon}`} />
                          <span>{entry.startTime} - {entry.endTime}</span>
                        </div>

                        {/* Room */}
                        {entry.room && (
                          <div className="flex items-center gap-1 text-[10px] font-medium opacity-80 truncate mb-1">
                            <MapPin className={`w-3.5 h-3.5 shrink-0 ${c.icon}`} />
                            <span className="truncate">{entry.room}</span>
                          </div>
                        )}

                        {/* Notes tooltip / info */}
                        {entry.notes && (
                          <div className="text-[9px] font-medium opacity-75 leading-tight bg-white/40 border border-slate-200/20 px-1.5 py-0.5 mt-1.5 rounded-md">
                            📌 {entry.notes}
                          </div>
                        )}

                        {/* Delete Button */}
                        <button
                          id={`btn-delete-class-${entry.id}`}
                          onClick={() => handleDelete(entry.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                          title="Delete class"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-100 shrink-0 animate-pulse" />
        <p className="text-xs font-semibold text-slate-600 leading-normal">
          💡 PRO-TIP: Keep your study sessions to under 2 hours and follow them up with a <strong className="text-slate-800">Pomodoro Timer session</strong> on the navigation tab for peak cognitive retention!
        </p>
      </div>
    </div>
  );
}
