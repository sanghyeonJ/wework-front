import { useState, type SubmitEvent } from "react";
import type { WorkScheduleRequest } from "./types";
import { toAttendanceErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { Dialog } from "../../shared/components/Dialog";
import { Button } from "../../shared/components/Button";
import { TextField } from "../../shared/components/TextField";

// 폼 값은 문자열로 관리하고 보낼 때 변환
export interface WorkScheduleFormValues {
  startTime: string;
  endTime: string;
  graceMinutes: string
}

interface WorkScheduleFormDialogProps {
  title: string;
  initial: WorkScheduleFormValues;
  save: (body: WorkScheduleRequest) => Promise<unknown>;  // 회사 설정·개인 설정이 저장 함수만 바꿔 같은 폼을 씀
  onClose: () => void;
  onSaved: () => void;
}

// 근무시간 입력 대화상자 (출근·퇴근 기준 시각, 지각 유예 분)
export function WorkScheduleFormDialog({ title, initial, save, onClose, onSaved }: WorkScheduleFormDialogProps) {
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [graceMinutes, setGraceMinutes] = useState(initial.graceMinutes);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErrorMessage(null);
    try {
      await save({ startTime, endTime, graceMinutes: Number(graceMinutes) });
      onSaved();  // 부모가 목록을 다시 불러옴
      onClose();
    } catch (error) {
      setErrorMessage(toAttendanceErrorMessage(getErrorCode(error)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={busy}>
            취소
          </Button>
          <Button type="submit" form="work-schedule-form" variant="primary" disabled={busy}>
            {busy ? "저장 중..." : "저장"}
          </Button>
        </>
      }
    >
      <form id="work-schedule-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField 
            id="schedule-start"
            label="출근 기록"
            type="time"
            required
            data-autofocus
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <TextField 
            id="schedule-end"
            label="퇴근 기록"
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <TextField 
          id="schedule-grace"
          label="지각 유예(분)"
          type="number"
          required
          min={0}
          max={60}
          step={1}
          hint="출근 기준 시각 뒤 이 시간(0~60분)까지는 지각으로 보지 않습니다."
          value={graceMinutes}
          onChange={(e) => setGraceMinutes(e.target.value)}
        />
        <p className="text-sm text-fg-muted">
          저장한 뒤의 출근·퇴근부터 적용됩니다. 이미 판단된 지각 결과는 바뀌지 않습니다.
        </p>
        {errorMessage && (
          <p role="alert" className="text-sm text-danger">
            {errorMessage}
          </p>
        )}
      </form>
    </Dialog>
  );
}