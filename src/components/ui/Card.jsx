export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
