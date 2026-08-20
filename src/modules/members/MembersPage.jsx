import { useState } from "react";
import { setDoc, serverTimestamp } from "firebase/firestore";
import { Plus, Pencil, Trash2, ShieldCheck, ShieldAlert, UserRound } from "lucide-react";
import { useCollection, docRef } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import { useAuth } from "../../hooks/useAuth";
import { useMembership } from "../../hooks/useMembership";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";

const ROLE_LABELS = { admin: "管理員", member: "一般成員" };

const EMPTY_FORM = { uid: "", label: "", role: "member" };

export default function MembersPage() {
  const { user } = useAuth();
  const { isAdmin, loading: membershipLoading } = useMembership();
  const { data: members, loading } = useCollection("members");
  const { update, permanentlyDelete } = useFirestoreCrud("members");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editLabel, setEditLabel] = useState("");

  if (membershipLoading) {
    return <div className="text-center py-16 text-slate-400 italic">載入中...</div>;
  }

  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="只有管理員能使用這個頁面"
        description="成員管理僅開放給管理員，用來新增、移除成員或調整權限。"
      />
    );
  }

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uid = form.uid.trim();
    if (!uid) {
      setError("請輸入該成員的 UID。");
      return;
    }
    if (members.some((m) => m.id === uid)) {
      setError("這個 UID 已經是團隊成員了。");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await setDoc(docRef("members", uid), {
        role: form.role,
        label: form.label.trim(),
        addedAt: serverTimestamp(),
        addedBy: user ? { uid: user.uid, name: user.displayName || user.email || "未知使用者" } : null,
      });
      setShowForm(false);
    } catch {
      setError("新增失敗，請確認 UID 是否正確或稍後再試一次。");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRole = (member) => {
    const nextRole = member.role === "admin" ? "member" : "admin";
    update(member.id, { role: nextRole });
  };

  const openEdit = (member) => {
    setEditing(member);
    setEditLabel(member.label || "");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await update(editing.id, { label: editLabel.trim() });
    setEditing(null);
  };

  const handleRemove = async () => {
    await permanentlyDelete(removing.id);
    setRemoving(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-black italic text-slate-800">成員管理</h2>
        <Button icon={Plus} onClick={openCreate}>新增成員</Button>
      </div>

      <p className="text-sm text-slate-500 mb-4">
        還沒有帳號的人請先用 Google 登入這個網站一次，登入後畫面會顯示他的 UID，把那組 UID 貼到下面「新增成員」即可。
      </p>

      {loading ? (
        <div className="text-center py-16 text-slate-400 italic">載入中...</div>
      ) : members.length === 0 ? (
        <EmptyState icon={UserRound} title="還沒有任何成員" description="點選「新增成員」開始建立團隊白名單。" />
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <Card key={m.id} className="!p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black italic text-slate-800">{m.label || "未命名成員"}</span>
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${
                      m.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {m.role === "admin" && <ShieldCheck size={12} />}
                    {ROLE_LABELS[m.role] || "一般成員"}
                  </span>
                  {m.id === user?.uid && (
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700">就是你</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1 break-all">{m.id}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(m)}
                  title="編輯名稱"
                  className="p-2.5 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <Pencil size={18} />
                </button>
                <Button variant="secondary" onClick={() => toggleRole(m)}>
                  {m.role === "admin" ? "設為一般成員" : "設為管理員"}
                </Button>
                <button
                  onClick={() => setRemoving(m)}
                  disabled={m.id === user?.uid}
                  title={m.id === user?.uid ? "無法移除自己" : "移除成員"}
                  className="p-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="新增成員">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="UID"
            placeholder="請貼上該成員登入後顯示的 UID"
            value={form.uid}
            onChange={(e) => setForm({ ...form, uid: e.target.value })}
          />
          <Input
            label="顯示名稱（選填，方便辨識）"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          />
          <Select label="角色" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="member">一般成員</option>
            <option value="admin">管理員</option>
          </Select>
          {error && <p className="text-rose-600 text-sm font-bold">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>取消</Button>
            <Button type="submit" disabled={submitting}>新增</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="編輯成員名稱">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="顯示名稱"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>取消</Button>
            <Button type="submit">儲存</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        message={removing ? `確定要移除成員「${removing.label || removing.id}」嗎？移除後對方將無法再使用這個系統。` : ""}
      />
    </div>
  );
}
