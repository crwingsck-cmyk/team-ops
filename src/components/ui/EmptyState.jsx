export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Icon className="text-slate-400" size={24} />
        </div>
      )}
      <h3 className="text-xl font-black italic text-slate-700 mb-2">{title}</h3>
      {description && <p className="text-base text-slate-500 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
