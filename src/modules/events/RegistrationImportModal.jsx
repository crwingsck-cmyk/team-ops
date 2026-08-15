import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Upload, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ColumnMappingRow from "../../components/ui/ColumnMappingRow";
import { normalizeForSearch } from "../../lib/chineseSearch";
import { TC_IDENTIFICATION_LABELS, GENDER_LABELS } from "../../constants/categoryStyles";

const TEXT_FIELDS = [
  { key: "name", label: "姓名", required: true, keywords: ["名字", "姓名", "Name"] },
  { key: "phone", label: "電話", keywords: ["電話", "Phone", "聯絡", "联络"] },
  { key: "invitedBy", label: "邀約人姓名", keywords: ["邀約人", "邀约人", "Invited by"] },
  { key: "area", label: "住的地區", keywords: ["住的地區", "住的地区", "地區", "地区", "Area", "Region"] },
  { key: "heQi", label: "和氣", keywords: ["和氣", "HeQi"] },
  { key: "huAi", label: "互愛", keywords: ["互愛", "HuAi"] },
  { key: "xieLi", label: "協力", keywords: ["協力", "XieLi"] },
  { key: "notes", label: "備註", keywords: ["備註", "Remarks", "Notes"] },
];

const TC_MATCHERS = {
  training: ["培訓", "PeiXun", "Training"],
  trainee: ["見習", "Trainee"],
  volunteer: ["志工", "Volunteer"],
  da_de: ["大德", "Da De"],
  tzu_cheng: ["慈誠", "Tzu-Cheng"],
  commissioner: ["委員", "Commissioner"],
};

const GENDER_MATCHERS = {
  male: ["男", "Male"],
  female: ["女", "Female"],
};

function guessColumn(headers, keywords) {
  const hit = headers.find((h) => keywords.some((kw) => normalizeForSearch(h).includes(normalizeForSearch(kw))));
  return hit || "";
}

function guessColumns(headers, keywords, max) {
  return headers.filter((h) => keywords.some((kw) => normalizeForSearch(h).includes(normalizeForSearch(kw)))).slice(0, max);
}

function matchOption(rawValue, matchers) {
  if (!rawValue) return "";
  const value = normalizeForSearch(String(rawValue));
  for (const [key, subs] of Object.entries(matchers)) {
    if (subs.some((s) => value.includes(normalizeForSearch(s)))) return key;
  }
  return "";
}

