import { useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { ChevronDown, Copy, Check, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EquationBlockProps {
  content: string;
  onChange: (content: string) => void;
}

const EquationBlock = ({ content, onChange }: EquationBlockProps) => {
  const [isEditing, setIsEditing] = useState(true);
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const renderLatex = (latex: string): string => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        strict: false,
      });
    } catch {
      return "";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  const insertFormula = (formula: string) => {
    onChange(formula);
  };

  const commonFormulas = [
    { name: "Quadratic Formula", formula: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
    { name: "Pythagorean Theorem", formula: "a^2 + b^2 = c^2" },
    { name: "Distance Formula", formula: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}" },
    { name: "Area of Circle", formula: "A = \\pi r^2" },
    { name: "Euler's Identity", formula: "e^{i\\pi} + 1 = 0" },
    { name: "Gaussian Integral", formula: "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}" },
  ];

  const hasValidLatex = content.trim().length > 0;
  const renderedLatex = renderLatex(content);

  return (
    <div className="py-2 space-y-3">
      {/* Help Section */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-2 w-full text-left hover:bg-primary/10 p-2 rounded transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">How to write formulas</span>
          <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showHelp ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 pt-2 border-t border-primary/20 space-y-2 text-xs text-muted-foreground"
            >
              <p>Use <strong>LaTeX syntax</strong> to write math formulas:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><code className="bg-muted px-1 rounded">x^2</code> = superscript (power)</li>
                <li><code className="bg-muted px-1 rounded">x_n</code> = subscript</li>
                <li><code className="bg-muted px-1 rounded">\\frac{a}{b}</code> = fraction</li>
                <li><code className="bg-muted px-1 rounded">\\sqrt{x}</code> = square root</li>
                <li><code className="bg-muted px-1 rounded">\\pi, \\alpha, \\beta</code> = Greek letters</li>
                <li><code className="bg-muted px-1 rounded">\\int, \\sum, \\prod</code> = calculus symbols</li>
              </ul>
              <p className="mt-2 pt-2 border-t border-primary/20">Pick a formula below to start:</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Common Formulas */}
      <div className="grid grid-cols-2 gap-2">
        {commonFormulas.map((formula) => (
          <button
            key={formula.name}
            onClick={() => insertFormula(formula.formula)}
            className="p-2 text-xs text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-primary/30 group"
          >
            <span className="font-medium block text-foreground group-hover:text-primary">{formula.name}</span>
            <span className="text-muted-foreground text-[10px]">{formula.formula}</span>
          </button>
        ))}
      </div>

      {/* Editor Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground">LaTeX Formula</label>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
          >
            {isEditing ? "Preview" : "Edit"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-muted/30 rounded-lg border border-border p-3"
            >
              <textarea
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
                className="w-full h-[100px] bg-transparent outline-none resize-none font-mono text-sm placeholder:text-muted-foreground/50"
              />
              <p className="text-[10px] text-muted-foreground mt-2">Type LaTeX syntax above. The preview updates in real-time.</p>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 flex items-center justify-center min-h-[120px]"
            >
              {hasValidLatex && renderedLatex ? (
                <div
                  dangerouslySetInnerHTML={{ __html: renderedLatex }}
                  className="text-center"
                />
              ) : (
                <p className="text-sm text-muted-foreground">Enter a LaTeX formula to see preview</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Render Output (always visible) */}
      {hasValidLatex && renderedLatex && (
        <div className="bg-background border border-border rounded-lg p-4 flex items-center justify-center min-h-[80px]">
          <div dangerouslySetInnerHTML={{ __html: renderedLatex }} className="text-center" />
        </div>
      )}

      {/* Copy Button */}
      {content && (
        <button
          onClick={copyToClipboard}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        >
          {copiedFormula ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy LaTeX</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default EquationBlock;
