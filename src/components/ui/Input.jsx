export default function Input({ label, className = "", type, ...props }) {
  const isDateTime = type === "date" || type === "time";
  return (
    <label className="block">
      {label && <span className="block text-base font-bold text-slate-600 mb-2">{label}</span>}
      <input
        type={type}
        className={`w-full ${isDateTime ? "px-3 text-base" : "px-4 text-lg"} py-3 rounded-xl border border-slate-200 text-slate-800 hover:border-indigo-300 hover:shadow-md hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${className}`}
        {...props}
      />
    </label>
  );
}
