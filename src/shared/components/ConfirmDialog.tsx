import type { ReactNode } from "react";
import { Button } from "./Button";
import { Dialog } from "./Dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  busy?: boolean;  // 처리 중이면 버튼 비활성화
  errorMessage?: string | null;  // 실패 사유 (예: 사용 중이라 삭제 불가)
  onConfirm: () => void;
  onClose: () => void;
}

// 삭제 등 되돌릴 수 없는 작업 전 확인창
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busy = false,
  errorMessage,
  onConfirm,
  onClose
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button data-autofocus onClick={onClose} disabled={busy}>
            취소
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? "처리 중..." : confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {errorMessage}
        </p>
      )}
    </Dialog>
  );
}