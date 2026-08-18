import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, Undo2, Redo2 } from "lucide-react";

const FONT_SIZES = [
  { value: "2", label: "小" },
  { value: "3", label: "正常" },
  { value: "5", label: "大" },
  { value: "7", label: "特大" },
];

function ToolbarButton({ onClick, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = "10rem", fill = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command, arg) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    onChange(ref.current.innerHTML);
  };

  return (
    <div className={`border border-slate-200 rounded-2xl overflow-hidden ${fill ? "h-full flex flex-col" : ""}`}>
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-slate-100 bg-slate-50 shrink-0">
        <ToolbarButton title="粗體" onClick={() => exec("bold")}><Bold size={16} /></ToolbarButton>
        <ToolbarButton title="斜體" onClick={() => exec("italic")}><Italic size={16} /></ToolbarButton>
        <ToolbarButton title="底線" onClick={() => exec("underline")}><Underline size={16} /></ToolbarButton>
        <select
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => exec("fontSize", e.target.value)}
          defaultValue="3"
          title="字體大小"
          className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white hover:border-indigo-300"
        >
          {FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <label
          title="文字顏色"
          onMouseDown={(e) => e.preventDefault()}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <input
            type="color"
            onChange={(e) => exec("foreColor", e.target.value)}
            className="w-5 h-5 cursor-pointer"
          />
        </label>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <ToolbarButton title="復原" onClick={() => exec("undo")}><Undo2 size={16} /></ToolbarButton>
        <ToolbarButton title="重做" onClick={() => exec("redo")}><Redo2 size={16} /></ToolbarButton>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        style={fill ? undefined : { minHeight }}
        className={`w-full p-4 text-lg text-slate-800 focus:outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-slate-400 overflow-y-auto ${fill ? "flex-1 min-h-0" : ""}`}
      />
    </div>
  );
}
