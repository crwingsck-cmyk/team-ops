import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Upload, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ColumnMappingRow from "../../components/ui/ColumnMappingRow";
import { normalizeForSearch } from "../../lib/chineseSearch";
import { TC_IDENTIFICATION_LABELS, REGISTRATION_STATUS } from "../../constants/categoryStyles";

const TEXT_FIELDS = [
  { key: "name", label: "姓名", required: true, keywords: ["名字", "姓名", "Name"] },
  { key: "phone", label: "電話", keywords: ["電話", "Phone", "聯絡"] },
  { key: "area", label: "住的地區", keywords: ["地區", "地址", "Address", "Area"] },
  { key: "inviterName", label: "邀約人姓名", keywords: ["邀約人姓名", "邀約人", "Inviter"] },
  { key: "inviterPhone", label: "邀約人電話", keywords: ["邀約人電話", "Inviter Phone"] },
  { key: "childrenCount", label: "帶小孩或家人人數", keywords: ["小孩", "家人人數", "Children"] },
  { key: "notes", label: "備註", keywords: ["備註", "Notes"] },
];

const SELECT_FIELDS = [
  { key: "tcIdentification", label: "實際身份", options: TC_IDENTIFICATION_LABELS, keywords: ["身份", "Identification"],
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
  { key: "status", label: "狀態", options: Object.fromEntries(Object.entries(REGISTRATION_STATUS).map(([k, v]) => [k, v.label])), keywords: ["狀態", "Status"],
    matchers: {
      registered: ["已報名", "確認", "Registered", "Confirmed"],
      waitlisted: ["考慮中", "候補", "Waitlist"],
      cancelled: ["無法出席", "取消", "Cancelled"],
    } },
];

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

export default function RegistrationImportModal({ onImport, onClose }) {
  const [step, setStep] = useState("upload"); // upload | map | preview | importing | done
  const [sheet, setSheet] = useState(null);
  const [headerRow, setHeaderRow] = useState(1);
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
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
  }, [sheet, headerRow]);

  const buildRegistration = (row) => {
    const data = { volunteerId: null, status: "registered", tcIdentification: "da_de" };
    TEXT_FIELDS.forEach((f) => {
      const col = mapping[f.key];
      data[f.key] = col ? String(row[col] || "").trim() : "";
    });
    data.childrenCount = data.childrenCount === "" ? 0 : Number(data.childrenCount) || 0;

    SELECT_FIELDS.forEach((f) => {
      const col = mapping[f.key];
      const raw = col ? row[col] : "";
      const matched = matchOption(raw, f.matchers);
      if (matched) data[f.key] = matched;
    });
    return data;
  };

  const preview = step === "preview" ? rows.map(buildRegistration) : [];
  const validPreview = preview.filter((r) => r.name);
  const skippedCount = preview.length - validPreview.length;

  const runImport = async () => {
    setStep("importing");
    const toImport = rows.map(buildRegistration).filter((r) => r.name);
    setProgress({ done: 0, total: toImport.length });
    for (const data of toImport) {
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
            <p className="text-slate-400 text-sm mb-4">或點選這裡瀏覽檔案（.xlsx / .csv）</p>
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
          </p>
          <div className="max-h-[45vh] overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
            {validPreview.slice(0, 50).map((r, i) => (
              <div key={i} className="px-4 py-2 text-sm">
                <span className="font-bold text-slate-800">{r.name}</span>
                <span className="text-slate-400 ml-2">{r.phone} {r.area}</span>
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
          <p className="text-slate-700 font-bold mb-4">已成功匯入 {progress.total} 筆報名資料。</p>
          <Button onClick={onClose}>完成</Button>
        </div>
      )}
    </div>
  );
}
