"use client";

import { useState, useMemo } from "react";
import { 
  ChevronLeft, ChevronRight, Search, Plus, Filter, 
  MoreHorizontal
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { UniversalContent, ContentStatus, ContentPlatform } from "@/lib/db";
import { useRouter } from "next/navigation";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, isToday } from "date-fns";
import { ContentService } from "@/services/ContentService";

function getStatusColor(status: ContentStatus) {
  switch (status) {
    case 'published': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'completed': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-[var(--surface)] text-[var(--muted)] border-[var(--border)]';
  }
}

function handleDragStart(e: React.DragEvent, id: string) {
  e.dataTransfer.setData("contentId", id);
}

function handleDragOver(e: React.DragEvent) {
  e.preventDefault();
}

export default function CalendarPage() {
  const router = useRouter();
  const { calendarItems, refreshData } = useAppStore(); // scheduled items
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const [platformFilter, setPlatformFilter] = useState<ContentPlatform | "all">("all");
  const [selectedItem, setSelectedItem] = useState<UniversalContent | null>(null);

  // Filter content
  const calendarContent = useMemo(() => {
    return calendarItems.filter(item => {
      // Must have a scheduled date to appear on the grid naturally, 
      // but if we are filtering maybe we show unscheduled in a sidebar? 
      // For now, only show scheduled content.
      if (!item.scheduledFor) return false;
      
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (platformFilter !== "all" && item.platform !== platformFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesPillars = item.contentPillars.some(p => p.toLowerCase().includes(query));
        if (!matchesTitle && !matchesPillars) return false;
      }
      return true;
    });
  }, [calendarItems, searchQuery, statusFilter, platformFilter]);

  // Calendar Grid Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Pad beginning of month
  const startDay = getDay(monthStart); // 0 = Sunday
  const paddingDays = Array.from({ length: startDay }, () => null);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getItemsForDay = (date: Date) => {
    return calendarContent.filter(item => {
      if (!item.scheduledFor) return false;
      return isSameDay(new Date(item.scheduledFor), date);
    });
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("contentId");
    if (id) {
      // Update the scheduled date
      await ContentService.update(id, { scheduledFor: date.toISOString() });
      refreshData();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] animate-fade-in">
      {/* Toolbar */}
      <header className="flex-none p-6 border-b border-[var(--border)] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-1">
            <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-[var(--background)] rounded-md text-[var(--muted)] hover:text-[var(--text)] transition" aria-label="Previous month">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={goToToday} className="px-3 py-1.5 text-sm font-medium hover:bg-[var(--background)] rounded-md transition">
              Today
            </button>
            <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-[var(--background)] rounded-md text-[var(--muted)] hover:text-[var(--text)] transition" aria-label="Next month">
              <ChevronRight size={18} />
            </button>
          </div>
          <h1 className="text-xl font-semibold w-40 text-center">
            {format(currentDate, "MMMM yyyy")}
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
            <input 
              aria-label="Search calendar"
              type="text" 
              placeholder="Search calendar..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-md text-sm focus:outline-none focus:border-[var(--text)] text-[var(--text)]"
            />
          </div>
          
          <div className="relative group">
            <button type="button" className="p-2 border border-[var(--border)] rounded-md bg-[var(--surface)] hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--text)] transition flex items-center gap-2" aria-label="Open calendar filters">
              <Filter size={16} />
              <span className="hidden md:inline text-sm font-medium">Filter</span>
            </button>
            {/* Simple dropdown hover for filters */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-xl p-2 hidden group-hover:block z-50">
              <div className="text-xs font-medium text-[var(--muted)] px-2 py-1 uppercase tracking-wider mb-1">Status</div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ContentStatus | "all")} className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded-md text-sm mb-3">
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
              <div className="text-xs font-medium text-[var(--muted)] px-2 py-1 uppercase tracking-wider mb-1">Platform</div>
              <select value={platformFilter || "all"} onChange={e => setPlatformFilter(e.target.value === "all" ? "all" : e.target.value as ContentPlatform)} className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded-md text-sm">
                <option value="all">All Platforms</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="X (Twitter)">X (Twitter)</option>
                <option value="Instagram">Instagram</option>
                <option value="Newsletter">Newsletter</option>
              </select>
            </div>
          </div>

          <button type="button" 
            onClick={() => router.push('/writer')}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--text)] text-[var(--background)] text-sm font-medium rounded-md hover:opacity-90 transition"
          >
            <Plus size={16} />
            <span className="hidden md:inline">New Post</span>
          </button>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="min-w-[800px] h-full flex flex-col">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-[var(--muted)] uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          
          {/* Grid */}
          <div className="grid grid-cols-7 gap-4 flex-1 pb-12">
            {paddingDays.map((_val, idx) => (
              <div key={`pad-${idx}`} className="min-h-[120px] rounded-xl border border-dashed border-[var(--border)]/50 opacity-30" />
            ))}
            
            {daysInMonth.map((date) => {
              const isCurrentDay = isToday(date);
              const dayItems = getItemsForDay(date);
              
              return (
                <div 
                  key={date.toISOString()} 
                  className={`min-h-[120px] rounded-xl border flex flex-col p-2 transition-colors ${isCurrentDay ? 'border-[var(--text)] bg-[var(--surface)]/50' : 'border-[var(--border)] hover:border-[var(--muted)]'}`}
                  onDrop={(e) => handleDrop(e, date)}
                  onDragOver={handleDragOver}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isCurrentDay ? 'bg-[var(--text)] text-[var(--background)]' : 'text-[var(--text)]'}`}>
                      {format(date, "d")}
                    </span>
                    <button type="button" 
                      onClick={() => router.push('/writer')}
                      className="opacity-0 hover:opacity-100 text-[var(--muted)] hover:text-[var(--text)] transition focus:opacity-100"
                      aria-label={`Create post on ${format(date, "MMMM d")}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                    {dayItems.map(item => (
                      <button
                        type="button"
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onClick={() => setSelectedItem(item)}
                        className={`w-full text-left text-xs p-2 rounded-lg border cursor-pointer hover:shadow-md transition-shadow group ${getStatusColor(item.status)}`}
                      >
                        <div className="font-semibold truncate mb-1 text-[var(--text)] group-hover:text-current">{item.title || 'Untitled'}</div>
                        <div className="flex items-center justify-between opacity-80">
                          <span className="truncate max-w-[70px]">{item.platform || 'General'}</span>
                          <span className="capitalize">{item.status}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Legend & Status */}
      <div className="flex-none p-4 border-t border-[var(--border)] flex items-center justify-center gap-6 text-xs font-medium text-[var(--muted)] bg-[var(--surface)]">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--muted)]"></div> Draft</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Scheduled</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Published</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Failed</div>
      </div>

      {/* Basic Modal implementation (in-file for speed) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)]">
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider rounded border ${getStatusColor(selectedItem.status)}`}>
                  {selectedItem.status}
                </div>
                <span className="text-sm font-medium text-[var(--muted)]">
                  {selectedItem.scheduledFor ? format(new Date(selectedItem.scheduledFor), "EEEE, MMMM d, yyyy") : 'Unscheduled'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => router.push(`/writer?id=${selectedItem.id}`)} className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--background)] rounded-md transition" title="Edit in Writer">
                  <MoreHorizontal size={18} />
                </button>
                <button type="button" onClick={() => setSelectedItem(null)} className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--background)] rounded-md transition" aria-label="Close content details">
                  <ChevronRight size={18} className="rotate-90" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <h2 className="text-2xl font-bold mb-6 tracking-tight">{selectedItem.title || 'Untitled Document'}</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">Platform</h4>
                  <div className="text-sm font-medium">{selectedItem.platform || 'Not set'}</div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">Content Pillars</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.contentPillars?.length ? selectedItem.contentPillars.map((p) => (
                      <span key={p} className="px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-md text-xs font-medium">{p}</span>
                    )) : <span className="text-sm text-[var(--muted)]">None</span>}
                  </div>
                </div>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h4 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-4 not-prose">Content Preview</h4>
                {/* A real app would render the TipTap AST here, but we will show a placeholder/summary for now to save complexity */}
                <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl opacity-80 text-sm">
                  [Content preview is available in the Writer view. Click edit to modify.]
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-end gap-3">
              <button type="button" onClick={() => setSelectedItem(null)} className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition">
                Close
              </button>
              <button type="button" onClick={() => router.push(`/writer?id=${selectedItem.id}`)} className="px-4 py-2 bg-[var(--text)] text-[var(--background)] text-sm font-medium rounded-lg hover:opacity-90 transition">
                Open in Writer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
