import { Dispatch, SetStateAction } from "react";
import { Calendar, FolderOpen, ChevronLeft, ChevronRight, X } from "lucide-react";
import { UniversalContent, ContentPlatform, ContentStatus } from "@/lib/db";

interface WriterMetaPanelProps {
  showMeta: boolean;
  setShowMeta: Dispatch<SetStateAction<boolean>>;
  document: Partial<UniversalContent>;
  setDocument: Dispatch<SetStateAction<Partial<UniversalContent>>>;
  saveTo: 'project' | 'calendar';
  setSaveTo: Dispatch<SetStateAction<'project' | 'calendar'>>;
  projects: UniversalContent[];
  pillarInput: string;
  setPillarInput: Dispatch<SetStateAction<string>>;
  handleAddPillar: (e: React.KeyboardEvent) => void;
  removePillar: (index: number) => void;
  changeDate: (days: number) => void;
}

export function WriterMetaPanel({
  showMeta,
  setShowMeta,
  document,
  setDocument,
  saveTo,
  setSaveTo,
  projects,
  pillarInput,
  setPillarInput,
  handleAddPillar,
  removePillar,
  changeDate,
}: WriterMetaPanelProps) {
  const isCalendarMode = saveTo === 'calendar';

  return (
    <aside
      className={`w-80 h-full bg-[var(--surface)] border-l border-[var(--border)] absolute right-0 top-0 overflow-y-auto shadow-2xl transition-transform duration-300 z-30 ${showMeta ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">Metadata</h3>
          <button type="button" onClick={() => setShowMeta(false)} className="p-1 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--background)] rounded-md transition" aria-label="Close metadata panel">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--text)]">Save Destination</span>
            <div className="flex bg-[var(--background)] p-1 rounded-lg border border-[var(--border)]">
              <button type="button"
                onClick={() => setSaveTo('project')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition ${saveTo === 'project' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm border border-[var(--border)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
              >
                <FolderOpen size={16} /> Project
              </button>
              <button type="button"
                onClick={() => {
                  setSaveTo('calendar');
                  if (!document.scheduledFor) {
                    setDocument({ ...document, scheduledFor: new Date().toISOString() });
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition ${saveTo === 'calendar' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm border border-[var(--border)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
              >
                <Calendar size={16} /> Calendar
              </button>
            </div>
          </div>

          {isCalendarMode ? (
            <>
              <div className="space-y-2">
                <span className="text-sm font-medium text-[var(--text)]">Schedule Date</span>
                <div className="flex items-center justify-between bg-[var(--background)] border border-[var(--border)] rounded-lg p-1.5 shadow-sm">
                  <button type="button" onClick={() => changeDate(-1)} className="p-1.5 hover:bg-[var(--surface)] rounded-md text-[var(--muted)] hover:text-[var(--text)] transition" aria-label="Move schedule date back one day"><ChevronLeft size={16}/></button>
                  <span className="text-sm font-medium">
                    {document.scheduledFor ? new Date(document.scheduledFor).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Select Date'}
                  </span>
                  <button type="button" onClick={() => changeDate(1)} className="p-1.5 hover:bg-[var(--surface)] rounded-md text-[var(--muted)] hover:text-[var(--text)] transition" aria-label="Move schedule date forward one day"><ChevronRight size={16}/></button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text)]" htmlFor="writer-platform">Platform</label>
                <select
                  id="writer-platform"
                  value={document.platform || ""}
                  onChange={(e) => setDocument({ ...document, platform: e.target.value as ContentPlatform })}
                  className="w-full p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] shadow-sm outline-none focus:border-[var(--text)] transition-colors"
                >
                  <option value="">Select Platform...</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="X (Twitter)">X (Twitter)</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Newsletter">Newsletter</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text)]" htmlFor="writer-status">Status</label>
                <select
                  id="writer-status"
                  value={document.status || "draft"}
                  onChange={(e) => setDocument({ ...document, status: e.target.value as ContentStatus })}
                  className="w-full p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] shadow-sm outline-none focus:border-[var(--text)] transition-colors"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text)]" htmlFor="writer-project">Assigned Project</label>
              <select
                id="writer-project"
                value={document.projectId || ""}
                onChange={(e) => setDocument({ ...document, projectId: e.target.value })}
                className="w-full p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] shadow-sm outline-none focus:border-[var(--text)] transition-colors"
              >
                <option value="">No Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          <hr className="border-[var(--border)]" />

          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--text)] flex justify-between">
              <span>Content Pillars</span>
              <span className="text-xs text-[var(--muted)]">{(document.contentPillars || []).length}/4</span>
            </span>
            <div className="flex flex-wrap gap-2 mb-2">
              {(document.contentPillars || []).map((pillar, idx) => (
                <span key={pillar} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--background)] border border-[var(--border)] rounded-full text-xs font-medium shadow-sm">
                  {pillar}
                  <button type="button" onClick={() => removePillar(idx)} className="text-[var(--muted)] hover:text-red-500 p-0.5 rounded-full transition-colors" aria-label={`Remove ${pillar} pillar`}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            {(document.contentPillars || []).length < 4 && (
              <input
                aria-label="Add content pillar"
                type="text"
                value={pillarInput}
                onChange={(e) => setPillarInput(e.target.value)}
                onKeyDown={handleAddPillar}
                placeholder="Type & press enter..."
                className="w-full p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] shadow-sm outline-none focus:border-[var(--text)] transition-colors"
              />
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
