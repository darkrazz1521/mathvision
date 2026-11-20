import katex from 'katex';

/**
 * Safely renders LaTeX string to HTML using KaTeX.
 * Returns { html, error }
 */
export function renderLatexToHtml(
  latex: string, 
  displayMode: boolean = true
): { html: string; error: string | null } {
  if (!latex || !latex.trim()) {
    return { html: '', error: null };
  }

  try {
    const html = katex.renderToString(latex.trim(), {
      displayMode,
      output: 'html',
      throwOnError: false,
      errorColor: '#FB7185',
      strict: false,
      trust: false,
    });
    return { html, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown KaTeX rendering error';
    return { html: '', error: msg };
  }
}

/**
 * Checks if braces { and } are balanced in LaTeX tokens
 */
export function checkBalancedBraces(latex: string): boolean {
  let count = 0;
  for (let i = 0; i < latex.length; i++) {
    const char = latex[i];
    // Ignore escaped braces \{ and \}
    if (char === '{' && (i === 0 || latex[i - 1] !== '\\')) {
      count++;
    } else if (char === '}' && (i === 0 || latex[i - 1] !== '\\')) {
      count--;
    }
    if (count < 0) return false;
  }
  return count === 0;
}

/**
 * Joins tokens cleanly for LaTeX. 
 * Formats spaces appropriately while preserving atomic commands.
 */
export function tokensToLatex(tokens: string[]): string {
  // Replace tokens cleanly
  return tokens.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Replaces a specific token in a token sequence by index and returns new LaTeX string
 */
export function replaceTokenInSequence(
  tokens: string[], 
  index: number, 
  newToken: string
): string {
  if (index < 0 || index >= tokens.length) return tokensToLatex(tokens);
  const next = [...tokens];
  next[index] = newToken;
  return tokensToLatex(next);
}

/**
 * Formats confidence score as percentage string
 */
export function formatConfidence(score: number): string {
  const percent = Math.min(100, Math.max(0, score * 100));
  return `${percent.toFixed(1)}%`;
}

/**
 * Gets appropriate color for confidence badge
 */
export function getConfidenceColor(score: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (score >= 0.85) {
    return {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
    };
  }
  if (score >= 0.6) {
    return {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
    };
  }
  return {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
  };
}
