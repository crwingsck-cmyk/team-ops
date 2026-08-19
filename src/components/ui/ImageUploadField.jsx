import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadImage, deleteImage } from "../../lib/storage";

export default function ImageUploadField({ label = "照片 / Poster（選填）", folder, url, path, onChange, onUploadingChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const [dragging, setDragging] = useState(false);

  const setUploadingState = (value) => {
    setUploading(value);
    onUploadingChange?.(value);
  };

  const handleFile = async (file) => {
    if (!file || !file.type?.startsWith("image/")) return;
    setError("");
    setUploadingState(true);
    try {
      const oldPath = path;
      const result = await uploadImage(file, folder);
      onChange({ url: result.url, path: result.path });
      if (oldPath) await deleteImage(oldPath);
    } catch {
      setError("上傳失敗，請確認 Firebase Storage 設定或再試一次。");
    } finally {
      setUploadingState(false);
    }
  };

  const handleSelect = (e) => handleFile(e.target.files?.[0]);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!uploading) setDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (uploading) return;
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleRemove = async () => {
    const oldPath = path;
    onChange({ url: "", path: "" });
    if (oldPath) await deleteImage(oldPath);
  };

  return (
    <div>
      <span className="block text-base font-bold text-slate-600 mb-2">{label}</span>
      {url ? (
        <div
          className="relative inline-block"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setZoomed(true); }}
            className="block cursor-zoom-in"
          >
            <img
              src={url}
              alt="預覽"
              draggable={false}
              className={`max-h-48 rounded-xl border transition-opacity pointer-events-none ${dragging ? "border-indigo-400 opacity-60" : "border-slate-200 hover:opacity-90"}`}
            />
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-all"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}`}
        >
          {uploading ? (
            <Loader2 size={28} className="text-indigo-500 animate-spin" />
          ) : (
            <ImageIcon size={28} className="text-slate-300" />
          )}
          <span className="text-sm text-slate-400">{uploading ? "上傳中…" : "點選或拖曳照片到這裡上傳"}</span>
          <input type="file" accept="image/*" onChange={handleSelect} disabled={uploading} className="hidden" />
        </label>
      )}
      {error && <p className="text-rose-600 text-sm mt-2 font-bold">{error}</p>}

      {zoomed && createPortal(
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
