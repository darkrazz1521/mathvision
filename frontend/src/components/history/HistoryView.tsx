import React, { useState, useEffect } from 'react';
import { HistoryEntry, HistoryFilter } from '../../types/history';
import { getHistory, deleteHistoryEntry, toggleFavorite, clearHistory, exportHistoryJson } from '../../services/historyStorage';
import { renderLatexToHtml, formatConfidence } from '../../utils/latex';
import { Search, Trash2, Star, ArrowUpRight, Copy, Check, Download, History, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { useToast } from '../ui/Toast';
import { cn } from '../../utils/cn';

interface HistoryViewProps {
  onLoadEntry: (entry: HistoryEntry) => void;
  onClose?: () => void;
  initialFilter?: HistoryFilter;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onLoadEntry, onClose, initialFilter = 'all' }) => {
  const { success } = useToast();
  const [historyList, setHistoryList] = useState<HistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>(initialFilter);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = () => {
    setHistoryList(getHistory());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryEntry(id);
    loadData();
  };

  const handleToggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
    loadData();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all recognition history?')) {
      clearHistory();
      loadData();
      success('History Cleared', 'All local entries have been removed.');
    }
  };

  const handleExportJson = () => {
    const json = exportHistoryJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mathvision-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLatex = (latex: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(latex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & Search
  const filteredList = historyList.filter((item) => {
    // Mode filter
    if (activeFilter === 'canvas' && item.inputMode !== 'canvas') return false;
    if (activeFilter === 'photo' && item.inputMode !== 'photo') return false;
    if (activeFilter === 'favorites' && !item.isFavorite) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLatex = item.currentLatex.toLowerCase().includes(q);
      const matchOrig = item.originalLatex.toLowerCase().includes(q);
      return matchLatex || matchOrig;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full gap-4 p-1">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equations or LaTeX commands..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#090B10] text-[#F1F5F9] rounded-xl border border-[#252D3B] focus:border-[#8B7CFF] focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-[#090B10] p-1 rounded-xl border border-[#252D3B]">
          {(['all', 'canvas', 'photo', 'favorites'] as HistoryFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-colors',
                activeFilter === f
                  ? 'bg-[#1E2536] text-[#F1F5F9]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Clear & Export */}
        <div className="flex items-center gap-2">
          {historyList.length > 0 && (
            <>
              <Button size="xs" variant="outline" onClick={handleExportJson} icon={<Download className="w-3.5 h-3.5" />}>
                Export
              </Button>
              <Button size="xs" variant="danger" onClick={handleClearAll} icon={<Trash2 className="w-3.5 h-3.5" />}>
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 max-h-[60vh]">
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-[#94A3B8]">
            <History className="w-8 h-8 opacity-40 mb-2" />
            <p className="text-sm font-medium text-[#F1F5F9]">No recognition history found</p>
            <p className="text-xs text-[#64748B] mt-1">
              Equations recognized via Digital Ink or Photo uploads will appear here.
            </p>
          </div>
        ) : (
          filteredList.map((item) => {
            const { html } = renderLatexToHtml(item.currentLatex, false);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => {
                  onLoadEntry(item);
                  onClose?.();
                }}
                className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#151B27] border border-[#252D3B] hover:border-[#38BDF8]/50 hover:bg-[#1A2232] transition-all cursor-pointer shadow-subtle"
              >
                {/* Left: Preview & Meta */}
                <div className="flex items-center gap-3">
                  {item.inputPreview ? (
                    <div className="w-14 h-12 rounded-lg bg-black/60 border border-[#252D3B] overflow-hidden flex items-center justify-center shrink-0">
                      <img
                        src={item.inputPreview}
                        alt="Input preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-12 rounded-lg bg-[#090B10] border border-[#252D3B] flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-[#8B7CFF]/50" />
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.inputMode === 'canvas' ? 'accent' : 'cyan'} size="sm">
                        {item.inputMode === 'canvas' ? 'Digital Ink' : 'Notebook Photo'}
                      </Badge>
                      <span className="text-[11px] text-[#64748B]">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">
                        {formatConfidence(item.avgConfidence)}
                      </span>
                    </div>

                    {/* Rendered Math preview */}
                    <div className="overflow-x-auto max-w-md py-0.5">
                      {html ? (
                        <div
                          className="font-math text-[#F1F5F9] text-sm"
                          dangerouslySetInnerHTML={{ __html: html }}
                        />
                      ) : (
                        <code className="text-xs font-mono text-[#F1F5F9]">{item.currentLatex}</code>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 self-end md:self-center">
                  <Tooltip content={item.isFavorite ? 'Remove Favorite' : 'Favorite'}>
                    <button
                      onClick={(e) => handleToggleFav(item.id, e)}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        item.isFavorite
                          ? 'text-amber-400 bg-amber-400/10'
                          : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2536]'
                      )}
                      aria-label="Toggle favorite"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </Tooltip>

                  <Tooltip content={isCopied ? 'Copied' : 'Copy LaTeX'}>
                    <button
                      onClick={(e) => handleCopyLatex(item.currentLatex, item.id, e)}
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2536] transition-colors"
                      aria-label="Copy LaTeX"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </Tooltip>

                  <Tooltip content="Load into Workspace">
                    <button
                      onClick={() => {
                        onLoadEntry(item);
                        onClose?.();
                      }}
                      className="p-1.5 rounded-lg text-[#8B7CFF] hover:bg-[#8B7CFF]/20 transition-colors"
                      aria-label="Load into workspace"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </Tooltip>

                  <Tooltip content="Delete">
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
