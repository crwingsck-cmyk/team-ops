export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
