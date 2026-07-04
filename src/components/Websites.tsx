import React, { useState } from 'react';
import { 
  Plus, Folder, ExternalLink, Trash2, Tag, BookmarkCheck,
  Globe, Sparkles, FolderOpen, HeartHandshake, CheckSquare, CheckCircle
} from 'lucide-react';
import { Bookmark } from '../types';

interface WebsitesProps {
  bookmarks: Bookmark[];
  onAddBookmark: (b: Bookmark) => void;
  onDeleteBookmark: (id: string) => void;
  gainXp: (amount: number) => void;
}

const CATEGORIES = ['General Science', 'Computer Science', 'Mathematics', 'Study Guides', 'Productivity'];

export default function Websites({ bookmarks, onAddBookmark, onDeleteBookmark, gainXp }: WebsitesProps) {
  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [notes, setNotes] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const newBookmark: Bookmark = {
      id: `bm_${Date.now()}`,
      title: title.trim(),
      url: cleanUrl,
      category,
      notes: notes.trim() || undefined,
      dateAdded: new Date().toISOString().slice(0, 10)
    };

    onAddBookmark(newBookmark);
    gainXp(15);
    showToast(`🔖 Saved "${newBookmark.title}" to folder "${category}"!`);

    // Reset Form
    setTitle('');
    setUrl('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string, name: string) => {
    onDeleteBookmark(id);
    gainXp(2);
    showToast(`🗑️ Removed bookmark "${name}".`);
  };

  const filteredBookmarks = activeFolder === 'All' 
    ? bookmarks 
    : bookmarks.filter(b => b.category === activeFolder);

  // Gather unique categories from bookmark listings
  const allFolders = ['All', ...Array.from(new Set([...CATEGORIES, ...bookmarks.map(b => b.category)]))];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3.5 rounded-2xl shadow-lg border border-slate-800 flex items-center gap-2 animate-fade-in text-xs font-semibold max-w-sm">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
            🔖 Saved Study Portals & Bookmarks
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Keep your top research directories, documentation, and reference websites organized into study folders.
          </p>
        </div>

        <button
          id="btn-toggle-add-bookmark"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/10 cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Save Website Link
        </button>
      </div>

      {/* Add Bookmark Form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-md relative transition-all animate-fade-in">
          <div className="bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider inline-block mb-4">
            ⚡ New Study Portal Reference
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Website Title *</label>
              <input
                id="bookmark-form-title"
                type="text"
                required
                placeholder="e.g., MDN Web Docs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-950 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">URL Link *</label>
              <input
                id="bookmark-form-url"
                type="text"
                required
                placeholder="e.g., developer.mozilla.org"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-950 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Folder Category</label>
              <select
                id="bookmark-form-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-950 focus:outline-none focus:border-indigo-500 focus:bg-white font-semibold"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Brief Description</label>
              <input
                id="bookmark-form-notes"
                type="text"
                placeholder="e.g., Best JS arrays cheatsheet"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-950 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                id="btn-cancel-bookmark-add"
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-submit-bookmark-add"
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Save Portal +15 XP
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Folder Selector + Bookmarks Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column Folder Navigator */}
        <div className="lg:col-span-3 space-y-2">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            📁 Directories
          </span>
          <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {allFolders.map(folder => (
              <button
                key={folder}
                id={`btn-select-folder-${folder.replace(/\s+/g, '-')}`}
                onClick={() => {
                  setActiveFolder(folder);
                  gainXp(2);
                }}
                className={`flex items-center gap-2 px-4 py-3 text-left font-bold text-xs tracking-wide shrink-0 rounded-xl transition-all cursor-pointer ${
                  activeFolder === folder 
                    ? 'bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm shadow-indigo-600/5' 
                    : 'bg-white hover:bg-slate-50/50 border border-transparent text-slate-600 hover:text-slate-950'
                }`}
              >
                {activeFolder === folder ? <FolderOpen className="w-4 h-4 shrink-0 text-indigo-600" /> : <Folder className="w-4 h-4 shrink-0 text-slate-400" />}
                <span>{folder}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right column Bookmarks List */}
        <div className="lg:col-span-9">
          {filteredBookmarks.length === 0 ? (
            <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl shadow-sm">
              <Globe className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5] mb-2" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Bookmarks Saved</h3>
              <p className="text-xs font-medium text-slate-500 leading-normal max-w-sm mx-auto">
                You haven't bookmarked any websites under folder "{activeFolder}" yet. Click the "Save Website Link" button above to register references!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBookmarks.map(bm => (
                <div
                  key={bm.id}
                  className="bg-white border border-slate-100 hover:border-indigo-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group relative flex flex-col justify-between"
                >
                  <div>
                    {/* Header Tags */}
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="bg-slate-100 text-slate-600 text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg">
                        {bm.category}
                      </span>
                      <span className="text-[9px] font-medium text-slate-400">
                        Added {bm.dateAdded}
                      </span>
                    </div>

                    {/* Title & URL */}
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group-hover:text-indigo-600 transition-colors"
                    >
                      <h4 className="font-bold text-sm text-slate-800 tracking-tight flex items-center gap-1 leading-snug">
                        {bm.title} <ExternalLink className="w-3.5 h-3.5 text-slate-400 inline-block group-hover:text-indigo-500 transition-colors" />
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 truncate block mt-0.5">
                        {bm.url}
                      </span>
                    </a>

                    {/* Description/Notes */}
                    {bm.notes && (
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-3">
                        📌 {bm.notes}
                      </p>
                    )}
                  </div>

                  {/* Foot Controls */}
                  <div className="flex justify-end pt-2.5 mt-4 border-t border-dashed border-slate-100">
                    <button
                      id={`btn-delete-bookmark-${bm.id}`}
                      onClick={() => handleDelete(bm.id, bm.title)}
                      className="text-slate-400 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all cursor-pointer p-1"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
