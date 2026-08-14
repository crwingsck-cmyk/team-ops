export default function Textarea({ label, className = "", rows = 4, ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-base font-bold text-slate-600 mb-2">{label}</span>}
      <textarea
        rows={rows}
        className={`w-full px-4 py-3 rounded-xl border border-slate-200 text-lg text-slate-800 hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-y ${className}`}
        {...props}
      />
    </label>
  );
}
