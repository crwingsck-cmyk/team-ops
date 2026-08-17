import { useMemo, useState } from "react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import { TC_IDENTIFICATION_LABELS, REGISTRATION_STATUS, registrationStatusSelectClass } from "../../constants/categoryStyles";

export default function RegistrationForm({ onSubmit, onCancel, guestDirectory = [] }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tcIdentification, setTcIdentification] = useState("da_de");
  const [heQi, setHeQi] = useState("");
  const [huAi, setHuAi] = useState("");
  const [xieLi, setXieLi] = useState("");
  const [area, setArea] = useState("");
  const [childrenCount, setChildrenCount] = useState("");
  const [status, setStatus] = useState("registered");
  const [notes, setNotes] = useState("");
  const [phoneSuggestOpen, setPhoneSuggestOpen] = useState(false);

  const guestByName = useMemo(() => {
    const map = new Map();
    guestDirectory.forEach((g) => { if (g.name) map.set(g.name.trim(), g); });
    return map;
  }, [guestDirectory]);

  const guestByPhone = useMemo(() => {
    const map = new Map();
    guestDirectory.forEach((g) => { if (g.phone) map.set(g.phone.trim(), g); });
    return map;
  }, [guestDirectory]);

  const applyGuestMatch = (match) => {
    setName(match.name || "");
    setPhone(match.phone || "");
    setTcIdentification(match.tcIdentification || "da_de");
    setHeQi(match.heQi || "");
    setHuAi(match.huAi || "");
    setXieLi(match.xieLi || "");
    setArea(match.area || "");
  };

  const handleNameChange = (value) => {
    setName(value);
    const match = guestByName.get(value.trim());
    if (match) applyGuestMatch({ ...match, name: value });
  };

  const phoneMatches = useMemo(() => {
    const q = phone.trim();
    if (!q) return [];
    return guestDirectory.filter((g) => g.phone && g.phone.includes(q)).slice(0, 8);
  }, [guestDirectory, phone]);

  const handlePhoneChange = (value) => {
    setPhone(value);
    setPhoneSuggestOpen(true);
    const match = guestByPhone.get(value.trim());
    if (match) applyGuestMatch({ ...match, phone: value });
  };

  const selectPhoneMatch = (match) => {
    applyGuestMatch(match);
    setPhoneSuggestOpen(false);
  };

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
      childrenCount: childrenCount === "" ? 0 : Number(childrenCount),
      notes,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="名字"
        required
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        list="guest-name-suggestions"
      />
      <datalist id="guest-name-suggestions">
        {guestDirectory.map((g) => (
          <option key={g.name} value={g.name} />
        ))}
      </datalist>
      <div className="relative">
        <Input
          label="電話號碼"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          onFocus={() => setPhoneSuggestOpen(true)}
          onBlur={() => setTimeout(() => setPhoneSuggestOpen(false), 150)}
          autoComplete="off"
        />
        {phoneSuggestOpen && phoneMatches.length > 0 && (
          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1.5">
            {phoneMatches.map((g) => (
              <button
                type="button"
                key={g.phone}
                onMouseDown={() => selectPhoneMatch(g)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
              >
                <span className="font-bold text-slate-800">{g.name}</span>
                <span className="text-sm text-slate-500">{g.phone}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {(guestByName.has(name.trim()) || guestByPhone.has(phone.trim())) && (
        <p className="text-sm text-indigo-600">已自動帶入之前報名的資料</p>
      )}
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
      <Input
        label="帶小孩或家人人數"
        type="number"
        min="0"
        value={childrenCount}
        onChange={(e) => setChildrenCount(e.target.value)}
      />
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
