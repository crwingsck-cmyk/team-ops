import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import Badge from "../../components/ui/Badge";
import {
  VOLUNTEER_STATUS,
  TC_IDENTIFICATION_LABELS,
  GENDER_LABELS,
  MISSION_BODY_LABELS,
  MARITAL_STATUS_LABELS,
  WORK_SCHEDULE_LABELS,
  CAR_SEATS_LABELS,
  AVAILABILITY_DAYS,
  AVAILABILITY_SLOTS,
} from "../../constants/categoryStyles";
import { buildMapHref, mapPlatformLabel } from "../../lib/maps";

function hasValue(v) {
  return v !== undefined && v !== null && v !== "";
}

function anyValue(...values) {
  return values.some(hasValue);
}

function SectionHeading({ children }) {
  return (
    <h4 className="text-sm font-black uppercase tracking-wide text-indigo-600 pt-4 border-t border-slate-100 first:border-t-0 first:pt-0">
      {children}
    </h4>
  );
}

function CollapsibleSection({ title, hasContent, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-slate-100 first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 pt-4 pb-1.5 text-left"
      >
        <span className="text-sm font-black uppercase tracking-wide text-indigo-600">{title}</span>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && (hasContent ? children : <p className="text-sm text-slate-400 italic pb-1.5">尚未填寫</p>)}
    </div>
  );
}

function Field({ label, children }) {
  if (!hasValue(children)) return null;
  return (
    <div className="py-1.5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-base text-slate-800">{children}</p>
    </div>
  );
}

function availabilityText(availability) {
  if (!availability) return "";
  const parts = [];
  AVAILABILITY_DAYS.forEach((d) => {
    const slots = AVAILABILITY_SLOTS.filter((s) => availability[d.key]?.[s.key]).map((s) => s.label);
    if (slots.length > 0) parts.push(`${d.label}（${slots.join("、")}）`);
  });
  return parts.join("、");
}

