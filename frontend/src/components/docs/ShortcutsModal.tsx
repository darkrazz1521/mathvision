import React from 'react';
import { Keyboard } from 'lucide-react';

export const ShortcutsModal: React.FC = () => {
  const shortcuts = [
    { key: 'Ctrl + Enter', description: 'Run Mathematical Recognition on current input' },
    { key: 'Ctrl + Z', description: 'Undo last drawing stroke on canvas' },
    { key: 'Ctrl + Shift + Z / Ctrl + Y', description: 'Redo previously undone stroke' },
    { key: 'P', description: 'Switch to Pen drawing tool' },
    { key: 'E', description: 'Switch to Eraser tool' },
    { key: '← / →', description: 'Navigate previous / next token in explainability inspector' },
    { key: 'Esc', description: 'Close any active modal dialog' },
  ];

  return (
    <div className="flex flex-col gap-4 p-1 text-sm text-[#F1F5F9]">
      <div className="flex items-center gap-2 mb-1">
        <Keyboard className="w-5 h-5 text-[#8B7CFF]" />
        <h3 className="font-semibold text-sm text-[#F1F5F9]">
          Keyboard Shortcuts & Accessibility Cheatsheet
        </h3>
      </div>

      <div className="flex flex-col divide-y divide-[#252D3B] rounded-xl border border-[#252D3B] bg-[#151B27] overflow-hidden">
        {shortcuts.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-[#94A3B8]">{item.description}</span>
            <kbd className="px-2.5 py-1 text-xs font-mono font-semibold rounded bg-[#090B10] text-[#8B7CFF] border border-[#252D3B] shadow-sm">
              {item.key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
};
