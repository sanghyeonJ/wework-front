import { useId, useState, type SubmitEvent } from "react";
import { Button } from "../../../shared/components/Button";
import { Dialog } from "../../../shared/components/Dialog";
import { TextField } from "../../../shared/components/TextField";
import { createCompanyHoliday } from "../api";
import { getErrorCode } from "../../../shared/api/client";
import { toHolidayErrorMessage } from "../errorMessages";

interface HolidayFormDialogProps {
  onClose: () => void;
  onSaved: () => void;
}

export function HolidayFormDialog({onClose, onSaved}: HolidayFormDialogProps) {
  const formId = useId();
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [recurring, setRecurring] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if(submitting) return;

    const trimmedName = name.trim();
    if(date === "") {
      setErrorMessage("날짜를 선택해 주세요.");
      return;
    }
    if(trimmedName === "") {
      setErrorMessage("이름을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const request = {holidayDate: date, name: trimmedName, recurring: recurring}
      await createCompanyHoliday(request);
      onSaved();
    } catch (error) {
      const code = getErrorCode(error);
      setErrorMessage(toHolidayErrorMessage(code));
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open
      title="휴일 추가"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={submitting}>취소</Button>
          <Button type="submit" form={formId} variant="primary" disabled={submitting}>추가</Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        {errorMessage && <p role="alert" className="text-sm text-danger">{errorMessage}</p>}
      </form>
    </Dialog>
  );
}