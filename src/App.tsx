import { useState, useEffect } from 'react';
import { 
  Calendar, Sparkles, Milestone, Users, Clock, Bookmark, 
  Youtube, Briefcase, Award, Zap, HelpCircle
} from 'lucide-react';

// Import Types
import { 
  TimetableEntry, Bookmark as BookmarkType, StudyRoadmap, 
  LearningCircle, Internship, UserStats, SharedNote, CircleMessage, RoadmapStep 
} from './types';

// Import Subcomponents
import DashboardHeader from './components/DashboardHeader';
import Timetable from './components/Timetable';
import AIStudyPack from './components/AIStudyPack';
import Roadmaps from './components/Roadmaps';
import LearningCircles from './components/LearningCircles';
import Pomodoro from './components/Pomodoro';
import Websites from './components/Websites';
import YoutubeSummarizer from './components/YoutubeSummarizer';
import InternshipFinder from './components/InternshipFinder';

const USER_EMAIL = "student@studyhub.edu";

export default function App() {
  // 🔑 API Key management
  const [currentKey, setCurrentKey] = useState<string>(() => {
    return localStorage.getItem('study_hub_gemini_key') || '';
  });

  // 📈 Gamified Stats
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('study_hub_stats');
    if (saved) return JSON.parse(saved);
    return { xp: 45, level: 1, streak: 3, lastLoginDate: new Date().toISOString().slice(0, 10) };
  });

  // 📅 Timetable Entries
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(() => {
    const saved = localStorage.getItem('study_hub_timetable');
    if (saved) return JSON.parse(saved);
    return defaultTimetableData;
  });

  // 🔖 Bookmark list
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(() => {
    const saved = localStorage.getItem('study_hub_bookmarks');
    if (saved) return JSON.parse(saved);
    return defaultBookmarksData;
  });

  // 🗺️ Learning Journeys/Roadmaps
  const [roadmaps, setRoadmaps] = useState<StudyRoadmap[]>(() => {
    const saved = localStorage.getItem('study_hub_roadmaps');
    if (saved) return JSON.parse(saved);
    return defaultRoadmapData;
  });

  // 👥 Study Circles
  const [circles, setCircles] = useState<LearningCircle[]>(() => {
    const saved = localStorage.getItem('study_hub_circles');
    if (saved) return JSON.parse(saved);
    return defaultCirclesData;
  });

  // 💼 Internship Tracking
  const [internships, setInternships] = useState<Internship[]>(() => {
    const saved = localStorage.getItem('study_hub_internships');
    if (saved) return JSON.parse(saved);
    return defaultInternshipData;
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('timetable');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('study_hub_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('study_hub_timetable', JSON.stringify(timetableEntries));
  }, [timetableEntries]);

  useEffect(() => {
    localStorage.setItem('study_hub_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('study_hub_roadmaps', JSON.stringify(roadmaps));
  }, [roadmaps]);

  useEffect(() => {
    localStorage.setItem('study_hub_circles', JSON.stringify(circles));
  }, [circles]);

  useEffect(() => {
    localStorage.setItem('study_hub_internships', JSON.stringify(internships));
  }, [internships]);

  // Streak verification on mount
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (stats.lastLoginDate !== todayStr) {
      setStats(prev => {
        // Check if logged in yesterday to continue streak
        const last = new Date(prev.lastLoginDate);
        const diff = Math.floor((new Date(todayStr).getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        let nextStreak = prev.streak;
        if (diff === 1) {
          nextStreak += 1;
        } else if (diff > 1) {
          nextStreak = 1; // Reset streak
        }
        return {
          ...prev,
          streak: nextStreak,
          lastLoginDate: todayStr
        };
      });
    }
  }, []);

  // XP Reward Engine
  const gainXp = (amount: number) => {
    setStats(prev => {
      const newXp = prev.xp + amount;
      const xpNeeded = prev.level * 100;
      if (newXp >= xpNeeded) {
        // Level Up celebratory sound effect
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
          osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
          osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
          osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3); // C6
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.5);
        } catch (_) {}

        return {
          ...prev,
          level: prev.level + 1,
          xp: newXp - xpNeeded
        };
      }
      return {
        ...prev,
        xp: Math.max(0, newXp)
      };
    });
  };

  // State Updates Handlers
  const handleAddTimetableEntry = (entry: TimetableEntry) => {
    setTimetableEntries(prev => [...prev, entry]);
  };

  const handleDeleteTimetableEntry = (id: string) => {
    setTimetableEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleAddBookmark = (b: BookmarkType) => {
    setBookmarks(prev => [b, ...prev]);
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const handleAddRoadmap = (rm: StudyRoadmap) => {
    setRoadmaps(prev => [rm, ...prev]);
  };

  const handleToggleRoadmapStep = (roadmapId: string, stepId: string) => {
    setRoadmaps(prev => prev.map(rm => {
      if (rm.id !== roadmapId) return rm;
      
      const nextSteps = rm.steps.map(step => {
        if (step.id !== stepId) return step;
        return { ...step, isCompleted: !step.isCompleted };
      });

      const completedCount = nextSteps.filter(s => s.isCompleted).length;
      const progressPercent = Math.round((completedCount / nextSteps.length) * 100);

      return {
        ...rm,
        steps: nextSteps,
        progressPercent
      };
    }));
  };

  const handleDeleteRoadmap = (id: string) => {
    setRoadmaps(prev => prev.filter(r => r.id !== id));
  };

  const handleAddCircle = (c: LearningCircle) => {
    setCircles(prev => [c, ...prev]);
  };

  const handleAddCircleMessage = (circleId: string, msg: CircleMessage) => {
    setCircles(prev => prev.map(c => {
      if (c.id !== circleId) return c;
      return {
        ...c,
        messages: [...c.messages, msg]
      };
    }));
  };

  const handleAddCircleSharedNote = (circleId: string, note: SharedNote) => {
    setCircles(prev => prev.map(c => {
      if (c.id !== circleId) return c;
      return {
        ...c,
        notes: [note, ...c.notes]
      };
    }));
  };

  const handleLikeSharedNote = (circleId: string, noteId: string, email: string) => {
    setCircles(prev => prev.map(c => {
      if (c.id !== circleId) return c;
      return {
        ...c,
        notes: c.notes.map(note => {
          if (note.id !== noteId) return note;
          
          const alreadyLiked = note.likedBy.includes(email);
          const nextLikedBy = alreadyLiked 
            ? note.likedBy.filter(e => e !== email)
            : [...note.likedBy, email];
          const nextLikes = alreadyLiked ? note.likes - 1 : note.likes + 1;

          return {
            ...note,
            likes: nextLikes,
            likedBy: nextLikedBy
          };
        })
      };
    }));
  };

  const handleAddInternship = (internship: Internship) => {
    setInternships(prev => {
      // Prevent duplicates
      if (prev.some(i => i.title === internship.title && i.company === internship.company)) {
        return prev;
      }
      return [internship, ...prev];
    });
  };

  const handleUpdateInternshipStatus = (id: string, status: Internship['status']) => {
    setInternships(prev => prev.map(i => {
      if (i.id !== id) return i;
      return { ...i, status };
    }));
  };

  const handleDeleteInternship = (id: string) => {
    setInternships(prev => prev.filter(i => i.id !== id));
  };

  // Export Save integrations from AI generator
  const handleSaveRoadmapFromPack = (topic: string, description: string, steps: any[]) => {
    const parsedSteps: RoadmapStep[] = steps.map((s, idx) => ({
      id: `step_${Date.now()}_${idx}`,
      stepNumber: s.stepNumber,
      title: s.title,
      description: s.description,
      duration: s.duration || "1 Hour",
      isCompleted: false
    }));

    const newRm: StudyRoadmap = {
      id: `rm_${Date.now()}`,
      topic,
      description,
      steps: parsedSteps,
      dateCreated: new Date().toISOString().slice(0, 10),
      progressPercent: 0
    };
    handleAddRoadmap(newRm);
  };

  const handleSaveBookmarksFromPack = (list: { title: string; url: string; category: string }[]) => {
    list.forEach((item, idx) => {
      const newBm: BookmarkType = {
        id: `bm_${Date.now()}_${idx}`,
        title: item.title,
        url: item.url,
        category: item.category,
        dateAdded: new Date().toISOString().slice(0, 10)
      };
      handleAddBookmark(newBm);
    });
  };

  // Nav Tabs configuration
  const navTabs = [
    { id: 'timetable', label: '📅 Planner', icon: Calendar, color: 'hover:bg-cyan-300' },
    { id: 'studypack', label: '🧠 AI Learn Pack', icon: Sparkles, color: 'hover:bg-yellow-300' },
    { id: 'roadmaps', label: '🗺️ Roadmaps', icon: Milestone, color: 'hover:bg-emerald-300' },
    { id: 'circles', label: '👥 Peer Circles', icon: Users, color: 'hover:bg-rose-300' },
    { id: 'pomodoro', label: '⏱️ Pomodoro', icon: Clock, color: 'hover:bg-violet-300' },
    { id: 'bookmarks', label: '🔖 Bookmarks', icon: Bookmark, color: 'hover:bg-amber-300' },
    { id: 'youtube', label: '📺 YouTube Summarizer', icon: Youtube, color: 'hover:bg-orange-300' },
    { id: 'internships', label: '💼 Jobs & Kanban', icon: Briefcase, color: 'hover:bg-teal-300' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Main Header with Stats Tracking */}
        <DashboardHeader 
          stats={stats} 
        />

        {/* Tab Ribbon - Sleek Modern Horizontal Navigation */}
        <nav className="flex flex-wrap gap-1.5 md:gap-2 bg-white border border-slate-200/80 p-2 rounded-2xl shadow-sm z-20 relative">
          {navTabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  gainXp(5);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 font-medium text-xs rounded-xl tracking-wide transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-950/10' 
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Active Module Window Pane */}
        <main className="min-h-[500px]">
          {activeTab === 'timetable' && (
            <Timetable 
              entries={timetableEntries} 
              onAddEntry={handleAddTimetableEntry} 
              onDeleteEntry={handleDeleteTimetableEntry} 
              gainXp={gainXp} 
            />
          )}

          {activeTab === 'studypack' && (
            <AIStudyPack 
              currentKey={currentKey} 
              gainXp={gainXp} 
              onSaveRoadmap={handleSaveRoadmapFromPack}
              onSaveBookmarks={handleSaveBookmarksFromPack}
            />
          )}

          {activeTab === 'roadmaps' && (
            <Roadmaps 
              roadmaps={roadmaps} 
              onAddRoadmap={handleAddRoadmap} 
              onToggleStep={handleToggleRoadmapStep} 
              onDeleteRoadmap={handleDeleteRoadmap}
              gainXp={gainXp} 
            />
          )}

          {activeTab === 'circles' && (
            <LearningCircles 
              circles={circles} 
              onAddCircle={handleAddCircle} 
              onAddMessage={handleAddCircleMessage} 
              onAddSharedNote={handleAddCircleSharedNote} 
              onLikeNote={handleLikeSharedNote} 
              gainXp={gainXp} 
              userEmail={USER_EMAIL} 
            />
          )}

          {activeTab === 'pomodoro' && (
            <Pomodoro gainXp={gainXp} />
          )}

          {activeTab === 'bookmarks' && (
            <Websites 
              bookmarks={bookmarks} 
              onAddBookmark={handleAddBookmark} 
              onDeleteBookmark={handleDeleteBookmark} 
              gainXp={gainXp} 
            />
          )}

          {activeTab === 'youtube' && (
            <YoutubeSummarizer 
              currentKey={currentKey} 
              gainXp={gainXp} 
            />
          )}

          {activeTab === 'internships' && (
            <InternshipFinder 
              currentKey={currentKey} 
              internships={internships} 
              onAddInternship={handleAddInternship} 
              onUpdateInternshipStatus={handleUpdateInternshipStatus} 
              onDeleteInternship={handleDeleteInternship}
              gainXp={gainXp} 
            />
          )}
        </main>

      </div>
    </div>
  );
}

// ==========================================
// SEEDED INITIAL DATABASE STATE (Pre-populated)
// ==========================================

const defaultTimetableData: TimetableEntry[] = [
  {
    id: "tt_1",
    subject: "Computer Systems (CS-201)",
    dayOfWeek: "Monday",
    startTime: "09:30",
    endTime: "11:00",
    room: "Engineering Hall Room 302",
    notes: "Prof. Davidson. Bring textbook and notebook.",
    color: "bg-cyan-300"
  },
  {
    id: "tt_2",
    subject: "Calculus III recitation",
    dayOfWeek: "Wednesday",
    startTime: "13:00",
    endTime: "14:15",
    room: "Science Annex Rec 4",
    notes: "Review Taylor series formulas with TAs.",
    color: "bg-rose-300"
  },
  {
    id: "tt_3",
    subject: "Algorithms and Data Structures",
    dayOfWeek: "Thursday",
    startTime: "10:00",
    endTime: "11:30",
    room: "Tech Seminar Room C",
    notes: "Submit Sorting assignment draft before class.",
    color: "bg-emerald-300"
  }
];

const defaultBookmarksData: BookmarkType[] = [
  {
    id: "bm_1",
    title: "Wolfram|Alpha Computational Engine",
    url: "https://www.wolframalpha.com",
    category: "Mathematics",
    notes: "Perfect for step-by-step calculus integration and matrix solvers.",
    dateAdded: "2026-07-01"
  },
  {
    id: "bm_2",
    title: "MDN Web Docs - JavaScript Guide",
    url: "https://developer.mozilla.org",
    category: "Computer Science",
    notes: "Authority reference manual on promises, arrays, and ES modules.",
    dateAdded: "2026-07-02"
  },
  {
    id: "bm_3",
    title: "Khan Academy Free Video Courses",
    url: "https://www.khanacademy.org",
    category: "General Science",
    notes: "Great organic chem and physical lecture guides.",
    dateAdded: "2026-07-03"
  }
];

const defaultRoadmapData: StudyRoadmap[] = [
  {
    id: "rm_1",
    topic: "Full-Stack Web Architectures",
    description: "My self-taught master plan to transition from client script writing to cloud architectures.",
    dateCreated: "2026-07-01",
    progressPercent: 33,
    steps: [
      {
        id: "step_rm1_1",
        stepNumber: 1,
        title: "RESTful API Integration & Proxies",
        description: "Practice configuring custom Express routers with body parsing and environment key configurations.",
        duration: "2 Hours",
        isCompleted: true
      },
      {
        id: "step_rm1_2",
        stepNumber: 2,
        title: "Durable NoSQL/Relational Databases",
        description: "Connect standard cloud document catalogs, design schemas, and run SQL execution statements.",
        duration: "4 Hours",
        isCompleted: false
      },
      {
        id: "step_rm1_3",
        stepNumber: 3,
        title: "Container Ingress & Live WS Pipelines",
        description: "Secure WebSocket handshakes, manage concurrent state variables, and deploy on production pipelines.",
        duration: "6 Hours",
        isCompleted: false
      }
    ]
  }
];

const defaultCirclesData: LearningCircle[] = [
  {
    id: "circle_1",
    name: "Web Dev Wizards",
    description: "For React builders, CSS brutality fans, and TypeScript masterminds.",
    category: "Computer Science",
    memberCount: 3,
    members: [USER_EMAIL, "alex@studyhub.edu", "chloe@studyhub.edu"],
    creatorEmail: "alex@studyhub.edu",
    notes: [
      {
        id: "sn_1",
        title: "Clean React state habits",
        content: "Always keep arrays and object references stabilized! Avoid updating state directly in the function body. Use primitives in your useEffect dependencies to prevent infinite re-render loops.",
        author: "Alex Rivera",
        authorEmail: "alex@studyhub.edu",
        dateShared: "2026-07-03",
        likes: 4,
        likedBy: ["chloe@studyhub.edu"],
        tags: ["react", "state-management", "hooks"]
      }
    ],
    messages: [
      {
        id: "m_1",
        senderName: "Alex Rivera",
        senderEmail: "alex@studyhub.edu",
        text: "Hey! Welcome. Has anyone checked out the new neubrutalist CSS themes? They look so alive!",
        timestamp: "10:14"
      },
      {
        id: "m_2",
        senderName: "Chloe Chen",
        senderEmail: "chloe@studyhub.edu",
        text: "Yes! The comic-border effect makes everything so punchy. I'm currently designing our circle scoreboard with it.",
        timestamp: "10:18"
      }
    ]
  },
  {
    id: "circle_2",
    name: "Calculus Survivors",
    description: "Accountability club for conquering taylor series, integration parts, and math recitations.",
    category: "Mathematics",
    memberCount: 2,
    members: [USER_EMAIL, "devon@studyhub.edu"],
    creatorEmail: "devon@studyhub.edu",
    notes: [],
    messages: [
      {
        id: "m_3",
        senderName: "Devon Miller",
        senderEmail: "devon@studyhub.edu",
        text: "I am losing my mind over Taylor series. What's the best shortcut definition for sin(x) expansion?",
        timestamp: "11:42"
      }
    ]
  }
];

const defaultInternshipData: Internship[] = [
  {
    id: "int_1",
    title: "Frontend Engineering Intern",
    company: "BrutalDesign Studios",
    location: "San Francisco, CA (SoMa Design Loft)",
    type: "Hybrid",
    stipend: "$42 / hour",
    description: "We build eye-popping visual interfaces for high-scale student apps. Looking for pure React & Tailwind hackers.",
    requirements: ["Solid understanding of CSS selectors and grid layouts", "A passion for bold displays"],
    status: "Saved"
  }
];
