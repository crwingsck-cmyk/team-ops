import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({ open, onClose, onConfirm, title = "確認刪除", message }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            刪除
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message || "確定要刪除這筆資料嗎？此操作無法復原。"}</p>
    </Modal>
  );
}
