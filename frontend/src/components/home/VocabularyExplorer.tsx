import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, Check, Sparkles, BookOpen, Filter } from 'lucide-react';
import { renderLatexToHtml } from '../../utils/latex';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

interface TokenItem {
  id: number;
  token: string;
  category: 'greek' | 'operators' | 'calculus' | 'delimiters' | 'variables' | 'structural';
  description?: string;
}

const CATEGORIES = [
  { key: 'all', label: 'All 132 Tokens' },
  { key: 'greek', label: 'Greek Symbols' },
  { key: 'operators', label: 'Operators & Relations' },
  { key: 'calculus', label: 'Calculus & Functions' },
  { key: 'delimiters', label: 'Delimiters & Sets' },
  { key: 'variables', label: 'Variables & Numbers' },
];

/**
 * Format structural or operator tokens with arguments so KaTeX can render them cleanly
 */
const getDisplayTokenLatex = (tok: string): string => {
  switch (tok) {
    case '\\sqrt':
      return '\\sqrt{\\phantom{n}}';
    case '\\frac':
      return '\\frac{\\cdot}{\\cdot}';
    case '{':
      return '\\{';
    case '}':
      return '\\}';
    case '^':
      return '{}^{\\square}';
    case '_':
      return '{}_{\\square}';
    default:
      return tok;
  }
};

const VOCAB_LIST: TokenItem[] = [
  // Greek
  { id: 53, token: '\\alpha', category: 'greek', description: 'Alpha' },
  { id: 61, token: '\\beta', category: 'greek', description: 'Beta' },
  { id: 104, token: '\\gamma', category: 'greek', description: 'Gamma' },
  { id: 112, token: '\\Delta', category: 'greek', description: 'Capital Delta' },
  { id: 47, token: '\\theta', category: 'greek', description: 'Theta' },
  { id: 116, token: '\\lambda', category: 'greek', description: 'Lambda' },
  { id: 111, token: '\\mu', category: 'greek', description: 'Mu' },
  { id: 49, token: '\\pi', category: 'greek', description: 'Pi (3.14159...)' },
  { id: 110, token: '\\sigma', category: 'greek', description: 'Sigma' },
  { id: 103, token: '\\phi', category: 'greek', description: 'Phi' },

  // Calculus & Big Operators
  { id: 45, token: '\\int', category: 'calculus', description: 'Definite / Indefinite Integral' },
  { id: 44, token: '\\sum', category: 'calculus', description: 'Summation Operator' },
  { id: 65, token: '\\lim', category: 'calculus', description: 'Limit Notation' },
  { id: 22, token: '\\sqrt', category: 'calculus', description: 'Radical / Square Root' },
  { id: 16, token: '\\frac', category: 'calculus', description: 'Fraction Construction' },
  { id: 32, token: '\\sin', category: 'calculus', description: 'Sine Function' },
  { id: 43, token: '\\cos', category: 'calculus', description: 'Cosine Function' },
  { id: 69, token: '\\tan', category: 'calculus', description: 'Tangent Function' },
  { id: 70, token: '\\log', category: 'calculus', description: 'Logarithmic Function' },
  { id: 105, token: '\\prime', category: 'calculus', description: 'Derivative Prime Symbol' },
  { id: 54, token: '\\infty', category: 'calculus', description: 'Infinity' },

  // Operators & Relations
  { id: 9, token: '+', category: 'operators', description: 'Addition' },
  { id: 12, token: '-', category: 'operators', description: 'Subtraction' },
  { id: 82, token: '\\pm', category: 'operators', description: 'Plus-Minus Operator' },
  { id: 42, token: '\\times', category: 'operators', description: 'Cross Multiplication' },
  { id: 90, token: '\\div', category: 'operators', description: 'Division Symbol' },
  { id: 100, token: '\\cdot', category: 'operators', description: 'Center Dot Multiplication' },
  { id: 15, token: '=', category: 'operators', description: 'Equality' },
  { id: 96, token: '\\neq', category: 'operators', description: 'Not Equal' },
  { id: 73, token: '\\leq', category: 'operators', description: 'Less Than or Equal' },
  { id: 84, token: '\\geq', category: 'operators', description: 'Greater Than or Equal' },
  { id: 74, token: '\\rightarrow', category: 'operators', description: 'Rightward Arrow' },
  { id: 98, token: '\\to', category: 'operators', description: 'Tends To Arrow' },
  { id: 117, token: '\\in', category: 'operators', description: 'Element Of Set' },
  { id: 119, token: '\\forall', category: 'operators', description: 'Universal Quantifier (For All)' },
  { id: 125, token: '\\exists', category: 'operators', description: 'Existential Quantifier (Exists)' },
  { id: 130, token: '\\parallel', category: 'operators', description: 'Parallel Lines' },
  { id: 101, token: '!', category: 'operators', description: 'Factorial' },

  // Delimiters & Sets
  { id: 13, token: '(', category: 'delimiters', description: 'Open Parenthesis' },
  { id: 14, token: ')', category: 'delimiters', description: 'Close Parenthesis' },
  { id: 5, token: '{', category: 'delimiters', description: 'Open Curly Brace' },
  { id: 4, token: '}', category: 'delimiters', description: 'Close Curly Brace' },
  { id: 57, token: '[', category: 'delimiters', description: 'Open Square Bracket' },
  { id: 58, token: ']', category: 'delimiters', description: 'Close Square Bracket' },
  { id: 51, token: '|', category: 'delimiters', description: 'Absolute Value / Determinant' },
  { id: 91, token: '\\ldots', category: 'delimiters', description: 'Horizontal Low Ellipsis' },
  { id: 99, token: '\\cdots', category: 'delimiters', description: 'Centered Ellipsis' },

  // Structural & Superscripts
  { id: 8, token: '^', category: 'structural', description: 'Superscript / Power Operator' },
  { id: 10, token: '_', category: 'structural', description: 'Subscript Index' },

  // Variables & Numbers
  { id: 7, token: '1', category: 'variables', description: 'Digit 1' },
  { id: 6, token: '2', category: 'variables', description: 'Digit 2' },
  { id: 18, token: '3', category: 'variables', description: 'Digit 3' },
  { id: 23, token: '4', category: 'variables', description: 'Digit 4' },
  { id: 29, token: '5', category: 'variables', description: 'Digit 5' },
  { id: 31, token: '6', category: 'variables', description: 'Digit 6' },
  { id: 33, token: '7', category: 'variables', description: 'Digit 7' },
  { id: 36, token: '8', category: 'variables', description: 'Digit 8' },
  { id: 35, token: '9', category: 'variables', description: 'Digit 9' },
  { id: 20, token: '0', category: 'variables', description: 'Digit 0' },
  { id: 11, token: 'x', category: 'variables', description: 'Variable x' },
  { id: 21, token: 'y', category: 'variables', description: 'Variable y' },
  { id: 27, token: 'z', category: 'variables', description: 'Variable z' },
  { id: 17, token: 'a', category: 'variables', description: 'Coefficient a' },
  { id: 24, token: 'b', category: 'variables', description: 'Coefficient b' },
  { id: 30, token: 'c', category: 'variables', description: 'Constant c' },
  { id: 48, token: 'e', category: 'variables', description: 'Euler Constant e' },
  { id: 28, token: 'i', category: 'variables', description: 'Imaginary Unit i' },
  { id: 19, token: 'n', category: 'variables', description: 'Natural Number Index n' },
  { id: 41, token: 'f', category: 'variables', description: 'Function Symbol f' },
];

