import { useState } from "react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";

export default function RegistrationForm({ volunteers, onSubmit, onCancel }) {
  const [volunteerId, setVolunteerId] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");

  const handleVolunteerChange = (id) => {
    setVolunteerId(id);
    const v = volunteers.find((vol) => vol.id === id);
    if (v) {
      setName(v.name);
      setContact(v.phone || v.email || "");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      volunteerId: volunteerId || null,
      name,
      contact,
      notes,
      status: "registered",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {volunteers.length > 0 && (
        <Select label="從志工資料庫選取（選填）" value={volunteerId} onChange={(e) => handleVolunteerChange(e.target.value)}>
          <option value="">（非志工 / 手動輸入）</option>
          {volunteers.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </Select>
      )}
      <Input label="姓名" required value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="聯絡方式" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="電話或 Email" />
      <Textarea label="備註" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">確認報名</Button>
      </div>
    </form>
  );
}
