import { useState } from "react";
import { Users, HeartHandshake, CalendarCheck } from "lucide-react";
import VolunteerReport from "./VolunteerReport";
import GuestReport from "./GuestReport";
import AttendanceReport from "./AttendanceReport";

const REPORT_TYPES = [
  { id: "volunteers", label: "志工資料庫報表", icon: Users },
  { id: "guests", label: "大德資料庫報表", icon: HeartHandshake },
  { id: "attendance", label: "活動報名與出席報表", icon: CalendarCheck },
];

const REPORT_COMPONENTS = {
  volunteers: VolunteerReport,
  guests: GuestReport,
  attendance: AttendanceReport,
};

export default function ReportsPage() {
  const [activeType, setActiveType] = useState("volunteers");
  const ActiveReport = REPORT_COMPONENTS[activeType];

  return (
    <div>
      <h2 className="text-2xl font-black italic text-slate-800 mb-4">報表</h2>

      <div className="flex flex-wrap gap-3 mb-6">
        {REPORT_TYPES.map((type) => {
          const Icon = type.icon;
          const isActive = activeType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-[1.02] ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white/80 backdrop-blur-md text-slate-600 border border-slate-100 hover:border-indigo-300"
              }`}
            >
              <Icon size={18} />
              {type.label}
            </button>
          );
        })}
      </div>

      <ActiveReport />
    </div>
  );
}
