import { ReactNode } from "react";
import Modal from "./Modal";
import Button from "./Button";

interface Props {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="space-y-4">
        <div className="text-sm text-muted leading-relaxed">{message}</div>
        <div className="flex gap-2 pt-2">
          <Button onClick={onConfirm} loading={loading} fullWidth variant={danger ? "danger" : "primary"}>
            {confirmLabel}
          </Button>
          <Button onClick={onCancel} fullWidth variant="outline" disabled={loading}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}