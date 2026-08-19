import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import AttachmentUploadField from "../../components/ui/AttachmentUploadField";

const EMPTY = {
  date: "",
  time: "",
  location: "",
  eventType: "",
  heQi: "",
  huAi: "",
  xieLi: "",
  amount: "",
  volunteerCount: "",
  guestCount: "",
  submittedBy: "",
  attachmentUrl: "",
  attachmentPath: "",
  attachmentName: "",
  story: "",
};

export default function FundraisingEventForm({ initial, heQiOptions = [], huAiOptions = [], xieLiOptions = [], onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial } : EMPTY);
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      amount: form.amount === "" ? 0 : Number(form.amount),
      volunteerCount: form.volunteerCount === "" ? 0 : Number(form.volunteerCount),
      guestCount: form.guestCount === "" ? 0 : Number(form.guestCount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="日期" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Input label="時間" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="地點" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <Input
          label="活動形式"
          placeholder="例：園遊會、感恩會"
          value={form.eventType}
          onChange={(e) => setForm({ ...form, eventType: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select label="和氣" value={form.heQi} onChange={(e) => setForm({ ...form, heQi: e.target.value })}>
          <option value="">未選擇</option>
          {heQiOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </Select>
        <Select label="互愛" value={form.huAi} onChange={(e) => setForm({ ...form, huAi: e.target.value })}>
          <option value="">未選擇</option>
          {huAiOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </Select>
        <Select label="協力" value={form.xieLi} onChange={(e) => setForm({ ...form, xieLi: e.target.value })}>
          <option value="">未選擇</option>
          {xieLiOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </Select>
      </div>
      <Input label="募款金額" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="出席志工人數"
          type="number"
          min="0"
          value={form.volunteerCount}
          onChange={(e) => setForm({ ...form, volunteerCount: e.target.value })}
        />
        <Input
          label="出席大德人數"
          type="number"
          min="0"
          value={form.guestCount}
          onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
        />
      </div>
      <Input label="填表者" value={form.submittedBy} onChange={(e) => setForm({ ...form, submittedBy: e.target.value })} />

      <AttachmentUploadField
        folder="fundraisingEvents"
        url={form.attachmentUrl}
        path={form.attachmentPath}
        name={form.attachmentName}
        onChange={({ url, path, name }) => setForm((f) => ({ ...f, attachmentUrl: url, attachmentPath: path, attachmentName: name }))}
        onUploadingChange={setUploading}
      />

      <Textarea
        label="溫馨故事（選填）"
        placeholder="記錄這場活動募款背後的溫馨小故事..."
        value={form.story}
        onChange={(e) => setForm({ ...form, story: e.target.value })}
        rows={4}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit" disabled={uploading}>儲存</Button>
      </div>
    </form>
  );
}
