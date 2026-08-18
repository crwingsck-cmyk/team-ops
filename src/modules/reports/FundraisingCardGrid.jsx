import { LayoutGrid } from "lucide-react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import FundraisingDetail from "../fundraising/FundraisingDetail";
import { DONATION_TYPE_LABELS, PLEDGE_STATUS_LABELS } from "../../constants/categoryStyles";

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  );
}

function BreakdownRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-600 py-0.5">
      <span>{label}</span>
      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
}

function OrgUnitCard({ label, people }) {
  const withDonors = people.filter((p) => p.donors?.length > 0);
  const allDonors = withDonors.flatMap((p) => p.donors);

  const amountByType = {};
  const countByStatus = {};
  Object.keys(DONATION_TYPE_LABELS).forEach((k) => (amountByType[k] = 0));
  Object.keys(PLEDGE_STATUS_LABELS).forEach((k) => (countByStatus[k] = 0));
  allDonors.forEach((d) => {
    const type = d.donationType || "casual";
    const status = d.pledgeStatus || "not_yet";
    amountByType[type] = (amountByType[type] || 0) + (Number(d.amount) || 0);
    countByStatus[status] = (countByStatus[status] || 0) + 1;
  });

  return (
    <Card>
      <h3 className="font-black italic text-slate-800 text-xl mb-3">{label}</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat label="募款者人數" value={withDonors.length} />
        <Stat label="捐款者人數" value={allDonors.length} />
      </div>
      <div className="pt-3 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">各捐款形式金額</p>
        {Object.entries(DONATION_TYPE_LABELS).map(([k, v]) => (
          <BreakdownRow key={k} label={v} value={amountByType[k].toLocaleString()} />
        ))}
      </div>
      <div className="pt-3 border-t border-slate-100 mt-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">認捐狀態人數</p>
        {Object.entries(PLEDGE_STATUS_LABELS).map(([k, v]) => (
          <BreakdownRow key={k} label={v.label} value={countByStatus[k]} />
        ))}
      </div>
    </Card>
  );
}

function EventTypeSummaryCard({ type, events }) {
  const total = events.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  return (
    <Card>
      <h3 className="font-black italic text-slate-800 text-xl mb-3">{type || "未分類"}</h3>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="場次" value={events.length} />
        <Stat label="總金額" value={total.toLocaleString()} />
      </div>
    </Card>
  );
}

function EventDetailCard({ event }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-black italic text-slate-800 text-lg">{event.location || "-"}</h3>
        <span className="text-sm font-bold text-indigo-600">{(event.amount || 0).toLocaleString()}</span>
      </div>
      <p className="text-sm text-slate-500 mb-3">
        {event.date}{event.time ? ` ${event.time}` : ""}{event.eventType ? `・${event.eventType}` : ""}
      </p>
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
        <Stat label="出席志工" value={event.volunteerCount || 0} />
        <Stat label="出席大德" value={event.guestCount || 0} />
      </div>
    </Card>
  );
}

export default function FundraisingCardGrid({ groupMode, people, events }) {
  if (groupMode === "person") {
    const withDonors = people.filter((p) => p.donors?.length > 0);
    if (withDonors.length === 0) {
      return <EmptyState icon={LayoutGrid} title="還沒有任何募款記錄" description="到「個人」頁籤記錄志工或大德的捐款者資料後，這裡就會顯示卡片。" />;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {withDonors.map((p) => (
          <Card key={p.id}>
            <FundraisingDetail person={p} />
          </Card>
        ))}
      </div>
    );
  }

  if (groupMode === "event") {
    const byType = new Map();
    events.forEach((e) => {
      const type = e.eventType || "";
      if (!byType.has(type)) byType.set(type, []);
      byType.get(type).push(e);
    });
    if (events.length === 0) {
      return <EmptyState icon={LayoutGrid} title="還沒有任何活動募款記錄" description="到「活動」頁籤新增活動募款記錄後，這裡就會顯示卡片。" />;
    }
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...byType.entries()].map(([type, list]) => (
            <EventTypeSummaryCard key={type || "未分類"} type={type} events={list} />
          ))}
        </div>
        <p className="text-sm font-bold text-slate-500 mb-3">各場活動明細</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e) => (
            <EventDetailCard key={e.id} event={e} />
          ))}
        </div>
      </div>
    );
  }

  // heQi / huAi / xieLi
  const groups = new Map();
  people.forEach((p) => {
    const value = p[groupMode];
    if (!value) return;
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(p);
  });

  if (groups.size === 0) {
    return <EmptyState icon={LayoutGrid} title="沒有符合條件的資料" description="確認志工資料庫裡已經有和氣/互愛/協力的分類資料。" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "zh-Hant")).map(([label, groupPeople]) => (
        <OrgUnitCard key={label} label={label} people={groupPeople} />
      ))}
    </div>
  );
}
