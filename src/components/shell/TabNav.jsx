export default function TabNav({ tabs, activeTab, onChange }) {
  return (
    <nav className="grid grid-cols-3 sm:grid-cols-6 xl:flex items-center justify-center gap-1 xl:gap-2 p-1.5 bg-slate-900/50 backdrop-blur-sm rounded-[1.2rem] border border-slate-700/50 w-full mb-8">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`col-span-1 relative px-2 xl:px-5 py-2 xl:py-2.5 rounded-xl font-semibold text-[16px] xl:text-[19px] tracking-wide transition-all duration-300 italic
              ${isActive ? "bg-slate-700 text-slate-100 shadow-lg shadow-black/20" : "text-slate-300 hover:text-white hover:bg-slate-800/50"}`}
          >
            <div className="flex flex-col xl:flex-row items-center justify-center gap-0.5 xl:gap-2">
              <Icon size={18} className="xl:w-5 xl:h-5" />
              <span className="text-[15px] xl:text-[19px] leading-none">{tab.label}</span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
