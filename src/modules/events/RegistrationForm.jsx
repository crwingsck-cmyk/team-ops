import { useState } from "react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import { TC_IDENTIFICATION_LABELS, REGISTRATION_STATUS, registrationStatusSelectClass } from "../../constants/categoryStyles";

export default function RegistrationForm({ onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tcIdentification, setTcIdentification] = useState("da_de");
  const [heQi, setHeQi] = useState("");
  const [huAi, setHuAi] = useState("");
  const [xieLi, setXieLi] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState("registered");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      volunteerId: null,
      name,
      phone,
      tcIdentification,
      heQi,
      huAi,
      xieLi,
      area,
      notes,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="名字" required value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="電話號碼" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Select label="實際身份" value={tcIdentification} onChange={(e) => setTcIdentification(e.target.value)}>
        {Object.entries(TC_IDENTIFICATION_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v.split(" ")[0]}</option>
        ))}
      </Select>
      <div className="grid grid-cols-3 gap-3">
        <Input label="和氣" value={heQi} onChange={(e) => setHeQi(e.target.value)} />
        <Input label="互愛" value={huAi} onChange={(e) => setHuAi(e.target.value)} />
        <Input label="協力" value={xieLi} onChange={(e) => setXieLi(e.target.value)} />
      </div>
      <Input label="住的地區" value={area} onChange={(e) => setArea(e.target.value)} />
      <Select
        label="狀態"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className={registrationStatusSelectClass(status)}
      >
        {Object.entries(REGISTRATION_STATUS).map(([k, v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </Select>
      <Textarea label="備註" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">確認報名</Button>
      </div>
    </form>
  );
}
