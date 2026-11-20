import React from 'react';
import { SympyVerification } from '../../types/api';
import { renderLatexToHtml } from '../../utils/latex';
import { ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { Badge } from '../ui/Badge';

interface VerificationPanelProps {
  syntaxValid: boolean;
  sympy: SympyVerification;
  currentLatex?: string;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({
  syntaxValid,
  sympy,
}) => {
  // Render simplified expression if available
  const simplifiedRender = sympy.simplified
    ? renderLatexToHtml(sympy.simplified, false)
    : null;

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-[#10141D] border border-[#252D3B] p-3.5">
      {/* Verification Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#34D399]" />
          <h4 className="text-xs font-semibold text-[#F1F5F9]">
            Mathematical & Symbolic Verification
          </h4>
        </div>

        <Tooltip content="Symbolic verification powered by SymPy 1.13 and LaTeX syntax parser">
          <HelpCircle className="w-3.5 h-3.5 text-[#64748B] hover:text-[#94A3B8] cursor-pointer" />
        </Tooltip>
      </div>

      {/* Verification Status Cards */}
      <div className="grid grid-cols-2 gap-2">
        {/* Syntax Check Card */}
        <div className="flex flex-col p-2.5 rounded-lg bg-[#090B10] border border-[#252D3B]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[#94A3B8]">Syntax Validity</span>
            {syntaxValid ? (
              <Badge variant="success" size="sm" dot>
                Valid
              </Badge>
            ) : (
              <Badge variant="error" size="sm" dot>
                Malformed
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-[#64748B] leading-tight">
            {syntaxValid
              ? 'Balanced curly braces and well-formed atomic LaTeX commands.'
              : 'Unbalanced braces or structural tokens detected.'}
          </p>
        </div>

        {/* SymPy Symbolic Parser Card */}
        <div className="flex flex-col p-2.5 rounded-lg bg-[#090B10] border border-[#252D3B]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[#94A3B8]">SymPy Parsing</span>
            {sympy.valid ? (
              <Badge variant="success" size="sm" dot>
                Parsed
              </Badge>
            ) : (
              <Badge variant="default" size="sm">
                Unavailable
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-[#64748B] leading-tight">
            {sympy.valid
              ? 'Valid algebraic expression tree in Computer Algebra System.'
              : 'Expression not parseable as symbolic algebra.'}
          </p>
        </div>
      </div>

      {/* Simplified Algebraic Form if SymPy succeeded */}
      {sympy.valid && sympy.simplified && (
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[#151B27] border border-[#252D3B]">
          <div className="flex items-center gap-1.5 text-xs text-[#8B7CFF] font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SymPy Simplified Form</span>
          </div>

          <div className="p-2 rounded bg-[#090B10] border border-[#252D3B] text-center overflow-x-auto">
            {simplifiedRender?.html ? (
              <div
                className="font-math text-[#F1F5F9] text-sm"
                dangerouslySetInnerHTML={{ __html: simplifiedRender.html }}
              />
            ) : (
              <code className="text-xs font-mono text-[#F1F5F9]">{sympy.simplified}</code>
            )}
          </div>
        </div>
      )}

      {/* Disclaimers & Notes */}
      <div className="text-[10px] text-[#64748B] leading-tight">
        <strong>Notice:</strong> Syntax validity verifies formatting; SymPy parses algebraic structure. Neither guarantees that the expression matches user intent.
      </div>
    </div>
  );
};
