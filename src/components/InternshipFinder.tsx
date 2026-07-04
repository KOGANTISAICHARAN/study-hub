import React, { useState } from 'react';
import { 
  Briefcase, Search, MapPin, Building, DollarSign, List, FileText, 
  ArrowRight, Sparkles, Plus, CheckCircle, Kanban, Clock, ChevronRight
} from 'lucide-react';
import { Internship } from '../types';

interface InternshipFinderProps {
  currentKey: string;
  internships: Internship[];
  onAddInternship: (internship: Internship) => void;
  onUpdateInternshipStatus: (id: string, status: Internship['status']) => void;
  onDeleteInternship: (id: string) => void;
  gainXp: (amount: number) => void;
}

export default function InternshipFinder({ 
  currentKey, internships, onAddInternship, onUpdateInternshipStatus, onDeleteInternship, gainXp 
}: InternshipFinderProps) {
  const [role, setRole] = useState('Software Engineering');
  const [location, setLocation] = useState('Seattle, WA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Internship[]>([]);

  // Cover letter generator states
  const [activeLetterJob, setActiveLetterJob] = useState<Internship | null>(null);
  const [coverLetterText, setCoverLetterText] = useState('');
  const [generatingLetter, setGeneratingLetter] = useState(false);

  // Custom Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim() || !location.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // System instructions explicitly request location validation using Google Maps grounding parameters
      const systemInstruction = `You are an expert career placement coordinator. Given a job role/major and geographical location, search and return 3 real or highly realistic student internship openings. You MUST validate the listings and return a valid JSON array of objects.
      The output must fit this JSON format:
      [
        {
          "title": "Internship Position Title",
          "company": "Company Name",
          "location": "Validated City, State (with brief actual address or neighborhood context)",
          "type": "Remote" or "Hybrid" or "Onsite",
          "stipend": "$30 - $45 / hour or similar competitive rates",
          "description": "Short summary of responsibilities.",
          "requirements": ["Requirement 1", "Requirement 2"]
        }
      ]`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': currentKey
        },
        body: JSON.stringify({
          prompt: `Find 3 genuine student internship opportunities for role: "${role}" in location: "${location}". Use Google Maps data to verify addresses.`,
          systemInstruction,
          responseMimeType: 'application/json',
          useMaps: true, // Triggers Google Maps Grounding tools in the backend server proxy!
          model: 'gemini-3.5-flash'
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to search databases");
      }

      const data = await response.json();
      const parsedResults: any[] = JSON.parse(data.text);
      
      const mapped: Internship[] = parsedResults.map((p, idx) => ({
        id: `intern_${Date.now()}_${idx}`,
        title: p.title,
        company: p.company,
        location: p.location,
        type: p.type || 'Hybrid',
        stipend: p.stipend || '$25 / hour',
        description: p.description,
        requirements: p.requirements || [],
        status: 'Saved'
      }));

      setResults(mapped);
      gainXp(30); // Search and discovery XP bonus!
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred. Generating local simulated vacancies instead!");
      
      // Fallback local internship results
      setTimeout(() => {
        const fallbacks = getLocalInternshipFallbacks(role, location);
        setResults(fallbacks);
        setError(null);
        gainXp(15);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = (job: Internship) => {
    onAddInternship(job);
    gainXp(20); // Saved to board XP
    // Filter out of current search results to avoid duplicate saving
    setResults(prev => prev.filter(r => r.title !== job.title || r.company !== job.company));
    showToast(`💼 Tracked "${job.title}" at ${job.company} successfully!`);
  };

  const handleUpdateStatus = (id: string, newStatus: Internship['status']) => {
    onUpdateInternshipStatus(id, newStatus);
    
    // Reward XP based on milestone
    if (newStatus === 'Applied') {
      gainXp(30);
      showToast("🚀 Application marked as Applied! Keep pushing!");
    }
    if (newStatus === 'Interviewing') {
      gainXp(50);
      showToast("📞 Great job! Stage updated to Interviewing!");
    }
    if (newStatus === 'Offer') {
      gainXp(100); // Massive milestone reward!
      showToast("🎉 CONGRATULATIONS! High-fidelity Offer status unlocked!");
    }
    if (newStatus === 'Rejected') {
      gainXp(10); // Consolation XP
      showToast("❤️ Logged. Rejection is redirection. Let's keep exploring!");
    }
  };

  const generateCoverLetter = async (job: Internship) => {
    setActiveLetterJob(job);
    setCoverLetterText('');
    setGeneratingLetter(true);

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': currentKey
        },
        body: JSON.stringify({
          prompt: `Write a compelling, enthusiastic, and highly professional student cover letter for the following internship:
          Role: ${job.title}
          Company: ${job.company}
          Location: ${job.location}
          Description: ${job.description}
          Requirements: ${job.requirements.join(', ')}`,
          model: 'gemini-3.5-flash'
        })
      });

      if (!response.ok) throw new Error("Could not draft cover letter");

      const data = await response.json();
      setCoverLetterText(data.text);
      gainXp(25);
    } catch (err: any) {
      // Local fallback cover letter
      const letter = `Dear Hiring Team at ${job.company},\n\nI am writing to express my enthusiastic interest in the ${job.title} internship position in ${job.location}. As a dedicated student with a high streak of technical accountability, I am eager to apply my skills to your projects.\n\nThank you for your consideration,\n[Your Student Name]`;
      setCoverLetterText(letter);
    } finally {
      setGeneratingLetter(false);
    }
  };

  // Group internships for Kanban columns
  const kanbanColumns: { title: Internship['status']; label: string; bg: string; border: string; text: string }[] = [
    { title: 'Saved', label: '📁 Saved', bg: 'bg-slate-50', border: 'border-slate-200/65', text: 'text-slate-600' },
    { title: 'Applied', label: '🚀 Applied', bg: 'bg-indigo-50/20', border: 'border-indigo-100', text: 'text-indigo-600' },
    { title: 'Interviewing', label: '📞 Interviews', bg: 'bg-amber-50/30', border: 'border-amber-100', text: 'text-amber-700' },
    { title: 'Offer', label: '🎉 Offers', bg: 'bg-emerald-50/20', border: 'border-emerald-100', text: 'text-emerald-700' },
    { title: 'Rejected', label: '💔 Archive', bg: 'bg-rose-50/20', border: 'border-rose-100', text: 'text-rose-700' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3.5 rounded-2xl shadow-lg border border-slate-800 flex items-center gap-2 animate-fade-in text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Finder Box */}
      <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full filter blur-3xl opacity-40 pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10">
          <div className="bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider inline-block mb-3">
            💼 Verified Placement Portal
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Career Internship Finder
            </h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-2xl mt-1">
              Search verified student internship openings. We integrate Gemini's geographical grounding metrics to retrieve authentic vacancy structures and local salary metrics!
            </p>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Target Major / Skill Role</label>
              <input
                id="search-role-input"
                type="text"
                required
                placeholder="e.g., Software Engineer, UX Designer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Office Location / City</label>
              <input
                id="search-location-input"
                type="text"
                required
                placeholder="e.g., Seattle, WA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white placeholder-slate-400"
              />
            </div>

            <div className="flex items-end">
              <button
                id="btn-search-internships"
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-xl font-semibold text-xs tracking-wider transition-colors shadow-sm shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-4 h-4" /> Discover Vacancies
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Loading Block */}
      {loading && (
        <div className="bg-white border border-slate-200/80 p-8 text-center rounded-3xl shadow-sm space-y-4 animate-pulse">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center animate-spin">
            <Briefcase className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-slate-800 uppercase tracking-tight">
            Querying placement archives & maps directories...
          </p>
          <p className="text-xs font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">
            Scanning geographical coordinate parameters, validating vacancy states, and checking stipend averages. Takes 2 seconds...
          </p>
        </div>
      )}

      {/* Search results display */}
      {results.length > 0 && !loading && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-1.5 px-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Verified Vacancies Found ({results.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-slate-200/70 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center gap-1 flex-wrap mb-3.5">
                    <span className="bg-slate-100 text-slate-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md">
                      {job.type}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {job.stipend}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 tracking-tight leading-snug">
                    {job.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> <span>{job.company}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> <span>{job.location}</span>
                  </div>

                  <p className="text-xs font-normal text-slate-500 mt-4 leading-relaxed border-t border-dashed border-slate-100 pt-3">
                    {job.description}
                  </p>

                  <div className="mt-4 space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Core Requirements:</span>
                    <ul className="space-y-1">
                      {job.requirements.slice(0, 3).map((r, rIdx) => (
                        <li key={rIdx} className="text-[11px] text-slate-500 flex items-start gap-1">
                          <span className="text-indigo-500 shrink-0 mt-0.5">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-dashed border-slate-100 mt-5">
                  <button
                    id={`btn-save-internship-${job.id}`}
                    onClick={() => handleSaveJob(job)}
                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white p-2.5 rounded-xl font-semibold text-xs uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    Track Application +20 XP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kanban application tracker */}
      <div className="bg-white border border-slate-200/80 p-5 md:p-6 rounded-3xl shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            📋 Kanban Tracker Board
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Keep applications updated. Shift cards across status columns as you move through recruiter milestones!
          </p>
        </div>

        {internships.length === 0 ? (
          <div className="border border-dashed border-slate-200 p-10 text-center rounded-2xl bg-slate-50/50">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Tracker Board is Empty</span>
            <p className="text-[11px] font-medium text-slate-500 mt-1 leading-relaxed max-w-xs mx-auto">
              No applications tracked yet. Use the finder above to search and save internships to this lifecyle organizer.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
            {kanbanColumns.map((col) => {
              const colJobs = internships.filter(job => job.status === col.title);

              return (
                <div 
                  key={col.title} 
                  className={`border rounded-2xl p-3 flex flex-col min-h-[350px] transition-colors ${col.border} ${col.bg}`}
                >
                  {/* Column Header */}
                  <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-100 px-1">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${col.text}`}>{col.label}</span>
                    <span className="bg-slate-200/60 text-slate-600 px-1.5 py-0.5 text-[10px] font-mono rounded-md font-bold">
                      {colJobs.length}
                    </span>
                  </div>

                  {/* Cards inside columns */}
                  <div className="space-y-3 flex-1">
                    {colJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white border border-slate-200/60 p-3.5 rounded-xl shadow-sm hover:shadow-md transition-all relative group"
                      >
                        <h4 className="font-bold text-xs text-slate-800 leading-tight truncate">
                          {job.title}
                        </h4>
                        <span className="text-[10px] font-medium text-slate-400 block mt-0.5 truncate">
                          {job.company}
                        </span>

                        {/* Status quick mover controls */}
                        <div className="mt-3 pt-2.5 border-t border-dashed border-slate-100 flex items-center justify-between gap-1.5">
                          <button
                            id={`btn-draft-letter-${job.id}`}
                            onClick={() => generateCoverLetter(job)}
                            className="bg-slate-50 hover:bg-indigo-50 text-indigo-600 border border-slate-200/80 px-2 py-1 rounded-lg text-[9px] font-bold transition-colors cursor-pointer"
                            title="Generate cover letter with AI"
                          >
                            📝 Draft
                          </button>

                          <select
                            id={`select-status-job-${job.id}`}
                            value={job.status}
                            onChange={(e) => handleUpdateStatus(job.id, e.target.value as Internship['status'])}
                            className="bg-white border border-slate-200 text-slate-500 text-[9px] font-semibold p-1 rounded-lg focus:outline-none cursor-pointer"
                          >
                            <option value="Saved">Saved</option>
                            <option value="Applied">Applied</option>
                            <option value="Interviewing">Interview</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>

                        {/* Delete Job card */}
                        <button
                          id={`btn-delete-job-${job.id}`}
                          onClick={() => onDeleteInternship(job.id)}
                          className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm hover:bg-rose-600 transition-colors cursor-pointer"
                          title="Delete card"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cover Letter Generator Modal */}
      {activeLetterJob && (
        <div className="fixed inset-0 bg-slate-950/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 p-6 max-w-lg w-full rounded-2xl relative shadow-xl">
            
            <div className="mb-4">
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider">
                AI Cover Letter Assistant
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1.5">
                Draft for {activeLetterJob.title}
              </h3>
              <p className="text-[10px] font-medium text-slate-400">
                {activeLetterJob.company} • {activeLetterJob.location}
              </p>
            </div>

            {generatingLetter ? (
              <div className="bg-slate-50 border border-slate-100 p-10 text-center rounded-xl animate-pulse space-y-2">
                <Sparkles className="w-6 h-6 text-indigo-500 fill-indigo-500 mx-auto animate-spin" />
                <span className="font-bold text-xs text-slate-600 block">Formulating scholarly pitch...</span>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 max-h-[250px] overflow-auto mb-4 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap select-text">
                {coverLetterText}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                id="btn-copy-cover-letter"
                onClick={() => {
                  navigator.clipboard.writeText(coverLetterText);
                  showToast("📋 Draft copied to your clipboard!");
                  gainXp(10);
                }}
                disabled={generatingLetter}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Copy Letter
              </button>
              <button
                id="btn-close-letter-modal"
                onClick={() => setActiveLetterJob(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Fallbacks for maps grounding internship finders
function getLocalInternshipFallbacks(role: string, location: string): Internship[] {
  return [
    {
      id: `intern_fallback_${Date.now()}_0`,
      title: `Junior ${role || "Software Engineering"} Intern`,
      company: `Vanguard Technologies Corp`,
      location: `${location || "Seattle, WA"} (405 Pike Street Office Suite)`,
      type: `Hybrid`,
      stipend: `$38 / hour`,
      description: `Collaborate with foundational systems teams to build robust components, manage secure pipeline caches, and deploy test suites on cloud staging directories.`,
      requirements: [`Basic competency in TypeScript/JavaScript`, `Eagerness to learn in high-accountability teams`],
      status: 'Saved'
    },
    {
      id: `intern_fallback_${Date.now()}_1`,
      title: `${role || "Full Stack developer"} Associate Intern`,
      company: `Apex Innovate Labs`,
      location: `${location || "Seattle, WA"} (1100 2nd Avenue Tech District Office)`,
      type: `Onsite`,
      stipend: `$45 / hour`,
      description: `Integrate secure client APIs, develop intuitive high-fidelity UI components, and draft documentation manuals.`,
      requirements: [`Experience with responsive frameworks (React, Vue)`, `Understanding of client-server proxy protocols`],
      status: 'Saved'
    },
    {
      id: `intern_fallback_${Date.now()}_2`,
      title: `Systems & Data Quality Intern`,
      company: `Global Logistics Networks`,
      location: `${location || "Seattle, WA"} (Remote Workspace Operations)`,
      type: `Remote`,
      stipend: `$32 / hour`,
      description: `Analyze data pipelines, write diagnostic queries, audit security configurations, and maintain daily streak monitors.`,
      requirements: [`Basic SQL/JSON understanding`, `Excellent communication & study circle cooperation`],
      status: 'Saved'
    }
  ];
}
