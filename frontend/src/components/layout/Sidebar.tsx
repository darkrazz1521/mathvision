import React from 'react';
import {
  Globe,
  LayoutDashboard,
  Sparkles,
  History,
  Star,
  Cpu,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Server,
  User,
  FlaskConical,
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { cn } from '../../utils/cn';

export type SidebarTab =
  | 'home'
  | 'dashboard'
  | 'workspace'
  | 'history'
  | 'favorites'
  | 'playground'
  | 'settings'
  | 'model'
  | 'docs';

interface NavGroupItem {
  id: SidebarTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: 'purple' | 'cyan' | 'neutral';
  action?: () => void;
}

interface NavSection {
  title: string;
  items: NavGroupItem[];
}

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
  const sections: NavSection[] = [
    {
      title: 'WORKSPACE',
      items: [
        {
          id: 'workspace',
          label: 'Studio Workspace',
          icon: Sparkles,
          action: onNewWorkspace,
          badge: 'Active',
          badgeVariant: 'purple',
        },
        {
          id: 'dashboard',
          label: 'App Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'home',
          label: 'Public Website',
          icon: Globe,
        },
      ],
    },
    {
      title: 'COLLECTIONS',
      items: [
        {
          id: 'history',
          label: 'Recognition History',
          icon: History,
          badge: historyCount > 0 ? historyCount : undefined,
          badgeVariant: 'neutral',
        },
        {
          id: 'favorites',
          label: 'My Equations',
          icon: Star,
          badge: favoritesCount > 0 ? favoritesCount : undefined,
          badgeVariant: 'cyan',
        },
        {
          id: 'playground',
          label: 'Example Playground',
          icon: FlaskConical,
        },
      ],
    },
    {
      title: 'ENGINE & SYSTEM',
      items: [
        {
          id: 'model',
          label: 'Model Architecture',
          icon: Cpu,
          badge: '10.6MB',
          badgeVariant: 'purple',
        },
        {
          id: 'settings',
          label: 'Settings & Backend',
          icon: Settings,
        },
        {
          id: 'docs',
          label: 'Documentation & Vocab',
          icon: BookOpen,
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col justify-between bg-[#0D111A] border-r border-[#212836] transition-all duration-300 z-20 shrink-0 select-none shadow-2xl',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Top Header: Brand logo and collapse button */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-3.5 h-14 border-b border-[#212836]">
          <div
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer group"
            onClick={() => onSelectTab('home')}
            title="Return to Public Homepage"
          >
            <div className="relative">
              <img
                src="/logo.svg"
                alt="MathVision"
                className="w-8 h-8 shrink-0 rounded-lg shadow-glow-accent group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#090B10]" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-extrabold text-sm text-[#F8FAFC] tracking-tight leading-none flex items-center gap-1.5">
                  MathVision
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/30">
                    v3-Final
                  </span>
                </span>
                <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5 truncate">
                  Scientific HMER IDE
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A2233] transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Categorized Navigation Sections */}
        <div className="flex flex-col gap-4 p-2.5 overflow-y-auto">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="flex flex-col gap-1">
              {!isCollapsed && (
                <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-[#64748B] px-2.5 py-1">
                  {section.title}
                </span>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                const buttonContent = (
                  <button
                    onClick={() => {
                      if (item.action && item.id === 'workspace' && currentTab === 'workspace') {
                        item.action();
                      }
                      onSelectTab(item.id);
                    }}
                    className={cn(
                      'relative w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium transition-all group select-none',
                      isActive
                        ? 'bg-[#182133] text-[#F8FAFC] border border-[#2B3852] shadow-sm'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#141A28] border border-transparent'
                    )}
                    aria-label={item.label}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#8B7CFF] shadow-[0_0_8px_#8B7CFF]" />
                    )}

                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-[#8B7CFF]' : 'text-[#94A3B8] group-hover:text-[#F8FAFC]'
                      )}
                    />

                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between overflow-hidden">
                        <span className="truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded-full text-[10px] font-mono shrink-0 ml-1.5',
                              item.badgeVariant === 'purple'
                                ? 'bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30'
                                : item.badgeVariant === 'cyan'
                                ? 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30'
                                : 'bg-[#1E2536] text-[#94A3B8] border border-[#252D3B]'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );

                return isCollapsed ? (
                  <Tooltip key={item.id} content={item.label} position="right" className="w-full">
                    {buttonContent}
                  </Tooltip>
                ) : (
                  <React.Fragment key={item.id}>{buttonContent}</React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Area: Live Engine Status & Local Researcher Profile */}
      <div className="p-2.5 border-t border-[#212836] flex flex-col gap-2 bg-[#0B0E16]">
        {/* Backend status pill */}
        <div
          onClick={() => onSelectTab('settings')}
          className={cn(
            'flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-colors select-none',
            isBackendConnected
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15'
              : 'bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/15'
          )}
          title="Click to configure backend connection"
        >
          <Server className="w-4 h-4 shrink-0" />
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between overflow-hidden text-[11px]">
              <span className="font-medium truncate font-mono">
                {isBackendConnected ? 'FastAPI Online' : 'Simulation Mode'}
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

        {/* User profile card */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#141A28] border border-[#212836]">
          <div className="w-7 h-7 rounded-lg bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden text-[11px]">
              <span className="font-semibold text-[#F8FAFC] truncate">Researcher</span>
              <span className="text-[#94A3B8] text-[10px] truncate font-mono">MathVision Lab</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
