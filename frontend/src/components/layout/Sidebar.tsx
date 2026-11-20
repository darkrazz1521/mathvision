import React from 'react';
import {
  Home,
  PlusCircle,
  History,
  Star,
  Sparkles,
  Settings,
  BookOpen,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Server,
  User,
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { cn } from '../../utils/cn';

export type SidebarTab =
  | 'home'
  | 'workspace'
  | 'history'
  | 'favorites'
  | 'playground'
  | 'settings'
  | 'model'
  | 'docs';

interface SidebarProps {
  currentTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewWorkspace: () => void;
  isBackendConnected: boolean;
  historyCount: number;
  favoritesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onNewWorkspace,
  isBackendConnected,
  historyCount,
  favoritesCount,
}) => {
  const navItems = [
    {
      id: 'home' as SidebarTab,
      label: 'Home & Overview',
      icon: Home,
      badge: 'Intro',
    },
    {
      id: 'workspace' as SidebarTab,
      label: 'Studio Workspace',
      icon: PlusCircle,
      action: onNewWorkspace,
      badge: undefined,
    },
    {
      id: 'history' as SidebarTab,
      label: 'Recognition History',
      icon: History,
      badge: historyCount > 0 ? historyCount : undefined,
    },
    {
      id: 'favorites' as SidebarTab,
      label: 'My Equations',
      icon: Star,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
    },
    {
      id: 'playground' as SidebarTab,
      label: 'Example Playground',
      icon: Sparkles,
      badge: undefined,
    },
    {
      id: 'model' as SidebarTab,
      label: 'Model Architecture',
      icon: Cpu,
      badge: '12.8MB',
    },
    {
      id: 'settings' as SidebarTab,
      label: 'Settings & Backend',
      icon: Settings,
      badge: undefined,
    },
    {
      id: 'docs' as SidebarTab,
      label: 'Documentation & Vocab',
      icon: BookOpen,
      badge: undefined,
    },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col justify-between bg-[#10141D] border-r border-[#252D3B] transition-all duration-300 z-20 shrink-0 select-none',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Top: Logo and collapse toggle */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-3.5 py-4 border-b border-[#252D3B]">
          <div
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer"
            onClick={() => onSelectTab('home')}
          >
            <img src="/logo.svg" alt="MathVision" className="w-8 h-8 shrink-0 rounded-lg shadow-glow-accent" />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sm text-[#F1F5F9] tracking-tight leading-none flex items-center gap-1.5">
                  MathVision
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/30">
                    v2.0
                  </span>
                </span>
                <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                  Scientific HMER IDE
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2536] transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex flex-col gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <Tooltip
                key={item.id}
                content={isCollapsed ? item.label : ''}
                position="right"
                className="w-full"
              >
                <button
                  onClick={() => {
                    if (item.action && item.id === 'workspace' && currentTab === 'workspace') {
                      item.action();
                    }
                    onSelectTab(item.id);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group',
                    isActive
                      ? 'bg-[#1E2536] text-[#F1F5F9] border border-[#374151] shadow-sm'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#151B27]'
                  )}
                  aria-label={item.label}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive ? 'text-[#8B7CFF]' : 'group-hover:text-[#F1F5F9]'
                    )}
                  />
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between overflow-hidden">
                      <span className="truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded-full text-[10px] font-mono shrink-0',
                            isActive
                              ? 'bg-[#8B7CFF]/20 text-[#8B7CFF]'
                              : 'bg-[#151B27] text-[#94A3B8]'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Bottom: Connection status & Profile info */}
      <div className="p-2 border-t border-[#252D3B] flex flex-col gap-2">
        {/* Backend status banner */}
        <div
          onClick={() => onSelectTab('settings')}
          className={cn(
            'flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-colors',
            isBackendConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/15'
          )}
          title="Click to configure backend connection"
        >
          <Server className="w-4 h-4 shrink-0" />
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between overflow-hidden text-[11px]">
              <span className="font-medium truncate">
                {isBackendConnected ? 'FastAPI Connected' : 'Backend Offline (Demo)'}
              </span>
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                )}
              />
            </div>
          )}
        </div>

        {/* User local profile */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#151B27] border border-[#252D3B]">
          <div className="w-7 h-7 rounded-lg bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/30 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden text-[11px]">
              <span className="font-semibold text-[#F1F5F9] truncate">Researcher</span>
              <span className="text-[#94A3B8] text-[10px] truncate">MathVision Lab</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
