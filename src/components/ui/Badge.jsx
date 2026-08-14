export default function Badge({ tone, children, className = "" }) {
  const { bg = "bg-slate-100", text = "text-slate-600" } = tone || {};
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider italic ${bg} ${text} ${className}`}>
      {children}
    </span>
  );
}
