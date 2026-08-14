export default function Badge({ tone, children, className = "" }) {
  const { bg = "bg-slate-100", text = "text-slate-600" } = tone || {};
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-black uppercase tracking-wider italic ${bg} ${text} ${className}`}>
      {children}
    </span>
  );
}
