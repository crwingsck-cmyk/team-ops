import { useState } from "react";
import { Maximize2, X } from "lucide-react";
import Button from "./Button";
import RichTextEditor from "./RichTextEditor";

export default function ExpandableTextarea({ label, value, onChange, placeholder }) {
  const [expanded, setExpanded] = useState(false);

  const setValue = (html) => onChange({ target: { value: html } });

  return (
    <div>
      {label && <span className="block text-base font-bold text-slate-600 mb-2">{label}</span>}
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="relative w-full text-left"
      >
        <div
          className={`w-full min-h-[4.5rem] px-4 py-3 rounded-xl border border-slate-200 text-lg text-slate-800 hover:border-indigo-300 hover:shadow-md transition-all duration-200 overflow-hidden ${!value ? "text-slate-400" : ""}`}
          dangerouslySetInnerHTML={{ __html: value || placeholder || "點選展開編輯" }}
        />
        <span className="absolute right-2 top-2 p-1.5 rounded-lg text-slate-400 bg-white/80">
          <Maximize2 size={16} />
        </span>
      </button>

      {expanded && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-xl font-black italic text-slate-800">{label || "編輯"}</h2>
              <button
                onClick={() => setExpanded(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 min-h-0 p-6 flex flex-col">
              <RichTextEditor value={value} onChange={setValue} placeholder={placeholder} fill />
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-slate-100">
              <Button onClick={() => setExpanded(false)}>完成</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
