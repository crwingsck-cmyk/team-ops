import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import {
  MARITAL_STATUS_LABELS,
  WORK_SCHEDULE_LABELS,
  CAR_SEATS_LABELS,
  TC_IDENTIFICATION_LABELS,
  AVAILABILITY_DAYS,
  AVAILABILITY_SLOTS,
  VOLUNTEER_STATUS,
  MISSION_BODY_LABELS,
  GENDER_LABELS,
} from "../../constants/categoryStyles";
import { buildMapHref, mapPlatformLabel } from "../../lib/maps";

const EMPTY_AVAILABILITY = Object.fromEntries(
  AVAILABILITY_DAYS.map((d) => [d.key, Object.fromEntries(AVAILABILITY_SLOTS.map((s) => [s.key, false]))])
);

const EMPTY = {
  name: "",
  englishName: "",
  age: "",
  gender: "",
  phone: "",
  email: "",
  memberId: "",
  skills: "",
  joinDate: "",
  status: "active",
  missionBody: "",
  missionBodyOther: "",
  notes: "",
  heQi: "",
  huAi: "",
  xieLi: "",
  address: "",
  mapLink: "",
  maritalStatus: "",
  familyRemarks: "",
  workSchedule: "",
  workScheduleOther: "",
  jobTitle: "",
  jobTenure: "",
  availability: EMPTY_AVAILABILITY,
  availabilityRemarks: "",
  canDrive: "",
  carSeats: "",
  position4in1: "",
  positionOther: "",
  positionHistory: "",
  tcIdentification: "",
  usesFamilyTreasure: "",
  mentorName: "",
  goodAt1: "",
  goodAt2: "",
  futureInterest: "",
};

function SectionHeading({ children }) {
  return (
    <h4 className="text-sm font-black uppercase tracking-wide text-indigo-600 pt-2 border-t border-slate-100 first:border-t-0 first:pt-0">
      {children}
    </h4>
  );
}

