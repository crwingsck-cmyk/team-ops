export default function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-base font-bold text-slate-600 mb-2">{label}</span>}
      <input
        className={`w-full px-4 py-3 rounded-xl border border-slate-200 text-lg text-slate-800 hover:border-indigo-300 hover:shadow-md hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${className}`}
        {...props}
      />
    </label>
  );
}
