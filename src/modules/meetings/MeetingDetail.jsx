import { useMemo, useState } from "react";
import { ArrowLeft, Plus, ListTodo, Calendar, MapPin, Video, User, UserCheck, FileDown } from "lucide-react";
import { exportMeetingToWord } from "../../lib/exportMeetingWord";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import ZoomableText from "../../components/ui/ZoomableText";
import ActionItemRow from "./ActionItemRow";
import ActionItemForm from "./ActionItemForm";

export default function MeetingDetail({ meeting, isAdmin, onBack }) {
  const { data: volunteers } = useCollection("volunteers");
  const { data: allActionItems } = useCollection("actionItems");
  const { create, update, remove } = useFirestoreCrud("actionItems");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const actionItems = useMemo(
    () => allActionItems.filter((a) => a.meetingId === meeting.id),
    [allActionItems, meeting.id]
  );

  const handleSubmit = async (data) => {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create({ ...data, meetingId: meeting.id });
    }
    setShowForm(false);
  };

  const hasStructuredAgenda = meeting.agendaItems?.length > 0;
  const hasLegacyNotes = meeting.agenda || meeting.minutes || meeting.decisions;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">
          <ArrowLeft size={14} /> 回到會議列表
        </button>
        <Button variant="secondary" icon={FileDown} onClick={() => exportMeetingToWord(meeting, actionItems)}>
          匯出 WORD
        </Button>
      </div>

      <Card className="mb-6">
        <h2 className="text-2xl font-black italic text-slate-800 mb-3">{meeting.title}</h2>

        <div className="flex flex-wrap gap-4 text-base text-slate-600 mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar size={17} />
            {meeting.date}{meeting.startTime && ` ${meeting.startTime}${meeting.endTime ? `-${meeting.endTime}` : ""}`}
          </span>
          {meeting.location && <span className="flex items-center gap-1.5"><MapPin size={17} />{meeting.location}</span>}
          {meeting.meetingLink && (
            <a
              href={meeting.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-indigo-600 font-bold hover:underline"
            >
              <Video size={17} /> 會議連結
            </a>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-base text-slate-600 mb-4">
          {meeting.hostName && <span className="flex items-center gap-1.5"><User size={17} />主持人：{meeting.hostName}</span>}
          {meeting.recorderName && <span className="flex items-center gap-1.5"><UserCheck size={17} />記錄人：{meeting.recorderName}</span>}
        </div>

        {meeting.attendeeNamesSnapshot?.length > 0 && (
          <p className="text-lg text-slate-600 mb-2">出席者：{meeting.attendeeNamesSnapshot.join("、")}</p>
        )}
        {meeting.absenteeNamesSnapshot?.length > 0 && (
          <p className="text-lg text-slate-500 mb-4">請假 / 缺席：{meeting.absenteeNamesSnapshot.join("、")}</p>
        )}

        <ZoomableText label="會議主旨" text={meeting.purpose} colorClass="text-slate-700" className="mb-4" html />

        {hasStructuredAgenda && (
          <div className="mb-4">
            <span className="block text-base font-bold text-slate-600 mb-2">議程與討論摘要</span>
            <div className="space-y-3">
              {meeting.agendaItems.map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50">
                  <p className="font-bold text-slate-800 mb-1">{i + 1}. {item.topic}</p>
                  {item.summary && (
                    <div className="text-base text-slate-600 mb-1" dangerouslySetInnerHTML={{ __html: item.summary }} />
                  )}
                  {item.decision && (
                    <div className="text-base text-slate-500 italic">
                      決議：<span dangerouslySetInnerHTML={{ __html: item.decision }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasStructuredAgenda && hasLegacyNotes && (
          <>
            <ZoomableText label="議程" text={meeting.agenda} colorClass="text-slate-700" className="mb-4" />
            <ZoomableText label="會議記錄" text={meeting.minutes} colorClass="text-slate-700" className="mb-4" />
            <ZoomableText label="決議事項" text={meeting.decisions} colorClass="text-slate-700" className="mb-4" />
          </>
        )}

        <ZoomableText label="待搜集資訊 / 待外部確認事項" text={meeting.otherNotes} colorClass="text-slate-700" className="mb-4" html />

        {(meeting.nextMeetingDate || meeting.nextMeetingTime || meeting.nextMeetingTopic) && (
          <p className="text-base text-slate-500 flex flex-wrap items-baseline gap-1">
            <span>
              下次會議暫定：
              {meeting.nextMeetingDate && ` ${meeting.nextMeetingDate}`}
              {meeting.nextMeetingTime && ` ${meeting.nextMeetingTime}`}
              {meeting.nextMeetingTopic && " · "}
            </span>
            {meeting.nextMeetingTopic && <span dangerouslySetInnerHTML={{ __html: meeting.nextMeetingTopic }} />}
          </p>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black italic text-slate-700 text-xl">行動任務清單</h3>
          <Button icon={Plus} onClick={() => { setEditing(null); setShowForm(true); }}>新增待辦</Button>
        </div>
        {actionItems.length === 0 ? (
          <EmptyState icon={ListTodo} title="還沒有待辦事項" />
        ) : (
          <ul className="space-y-3">
            {actionItems.map((item) => (
              <ActionItemRow
                key={item.id}
                item={item}
                isAdmin={isAdmin}
                onEdit={(i) => { setEditing(i); setShowForm(true); }}
                onDelete={setDeleting}
              />
            ))}
          </ul>
        )}
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "編輯待辦" : "新增待辦"}>
        <ActionItemForm initial={editing} volunteers={volunteers} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(deleting.id)}
        message={deleting ? `確定要刪除待辦「${deleting.description}」嗎？` : ""}
      />
    </div>
  );
}
