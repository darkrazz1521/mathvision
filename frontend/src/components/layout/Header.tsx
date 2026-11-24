import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  LayoutDashboard,
  Keyboard,
  HelpCircle,
  Cpu,
  RotateCcw,
  ChevronRight,
  Edit2,
  Check,
  Sparkles,
  Server,
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
        return 'Public Website';
      case 'dashboard':
        return 'Application Dashboard';
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
    <header className="h-13 min-h-[52px] bg-[#0D111A]/95 backdrop-blur-md border-b border-[#212836] px-4 flex items-center justify-between shrink-0 select-none z-20 shadow-sm">
      {/* Left: Breadcrumbs & Workspace Title */}
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] shrink-0">
          <span
            className="font-bold text-[#F8FAFC] cursor-pointer hover:text-[#8B7CFF] transition-colors"
            onClick={() => onSelectTab('home')}
          >
            MathVision
          </span>
          <ChevronRight className="w-3 h-3 text-[#4B5563]" />
          <span className="font-medium text-[#CBD5E1]">{getBreadcrumbLabel()}</span>
        </div>

        {/* Editable Workspace Title when on workspace tab */}
        {currentTab === 'workspace' && (
          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-[#252D3B]">
            {isEditingTitle ? (
              <form onSubmit={handleSaveTitle} className="flex items-center gap-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  autoFocus
                  onBlur={() => setIsEditingTitle(false)}
                  className="bg-[#090B10] border border-[#8B7CFF] rounded-md px-2 py-0.5 text-xs text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#8B7CFF]"
                />
                <button
                  type="submit"
                  className="p-1 rounded text-emerald-400 hover:bg-[#1E2536] transition-colors"
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
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold text-[#F8FAFC] hover:bg-[#182133] cursor-pointer transition-colors group"
                title="Click to rename workspace"
              >
                <span className="truncate max-w-[220px]">{workspaceTitle}</span>
                <Edit2 className="w-3 h-3 text-[#64748B] group-hover:text-[#8B7CFF] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center: Primary Mode Navigator Pills */}
      <div className="hidden md:flex items-center relative bg-[#090B10] p-0.5 rounded-xl border border-[#212836]">
        <button
          onClick={() => onSelectTab('home')}
          className="relative flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] transition-colors z-10"
          title="Return to Public Website"
        >
          <Globe className="w-3.5 h-3.5 text-[#8B7CFF]" />
          <span>Public Home</span>
        </button>
        <button
          onClick={() => onSelectTab('dashboard')}
          className={cn(
            'relative flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors z-10',
            currentTab === 'dashboard'
              ? 'text-[#F8FAFC]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          )}
        >
          {currentTab === 'dashboard' && (
            <motion.div
              layoutId="activeHeaderPill"
              className="absolute inset-0 bg-[#182133] border border-[#2B3852] rounded-lg -z-10 shadow-sm"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <LayoutDashboard className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => onSelectTab('workspace')}
          className={cn(
            'relative flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors z-10',
            currentTab === 'workspace'
              ? 'text-[#8B7CFF]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          )}
        >
          {currentTab === 'workspace' && (
            <motion.div
              layoutId="activeHeaderPill"
              className="absolute inset-0 bg-[#8B7CFF]/15 border border-[#8B7CFF]/35 rounded-lg -z-10 shadow-sm"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <Sparkles className="w-3.5 h-3.5 text-[#8B7CFF]" />
          <span>Studio Workspace</span>
        </button>
      </div>

      {/* Right: Engine status, Specs, Documentation, Reset */}
      <div className="flex items-center gap-1.5">
        {/* Backend live status pill */}
        <Tooltip
          content={
            isBackendConnected
              ? 'FastAPI HMER server online (v5.0-Final BiBeam PyTorch CPU execution)'
              : 'Backend offline. Running interactive simulation mode.'
          }
        >
          <button
            onClick={onOpenSettings}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors select-none',
              isBackendConnected
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/15'
            )}
            aria-label="Backend status"
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              )}
            />
            <span className="hidden sm:inline">
              {isBackendConnected ? 'FastAPI Online' : 'Simulation'}
            </span>
          </button>
        </Tooltip>

        {/* Model Spec button */}
        <Tooltip content="MathVision V5 Architecture Specs (6.57M · 13MB)">
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenModelSpecs}
            icon={<Cpu className="w-3.5 h-3.5 text-[#8B7CFF]" />}
          >
            <span className="hidden xl:inline">Model</span>
          </Button>
        </Tooltip>

        {/* Documentation button */}
        <Tooltip content="Documentation & 132-Token Vocab">
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenDocs}
            icon={<HelpCircle className="w-3.5 h-3.5 text-[#38BDF8]" />}
          >
            <span className="hidden xl:inline">Guide</span>
          </Button>
        </Tooltip>

        {/* Shortcuts button */}
        <Tooltip content="Keyboard Shortcuts (?)">
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenShortcuts}
            icon={<Keyboard className="w-3.5 h-3.5 text-[#94A3B8]" />}
            aria-label="Keyboard Shortcuts"
          />
        </Tooltip>

        {/* Reset / Clear Workspace button with clear destructive confirmation */}
        {currentTab === 'workspace' && (
          <Tooltip content="Reset active workspace drawing and output">
            <button
              onClick={onResetWorkspace}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#182133] text-[#94A3B8] border border-[#252D3B] hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors ml-1"
              aria-label="Reset Workspace"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Reset</span>
            </button>
          </Tooltip>
        )}
      </div>
    </header>
  );
};