export default function RegistrationImportModal({ existingRegistrations, onImport, onClose }) {
  const [step, setStep] = useState("upload"); // upload | map | preview | importing | done
  const [sheet, setSheet] = useState(null);
  const [headerRow, setHeaderRow] = useState(1);
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
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

    const guessedDateCols = guessColumns(cols, ["日期", "Date"], 3);
    const initialMapping = {
      tcIdentification: guessColumn(cols, ["慈濟身份", "慈济身份", "TC Identification", "Tzu Chi Status"]),
      gender: guessColumn(cols, ["性別", "性别", "Gender"]),
      attendingDateColumns: [guessedDateCols[0] || "", guessedDateCols[1] || "", guessedDateCols[2] || ""],
      participantCount: guessColumn(cols, ["參與人數", "参与人数", "同行", "participants"]),
    };
    TEXT_FIELDS.forEach((f) => { initialMapping[f.key] = guessColumn(cols, f.keywords); });
    setMapping(initialMapping);
  }, [sheet, headerRow]);

  const existingNames = new Set(existingRegistrations.map((r) => normalizeForSearch(r.name)));

  const buildEntry = (row) => {
    const name = mapping.name ? String(row[mapping.name] || "").trim() : "";
    if (!name) return null;

    const mapped = {};
    TEXT_FIELDS.forEach((f) => {
      const col = mapping[f.key];
      mapped[f.key] = col ? String(row[col] || "").trim() : "";
    });
    const tcIdentification = mapping.tcIdentification
      ? matchOption(row[mapping.tcIdentification], TC_MATCHERS)
      : "";
    const gender = mapping.gender ? matchOption(row[mapping.gender], GENDER_MATCHERS) : "";
    const attendingDates = [];
    (mapping.attendingDateColumns || []).forEach((col) => {
      if (!col) return;
      const raw = String(row[col] || "").trim();
      if (!raw) return;
      const parts = raw.split(/[,、;]/).map((s) => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        // one cell holding several comma-separated dates (multi-select checkbox) — keep each date distinct
        parts.forEach((p) => { if (!attendingDates.includes(p)) attendingDates.push(p); });
      } else {
        // single answer for this column (e.g. a specific day's dinner choice) — keep the column label for context
        const entry = `${col}：${raw}`;
        if (!attendingDates.includes(entry)) attendingDates.push(entry);
      }
    });
    const participantCountRaw = mapping.participantCount ? String(row[mapping.participantCount] || "").trim() : "";
    const participantCount = participantCountRaw ? Number(participantCountRaw.match(/\d+/)?.[0]) || null : null;

    return {
      volunteerId: null,
      name,
      phone: mapped.phone,
      gender,
      tcIdentification,
      invitedBy: mapped.invitedBy,
      area: mapped.area,
      attendingDates,
      participantCount,
      heQi: mapped.heQi,
      huAi: mapped.huAi,
      xieLi: mapped.xieLi,
      notes: mapped.notes,
      status: "registered",
      alreadyRegistered: existingNames.has(normalizeForSearch(name)),
    };
  };

  const preview = step === "preview" ? rows.map(buildEntry).filter(Boolean) : [];
  const toImport = preview.filter((p) => !p.alreadyRegistered);
  const skippedCount = preview.length - toImport.length;

  const runImport = async () => {
    setStep("importing");
    setProgress({ done: 0, total: toImport.length });
    for (const entry of toImport) {
      const { alreadyRegistered, ...data } = entry;
      await onImport(data);
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setStep("done");
  };

  return (
    <div className="space-y-4">
      {step === "upload" && (
        <div>
          <label
            htmlFor="registration-import-file"
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
            <p className="text-slate-400 text-sm mb-4">或點選這裡瀏覽檔案（.xlsx / .csv，例如 Google Form 匯出的回覆）</p>
            <input
              id="registration-import-file"
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
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 items-center">
            <span className="text-sm font-bold text-slate-600">欄位標題在第幾列？</span>
            <Input
              type="number"
              min="1"
              value={headerRow}
              onChange={(e) => setHeaderRow(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          {headers.length === 0 ? (
            <p className="text-rose-600 text-sm font-bold">這一列讀不到欄位標題，請調整上面的列號。</p>
          ) : (
            <p className="text-slate-500">
              這裡匯入的資料不會比對志工資料庫，Excel 裡有什麼就直接建立成報名記錄。
            </p>
          )}

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

          <ColumnMappingRow
            label="性別"
            headers={headers}
            value={mapping.gender}
            onChange={(v) => setMapping({ ...mapping, gender: v })}
          />
          <p className="text-xs text-slate-400 -mt-2">性別可對應到：{Object.values(GENDER_LABELS).join("、")}</p>

          <ColumnMappingRow
            label="慈濟身份"
            headers={headers}
            value={mapping.tcIdentification}
            onChange={(v) => setMapping({ ...mapping, tcIdentification: v })}
          />
          <p className="text-xs text-slate-400 -mt-2">慈濟身份可對應到：{Object.values(TC_IDENTIFICATION_LABELS).map((v) => v.split(" ")[0]).join("、")}</p>

          <p className="text-sm font-bold text-slate-600 -mb-2">
            參與日期（最多對應 3 欄，例如星期五/六/日各一欄。每欄會記錄成「欄位標題：回答內容」，例如「星期五報名：報名加晚餐」）
          </p>
          {[0, 1, 2].map((i) => (
            <ColumnMappingRow
              key={i}
              label={`參與日期 ${i + 1}`}
              headers={headers}
              value={mapping.attendingDateColumns?.[i]}
              onChange={(v) => {
                const next = [...(mapping.attendingDateColumns || ["", "", ""])];
                next[i] = v;
                setMapping({ ...mapping, attendingDateColumns: next });
              }}
            />
          ))}

          <ColumnMappingRow
            label="同行人數（含本人）"
            headers={headers}
            value={mapping.participantCount}
            onChange={(v) => setMapping({ ...mapping, participantCount: v })}
          />

          <div className="flex justify-between pt-2">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => setStep("upload")}>上一步</Button>
            <Button icon={ArrowRight} disabled={!mapping.name} onClick={() => setStep("preview")}>
              預覽（共 {rows.length} 筆）
            </Button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <p className="text-slate-500">
            共 {preview.length} 筆，其中 {toImport.length} 筆可匯入
            {skippedCount > 0 && `，${skippedCount} 筆已經在報名名單裡跳過`}。
          </p>
          <div className="max-h-[45vh] overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
            {toImport.length === 0 ? (
              <p className="px-4 py-6 text-center text-slate-400 italic">沒有新的名單可以匯入</p>
            ) : (
              toImport.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="font-bold text-slate-800">{p.name}</span>
                  <span className="text-slate-400 text-sm">{p.phone}</span>
                  {p.participantCount > 1 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">共 {p.participantCount} 人</span>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => setStep("map")}>上一步</Button>
            <Button onClick={runImport} disabled={toImport.length === 0}>確認匯入 {toImport.length} 位</Button>
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
          <p className="text-slate-700 font-bold mb-4">已成功匯入 {progress.total} 位報名。</p>
          <Button onClick={onClose}>完成</Button>
        </div>
      )}
    </div>
  );
}
