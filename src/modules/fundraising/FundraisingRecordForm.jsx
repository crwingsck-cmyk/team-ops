import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import Button from "../../components/ui/Button";
import { PLEDGE_STATUS_LABELS, DONATION_TYPE_LABELS } from "../../constants/categoryStyles";

const EMPTY_DONOR = { name: "", date: "", donationType: "casual", amount: "", pledgeStatus: "not_yet", assignVolunteerId: "", assignVolunteerText: "", heQi: "", huAi: "", xieLi: "" };
const EMPTY = { pledgeTarget: "", donors: [] };
const ASSIGN_VOLUNTEER_DATALIST_ID = "fundraising-assign-volunteer-suggestions";

export default function FundraisingRecordForm({
  person,
  initial,
  allowVolunteerAssignment = false,
  volunteerOptions = [],
  heQiOptions = [],
  huAiOptions = [],
  xieLiOptions = [],
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(EMPTY);

  const volunteerByName = useMemo(() => {
    const map = new Map();
    volunteerOptions.forEach((v) => { if (v.name) map.set(v.name.trim(), v); });
    return map;
  }, [volunteerOptions]);

  const volunteerByPhone = useMemo(() => {
    const map = new Map();
    volunteerOptions.forEach((v) => { if (v.phone) map.set(v.phone.trim(), v); });
    return map;
  }, [volunteerOptions]);

  useEffect(() => {
    if (initial) {
      const donors = (initial.donors || []).map((d) => ({ ...EMPTY_DONOR, ...d, amount: d.amount ?? "" }));
      setForm({
        pledgeTarget: initial.pledgeTarget ?? "",
        donors,
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial]);

  const addDonor = () => setForm((f) => ({ ...f, donors: [...f.donors, { ...EMPTY_DONOR }] }));
  const updateDonor = (i, key, value) =>
    setForm((f) => ({ ...f, donors: f.donors.map((d, idx) => (idx === i ? { ...d, [key]: value } : d)) }));
  const updateAssignVolunteer = (i, value) => {
    const trimmed = value.trim();
    const match = volunteerByName.get(trimmed) || volunteerByPhone.get(trimmed);
    setForm((f) => ({
      ...f,
      donors: f.donors.map((d, idx) => (idx === i ? { ...d, assignVolunteerText: value, assignVolunteerId: match?.id || "" } : d)),
    }));
  };
  const removeDonor = (i) => setForm((f) => ({ ...f, donors: f.donors.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const donors = [];
    const movedDonors = [];
    form.donors
      .filter((d) => d.name || d.amount)
      .forEach((d) => {
        const donor = {
          name: d.name,
          date: d.date,
          donationType: d.donationType,
          amount: d.amount === "" ? 0 : Number(d.amount),
          pledgeStatus: d.pledgeStatus,
        };
        if (d.assignVolunteerId) {
          // Moving to a known volunteer — that record already carries its own
          // 和氣/互愛/協力, so the placeholder's per-donor tag no longer applies.
          movedDonors.push({ volunteerId: d.assignVolunteerId, donor });
        } else if (allowVolunteerAssignment) {
          donors.push({ ...donor, heQi: d.heQi, huAi: d.huAi, xieLi: d.xieLi });
        } else {
          donors.push(donor);
        }
      });
    onSubmit({
      pledgeTarget: form.pledgeTarget === "" ? "" : Number(form.pledgeTarget),
      donors,
      movedDonors,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {person && (
        <div className="p-3 rounded-xl bg-slate-50">
          <p className="font-bold text-lg text-slate-800">{person.name}</p>
          <p className="text-sm text-slate-500">{person.phone || "-"}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="block text-sm font-bold text-slate-600 mb-1">目標人數</span>
          <input
            type="number"
            min="0"
            placeholder="人數"
            value={form.pledgeTarget}
            onChange={(e) => setForm((f) => ({ ...f, pledgeTarget: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200"
          />
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="block text-base font-bold text-slate-600">捐款者（每人獨立輸入）</span>
          <button type="button" onClick={addDonor} className="text-base text-indigo-600 font-bold flex items-center gap-1">
            <Plus size={16} /> 新增捐款者
          </button>
        </div>
        {allowVolunteerAssignment && (
          <p className="text-sm text-slate-500 mb-2">若後來知道是哪位志工募的，輸入該志工的姓名或電話並選取後儲存，這筆捐款者會自動移到該志工的募款資料中。</p>
        )}
        <datalist id={ASSIGN_VOLUNTEER_DATALIST_ID}>
          {volunteerOptions.map((v) => (
            <option key={`n-${v.id}`} value={v.name} />
          ))}
          {volunteerOptions.filter((v) => v.phone).map((v) => (
            <option key={`p-${v.id}`} value={v.phone} />
          ))}
        </datalist>
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[860px] border-separate border-spacing-y-2">
            <thead>
              <tr className="text-sm font-bold text-slate-500">
                <th className="text-left font-bold px-1 w-40">姓名</th>
                <th className="text-left font-bold px-1 w-36">日期</th>
                <th className="text-left font-bold px-1 w-32">捐款形式</th>
                <th className="text-left font-bold px-1 w-24">金額</th>
                <th className="text-left font-bold px-1 w-32">認捐狀態</th>
                {allowVolunteerAssignment && <th className="text-left font-bold px-1 w-40">和氣／互愛／協力</th>}
                {allowVolunteerAssignment && <th className="text-left font-bold px-1 w-48">已知志工（輸入姓名/電話）</th>}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {form.donors.map((d, i) => (
                <tr key={i}>
                  <td className="px-1">
                    <input
                      placeholder="姓名"
                      value={d.name}
                      onChange={(e) => updateDonor(i, "name", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                    />
                  </td>
                  <td className="px-1">
                    <input
                      type="date"
                      value={d.date}
                      onChange={(e) => updateDonor(i, "date", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                    />
                  </td>
                  <td className="px-1">
                    <select
                      value={d.donationType}
                      onChange={(e) => updateDonor(i, "donationType", e.target.value)}
                      className="w-full px-2.5 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      {Object.entries(DONATION_TYPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-1">
                    <input
                      type="number"
                      min="0"
                      placeholder="金額"
                      value={d.amount}
                      onChange={(e) => updateDonor(i, "amount", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                    />
                  </td>
                  <td className="px-1">
                    <select
                      value={d.pledgeStatus}
                      onChange={(e) => updateDonor(i, "pledgeStatus", e.target.value)}
                      className="w-full px-2.5 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      {Object.entries(PLEDGE_STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </td>
                  {allowVolunteerAssignment && (
                    <td className="px-1 space-y-1">
                      <select
                        value={d.heQi}
                        onChange={(e) => updateDonor(i, "heQi", e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm hover:border-indigo-300 transition-all duration-200 bg-white"
                      >
                        <option value="">和氣</option>
                        {heQiOptions.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      <select
                        value={d.huAi}
                        onChange={(e) => updateDonor(i, "huAi", e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm hover:border-indigo-300 transition-all duration-200 bg-white"
                      >
                        <option value="">互愛</option>
                        {huAiOptions.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      <select
                        value={d.xieLi}
                        onChange={(e) => updateDonor(i, "xieLi", e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm hover:border-indigo-300 transition-all duration-200 bg-white"
                      >
                        <option value="">協力</option>
                        {xieLiOptions.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </td>
                  )}
                  {allowVolunteerAssignment && (
                    <td className="px-1">
                      <input
                        placeholder="姓名或電話"
                        value={d.assignVolunteerText}
                        onChange={(e) => updateAssignVolunteer(i, e.target.value)}
                        list={ASSIGN_VOLUNTEER_DATALIST_ID}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                      />
                      {d.assignVolunteerText && (
                        <p className={`mt-1 text-xs font-bold ${d.assignVolunteerId ? "text-emerald-600" : "text-slate-400"}`}>
                          {d.assignVolunteerId ? "已對應志工，儲存後會移過去" : "尚未對應到志工"}
                        </p>
                      )}
                    </td>
                  )}
                  <td className="px-1">
                    <button type="button" onClick={() => removeDonor(i)} className="p-2 text-slate-400 hover:text-rose-600">
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {form.donors.length === 0 && (
          <p className="text-sm text-slate-400 italic mt-2">還沒有捐款者，點「新增捐款者」開始新增。</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