export default function VolunteerForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (initial) {
      setForm({
        ...EMPTY,
        ...initial,
        skills: (initial.skills || []).join(", "),
        position4in1: Array.isArray(initial.position4in1) ? initial.position4in1.join(", ") : (initial.position4in1 || ""),
        availability: { ...EMPTY_AVAILABILITY, ...(initial.availability || {}) },
        xieLi: initial.xieLi || (!initial.heQi && !initial.huAi ? initial.heqiHuaiXieli || "" : ""),
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const toggleAvailability = (day, slot) => {
    setForm((f) => ({
      ...f,
      availability: {
        ...f.availability,
        [day]: { ...f.availability[day], [slot]: !f.availability[day][slot] },
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      position4in1: form.position4in1
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionHeading>基本資料</SectionHeading>
      <Input label="姓名" required value={form.name} onChange={set("name")} />
      <Input label="英文名字" value={form.englishName} onChange={set("englishName")} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="年齡" type="number" min="0" value={form.age} onChange={set("age")} />
        <Select label="性別" value={form.gender} onChange={set("gender")}>
          <option value="">選擇</option>
          {Object.entries(GENDER_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </div>
      <Input label="電話" value={form.phone} onChange={set("phone")} />
      <Input label="Email" type="email" value={form.email} onChange={set("email")} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="會員編號" value={form.memberId} onChange={set("memberId")} />
        <Input label="加入日期" type="date" value={form.joinDate} onChange={set("joinDate")} />
      </div>
      <Select label="狀態" value={form.status} onChange={set("status")}>
        {Object.entries(VOLUNTEER_STATUS).map(([k, v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </Select>
      {form.status === "mission_only" && (
        <>
          <Select label="志業體" value={form.missionBody} onChange={set("missionBody")}>
            <option value="">選擇</option>
            {Object.entries(MISSION_BODY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
          {form.missionBody === "other" && (
            <Input label="其他志業體說明" value={form.missionBodyOther} onChange={set("missionBodyOther")} />
          )}
        </>
      )}

      <SectionHeading>和氣互愛協力</SectionHeading>
      <div className="grid grid-cols-3 gap-3">
        <Input label="和氣 HeQi" value={form.heQi} onChange={set("heQi")} placeholder="例：090 西北和氣" />
        <Input label="互愛 HuAi" value={form.huAi} onChange={set("huAi")} placeholder="例：賓達阿南互愛" />
        <Input label="協力 XieLi" value={form.xieLi} onChange={set("xieLi")} placeholder="例：賓達阿南1協力" />
      </div>
      <Input label="住址 Address" value={form.address} onChange={set("address")} className="truncate" />
      {form.address && (
        <a
          href={buildMapHref(form.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
        >
          <MapPin size={14} />在 {mapPlatformLabel(form.address)} 開啟
        </a>
      )}
      <Input
        label="Google Map / Waze 分享連結（如果對方直接分享連結給你）"
        value={form.mapLink}
        onChange={set("mapLink")}
        className="truncate"
      />
      {form.mapLink && (
        <a
          href={buildMapHref(form.mapLink)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
        >
          <MapPin size={14} />在 {mapPlatformLabel(form.mapLink)} 開啟
        </a>
      )}
      <Select label="婚姻狀態 Marital Status" value={form.maritalStatus} onChange={set("maritalStatus")}>
        <option value="">選擇</option>
        {Object.entries(MARITAL_STATUS_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </Select>

      <SectionHeading>家庭情況</SectionHeading>
      <Textarea
        label="家庭情況備註 (例：有80歲父親要照顧)"
        value={form.familyRemarks}
        onChange={set("familyRemarks")}
      />

      <SectionHeading>工作 Profession</SectionHeading>
      <Select label="上班時間 Working hours" value={form.workSchedule} onChange={set("workSchedule")}>
        <option value="">選擇</option>
        {Object.entries(WORK_SCHEDULE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </Select>
      {form.workSchedule === "other" && (
        <Input label="其他上班時間說明" value={form.workScheduleOther} onChange={set("workScheduleOther")} />
      )}
      <Input
        label="職稱 Job Post（退休人士請填退休前職業，例：退休-倉庫管理員）"
        value={form.jobTitle}
        onChange={set("jobTitle")}
      />
      <Input
        label="目前的職業的年資（年）"
        type="number"
        min="0"
        value={form.jobTenure}
        onChange={set("jobTenure")}
      />

      <SectionHeading>可付出做慈濟的時間</SectionHeading>
      <div className="overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th></th>
              {AVAILABILITY_SLOTS.map((s) => (
                <th key={s.key} className="pb-2 text-sm font-bold text-slate-500">{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AVAILABILITY_DAYS.map((d) => (
              <tr key={d.key}>
                <td className="text-left text-sm font-bold text-slate-600 py-1">{d.label}</td>
                {AVAILABILITY_SLOTS.map((s) => (
                  <td key={s.key} className="py-1">
                    <input
                      type="checkbox"
                      checked={form.availability[d.key][s.key]}
                      onChange={() => toggleAvailability(d.key, s.key)}
                      className="w-5 h-5 accent-indigo-600"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Input
        label="可付出的時間備註 (例：每月第2個週末回家鄉)"
        value={form.availabilityRemarks}
        onChange={set("availabilityRemarks")}
      />

      <SectionHeading>是否會開車</SectionHeading>
      <Select label="是否會開車？" value={form.canDrive} onChange={set("canDrive")}>
        <option value="">選擇</option>
        <option value="yes">是 Yes</option>
        <option value="no">否 No</option>
      </Select>
      <Select label="是否有車子（多少人座）" value={form.carSeats} onChange={set("carSeats")}>
        <option value="">選擇</option>
        {Object.entries(CAR_SEATS_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </Select>

      <SectionHeading>承擔</SectionHeading>
      <Input
        label="目前承擔的『四合一』崗位（可同時多個，用逗號分隔，例：互愛訪視幹事, 協力組長）"
        value={form.position4in1}
        onChange={set("position4in1")}
      />
      <Input
        label="目前承擔的其他崗位（例：大精進-生活組-小組長）"
        value={form.positionOther}
        onChange={set("positionOther")}
      />
      <Input
        label="曾經承擔過的任何崗位（例：協力組長-5年，環保點長-2年）"
        value={form.positionHistory}
        onChange={set("positionHistory")}
      />
      <Select label="慈濟身份 TC Identification" value={form.tcIdentification} onChange={set("tcIdentification")}>
        <option value="">選擇</option>
        {Object.entries(TC_IDENTIFICATION_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </Select>
      <Select label="是否有使用傳家寶" value={form.usesFamilyTreasure} onChange={set("usesFamilyTreasure")}>
        <option value="">選擇</option>
        <option value="yes">是 Yes</option>
        <option value="no">否 No</option>
      </Select>
      <Input
        label="直屬/帶動人的名字"
        value={form.mentorName}
        onChange={set("mentorName")}
      />

      <SectionHeading>專長 Expertise</SectionHeading>
      <Input
        label="專長標籤（用逗號分隔，例：司機, 香積, 翻譯）"
        value={form.skills}
        onChange={set("skills")}
      />
      <Input
        label="在慈濟裡最擅長做的事1（例：接引菩薩、福田打掃）"
        value={form.goodAt1}
        onChange={set("goodAt1")}
      />
      <Input label="在慈濟裡最擅長做的事2" value={form.goodAt2} onChange={set("goodAt2")} />
      <Input
        label="未來您有興趣/嘗試在哪個志業崗位/功能付出？"
        value={form.futureInterest}
        onChange={set("futureInterest")}
      />

      <SectionHeading>備註</SectionHeading>
      <Textarea label="備註" value={form.notes} onChange={set("notes")} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
