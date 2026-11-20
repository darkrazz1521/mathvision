import React, { useState } from 'react';
import {
  Home,
  Keyboard,
  HelpCircle,
  Cpu,
  RotateCcw,
  ChevronRight,
  Edit2,
  Check,
  Columns3,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { SidebarTab } from './Sidebar';
import { cn } from '../../utils/cn';

interface HeaderProps {
  currentTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  workspaceTitle: string;
  onUpdateTitle: (title: string) => void;
  isBackendConnected: boolean;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onOpenDocs: () => void;
  onOpenModelSpecs: () => void;
  onResetWorkspace: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  workspaceTitle,
  onUpdateTitle,
  isBackendConnected,
  onOpenSettings,
  onOpenShortcuts,
  onOpenDocs,
  onOpenModelSpecs,
  onResetWorkspace,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(workspaceTitle);

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const getBreadcrumbLabel = () => {
    switch (currentTab) {
      case 'home':
        return 'Home & Introduction';
      case 'history':
        return 'Recognition History';
      case 'favorites':
        return 'My Saved Equations';
      case 'playground':
        return 'Example Playground';
      default:
        return 'Studio Workspace';
    }
  };

  return (
    <header className="h-14 bg-[#10141D]/90 backdrop-blur-md border-b border-[#252D3B] px-4 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: Breadcrumbs & Workspace Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
          <span
            className="font-semibold text-[#F1F5F9] cursor-pointer hover:text-[#8B7CFF] transition-colors"
            onClick={() => onSelectTab('home')}
          >
            MathVision
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{getBreadcrumbLabel()}</span>
          {currentTab === 'workspace' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
            </>
          )}
        </div>

        {/* Editable Workspace Title when on workspace tab */}
        {currentTab === 'workspace' && (
          <>
            {isEditingTitle ? (
              <form onSubmit={handleSaveTitle} className="flex items-center gap-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  autoFocus
                  onBlur={() => setIsEditingTitle(false)}
                  className="bg-[#090B10] border border-[#8B7CFF] rounded px-2 py-0.5 text-xs text-[#F1F5F9] focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-1 rounded text-emerald-400 hover:bg-[#1E2536]"
                  aria-label="Save title"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div
                onClick={() => {
                  setTitleInput(workspaceTitle);
                  setIsEditingTitle(true);
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold text-[#F1F5F9] hover:bg-[#151B27] cursor-pointer transition-colors group"
                title="Click to rename workspace"
              >
                <span>{workspaceTitle}</span>
                <Edit2 className="w-3 h-3 text-[#64748B] group-hover:text-[#8B7CFF] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Right: Quick actions, connection status, modal triggers */}
      <div className="flex items-center gap-2">
        {/* Toggle between Home and Workspace */}
        <div className="flex items-center bg-[#090B10] p-0.5 rounded-xl border border-[#252D3B]">
          <button
            onClick={() => onSelectTab('home')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors',
              currentTab === 'home'
                ? 'bg-[#1E2536] text-[#F1F5F9] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>
          <button
            onClick={() => onSelectTab('workspace')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors',
              currentTab === 'workspace'
                ? 'bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/40 shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Studio IDE</span>
          </button>
        </div>

        {/* Backend live status pill */}
        <Tooltip
          content={
            isBackendConnected
              ? 'FastAPI HMER server online (INT8 ONNX CPU execution)'
              : 'Backend offline. Running interactive simulation mode.'
          }
        >
          <button
            onClick={onOpenSettings}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
              isBackendConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            )}
            aria-label="Backend status"
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              )}
            />
            <span className="hidden md:inline">
              {isBackendConnected ? 'FastAPI Online' : 'Simulation Mode'}
            </span>
          </button>
        </Tooltip>

        {/* Model Spec button */}
        <Tooltip content="DenseNet-121 + 3L-Trans Specs">
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenModelSpecs}
            icon={<Cpu className="w-4 h-4 text-[#8B7CFF]" />}
          >
            <span className="hidden lg:inline">Model</span>
          </Button>
        </Tooltip>

        {/* Documentation button */}
        <Tooltip content="Documentation & Vocabulary">
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenDocs}
            icon={<HelpCircle className="w-4 h-4 text-[#38BDF8]" />}
          >
            <span className="hidden lg:inline">Guide</span>
          </Button>
        </Tooltip>

        {/* Shortcuts button */}
        <Tooltip content="Keyboard Shortcuts (?)">
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenShortcuts}
            icon={<Keyboard className="w-4 h-4 text-[#94A3B8]" />}
            aria-label="Keyboard Shortcuts"
          />
        </Tooltip>

        {/* Reset / Clear Workspace (when on workspace) */}
        {currentTab === 'workspace' && (
          <Tooltip content="Clear Active Workspace">
            <Button
              size="sm"
              variant="outline"
              onClick={onResetWorkspace}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              <span className="hidden xl:inline">Reset</span>
            </Button>
          </Tooltip>
        )}
      </div>
    </header>
  );
};
