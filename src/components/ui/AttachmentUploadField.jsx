import { useState } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Loader2 } from "lucide-react";
import { uploadImage, deleteImage } from "../../lib/storage";

function isPdf(url, name) {
  return /\.pdf($|\?)/i.test(url || "") || /\.pdf$/i.test(name || "");
}

export default function AttachmentUploadField({ label = "照片 / PDF（選填）", folder, url, path, name, onChange, onUploadingChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const pdf = isPdf(url, name);

  const setUploadingState = (value) => {
    setUploading(value);
    onUploadingChange?.(value);
  };

  const handleSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploadingState(true);
    try {
      const oldPath = path;
      const result = await uploadImage(file, folder);
      onChange({ url: result.url, path: result.path, name: file.name });
      if (oldPath) await deleteImage(oldPath);
    } catch {
      setError("上傳失敗，請確認 Firebase Storage 設定或再試一次。");
    } finally {
      setUploadingState(false);
    }
  };

  const handleRemove = async () => {
    const oldPath = path;
    onChange({ url: "", path: "", name: "" });
    if (oldPath) await deleteImage(oldPath);
  };

  return (
    <div>
      <span className="block text-base font-bold text-slate-600 mb-2">{label}</span>
      {url ? (
        <div className="relative inline-block">
          {pdf ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 pr-8 pl-4 py-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all"
            >
              <FileText size={22} className="text-rose-500 shrink-0" />
              <span className="text-sm text-slate-600 truncate max-w-[220px]">{name || "PDF 檔案"}</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setZoomed(true); }}
              className="block cursor-zoom-in"
            >
              <img
                src={url}
                alt="預覽"
                draggable={false}
                className="max-h-48 rounded-xl border border-slate-200 hover:opacity-90 transition-opacity pointer-events-none"
              />
            </button>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-all"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-slate-50 cursor-pointer transition-all">
          {uploading ? (
            <Loader2 size={28} className="text-indigo-500 animate-spin" />
          ) : (
            <FileText size={28} className="text-slate-300" />
          )}
          <span className="text-sm text-slate-400">{uploading ? "上傳中…" : "點選上傳照片或 PDF"}</span>
          <input type="file" accept="image/*,.pdf,application/pdf" onChange={handleSelect} disabled={uploading} className="hidden" />
        </label>
      )}
      {error && <p className="text-rose-600 text-sm mt-2 font-bold">{error}</p>}

      {zoomed && !pdf && createPortal(
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <img src={url} alt="預覽（放大）" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
          <button
            type="button"
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-slate-700 hover:bg-white transition-all"
          >
            <X size={20} />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
