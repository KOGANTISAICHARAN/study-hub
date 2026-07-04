import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageSquare, BookOpen, ThumbsUp, Send, Trophy, Plus, 
  Sparkles, Check, Share2, Award, FolderHeart, Lightbulb 
} from 'lucide-react';
import { LearningCircle, SharedNote, CircleMessage } from '../types';

interface LearningCirclesProps {
  circles: LearningCircle[];
  onAddCircle: (circle: LearningCircle) => void;
  onAddMessage: (circleId: string, msg: CircleMessage) => void;
  onAddSharedNote: (circleId: string, note: SharedNote) => void;
  onLikeNote: (circleId: string, noteId: string, userEmail: string) => void;
  gainXp: (amount: number) => void;
  userEmail: string;
}

export default function LearningCircles({ 
  circles, onAddCircle, onAddMessage, onAddSharedNote, onLikeNote, gainXp, userEmail 
}: LearningCirclesProps) {
  const [activeCircleId, setActiveCircleId] = useState<string | null>(circles[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'leaderboard'>('chat');
  
  // Create circle state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDesc, setNewCircleDesc] = useState('');
  const [newCircleCat, setNewCircleCat] = useState('Computer Science');

  // Input chat state
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // New note share state
  const [showShareNoteForm, setShowShareNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('react, state');

  // Custom Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeCircle = circles.find(c => c.id === activeCircleId) || circles[0] || null;

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeCircle?.messages, activeTab]);

  const handleCreateCircle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleName.trim()) return;

    const newCircle: LearningCircle = {
      id: `circle_${Date.now()}`,
      name: newCircleName.trim(),
      description: newCircleDesc.trim() || 'Collaborative circle for study accountability.',
      category: newCircleCat,
      memberCount: 1, // creator
      members: [userEmail],
      notes: [],
      messages: [
        {
          id: `msg_welcome`,
          senderName: "Study Hub Bot",
          senderEmail: "bot@studyhub.edu",
          text: `Welcome to the brand new ${newCircleName.trim()} Circle! Share notes, talk through algorithms, and maintain accountability.`,
          timestamp: new Date().toLocaleTimeString().slice(0, 5)
        }
      ],
      creatorEmail: userEmail
    };

    onAddCircle(newCircle);
    setActiveCircleId(newCircle.id);
    gainXp(30);

    // Reset Form
    setNewCircleName('');
    setNewCircleDesc('');
    setShowCreateForm(false);
    showToast(`🌟 Successfully assembled "${newCircle.name}" Circle!`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeCircle) return;

    const newMsg: CircleMessage = {
      id: `msg_${Date.now()}`,
      senderName: "You",
      senderEmail: userEmail,
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString().slice(0, 5)
    };

    onAddMessage(activeCircle.id, newMsg);
    setChatInput('');
    gainXp(10); // Active discussion reward!

    // Simulated companion responses to make the room feel comical and alive
    setTimeout(() => {
      const responses = [
        "Whoa, excellent point! I was actually reviewing that exact concept in our flashcards just now.",
        "Wait, can someone explain that step again? My brain is currently running on 2% battery.",
        "Oh! I have a cheat-sheet note on this. Let me upload it to the Notes Library on the next tab!",
        "Struggling with this problem too... Let's set up a joint 25-minute Pomodoro session to crack it!",
        "Haha, so true! That's typical for Professor Miller's quizzes. Thanks for posting!"
      ];
      const names = ["Alex Rivera", "Chloe Chen", "Devon Miller", "Zoe Jenkins", "Liam Vance"];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomText = responses[Math.floor(Math.random() * responses.length)];

      const companionMsg: CircleMessage = {
        id: `msg_${Date.now()}_reply`,
        senderName: randomName,
        senderEmail: `${randomName.toLowerCase().replace(' ', '')}@studyhub.edu`,
        text: randomText,
        timestamp: new Date().toLocaleTimeString().slice(0, 5)
      };

      onAddMessage(activeCircle.id, companionMsg);
    }, 1500);
  };

  const handleShareNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim() || !activeCircle) return;

    const newNote: SharedNote = {
      id: `note_${Date.now()}`,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      author: "You (Student)",
      authorEmail: userEmail,
      dateShared: new Date().toISOString().slice(0, 10),
      likes: 0,
      likedBy: [],
      tags: noteTags.split(',').map(t => t.trim()).filter(t => t !== '')
    };

    onAddSharedNote(activeCircle.id, newNote);
    gainXp(40); // Generous reward for helping peers!

    // Reset Form
    setNoteTitle('');
    setNoteContent('');
    setShowShareNoteForm(false);
    showToast(`📝 Shared "${newNote.title}" with the circle comrades!`);
  };

  const handleLike = (noteId: string) => {
    if (!activeCircle) return;
    onLikeNote(activeCircle.id, noteId, userEmail);
    gainXp(5); // Like reward
    showToast("❤️ Upvoted peer study notes!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3.5 rounded-2xl shadow-lg border border-slate-800 flex items-center gap-2 animate-fade-in text-xs font-semibold">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
      
      {/* Title & Create Circle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Peer Learning Circles
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Join custom academic circles to collaborate with peer bots, exchange lectures, chat through guides, and build camaraderie.
          </p>
        </div>

        <button
          id="btn-toggle-create-circle"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3.5 rounded-xl font-bold transition-colors shadow-sm shadow-indigo-600/10 flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Assemble New Circle
        </button>
      </div>

      {/* Create Circle Form Drawer */}
      {showCreateForm && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm relative animate-fade-in">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-2">Assemble Academic Cohort</span>

          <form onSubmit={handleCreateCircle} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Circle Name *</label>
              <input
                id="circle-name-input"
                type="text"
                required
                placeholder="e.g., Quantum Mechanics Crew"
                value={newCircleName}
                onChange={(e) => setNewCircleName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Academic Category</label>
              <select
                id="circle-category-select"
                value={newCircleCat}
                onChange={(e) => setNewCircleCat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biological Sciences">Biological Sciences</option>
                <option value="Engineering & Physics">Engineering & Physics</option>
                <option value="Arts & Humanities">Arts & Humanities</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Catchphrase / Goal</label>
              <input
                id="circle-desc-input"
                type="text"
                placeholder="e.g., Survive finals & crack coding interviews"
                value={newCircleDesc}
                onChange={(e) => setNewCircleDesc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white placeholder-slate-400"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                id="btn-cancel-circle-create"
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-submit-circle-create"
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Assemble Cohort +30 XP
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Circles list directory */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center gap-1 px-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Circle Hubs ({circles.length})
            </span>
          </div>
          
          <div className="space-y-3">
            {circles.map(c => {
              const isActive = activeCircle?.id === c.id;
              return (
                <button
                  key={c.id}
                  id={`btn-select-circle-${c.id}`}
                  onClick={() => {
                    setActiveCircleId(c.id);
                    gainXp(5);
                  }}
                  className={`w-full text-left p-4.5 rounded-2xl border transition-all ${
                    isActive 
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md scale-[1.01]' 
                      : 'bg-white text-slate-900 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide mb-2 ${
                    isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.category}
                  </span>
                  
                  <div className="font-bold text-sm tracking-tight leading-snug">
                    {c.name}
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${
                    isActive ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {c.description}
                  </p>
                  
                  <div className={`flex items-center gap-1.5 mt-4 text-[10px] font-semibold uppercase tracking-wider ${
                    isActive ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <Users className="w-3.5 h-3.5" />
                    <span>{c.memberCount + 4} Active Peers Online</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Circle dashboard lounge */}
        {activeCircle ? (
          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col min-h-[500px] overflow-hidden">
            
            {/* Header & Tabs */}
            <div className="bg-slate-950 text-white p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-indigo-400 font-bold text-[9px] uppercase tracking-widest">
                  COHORT LOUNGE • CATEGORY: {activeCircle.category}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight leading-tight mt-0.5">
                  {activeCircle.name}
                </h3>
              </div>
              
              {/* Premium Tab Bar */}
              <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
                <button
                  id="tab-circle-chat"
                  onClick={() => setActiveTab('chat')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer ${
                    activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💬 Chat
                </button>
                <button
                  id="tab-circle-notes"
                  onClick={() => setActiveTab('notes')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer ${
                    activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📝 Notes ({activeCircle.notes.length})
                </button>
                <button
                  id="tab-circle-leaderboard"
                  onClick={() => setActiveTab('leaderboard')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer ${
                    activeTab === 'leaderboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🏆 Leaderboard
                </button>
              </div>
            </div>

            {/* Content Switcher */}
            <div className="p-5 flex-1 flex flex-col bg-slate-50/40">
              
              {/* CHAT TAB */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col justify-between h-[400px]">
                  
                  {/* Messages container */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 p-1 max-h-[320px]">
                    {activeCircle.messages.map((m, idx) => {
                      const isMe = m.senderEmail === userEmail;
                      return (
                        <div 
                          key={idx} 
                          className={`flex flex-col max-w-[75%] ${
                            isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                          }`}
                        >
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                            {m.senderName} • {m.timestamp}
                          </span>
                          <div 
                            className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                              isMe 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Message Input Box */}
                  <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-slate-200/60">
                    <input
                      id="chat-message-input"
                      type="text"
                      required
                      placeholder="Brainstorm definitions, ask study circle questions..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 placeholder-slate-400 shadow-sm"
                    />
                    <button
                      id="btn-send-chat-msg"
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-xl font-bold uppercase text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </form>
                </div>
              )}

              {/* NOTES LIBRARY TAB */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  
                  {/* Note creation triggers */}
                  <div className="flex justify-between items-center gap-4 flex-wrap pb-3.5 border-b border-slate-200/60">
                    <p className="text-xs font-semibold text-slate-400">
                      Peers share their lectures & cheat-sheets here. Upvote peer notes to reward authors +5XP!
                    </p>
                    <button
                      id="btn-toggle-share-note-form"
                      onClick={() => setShowShareNoteForm(!showShareNoteForm)}
                      className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-xl font-bold text-xs uppercase transition-colors cursor-pointer"
                    >
                      {showShareNoteForm ? "✕ Close Editor" : "📂 Share Guide +40 XP"}
                    </button>
                  </div>

                  {/* Share note form */}
                  {showShareNoteForm && (
                    <form onSubmit={handleShareNote} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 relative shadow-sm animate-fade-in">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Compose Peer Guide</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Note Title *</label>
                          <input
                            id="share-note-title"
                            type="text"
                            required
                            placeholder="e.g., Dijkstra's Algorithm Summary"
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Tags (comma separated)</label>
                          <input
                            id="share-note-tags"
                            type="text"
                            placeholder="e.g., algorithms, computer science, final-guide"
                            value={noteTags}
                            onChange={(e) => setNoteTags(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Study Guide Content (supports plain markdown text) *</label>
                        <textarea
                          id="share-note-content"
                          rows={4}
                          required
                          placeholder="Summarize formulas, core terms, or helpful explanations..."
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed font-semibold"
                        ></textarea>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          id="btn-publish-shared-note"
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Publish to Library
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Shared notes list */}
                  {activeCircle.notes.length === 0 ? (
                    <div className="border border-dashed border-slate-200 p-10 text-center flex flex-col items-center bg-white rounded-2xl">
                      <FolderHeart className="w-12 h-12 text-slate-300 mb-2" />
                      <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Note Library is Empty</span>
                      <p className="text-[11px] font-medium text-slate-500 mt-1 max-w-xs leading-relaxed">
                        Be the circle pioneer! Share your definitions, outlines, or flashcard text guides above.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[350px] overflow-auto pr-1">
                      {activeCircle.notes.map(note => {
                        const hasLiked = note.likedBy.includes(userEmail);
                        return (
                          <div 
                            key={note.id} 
                            className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-3 relative hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start gap-2 flex-wrap">
                              <div>
                                <h5 className="font-bold text-sm text-slate-900 leading-tight">
                                  {note.title}
                                </h5>
                                <span className="text-[10px] font-medium text-slate-400">
                                  Shared by {note.author} on {note.dateShared}
                                </span>
                              </div>
                              <button
                                id={`btn-like-note-${note.id}`}
                                onClick={() => handleLike(note.id)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                  hasLiked 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                                <span>{note.likes} Likes</span>
                              </button>
                            </div>

                            <p className="text-xs font-normal text-slate-600 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-wrap">
                              {note.content}
                            </p>

                            <div className="flex gap-1.5 flex-wrap pt-1">
                              {note.tags.map(t => (
                                <span key={t} className="bg-indigo-50 text-indigo-600 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* LEADERBOARD TAB */}
              {activeTab === 'leaderboard' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-3">
                    <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Circle Competition</span>
                      <h4 className="font-bold text-xs uppercase text-slate-900 leading-tight">
                        Daily Study Accountability Leaderboard
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { name: "Chloe Chen", xp: 480, badge: "⚡ Speed Reader" },
                      { name: "You (Student)", xp: 320, badge: "🔥 Study Streak Hero" },
                      { name: "Alex Rivera", xp: 290, badge: "🧪 Lab Wizard" },
                      { name: "Zoe Jenkins", xp: 220, badge: "⏱️ Pomodoro Sage" },
                      { name: "Devon Miller", xp: 180, badge: "📝 Master Annotator" }
                    ]
                    .sort((a,b) => b.xp - a.xp)
                    .map((peer, idx) => {
                      const isMe = peer.name.includes("You");
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between border rounded-2xl p-4 transition-all ${
                            isMe 
                              ? 'bg-slate-950 text-white border-slate-950 shadow-md scale-[1.01]' 
                              : 'bg-white border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3 font-semibold">
                            <span className={`text-xs w-6 h-6 rounded-lg flex items-center justify-center font-bold font-mono ${
                              idx === 0 
                                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                : isMe ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <div className="text-xs font-bold leading-tight">{peer.name}</div>
                              <span className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 inline-block ${
                                isMe ? 'text-indigo-300' : 'text-slate-400'
                              }`}>
                                {peer.badge}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`text-xs font-bold font-mono ${
                            isMe ? 'text-indigo-400' : 'text-slate-500'
                          }`}>
                            {peer.xp} XP TODAY
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="lg:col-span-8 bg-white border border-slate-200 p-12 text-center rounded-3xl shadow-sm">
            <Users className="w-16 h-16 mx-auto text-slate-300 stroke-[1.5] mb-2" />
            <h3 className="text-lg font-bold text-slate-900">No Active Study Circles</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">
              Establish your own custom circle or study on your own!
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
