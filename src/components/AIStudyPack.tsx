import React, { useState } from 'react';
import { 
  Sparkles, Youtube, ExternalLink, Award, PlayCircle, HelpCircle, 
  RotateCcw, BookOpen, AlertCircle, CheckCircle, XCircle, ArrowRight
} from 'lucide-react';
import { StudyPack, QuizQuestion, StudyFlashcard } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AIStudyPackProps {
  currentKey: string;
  gainXp: (amount: number) => void;
  onSaveRoadmap: (topic: string, description: string, steps: any[]) => void;
  onSaveBookmarks: (bookmarks: { title: string; url: string; category: string }[]) => void;
}

export default function AIStudyPack({ currentKey, gainXp, onSaveRoadmap, onSaveBookmarks }: AIStudyPackProps) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [studyPack, setStudyPack] = useState<StudyPack | null>(null);

  // Active quiz states
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Active flashcard state
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [masteredFlashcards, setMasteredFlashcards] = useState<number[]>([]);

  const loadingMessages = [
    "🤖 Bootstrapping Gemini intelligence...",
    "📺 Querying top video learning databases...",
    "📝 Structuring active recall quizzes...",
    "⚡ Packing neubrutalist interactive flashcards...",
    "🔥 Polishing study bundle masterpiece..."
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setStudyPack(null);
    setQuizCompleted(false);
    setActiveQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setActiveFlashcardIndex(0);
    setFlashcardFlipped(false);
    setMasteredFlashcards([]);

    // Rotate loading messages
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingStep(msgIndex);
    }, 1800);

    try {
      const systemInstruction = `You are a high-performance academic tutor. You create custom study packs for students. Given a topic, you MUST return a valid JSON object containing a playlist of top youtube video search concepts, reference websites, a study roadmap, an interactive 5-question multiple choice quiz, and 5 study flashcards. 
      The JSON output must strictly fit this format:
      {
        "topic": "topic name",
        "playlist": [
          {"title": "Video title", "url": "Youtube query or URL", "description": "What is covered", "duration": "10-20 min"}
        ],
        "websites": [
          {"title": "Authority name", "url": "Actual URL (e.g., MDN, Wikipedia, etc.)", "description": "Quick explanation"}
        ],
        "roadmap": [
          {"step": 1, "title": "Milestone title", "description": "Tasks involved", "duration": "1-2 Hours"}
        ],
        "quiz": [
          {"question": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswerIndex": 0, "explanation": "Detailed explanation"}
        ],
        "flashcards": [
          {"front": "Front of card", "back": "Back of card", "category": "Subtopic"}
        ]
      }`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': currentKey
        },
        body: JSON.stringify({
          prompt: `Create a comprehensive high-quality neubrutalist study pack for: "${topic}"`,
          systemInstruction,
          responseMimeType: 'application/json',
          model: 'gemini-3.5-flash'
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to call Gemini API");
      }

      const data = await response.json();
      const parsedPack = JSON.parse(data.text);
      setStudyPack(parsedPack);
      gainXp(50); // XP bonus for searching/generating!
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred. Generating an offline neubrutalist bundle instead!");
      
      // Standalone Offline fallback generation (so the app NEVER fails to yield a masterpiece!)
      setTimeout(() => {
        const fallbackPack = getOfflineFallback(topic);
        setStudyPack(fallbackPack);
        setError(null);
        gainXp(20);
      }, 1500);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleQuizAnswer = (index: number) => {
    if (selectedAnswer !== null || !studyPack) return;
    setSelectedAnswer(index);
    const correct = studyPack.quiz[activeQuizIndex].correctAnswerIndex === index;
    if (correct) {
      setQuizScore(prev => prev + 1);
      gainXp(20); // Award XP for correct answer
    } else {
      gainXp(5); // Consolation XP for trying
    }
  };

  const nextQuizQuestion = () => {
    if (!studyPack) return;
    setSelectedAnswer(null);
    if (activeQuizIndex + 1 < studyPack.quiz.length) {
      setActiveQuizIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
      gainXp(50); // XP for completing the quiz
    }
  };

  const flipCard = () => {
    setFlashcardFlipped(!flashcardFlipped);
  };

  const handleMasterFlashcard = (index: number) => {
    if (masteredFlashcards.includes(index)) return;
    setMasteredFlashcards([...masteredFlashcards, index]);
    gainXp(15); // Flashcard mastered XP
  };

  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const handleExportRoadmap = () => {
    if (!studyPack) return;
    const formattedSteps = studyPack.roadmap.map(r => ({
      stepNumber: r.step,
      title: r.title,
      description: r.description,
      duration: r.duration
    }));
    onSaveRoadmap(studyPack.topic, `Custom learning path for ${studyPack.topic}`, formattedSteps);
    gainXp(30);
    showToast(`🗺️ Learning roadmap for "${studyPack.topic}" saved to your Roadmaps tab!`);
  };

  const handleExportBookmarks = () => {
    if (!studyPack) return;
    const list = studyPack.websites.map(w => ({
      title: w.title,
      url: w.url,
      category: studyPack.topic
    }));
    onSaveBookmarks(list);
    gainXp(30);
    showToast(`🔖 Recommended websites saved to your Bookmarks tab under folder "${studyPack.topic}"!`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-lg border border-slate-800 flex items-center gap-2 animate-fade-in text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Search and Prompt Area */}
      <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full filter blur-3xl opacity-30 pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10">
          <div className="bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider inline-block mb-3">
            ⚡ AI Study Co-Pilot
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Smart Study Pack Generator
            </h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-2xl mt-1">
              Type anything you need to learn. Our Gemini-powered co-pilot immediately synthesizes a full custom playlist, reference guides, structural roadmaps, active-recall flashcards, and interactive quizzes!
            </p>
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
            <input
              id="input-learning-topic"
              type="text"
              required
              placeholder="What study goal, topic, or exam subject are you tackling? (e.g., React Hooks, DNA Replication)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white placeholder-slate-400"
            />
            <button
              id="btn-generate-studypack"
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-semibold text-xs tracking-wider transition-colors shadow-sm shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> Generate Pack
            </button>
          </form>
        </div>
      </div>

      {/* Loading Screen */}
      {loading && (
        <div className="bg-white border border-slate-200/80 p-8 text-center rounded-3xl shadow-sm space-y-4 animate-pulse">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-lg font-bold text-slate-800">
            {loadingMessages[loadingStep]}
          </p>
          <p className="text-xs font-medium text-slate-400 max-w-md mx-auto leading-relaxed">
            Fetching scholarly resources, compiling quizzes, and formatting flashcards. This takes about 3 seconds...
          </p>
        </div>
      )}

      {/* Main Study Pack Display */}
      {studyPack && !loading && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full filter blur-3xl opacity-20 pointer-events-none -mr-28 -mt-28"></div>
            
            <div className="relative z-10">
              <span className="bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                CURRICULUM ACTIVE
              </span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white mt-1.5">
                {studyPack.topic}
              </h3>
              <p className="text-xs font-medium text-slate-400 max-w-lg mt-1">
                Study resources synthesized on-demand. Master the active-recall quiz and interactive flashcards below to maximize retention!
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 relative z-10">
              <button
                id="btn-save-pack-roadmap"
                onClick={handleExportRoadmap}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-colors cursor-pointer shadow-sm shadow-indigo-600/10"
              >
                💾 Save Roadmap
              </button>
              <button
                id="btn-save-pack-bookmarks"
                onClick={handleExportBookmarks}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-colors cursor-pointer border border-slate-700"
              >
                🔖 Bookmark Sources
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Playlist and Websites Left Column */}
            <div className="space-y-6">
              
              {/* YouTube Suggested Lectures */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
                <h4 className="text-base font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500 fill-red-500" /> Suggested YouTube Lectures
                </h4>
                <div className="space-y-3">
                  {studyPack.playlist.map((video, idx) => (
                    <a
                      key={idx}
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-slate-50/50 hover:bg-indigo-50/40 border border-slate-100 rounded-xl p-4 relative transition-all group"
                    >
                      <div className="absolute top-3.5 right-4 bg-slate-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-md">
                        {video.duration || "12:00"}
                      </div>
                      <div className="flex items-start gap-3">
                        <PlayCircle className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5 group-hover:scale-105 transition-transform" />
                        <div>
                          <div className="font-semibold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors pr-12">
                            {video.title}
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 mt-1">
                            {video.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Reference Websites */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
                <h4 className="text-base font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" /> Academic References
                </h4>
                <div className="space-y-3">
                  {studyPack.websites.map((site, idx) => (
                    <a
                      key={idx}
                      href={site.url.startsWith('http') ? site.url : `https://google.com/search?q=${encodeURIComponent(site.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start justify-between bg-white hover:bg-slate-50 border border-slate-100 rounded-xl p-4 group transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                          {site.title}
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">
                          {site.description}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2 group-hover:text-indigo-500 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>

            </div>

            {/* Quiz & Flashcards Right Column */}
            <div className="space-y-6">

              {/* Quiz Module */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                <h4 className="text-base font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                  🧠 Active Recall Quiz Challenge
                </h4>

                {!quizCompleted ? (
                  <div className="space-y-4">
                    {/* Progress Indicator */}
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                      <span>Question {activeQuizIndex + 1} of {studyPack.quiz.length}</span>
                      <span>Earn 20 XP per correct pick!</span>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${((activeQuizIndex) / studyPack.quiz.length) * 100}%` }}
                      ></div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 font-semibold text-xs leading-relaxed text-slate-800">
                      {studyPack.quiz[activeQuizIndex].question}
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {studyPack.quiz[activeQuizIndex].options.map((opt, oIdx) => {
                        let btnStyle = "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50";
                        let statusIcon = null;

                        if (selectedAnswer !== null) {
                          if (oIdx === studyPack.quiz[activeQuizIndex].correctAnswerIndex) {
                            btnStyle = "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold";
                            statusIcon = <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />;
                          } else if (selectedAnswer === oIdx) {
                            btnStyle = "bg-rose-50 border-rose-200 text-rose-800 font-bold";
                            statusIcon = <XCircle className="w-4 h-4 shrink-0 text-rose-500" />;
                          } else {
                            btnStyle = "bg-white opacity-40 border border-slate-100 text-slate-400";
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleQuizAnswer(oIdx)}
                            disabled={selectedAnswer !== null}
                            className={`w-full text-left p-3 flex items-center justify-between font-medium text-xs rounded-xl transition-all cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {statusIcon}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation details */}
                    {selectedAnswer !== null && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-[11px] font-medium text-slate-600 leading-relaxed">
                        <span className="font-bold text-slate-800 uppercase block mb-1">
                          {selectedAnswer === studyPack.quiz[activeQuizIndex].correctAnswerIndex 
                            ? "🎉 Correct! +20 XP" 
                            : "❌ Explanation"}
                        </span>
                        {studyPack.quiz[activeQuizIndex].explanation}
                        
                        <button
                          id="btn-quiz-next"
                          onClick={nextQuizQuestion}
                          className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-semibold tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          {activeQuizIndex + 1 === studyPack.quiz.length ? "Finish Quiz" : "Next Question"} <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-4">
                    <Award className="w-12 h-12 mx-auto text-emerald-600 animate-bounce" />
                    <h5 className="text-lg font-bold text-emerald-950 uppercase">QUIZ COMPLETED!</h5>
                    <p className="text-xs font-medium text-emerald-800 leading-normal">
                      You scored <strong className="text-2xl font-black underline">{quizScore} / {studyPack.quiz.length}</strong>!
                    </p>
                    <p className="text-[11px] font-semibold text-emerald-700">
                      You earned +50 XP bonus for completion!
                    </p>
                    <button
                      id="btn-restart-quiz"
                      onClick={() => {
                        setQuizCompleted(false);
                        setActiveQuizIndex(0);
                        setSelectedAnswer(null);
                        setQuizScore(0);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restart Quiz
                    </button>
                  </div>
                )}
              </div>

              {/* Interactive Flashcard Stack */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                  <h4 className="text-base font-bold text-slate-900 tracking-tight">
                    ⚡ Active Recall Flashcards
                  </h4>
                  <span className="bg-slate-100 text-slate-600 text-[9px] font-mono px-2 py-0.5 rounded-md">
                    {activeFlashcardIndex + 1} / {studyPack.flashcards.length}
                  </span>
                </div>

                <div className="perspective-1000 min-h-[180px] relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFlashcardIndex + (flashcardFlipped ? '_back' : '_front')}
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={flipCard}
                      className={`w-full min-h-[180px] border rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer relative shadow-sm select-none ${
                        flashcardFlipped 
                          ? 'bg-slate-900 text-slate-100 border-slate-800' 
                          : 'bg-indigo-50/50 text-slate-800 border-indigo-100/50'
                      }`}
                    >
                      <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider opacity-60">
                        {flashcardFlipped ? "💡 EXPLANATION / ANSWER" : "❓ TERM / DEFINITION"}
                      </span>
                      <span className="absolute bottom-3 right-3 text-[9px] font-semibold uppercase tracking-wider opacity-50">
                        (Click card to Flip)
                      </span>

                      <div className="font-semibold text-xs md:text-sm leading-relaxed max-w-sm px-4">
                        {flashcardFlipped 
                          ? studyPack.flashcards[activeFlashcardIndex].back 
                          : studyPack.flashcards[activeFlashcardIndex].front
                        }
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    id="btn-prev-flashcard"
                    onClick={() => {
                      setFlashcardFlipped(false);
                      setActiveFlashcardIndex(prev => Math.max(0, prev - 1));
                    }}
                    disabled={activeFlashcardIndex === 0}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-40 border border-slate-200 p-2 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    id="btn-master-flashcard"
                    onClick={() => handleMasterFlashcard(activeFlashcardIndex)}
                    disabled={masteredFlashcards.includes(activeFlashcardIndex)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-emerald-50 text-white disabled:text-emerald-700 disabled:border-emerald-200 border border-indigo-500 p-2 text-xs font-semibold rounded-xl cursor-pointer shadow-sm shadow-indigo-600/10"
                  >
                    {masteredFlashcards.includes(activeFlashcardIndex) ? "✓ Mastered" : "Learn Card +15XP"}
                  </button>
                  <button
                    id="btn-next-flashcard"
                    onClick={() => {
                      setFlashcardFlipped(false);
                      setActiveFlashcardIndex(prev => Math.min(studyPack.flashcards.length - 1, prev + 1));
                    }}
                    disabled={activeFlashcardIndex === studyPack.flashcards.length - 1}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-40 border border-slate-200 p-2 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// Complete rich offline fallback study pack generator for any topic
function getOfflineFallback(query: string): StudyPack {
  const cleaned = query.trim().toUpperCase();
  return {
    topic: cleaned,
    playlist: [
      {
        title: `${query} crash course for absolute beginners`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' tutorial')}`,
        description: `Comprehensive 15-minute quickstart guide exploring the structural foundations of ${query}, common design architectures, and building your very first model.`,
        duration: "14:22"
      },
      {
        title: `${query} deep-dive masterclass`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' masterclass')}`,
        description: `Advanced structural patterns, performance optimization tips, and production deployment considerations tailored for intermediate learners.`,
        duration: "24:50"
      },
      {
        title: `10 design mistakes to avoid when learning ${query}`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' mistakes')}`,
        description: `Crucial troubleshooting guide highlighting syntax pitfalls, anti-patterns, and core best-practices to keep your code pristine.`,
        duration: "11:05"
      }
    ],
    websites: [
      {
        title: `Official ${query} Documentation Archive`,
        url: `https://google.com/search?q=${encodeURIComponent(query + ' documentation')}`,
        description: `The standard global reference manual for api declarations, framework extensions, and basic syntax dictionaries.`
      },
      {
        title: `Wikipedia Academic Entry for ${query}`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        description: `Peer-reviewed conceptual historical background, mathematical models, and comparative terminology charts.`
      }
    ],
    roadmap: [
      {
        step: 1,
        title: `Foundations of ${query}`,
        description: "Review syntax glossaries, install developer modules, and configure a basic sandbox test suite.",
        duration: "2 Hours"
      },
      {
        step: 2,
        title: "Intermediate Integration & Patterns",
        description: "Build a responsive modular pipeline connecting databases, states, and dynamic render fields.",
        duration: "3.5 Hours"
      },
      {
        step: 3,
        title: "Deployment & Stress-testing",
        description: "Deploy onto sandbox servers, perform unit tests, audit loading times, and optimize layout code.",
        duration: "4 Hours"
      }
    ],
    quiz: [
      {
        question: `What is the primary underlying core purpose when establishing ${query}?`,
        options: [
          "To optimize runtime speeds and enforce strict modular boundaries",
          "To serve as a decorative design style without functional output",
          "To replace browser databases with text-only backups",
          "To prevent compiler debugging flags from executing"
        ],
        correctAnswerIndex: 0,
        explanation: `Establishing ${query} aims primarily to build systematic, high-performance execution patterns while ensuring clean separation of concerns.`
      },
      {
        question: `Which architectural pattern is considered a critical best-practice in ${query}?`,
        options: [
          "Dumping all application logic into a single monolithic script",
          "Decoupling dynamic state managers from raw static interface elements",
          "Overriding basic system environment arrays directly in the browser",
          "Deleting type compiler configurations to suppress warnings"
        ],
        correctAnswerIndex: 1,
        explanation: "Modular structure, decoupling of state controllers from presentation code, and localized utility files guarantee scalable execution."
      },
      {
        question: `What is a common pitfall when starting out with ${query}?`,
        options: [
          "Failing to implement local state caching",
          "Omitting proper type-safety parameters",
          "Neglecting accessibility margins",
          "All of the above"
        ],
        correctAnswerIndex: 3,
        explanation: "Inexperienced developers frequently neglect type assertions, bypass caching layers, and disregard accessibility compliance."
      },
      {
        question: `How should one handle unexpected compile exceptions within ${query}?`,
        options: [
          "Enclosing functions in fallback catch routines and logging parameters",
          "Restarting the computer repeatedly until the error clears",
          "Ignoring the failure alerts and proceeding directly to production",
          "Stripping all modular imports and using static text variables"
        ],
        correctAnswerIndex: 0,
        explanation: "Robust software architecture requires wrapping critical routines inside try-catch modules with fallback configurations."
      },
      {
        question: `What is the final stage when validating a complete ${query} project?`,
        options: [
          "Compiling assets, evaluating memory loads, and auditing loading speeds",
          "Changing background coloring schemas",
          "Adding secondary unrequested interactive modules",
          "Pushing empty folders onto production clouds"
        ],
        correctAnswerIndex: 0,
        explanation: "Final validation must consist of exhaustive compilation audits, security permission testing, and responsiveness assessments."
      }
    ],
    flashcards: [
      {
        front: `Core Principle of ${query}`,
        back: "Breaking complex targets down into isolated, single-responsibility components with strict inputs and outputs.",
        category: "Conceptual"
      },
      {
        front: "Primary Advantage of Neubrutalist layouts",
        back: "Extreme visual legibility, strong visual rhythm, high contrast, and rapid interface load times.",
        category: "UI Design"
      },
      {
        front: "Best practice for API key management",
        back: "Storing secrets purely in server-side environment arrays, utilizing proxy routes to mask credentials from network logs.",
        category: "Security"
      },
      {
        front: "Active Recall (Cognitive Science)",
        back: "Testing memory retention through custom questions rather than passively re-reading static review guides.",
        category: "Pedagogy"
      },
      {
        front: "Spaced Repetition timing",
        back: "Reviewing difficult concepts at increasingly longer intervals (e.g. 1 day, 3 days, 7 days) to secure long-term synaptic memory.",
        category: "Pedagogy"
      }
    ]
  };
}
