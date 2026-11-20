import { useId, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { Dialog } from "../../../shared/components/Dialog";
import { TextField } from "../../../shared/components/TextField";

interface HolidayFormDialogProps {
  onClose: () => void;
}

export function HolidayFormDialog({onClose}: HolidayFormDialogProps) {
  const formId = useId();
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [recurring, setRecurring] = useState(false);

  return (
    <Dialog
      open
      title="휴일 추가"
      onClose={onClose}
      footer={
        <Button onClick={onClose}>취소</Button>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField 
          id={`${formId}-date`}
          label="날짜"
          data-autofocus
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <TextField 
          id={`${formId}-name`}
          label="이름"
          maxLength={100}
          placeholder="예: 창립기념일"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div>
          <label className="flex items-center gap-2">
            <input 
              id={`${formId}-recurring`}
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="size-4 accent-accent"
            />
            매년 반복
          </label>
          <p className="text-sm text-fg-muted">체크하면 매년 같은 월·일이 휴일로 적용됩니다.</p>
        </div>
      </div>
    </Dialog>
  );
}