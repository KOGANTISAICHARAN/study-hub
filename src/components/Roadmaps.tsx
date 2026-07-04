import React, { useState } from 'react';
import { 
  Plus, CheckCircle2, Circle, Trash2, Download, Copy, Clipboard,
  Sparkles, ListChecks, Printer, FileText, Layout, Milestone
} from 'lucide-react';
import { StudyRoadmap, RoadmapStep } from '../types';

interface RoadmapsProps {
  roadmaps: StudyRoadmap[];
  onAddRoadmap: (roadmap: StudyRoadmap) => void;
  onToggleStep: (roadmapId: string, stepId: string) => void;
  onDeleteRoadmap: (id: string) => void;
  gainXp: (amount: number) => void;
}

export default function Roadmaps({ roadmaps, onAddRoadmap, onToggleStep, onDeleteRoadmap, gainXp }: RoadmapsProps) {
  const [activeRoadmapId, setActiveRoadmapId] = useState<string | null>(roadmaps[0]?.id || null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'markdown' | 'visual_svg'>('visual_svg');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [topic, setTopic] = useState('');
  const [desc, setDesc] = useState('');
  const [rawStepsText, setRawStepsText] = useState(
    "1. Setup Development Sandbox (1 Hour)\n2. Practice Basic Syntax (2 Hours)\n3. Build Complete Mini-Project (4 Hours)"
  );

  // Custom Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeRoadmap = roadmaps.find(r => r.id === activeRoadmapId) || roadmaps[0] || null;

  const handleCreateRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    // Parse steps from text
    const lines = rawStepsText.split('\n').filter(l => l.trim() !== '');
    const steps: RoadmapStep[] = lines.map((line, idx) => {
      // Try to parse step title and duration
      const cleanLine = line.replace(/^\d+[\.\-\s]*/, '').trim();
      const matchDuration = cleanLine.match(/\(([^)]+)\)/);
      const duration = matchDuration ? matchDuration[1] : '1 Hour';
      const title = cleanLine.replace(/\([^)]+\)/, '').trim();

      return {
        id: `step_${Date.now()}_${idx}`,
        stepNumber: idx + 1,
        title: title || `Step ${idx + 1}`,
        description: `Deep conceptual work on ${title}`,
        duration,
        isCompleted: false
      };
    });

    const newRoadmap: StudyRoadmap = {
      id: `rm_${Date.now()}`,
      topic: topic.trim(),
      description: desc.trim() || `My master curriculum for learning ${topic}`,
      steps,
      dateCreated: new Date().toISOString().slice(0, 10),
      progressPercent: 0
    };

    onAddRoadmap(newRoadmap);
    setActiveRoadmapId(newRoadmap.id);
    gainXp(40);

    // Reset Form
    setTopic('');
    setDesc('');
    setShowAddForm(false);
    showToast(`🗺️ Built "${newRoadmap.topic}" learning pathway!`);
  };

  const handleStepClick = (roadmapId: string, stepId: string) => {
    onToggleStep(roadmapId, stepId);
    
    // Check if the clicked step is now completed or not to award proper XP
    const rm = roadmaps.find(r => r.id === roadmapId);
    if (rm) {
      const step = rm.steps.find(s => s.id === stepId);
      if (step) {
        if (!step.isCompleted) {
          gainXp(30); // Milestone accomplished!
          showToast(`✨ Checkpoint "${step.title}" mastered! +30 XP`);
        } else {
          gainXp(-10); // Deduct if un-ticked
          showToast(`↩️ Checkpoint marked as pending.`);
        }
      }
    }
  };

  const copyMarkdown = () => {
    if (!activeRoadmap) return;
    let md = `# Study Roadmap: ${activeRoadmap.topic}\n> ${activeRoadmap.description}\n\n`;
    md += `*Progress: ${activeRoadmap.progressPercent}%*\n\n`;
    md += `## Learning Milestones\n`;
    activeRoadmap.steps.forEach(s => {
      md += `- [${s.isCompleted ? 'x' : ' '}] **Step ${s.stepNumber}: ${s.title}** (${s.duration})\n  *${s.description}*\n`;
    });
    md += `\n*Generated with Study Hub - Your Academic Masterpiece*`;
    
    navigator.clipboard.writeText(md);
    showToast('📋 Markdown curriculum copied to your clipboard!');
    gainXp(10);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3.5 rounded-2xl shadow-lg border border-slate-800 flex items-center gap-2 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Exportable Study Roadmaps
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Generate strategic learning pathways. Check off milestones as you learn, and export your roadmap to study offline.
          </p>
        </div>

        <button
          id="btn-toggle-add-roadmap"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3.5 rounded-xl font-bold transition-colors shadow-sm shadow-indigo-600/10 flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Design Roadmap
        </button>
      </div>

      {/* Add Roadmap Form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm relative transition-all animate-fade-in">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-2">Roadmap Builder</span>

          <form onSubmit={handleCreateRoadmap} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Subject or Skill Goal *</label>
                <input
                  id="roadmap-form-topic"
                  type="text"
                  required
                  placeholder="e.g., UI/UX Mobile Design"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Brief Description</label>
                <input
                  id="roadmap-form-desc"
                  type="text"
                  placeholder="e.g., Master Figma wireframes and spacing laws"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Roadmap Steps (one milestone per line with duration in parenthesis)
              </label>
              <textarea
                id="roadmap-form-steps"
                rows={4}
                required
                value={rawStepsText}
                onChange={(e) => setRawStepsText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-mono text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white leading-relaxed font-semibold"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                id="btn-cancel-roadmap-add"
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-submit-roadmap-add"
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Build Roadmap +40 XP
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Roadmap Hub Area */}
      {roadmaps.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center rounded-3xl shadow-sm">
          <Milestone className="w-16 h-16 mx-auto text-slate-300 stroke-[1.5] mb-2" />
          <h3 className="text-lg font-bold text-slate-900">No study roadmaps found</h3>
          <p className="text-sm font-medium text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
            Build your own custom curriculum above or generate an automatic roadmap by typing any learning topic in the <strong className="text-slate-900 font-extrabold">Smart AI Study Pack Tab</strong>!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Sidebar selector */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-1 px-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Learning Journeys ({roadmaps.length})
              </span>
            </div>
            
            <div className="space-y-3">
              {roadmaps.map(rm => (
                <div
                  key={rm.id}
                  id={`btn-select-roadmap-${rm.id}`}
                  onClick={() => {
                    setActiveRoadmapId(rm.id);
                    gainXp(5);
                  }}
                  className={`w-full text-left p-4.5 rounded-2xl border transition-all relative cursor-pointer select-none ${
                    activeRoadmap?.id === rm.id 
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md scale-[1.01]' 
                      : 'bg-white text-slate-900 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setActiveRoadmapId(rm.id);
                      gainXp(5);
                    }
                  }}
                >
                  <div className="font-bold text-sm tracking-tight leading-snug truncate pr-6">
                    {rm.topic}
                  </div>
                  <div className={`text-xs mt-1 truncate ${
                    activeRoadmap?.id === rm.id ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {rm.description}
                  </div>
                  
                  {/* Small progress meter */}
                  <div className="flex items-center justify-between gap-2 mt-4 text-[10px] font-bold uppercase tracking-wider">
                    <span>Progress</span>
                    <span>{rm.progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${
                        activeRoadmap?.id === rm.id ? 'bg-indigo-400' : 'bg-slate-900'
                      }`}
                      style={{ width: `${rm.progressPercent}%` }}
                    ></div>
                  </div>

                  {/* Delete button */}
                  <button
                    id={`btn-delete-roadmap-${rm.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRoadmap(rm.id);
                      if (activeRoadmapId === rm.id) {
                        setActiveRoadmapId(null);
                      }
                    }}
                    className={`absolute top-3.5 right-3.5 hover:scale-110 active:scale-95 transition-all z-20 ${
                      activeRoadmap?.id === rm.id ? 'text-slate-400 hover:text-rose-400' : 'text-slate-400 hover:text-rose-500'
                    }`}
                    title="Delete Roadmap"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Roadmap Details and Progress checkoff */}
          {activeRoadmap && (
            <div className="lg:col-span-8 bg-white border border-slate-200/80 p-5 md:p-6 rounded-3xl shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                    JOURNEY MAP
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1.5">
                    {activeRoadmap.topic}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    {activeRoadmap.description} • Created {activeRoadmap.dateCreated}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    id="btn-open-export-modal"
                    onClick={() => setShowExportModal(true)}
                    className="bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Export Roadmap
                  </button>
                </div>
              </div>

              {/* Progress Bar Widget */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none mb-1">Total Progress</span>
                    <div className="text-base font-extrabold text-slate-850 leading-none uppercase">
                      {activeRoadmap.progressPercent === 100 ? "🎉 Completed!" : `${activeRoadmap.progressPercent}% Mastered`}
                    </div>
                  </div>
                </div>
                <div className="w-40 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300 rounded-full" 
                    style={{ width: `${activeRoadmap.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Steps vertical flow */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 before:-translate-x-1/2">
                {activeRoadmap.steps.map(step => (
                  <div 
                    key={step.id} 
                    className="relative flex items-start gap-4"
                  >
                    {/* Circle Node */}
                    <button
                      id={`btn-toggle-step-${activeRoadmap.id}-${step.id}`}
                      onClick={() => handleStepClick(activeRoadmap.id, step.id)}
                      className="absolute left-[-23px] top-1 z-10 bg-white hover:scale-110 active:scale-95 transition-all p-0.5 rounded-full cursor-pointer"
                    >
                      {step.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 fill-white" />
                      )}
                    </button>

                    {/* Step Card */}
                    <div 
                      className={`flex-1 border rounded-2xl p-4 transition-all ${
                        step.isCompleted ? 'bg-slate-50/50 border-slate-150 opacity-70' : 'bg-white border-slate-200/80 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <h4 className={`font-bold text-xs uppercase leading-tight ${step.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          Step {step.stepNumber}: {step.title}
                        </h4>
                        <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                          ⌛ {step.duration}
                        </span>
                      </div>
                      <p className={`text-xs mt-1.5 font-normal text-slate-500 ${step.isCompleted ? 'line-through' : ''}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && activeRoadmap && (
        <div className="fixed inset-0 bg-slate-950/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 p-6 max-w-2xl w-full rounded-2xl relative shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
              📂 Export Study Journey
            </h3>

            {/* Selector tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
              <button
                id="btn-select-export-svg"
                onClick={() => setExportFormat('visual_svg')}
                className={`flex-1 px-4 py-2 rounded-lg font-bold uppercase text-[10px] transition-all cursor-pointer ${
                  exportFormat === 'visual_svg' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🖼️ Visual Blueprint Map
              </button>
              <button
                id="btn-select-export-md"
                onClick={() => setExportFormat('markdown')}
                className={`flex-1 px-4 py-2 rounded-lg font-bold uppercase text-[10px] transition-all cursor-pointer ${
                  exportFormat === 'markdown' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                📝 Markdown Document
              </button>
            </div>

            {/* Output view container */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl max-h-[350px] overflow-auto mb-4 font-mono text-xs">
              {exportFormat === 'markdown' ? (
                <pre className="whitespace-pre-wrap leading-relaxed text-slate-700 select-text">
{`# Study Roadmap: ${activeRoadmap.topic}
> ${activeRoadmap.description}

*Current Master Progress: ${activeRoadmap.progressPercent}%*

## Learning Checkpoints
${activeRoadmap.steps.map(s => `- [${s.isCompleted ? 'x' : ' '}] **Step ${s.stepNumber}: ${s.title}** (${s.duration})\n  Description: ${s.description}`).join('\n')}

---
Generated by Study Hub Masterpiece.`}
                </pre>
              ) : (
                <div className="flex flex-col items-center py-4 bg-white border border-slate-100 rounded-xl p-4 select-none">
                  <svg width="450" height="240" viewBox="0 0 450 240" className="w-full h-auto border border-slate-100 rounded-xl bg-slate-950">
                    <rect x="0" y="0" width="450" height="240" fill="#020617" />
                    <rect x="15" y="15" width="420" height="40" fill="#4f46e5" rx="8" />
                    <text x="30" y="40" fill="#fff" fontSize="13" fontWeight="bold" fontFamily="sans-serif">{activeRoadmap.topic.toUpperCase()}</text>
                    
                    {/* SVG timeline */}
                    <line x1="50" y1="120" x2="400" y2="120" stroke="#334155" strokeWidth="4" />
                    
                    {activeRoadmap.steps.slice(0, 3).map((s, sIdx) => {
                      const xPos = 50 + (sIdx * 150);
                      return (
                        <g key={sIdx}>
                          <circle cx={xPos} cy="120" r="14" fill={s.isCompleted ? "#10b981" : "#1e293b"} stroke={s.isCompleted ? "#059669" : "#475569"} strokeWidth="3" />
                          <text x={xPos - 4} y="124" fontSize="11" fontWeight="bold" fontFamily="monospace" fill="#fff">{s.stepNumber}</text>
                          
                          {/* Label info card */}
                          <rect x={xPos - 60} y="145" width="120" height="55" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="6" />
                          <text x={xPos - 50} y="160" fontSize="8" fontWeight="bold" fontFamily="sans-serif" fill="#f8fafc">{s.title.slice(0, 18)}</text>
                          <text x={xPos - 50} y="174" fontSize="7" fontWeight="medium" fontFamily="monospace" fill="#94a3b8">{s.duration}</text>
                          <text x={xPos - 50} y="188" fontSize="7" fontWeight="bold" fontFamily="sans-serif" fill={s.isCompleted ? "#34d399" : "#f87171"}>
                            {s.isCompleted ? "DONE" : "PENDING"}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  <p className="text-[10px] font-semibold text-slate-400 mt-3 text-center">
                    💡 Perfect visual diagram blueprint. Take a screenshot or press Command+P to print this view!
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              {exportFormat === 'markdown' ? (
                <button
                  id="btn-copy-md"
                  onClick={copyMarkdown}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-4 h-4" /> Copy Text
                </button>
              ) : (
                <button
                  id="btn-print-roadmap"
                  onClick={() => window.print()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print visual map
                </button>
              )}

              <button
                id="btn-close-export-modal"
                onClick={() => setShowExportModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
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
