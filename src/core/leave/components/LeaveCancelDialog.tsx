import { useState } from "react";
import { cancelApproval } from "../../approval/api";
import { toApprovalErrorMessage } from "../../approval/errorMessages";
import { getErrorCode } from "../../../shared/api/client";
import { Dialog } from "../../../shared/components/Dialog";
import { Button } from "../../../shared/components/Button";
import { TextField } from "../../../shared/components/TextField";

interface LeaveCancelDialogProps {
  approvalRequestId: number;
  onClose: () => void;
  onCanceled: () => void;
}

export function LeaveCancelDialog({ approvalRequestId, onClose, onCanceled }: LeaveCancelDialogProps) {

  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCandel() {
    setBusy(true);
    setErrorMessage(null);

    try {
      await cancelApproval(approvalRequestId, reason);
      onCanceled();
    } catch(error) {
      setErrorMessage(toApprovalErrorMessage(getErrorCode(error)));
    } finally {
      setBusy(false);
    }
  }


  return (
    <Dialog
      open
      title="휴가 신청 취소"
      onClose={onClose}
      footer={
        <>
          <Button data-autofocus onClick={onClose} disabled={busy}>닫기</Button>
          <Button variant="danger" onClick={handleCandel} disabled={busy}>
            {busy ? "처리중..." : "신청 취소"}
          </Button>
        </>
      }
    >
      <p>이 휴가 신청을 취소할까요? 취소하면 승인 대기가 해제됩니다.</p>
      <div className="mt-4">
        <TextField 
          id="leave-cancel-reason"
          label="취소 사유 (선택)"
          hint="500자 까지 입력할 수 있습니다."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
        />
      </div>
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {errorMessage}
        </p>
      )}
    </Dialog>
  );
}