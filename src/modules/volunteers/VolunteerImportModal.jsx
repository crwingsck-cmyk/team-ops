import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Upload, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ColumnMappingRow from "../../components/ui/ColumnMappingRow";
import { normalizeForSearch } from "../../lib/chineseSearch";
import {
  AVAILABILITY_DAYS,
  AVAILABILITY_SLOTS,
  MARITAL_STATUS_LABELS,
  WORK_SCHEDULE_LABELS,
  CAR_SEATS_LABELS,
  TC_IDENTIFICATION_LABELS,
  GENDER_LABELS,
} from "../../constants/categoryStyles";

const TEXT_FIELDS = [
  { key: "name", label: "姓名", required: true, keywords: ["名字", "姓名", "Name"] },
  { key: "englishName", label: "英文名字", keywords: ["英文名字", "English Name"] },
  { key: "age", label: "年齡", keywords: ["年齡", "Age"] },
  { key: "phone", label: "電話", keywords: ["電話", "Phone"] },
  { key: "email", label: "Email", keywords: ["Email", "電郵"] },
  { key: "memberId", label: "會員編號", keywords: ["會員編號", "Member ID", "志工編號"] },
  { key: "address", label: "住址", keywords: ["住址", "Address"] },
  { key: "heQi", label: "和氣", keywords: ["和氣", "HeQi"] },
  { key: "huAi", label: "互愛", keywords: ["互愛", "HuAi"] },
  { key: "xieLi", label: "協力", keywords: ["協力", "XieLi"] },
  { key: "familyRemarks", label: "家庭情況備註", keywords: ["家庭情況", "Family"] },
  { key: "jobTitle", label: "職稱", keywords: ["職稱", "Job Post"] },
  { key: "jobTenure", label: "職業年資", keywords: ["年資", "years"] },
  { key: "workScheduleOther", label: "其他上班時間說明", keywords: ["其他:"] },
  { key: "availabilityRemarks", label: "可付出的時間備註", keywords: ["時間備註", "Remarks"] },
  { key: "position4in1", label: "四合一崗位", keywords: ["四合一"] },
  { key: "positionOther", label: "其他崗位", keywords: ["其他崗位"] },
  { key: "positionHistory", label: "曾任崗位", keywords: ["曾經承擔"] },
  { key: "skills", label: "專長標籤（逗號分隔）", keywords: ["專長 1", "專長1", "Expertise 1"] },
  { key: "goodAt1", label: "最擅長做的事1", keywords: ["最擅長做的事1", "doing... (eg"] },
  { key: "goodAt2", label: "最擅長做的事2", keywords: ["最擅長做的事2"] },
  { key: "futureInterest", label: "未來志業興趣", keywords: ["未來您有興趣"] },
  { key: "notes", label: "備註", keywords: ["備註"] },
];

const SELECT_FIELDS = [
  { key: "gender", label: "性別", options: GENDER_LABELS, keywords: ["性別", "Gender"],
    matchers: { male: ["男", "Male"], female: ["女", "Female"] } },
  { key: "maritalStatus", label: "婚姻狀態", options: MARITAL_STATUS_LABELS, keywords: ["婚姻狀態", "Marital"],
    matchers: { single: ["未婚", "Single"], married: ["已婚", "Married"], other: ["其他"] } },
  { key: "workSchedule", label: "上班時間", options: WORK_SCHEDULE_LABELS, keywords: ["上班時間", "Working hours"],
    matchers: {
      mon_fri: ["週一至週五", "Monday to Friday"],
      mon_sat: ["週一至週六", "Monday to Saturday"],
      sat_sun: ["週六&週日", "Saturday to Sunday"],
      flexible: ["自由時間", "Flexible"],
      not_working: ["沒有上班", "Not working"],
      other: ["其他"],
    } },
  { key: "canDrive", label: "是否會開車", options: { yes: "是 Yes", no: "否 No" }, keywords: ["是否會開車", "know driving"],
    matchers: { yes: ["是"], no: ["否"] } },
  { key: "carSeats", label: "車子座位數", options: CAR_SEATS_LABELS, keywords: ["多少人座", "How many seats"],
    matchers: { na: ["沒有", "NA"], "5": ["5人座", "5 seater"], "6": ["6人座", "6 seater"], "7_8": ["7至8人座", "7-8 seater"], "9_plus": ["9人座", "9 seater"] } },
  { key: "tcIdentification", label: "慈濟身份", options: TC_IDENTIFICATION_LABELS, keywords: ["慈濟身份", "TC Identification"],
    matchers: {
      training: ["培訓", "PeiXun", "Training"],
      trainee: ["見習", "Trainee"],
      volunteer: ["志工", "Volunteer"],
      da_de: ["大德", "Da De"],
      tzu_cheng: ["慈誠", "Tzu-Cheng"],
      commissioner: ["委員", "Commissioner"],
      zi_qing: ["慈青", "Tzu Ching"],
      zi_shao: ["慈少", "Tzu Shao"],
    } },
];

