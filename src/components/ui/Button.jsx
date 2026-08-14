const VARIANTS = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700",
  danger: "bg-rose-600 hover:bg-rose-700 text-white",
  ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  icon: Icon,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest italic transition-all disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
