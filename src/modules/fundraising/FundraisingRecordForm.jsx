import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Button from "../../components/ui/Button";
import VolunteerSearchInput from "../../components/ui/VolunteerSearchInput";
import { PLEDGE_STATUS_LABELS, DONATION_TYPE_LABELS, DONATION_FREQUENCY_LABELS } from "../../constants/categoryStyles";

const EMPTY_DONOR = { name: "", date: "", donationType: "casual", frequency: "one_time", amount: "", pledgeStatus: "not_yet", assignVolunteerId: "", assignVolunteerText: "", heQi: "", huAi: "", xieLi: "" };
const EMPTY = { pledgeTarget: "", enteredBy: "", donors: [] };

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

  useEffect(() => {
    if (initial) {
      const donors = (initial.donors || []).map((d) => ({ ...EMPTY_DONOR, ...d, amount: d.amount ?? "" }));
      setForm({
        pledgeTarget: initial.pledgeTarget ?? "",
        enteredBy: initial.enteredBy || "",
        donors,
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial]);

  const addDonor = () => setForm((f) => ({ ...f, donors: [...f.donors, { ...EMPTY_DONOR }] }));
  const updateDonor = (i, key, value) =>
    setForm((f) => ({ ...f, donors: f.donors.map((d, idx) => (idx === i ? { ...d, [key]: value } : d)) }));
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
          frequency: d.frequency,
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
      enteredBy: form.enteredBy,
      donors,
      movedDonors,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {person && (
        <div className="p-3 rounded-xl bg-slate-50">
          <p className="font-bold text-lg text-slate-800">{person.name}</p>
          <p className="text-sm text-slate-500">{person.phone || "-"}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-base font-bold text-slate-600 mb-1">目標人數</span>
          <input
            type="number"
            min="0"
            placeholder="人數"
            value={form.pledgeTarget}
            onChange={(e) => setForm((f) => ({ ...f, pledgeTarget: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200"
          />
        </label>
        <label className="block">
          <span className="block text-base font-bold text-slate-600 mb-1">輸入者</span>
          <VolunteerSearchInput
            options={volunteerOptions}
            value={form.enteredBy}
            onChange={(text) => setForm((f) => ({ ...f, enteredBy: text }))}
          />
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="block text-lg font-bold text-slate-600">捐款者（每人獨立輸入）</span>
          <button type="button" onClick={addDonor} className="text-base text-indigo-600 font-bold flex items-center gap-1">
            <Plus size={18} /> 新增捐款者
          </button>
        </div>
        {allowVolunteerAssignment && (
          <p className="text-base text-slate-500 mb-3">若後來知道是哪位志工募的，在「已知志工」輸入姓名或電話搜尋並選取，這筆捐款者會自動移到該志工的募款資料中。</p>
        )}
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[1230px] border-separate border-spacing-y-3">
            <thead>
              <tr className="text-base font-bold text-slate-500">
                <th className="text-left font-bold px-1 w-44">姓名</th>
                <th className="text-left font-bold px-1 w-40">日期</th>
                <th className="text-left font-bold px-1 w-36">捐款形式</th>
                <th className="text-left font-bold px-1 w-32">捐款頻率</th>
                <th className="text-left font-bold px-1 w-28">金額</th>
                <th className="text-left font-bold px-1 w-36">認捐狀態</th>
                {allowVolunteerAssignment && <th className="text-left font-bold px-1 w-64">和氣／互愛／協力</th>}
                {allowVolunteerAssignment && <th className="text-left font-bold px-1 w-56">已知志工（輸入姓名/電話搜尋）</th>}
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
                    <select
                      value={d.frequency}
                      onChange={(e) => updateDonor(i, "frequency", e.target.value)}
                      className="w-full px-2.5 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      {Object.entries(DONATION_FREQUENCY_LABELS).map(([k, v]) => (
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
                    <td className="px-1">
                      <div className="grid grid-cols-3 gap-1">
                        <select
                          value={d.heQi}
                          onChange={(e) => updateDonor(i, "heQi", e.target.value)}
                          className="w-full px-1.5 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 transition-all duration-200 bg-white"
                        >
                          <option value="">和氣</option>
                          {heQiOptions.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                        <select
                          value={d.huAi}
                          onChange={(e) => updateDonor(i, "huAi", e.target.value)}
                          className="w-full px-1.5 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 transition-all duration-200 bg-white"
                        >
                          <option value="">互愛</option>
                          {huAiOptions.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                        <select
                          value={d.xieLi}
                          onChange={(e) => updateDonor(i, "xieLi", e.target.value)}
                          className="w-full px-1.5 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 transition-all duration-200 bg-white"
                        >
                          <option value="">協力</option>
                          {xieLiOptions.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  )}
                  {allowVolunteerAssignment && (
                    <td className="px-1">
                      <VolunteerSearchInput
                        options={volunteerOptions}
                        value={d.assignVolunteerText}
                        onChange={(text) => updateDonor(i, "assignVolunteerText", text)}
                        onSelect={(match) => updateDonor(i, "assignVolunteerId", match?.id || "")}
                        confirmedLabel="已對應志工，儲存後會移過去"
                        unresolvedLabel="尚未對應到志工"
                      />
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
          <p className="text-base text-slate-400 italic mt-2">還沒有捐款者，點「新增捐款者」開始新增。</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