const DAY_KEYWORDS = {
  mon: ["星期一", "Monday"],
  tue: ["星期二", "Tuesday"],
  wed: ["星期三", "Wednesday"],
  thu: ["星期四", "Thursday"],
  fri: ["星期五", "Friday"],
  sat: ["星期六", "Saturday"],
  sun: ["星期日", "Sunday"],
};

function guessColumn(headers, keywords) {
  const hit = headers.find((h) => keywords.some((kw) => normalizeForSearch(h).includes(normalizeForSearch(kw))));
  return hit || "";
}

function matchOption(rawValue, matchers) {
  if (!rawValue) return "";
  const value = normalizeForSearch(String(rawValue));
  for (const [key, subs] of Object.entries(matchers)) {
    if (subs.some((s) => value.includes(normalizeForSearch(s)))) return key;
  }
  return "";
}

function containsAny(value, subs) {
  if (!value) return false;
  const v = normalizeForSearch(String(value));
  return subs.some((s) => v.includes(normalizeForSearch(s)));
}

export default function VolunteerImportModal({ onImport, onUpdate, existingVolunteers = [], onClose }) {
  const [step, setStep] = useState("upload"); // upload | map | preview | importing | done
  const [sheet, setSheet] = useState(null);
  const [headerRow, setHeaderRow] = useState(1);
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [dayMapping, setDayMapping] = useState({});
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      setSheet(ws);
      setHeaderRow(1);
      setStep("map");
    } catch {
      setError("無法讀取這個檔案，請確認是 .xlsx 或 .csv 格式。");
    }
  };

  useEffect(() => {
    if (!sheet) return;
    const asRows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false, range: Math.max(0, headerRow - 1) });
    const cols = asRows.length > 0 ? Object.keys(asRows[0]) : [];
    setHeaders(cols);
    setRows(asRows);

    const initialMapping = {};
    TEXT_FIELDS.forEach((f) => { initialMapping[f.key] = guessColumn(cols, f.keywords); });
    SELECT_FIELDS.forEach((f) => { initialMapping[f.key] = guessColumn(cols, f.keywords); });
    setMapping(initialMapping);

    const initialDayMapping = {};
    AVAILABILITY_DAYS.forEach((d) => {
      initialDayMapping[d.key] = guessColumn(cols, DAY_KEYWORDS[d.key]);
    });
    setDayMapping(initialDayMapping);
  }, [sheet, headerRow]);

  const volunteersByMemberId = useMemo(() => {
    const map = new Map();
    existingVolunteers.forEach((v) => {
      if (v.memberId && String(v.memberId).trim()) map.set(normalizeForSearch(String(v.memberId).trim()), v);
    });
    return map;
  }, [existingVolunteers]);

  const volunteersByNamePhone = useMemo(() => {
    const map = new Map();
    existingVolunteers.forEach((v) => {
      if (v.name && v.phone) map.set(`${normalizeForSearch(v.name.trim())}|${v.phone.trim()}`, v);
    });
    return map;
  }, [existingVolunteers]);

  const findMatch = (data) => {
    if (data.memberId) {
      const m = volunteersByMemberId.get(normalizeForSearch(data.memberId.trim()));
      if (m) return m;
    }
    if (data.name && data.phone) {
      const m = volunteersByNamePhone.get(`${normalizeForSearch(data.name.trim())}|${data.phone.trim()}`);
      if (m) return m;
    }
    return null;
  };

  const buildVolunteer = (row) => {
    const data = { status: "active" };
    TEXT_FIELDS.forEach((f) => {
      const col = mapping[f.key];
      data[f.key] = col ? String(row[col] || "").trim() : "";
    });
    if (data.skills) {
      data.skills = data.skills.split(/[,、]/).map((s) => s.trim()).filter(Boolean);
    } else {
      data.skills = [];
    }
    data.position4in1 = data.position4in1 ? data.position4in1.split(/[,、]/).map((s) => s.trim()).filter(Boolean) : [];
    if (!data.name && data.englishName) data.name = data.englishName;

    SELECT_FIELDS.forEach((f) => {
      const col = mapping[f.key];
      const raw = col ? row[col] : "";
      data[f.key] = matchOption(raw, f.matchers);
    });
    if (!data.tcIdentification && mapping.tcIdentification) {
      const rawTc = String(row[mapping.tcIdentification] || "");
      if (rawTc.includes("慈委")) {
        data.tcIdentification = data.gender === "male" ? "tzu_cheng" : data.gender === "female" ? "commissioner" : "";
      }
    }

    const availability = {};
    AVAILABILITY_DAYS.forEach((d) => {
      const col = dayMapping[d.key];
      const raw = col ? row[col] : "";
      availability[d.key] = {
        morning: containsAny(raw, ["早", "Morning"]),
        afternoon: containsAny(raw, ["午", "Afternoon"]),
        night: containsAny(raw, ["晚", "Night"]),
      };
    });
    data.availability = availability;

    const matched = findMatch(data);
    data._matchedId = matched ? matched.id : null;
    return data;
  };

  const preview = step === "preview" ? rows.map(buildVolunteer) : [];
  const validPreview = preview.filter((v) => v.name);
  const skippedCount = preview.length - validPreview.length;
  const updateCount = validPreview.filter((v) => v._matchedId).length;

  // For updates, only overwrite fields that actually have a value in this row —
  // an updated row with blank/unmapped columns should never erase previously-entered profile data.
  const nonEmptyOnly = (data) => {
    const result = {};
    Object.entries(data).forEach(([key, value]) => {
      if (key === "_matchedId" || value === "" || value === null || value === undefined) return;
      if (Array.isArray(value) && value.length === 0) return;
      if (key === "availability" && !Object.values(value).some((d) => d.morning || d.afternoon || d.night)) return;
      result[key] = value;
    });
    return result;
  };

  const runImport = async () => {
    setStep("importing");
    const toImport = rows.map(buildVolunteer).filter((v) => v.name);
    setProgress({ done: 0, total: toImport.length });
    for (const item of toImport) {
      if (item._matchedId) {
        await onUpdate(item._matchedId, nonEmptyOnly(item));
      } else {
        const { _matchedId, ...data } = item;
        await onImport(data);
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setStep("done");
  };

  return (
    <div className="space-y-4">
      {step === "upload" && (
        <div>
          <label
            htmlFor="volunteer-import-file"
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`block text-center py-12 px-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
              dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
            }`}
          >
            <Upload className={`mx-auto mb-4 ${dragActive ? "text-indigo-500" : "text-slate-300"}`} size={48} />
            <p className="text-slate-600 font-bold mb-1">把 Excel 檔案拖曳到這裡</p>
            <p className="text-slate-400 text-sm mb-4">或點選這裡瀏覽檔案（.xlsx / .csv）</p>
            <input
              id="volunteer-import-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
          </label>
          {error && <p className="text-rose-600 mt-3 font-bold text-center">{error}</p>}
        </div>
      )}

      {step === "map" && (
        <div>
          <div className="grid grid-cols-2 gap-2 items-center mb-3">
            <span className="text-sm font-bold text-slate-600">欄位標題在第幾列？</span>
            <Input
              type="number"
              min="1"
              value={headerRow}
              onChange={(e) => setHeaderRow(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          {headers.length === 0 ? (
            <p className="text-rose-600 text-sm font-bold mb-3">這一列讀不到欄位標題，請調整上面的列號。</p>
          ) : (
            <p className="text-slate-500 mb-4">確認每個欄位對應到 Excel 的哪一欄（已自動猜測，可自行調整）。找不到就選「不匯入」。</p>
          )}

          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {TEXT_FIELDS.map((f) => (
              <ColumnMappingRow
                key={f.key}
                label={f.label}
                required={f.required}
                headers={headers}
                value={mapping[f.key]}
                onChange={(v) => setMapping({ ...mapping, [f.key]: v })}
              />
            ))}
            {SELECT_FIELDS.map((f) => (
              <ColumnMappingRow
                key={f.key}
                label={f.label}
                headers={headers}
                value={mapping[f.key]}
                onChange={(v) => setMapping({ ...mapping, [f.key]: v })}
              />
            ))}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-sm font-black text-indigo-600">可付出時間（每天一欄）</span>
            </div>
            {AVAILABILITY_DAYS.map((d) => (
              <ColumnMappingRow
                key={d.key}
                label={d.label}
                headers={headers}
                value={dayMapping[d.key]}
                onChange={(v) => setDayMapping({ ...dayMapping, [d.key]: v })}
              />
            ))}
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => setStep("upload")}>上一步</Button>
            <Button
              icon={ArrowRight}
              disabled={!mapping.name}
              onClick={() => setStep("preview")}
            >
              預覽（共 {rows.length} 筆）
            </Button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div>
          <p className="text-slate-500 mb-4">
            共 {preview.length} 筆，其中 {validPreview.length} 筆有姓名可匯入
            {skippedCount > 0 && `，${skippedCount} 筆因缺少姓名將被跳過`}。
            會員編號或姓名+電話對應到現有志工的會更新既有資料（{updateCount} 筆），其餘新增（{validPreview.length - updateCount} 筆）。
          </p>
          <div className="max-h-[45vh] overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
            {validPreview.slice(0, 50).map((v, i) => (
              <div key={i} className="px-4 py-2 text-sm">
                <span className="font-bold text-slate-800">{v.name}</span>
                {v._matchedId ? (
                  <span className="ml-2 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs font-bold">更新既有資料</span>
                ) : (
                  <span className="ml-2 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold">新增</span>
                )}
                <span className="text-slate-400 ml-2">{v.phone} {v.address}</span>
              </div>
            ))}
            {validPreview.length > 50 && (
              <div className="px-4 py-2 text-sm text-slate-400 italic">...還有 {validPreview.length - 50} 筆</div>
            )}
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => setStep("map")}>上一步</Button>
            <Button onClick={runImport} disabled={validPreview.length === 0}>
              確認匯入 {validPreview.length} 筆
            </Button>
          </div>
        </div>
      )}

      {step === "importing" && (
        <div className="text-center py-8">
          <p className="text-slate-600 font-bold mb-2">匯入中… {progress.done} / {progress.total}</p>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-3 transition-all"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="text-center py-8">
          <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={48} />
          <p className="text-slate-700 font-bold mb-4">已成功匯入 {progress.total} 筆志工資料。</p>
          <Button onClick={onClose}>完成</Button>
        </div>
      )}
    </div>
  );
}
