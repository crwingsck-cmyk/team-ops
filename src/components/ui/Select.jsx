export default function Select({ label, className = "", children, ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-bold text-slate-500 mb-1.5">{label}</span>}
      <select
        className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
