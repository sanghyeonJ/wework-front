import { Button } from "../../../shared/components/Button";
import { Dialog } from "../../../shared/components/Dialog";

interface HolidayFormDialogProps {
  onClose: () => void;
}

export function HolidayFormDialog({onClose}: HolidayFormDialogProps) {
  return (
    <Dialog
      open
      title="휴일 추가"
      onClose={onClose}
      footer={
        <Button onClick={onClose}>취소</Button>
      }
    >
      <p>입력칸은 다음 단계에</p>
    </Dialog>
  );
}