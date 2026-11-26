import { useEffect, useState } from "react";
import { PageHeader } from "../../../shared/components/PageHeader";
import { LEAVE_TYPE_LABELS } from "../labels";
import type { LeaveType } from "../types";
import { todayString } from "../../../shared/utils/format";
import { SelectField } from "../../../shared/components/SelectField";
import { TextField } from "../../../shared/components/TextField";
import { getLeaveDays } from "../api";
import { toLeaveErrorMessage } from "../errorMessages";
import { getErrorCode } from "../../../shared/api/client";

const LEAVE_TYPES = Object.keys(LEAVE_TYPE_LABELS) as LeaveType[];

export function LeaveApplyPage() {
  const [leaveType, setLeaveType] = useState<LeaveType>("ANNUAL");
  const [startDate, setStartDate] = useState(todayString);
  const [endDate, setEndDate] = useState(todayString);
  const [reason, setReason] = useState("");

  const isHalfDay = leaveType === "HALF_AM" || leaveType === "HALF_PM";
  const effectiveEndDate = isHalfDay ? startDate : endDate;

  const [days, setDays] = useState<number | null>(null);
  const [daysError, setDaysError] = useState<string | null>(null);
  const [daysLoading, setDaysLoading] = useState(false);

  useEffect(() => {
    // 날짜가 비어 있으면 묻지 않고 안내를 숨김
    if (startDate === "" || effectiveEndDate === "") {
      setDays(null);
      setDaysError(null);
      setDaysLoading(false);
      return;
    }

    let ignore = false;
    setDaysLoading(true);
    setDaysError(null);

    getLeaveDays(leaveType, startDate, effectiveEndDate)
      .then((data) => {
        if (ignore) return;
        setDays(data.days);
      })
      .catch((error) => {
        if (ignore) return;
        setDays(null);
        setDaysError(toLeaveErrorMessage(getErrorCode(error)));
      })
      .finally(() => {
        if (!ignore) setDaysLoading(false);
      });

    return () => {
      ignore = true;
    }
  }, [leaveType, startDate, effectiveEndDate]);


  return (
    <div className="p-6">
      <PageHeader 
        title="휴가 신청"
        description="휴가 종류와 기간, 결재자를 선택해 신청합니다."
      />

      <form className="mt-5 max-w-xl space-y-4">
        <SelectField
          id="leave-type"
          label="종류"
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value as LeaveType)}
        >
          {LEAVE_TYPES.map((type) => (
            <option key={type} value={type}>{LEAVE_TYPE_LABELS[type]}</option>
          ))}
        </SelectField>
        <TextField id="leave-start" label="시작일" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <TextField id="leave-end" label="종료일" type="date" value={effectiveEndDate} disabled={isHalfDay} className={isHalfDay ? "opacity-40" : undefined} onChange={(e) => setEndDate(e.target.value)} />
        <TextField id="leave-reason" label="사유 (선택)" maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
      </form>

      <div aria-live="polite" className={`mt-4 ${daysLoading ? "opacity-60" : ""}`}>
        {daysError ? (
          <p role="alert" className="text-sm text-danger">{daysError}</p>
        ) : days === null ? null : days === 0 ? (
          <p className="text-sm text-danger">{toLeaveErrorMessage("NO_WORKING_DAY")}</p>
        ) : (
          <p className="text-sm">사용 일수 <span className="font-semibold">{days}일</span></p>
        )}
      </div>
    </div>
  );
}