export const VocabularyExplorer: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const filteredTokens = useMemo(() => {
    return VOCAB_LIST.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.token.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 1800);
  };

  return (
    <div className="w-full max-w-6xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8B7CFF]" />
            <h3 className="text-xl sm:text-2xl font-bold text-[#F1F5F9]">
              132-Token Atomic LaTeX Vocabulary
            </h3>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Official CROHME-2023 certified mathematical symbol dictionary recognized by the Transformer decoder
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbol (e.g. frac, sqrt, alpha)..."
            className="w-full bg-[#10141D] border border-[#252D3B] focus:border-[#8B7CFF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F1F5F9] focus:outline-none transition-colors font-mono"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-[#252D3B]/40">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 border select-none',
              activeCategory === cat.key
                ? 'bg-[#8B7CFF]/20 text-[#8B7CFF] border-[#8B7CFF]/60 font-semibold shadow-sm'
                : 'bg-[#151B27] text-[#94A3B8] border-[#252D3B] hover:text-[#F1F5F9]'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Tokens */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredTokens.map((item) => {
          const isCopied = copiedToken === item.token;
          const { html } = renderLatexToHtml(getDisplayTokenLatex(item.token), false);

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              onClick={() => handleCopy(item.token)}
              className="group p-3 rounded-xl bg-[#090B10] border border-[#252D3B] hover:border-[#8B7CFF]/60 hover:shadow-glow-accent/20 cursor-pointer transition-all flex flex-col items-center justify-between text-center relative overflow-hidden"
            >
              {/* Token ID pill */}
              <span className="text-[9px] font-mono text-[#64748B] self-start">
                #{item.id}
              </span>

              {/* Rendered Math Symbol */}
              <div
                className="my-2 font-math text-2xl text-[#F1F5F9] group-hover:scale-110 transition-transform h-8 flex items-center justify-center select-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />

              {/* LaTeX Code Tag */}
              <code className="text-[11px] font-mono text-[#38BDF8] truncate max-w-full">
                {item.token}
              </code>

              {/* Hover Copy Confirmation Overlay */}
              <AnimatePresence>
                {isCopied && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xs gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filteredTokens.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#64748B] text-xs">
            No symbols match &ldquo;{searchQuery}&rdquo;. Try another search term.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-[#252D3B] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#94A3B8] gap-2">
        <span>Click any card to copy its atomic LaTeX command to clipboard.</span>
        <span className="font-mono text-[11px] text-[#34D399]">
          Showing {filteredTokens.length} of {VOCAB_LIST.length} curated symbols
        </span>
      </div>
    </div>
  );
};