export default function VolunteerDetail({ volunteer: v }) {
  const positions = Array.isArray(v.position4in1) ? v.position4in1.join("、") : v.position4in1;
  const skills = Array.isArray(v.skills) ? v.skills.join("、") : v.skills;
  const availabilitySummary = availabilityText(v.availability);
  const canDriveText = v.canDrive === "yes" ? "是" : v.canDrive === "no" ? "否" : "";
  const usesFamilyTreasureText = v.usesFamilyTreasure === "yes" ? "是" : v.usesFamilyTreasure === "no" ? "否" : "";
  const missionBodyText = v.status === "mission_only"
    ? (v.missionBody === "other" ? v.missionBodyOther : MISSION_BODY_LABELS[v.missionBody])
    : "";

  const tcIdentificationText = v.tcIdentification ? TC_IDENTIFICATION_LABELS[v.tcIdentification] : "";

  const showBasic = anyValue(
    v.age, v.gender, v.phone, v.email, v.memberId, v.joinDate, missionBodyText,
    tcIdentificationText, usesFamilyTreasureText, v.mentorName
  );
  const showHeQi = anyValue(v.heQi, v.huAi, v.xieLi, v.address, v.mapLink);
  const showFamily = anyValue(v.maritalStatus, v.familyRemarks);
  const showWork = anyValue(v.workSchedule, v.jobTitle, v.jobTenure);
  const showAvailability = anyValue(availabilitySummary, v.availabilityRemarks);
  const showDriving = anyValue(canDriveText, v.carSeats);
  const showPositions = anyValue(positions, v.positionOther, v.positionHistory);
  const showExpertise = anyValue(skills, v.goodAt1, v.goodAt2, v.futureInterest);
  const showNotes = anyValue(v.notes);

  return (
    <div>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-black italic text-slate-800 text-2xl">{v.name}</h3>
          {v.englishName && <p className="text-sm text-slate-500">{v.englishName}</p>}
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {v.status && VOLUNTEER_STATUS[v.status] && (
            <Badge tone={VOLUNTEER_STATUS[v.status]}>{VOLUNTEER_STATUS[v.status].label}</Badge>
          )}
          {v.tcIdentification && (
            <Badge tone={{ bg: "bg-indigo-100", text: "text-indigo-700" }}>
              {TC_IDENTIFICATION_LABELS[v.tcIdentification]?.split(" ")[0]}
            </Badge>
          )}
        </div>
      </div>

      <SectionHeading>基本資料</SectionHeading>
      {showBasic ? (
        <>
          <Field label="年齡">{v.age}</Field>
          <Field label="性別">{v.gender && GENDER_LABELS[v.gender]}</Field>
          <Field label="電話">{v.phone}</Field>
          <Field label="Email">{v.email}</Field>
          <Field label="會員編號">{v.memberId}</Field>
          <Field label="加入日期">{v.joinDate}</Field>
          <Field label="志業體">{missionBodyText}</Field>
          <Field label="慈濟身份">{tcIdentificationText}</Field>
          <Field label="是否有使用傳家寶">{usesFamilyTreasureText}</Field>
          <Field label="直屬/帶動人的名字">{v.mentorName}</Field>
        </>
      ) : (
        <p className="text-sm text-slate-400 italic pb-1.5">尚未填寫</p>
      )}

      <CollapsibleSection title="和氣互愛協力" hasContent={showHeQi}>
        <Field label="和氣">{v.heQi}</Field>
        <Field label="互愛">{v.huAi}</Field>
        <Field label="協力">{v.xieLi}</Field>
        <Field label="住址">
          {v.address && (
            <span className="flex items-center gap-1.5">
              {v.address}
              <a
                href={buildMapHref(v.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline text-sm shrink-0 flex items-center gap-1"
              >
                <MapPin size={13} />{mapPlatformLabel(v.address)}
              </a>
            </span>
          )}
        </Field>
        <Field label="Google Map / Waze 分享連結">
          {v.mapLink && (
            <a
              href={buildMapHref(v.mapLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline text-sm flex items-center gap-1"
            >
              <MapPin size={13} />在 {mapPlatformLabel(v.mapLink)} 開啟
            </a>
          )}
        </Field>
      </CollapsibleSection>

      <CollapsibleSection title="家庭情況" hasContent={showFamily}>
        <Field label="婚姻狀態">{v.maritalStatus && MARITAL_STATUS_LABELS[v.maritalStatus]}</Field>
        <Field label="家庭情況備註">{v.familyRemarks}</Field>
      </CollapsibleSection>

      <CollapsibleSection title="工作" hasContent={showWork}>
        <Field label="上班時間">
          {v.workSchedule === "other" ? v.workScheduleOther : WORK_SCHEDULE_LABELS[v.workSchedule]}
        </Field>
        <Field label="職稱">{v.jobTitle}</Field>
        <Field label="目前職業年資">{v.jobTenure && `${v.jobTenure} 年`}</Field>
      </CollapsibleSection>

      <CollapsibleSection title="可付出做慈濟的時間" hasContent={showAvailability}>
        <Field label="可付出時間">{availabilitySummary}</Field>
        <Field label="可付出時間備註">{v.availabilityRemarks}</Field>
      </CollapsibleSection>

      <CollapsibleSection title="是否會開車" hasContent={showDriving}>
        <Field label="是否會開車">{canDriveText}</Field>
        <Field label="是否有車子">{v.carSeats && CAR_SEATS_LABELS[v.carSeats]}</Field>
      </CollapsibleSection>

      <CollapsibleSection title="承擔" hasContent={showPositions}>
        <Field label="目前承擔的『四合一』崗位">{positions}</Field>
        <Field label="目前承擔的其他崗位">{v.positionOther}</Field>
        <Field label="曾經承擔過的崗位">{v.positionHistory}</Field>
      </CollapsibleSection>

      <CollapsibleSection title="專長" hasContent={showExpertise}>
        <Field label="專長標籤">{skills}</Field>
        <Field label="最擅長做的事1">{v.goodAt1}</Field>
        <Field label="最擅長做的事2">{v.goodAt2}</Field>
        <Field label="未來有興趣付出的崗位">{v.futureInterest}</Field>
      </CollapsibleSection>

      <CollapsibleSection title="備註" hasContent={showNotes}>
        <Field label="備註">{v.notes}</Field>
      </CollapsibleSection>
    </div>
  );
}
