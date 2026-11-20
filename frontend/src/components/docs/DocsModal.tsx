import React, { useState } from 'react';
import { BookOpen, Search, Lightbulb, Camera } from 'lucide-react';

export const DocsModal: React.FC = () => {
  const [searchVocab, setSearchVocab] = useState('');

  const vocabTokens = [
    "}", "{", "2", "1", "^", "+", "_", "x", "-", "(", ")", "=", "\\frac", "a", "3", "n", "0", "y", "\\sqrt", "4", "b", "\\mbox", "d", "z", "i", "5", "c", "6", "\\sin", "7", "t", "9", "8", ",", "\\left", "\\right", "k", "f", "\\times", "\\cos", "\\sum", "\\int", "p", "\\theta", "e", "\\pi", "m", "|", "r", "\\alpha", "\\infty", "u", "g", "[", "]", "v", "A", "\\beta", "q", "j", "X", "\\lim", "C", ".", "B", "\\tan", "\\log", "s", "h", "\\leq", "\\rightarrow", "R", "/", "F", "E", "\\limits", "L", "N", "\\pm", "l", "\\geq", "P", "w", "S", "V", "o", "\\div", "\\ldots", "T", "\\Bigg", "M", "Y", "\\neq", "H", "\\to", "\\cdots", "\\cdot", "!", "G", "\\phi", "\\gamma", "\\prime", "\\lt", "I", "\\{", "\\}", "\\sigma", "\\mu", "\\Delta", "\\gt", "\\mathrm", "\\!", "\\lambda", "\\in", "\\Big", "\\forall", "$", "<", "'", "\\", ">", "\\exists", "\\lbrack", "\\rbrack", "\\;", "O", "\\parallel", "\\hbox"
  ];

  const filteredTokens = vocabTokens.filter((t) =>
    t.toLowerCase().includes(searchVocab.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 p-1 text-sm text-[#F1F5F9]">
      {/* Overview */}
      <div className="p-4 rounded-xl bg-[#151B27] border border-[#252D3B]">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-[#8B7CFF]" />
          <h3 className="font-semibold text-sm text-[#F1F5F9]">
            MathVision Documentation & User Guide
          </h3>
        </div>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          MathVision is designed for researchers, educators, and students to convert handwritten mathematics into structured, verified LaTeX. The system couples deep spatial feature extraction with sequence-to-sequence beam search decoding and symbolic verification.
        </p>
      </div>

      {/* Capture Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-[#090B10] border border-[#252D3B]">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-[#8B7CFF]">
            <Lightbulb className="w-4 h-4" />
            <span>Digital Ink Tips</span>
          </div>
          <ul className="text-xs text-[#94A3B8] space-y-1 list-disc list-inside">
            <li>Write symbols with clear spacing between operators.</li>
            <li>Extend fraction bars completely across numerators and denominators.</li>
            <li>Write exponents smaller and positioned above base symbols.</li>
            <li>Use the Eraser or Undo (Ctrl+Z) to clean stray dots.</li>
          </ul>
        </div>

        <div className="p-3.5 rounded-xl bg-[#090B10] border border-[#252D3B]">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-[#38BDF8]">
            <Camera className="w-4 h-4" />
            <span>Photograph Guidelines</span>
          </div>
          <ul className="text-xs text-[#94A3B8] space-y-1 list-disc list-inside">
            <li>Ensure dark, legible ink (pen or dark pencil).</li>
            <li>Keep the camera roughly parallel to prevent extreme perspective tilt.</li>
            <li>MathVision binarization removes shadows and notebook lines.</li>
            <li>Crop tightly around the target equation for optimal recognition.</li>
          </ul>
        </div>
      </div>

      {/* Vocabulary Explorer */}
      <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#151B27] border border-[#252D3B]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F1F5F9]">
              Supported CROHME23 Vocabulary ({vocabTokens.length} Atomic Tokens)
            </h4>
          </div>

          <div className="relative w-44">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchVocab}
              onChange={(e) => setSearchVocab(e.target.value)}
              placeholder="Search token..."
              className="w-full pl-8 pr-2 py-1 text-xs bg-[#090B10] text-[#F1F5F9] rounded-lg border border-[#252D3B] focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-[#090B10] border border-[#252D3B] max-h-48 overflow-y-auto mt-2">
          {filteredTokens.map((t, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded font-mono text-xs bg-[#151B27] text-[#94A3B8] border border-[#252D3B] hover:text-[#8B7CFF] hover:border-[#8B7CFF]/50 transition-colors select-all"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-[#64748B] mt-1">
          Tokens recognized natively by the Transformer decoder during beam search.
        </p>
      </div>
    </div>
  );
};
