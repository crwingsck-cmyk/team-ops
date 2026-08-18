import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const SIZE_STEPS = ["text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl"];

export default function ZoomableText({ text, label, italic = true, colorClass = "text-slate-600", className = "", html = false }) {
  const [stepIndex, setStepIndex] = useState(0);

  if (!text) return null;

  const controls = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
        disabled={stepIndex === 0}
        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        title="縮小文字"
      >
        <Minus size={14} />
      </button>
      <button
        type="button"
        onClick={() => setStepIndex((i) => Math.min(SIZE_STEPS.length - 1, i + 1))}
        disabled={stepIndex === SIZE_STEPS.length - 1}
        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        title="放大文字"
      >
        <Plus size={14} />
      </button>
    </div>
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        {label ? (
          <h4 className="text-sm font-black text-slate-600 uppercase tracking-wider">{label}</h4>
        ) : (
          <span />
        )}
        {controls}
      </div>
      {html ? (
        <div
          className={`${SIZE_STEPS[stepIndex]} ${italic ? "italic" : ""} ${colorClass} whitespace-pre-wrap transition-all duration-200`}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      ) : (
        <p className={`${SIZE_STEPS[stepIndex]} ${italic ? "italic" : ""} ${colorClass} whitespace-pre-wrap transition-all duration-200`}>
          {text}
        </p>
      )}
    </div>
  );
}
