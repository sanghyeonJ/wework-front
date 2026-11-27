import { useEffect, useState } from "react";
import { PageHeader } from "../../../shared/components/PageHeader";
import { LEAVE_TYPE_LABELS } from "../labels";
import type { LeaveApplyRequest, LeaveType } from "../types";
import { todayString } from "../../../shared/utils/format";
import { SelectField } from "../../../shared/components/SelectField";
import { TextField } from "../../../shared/components/TextField";
import { createLeaveRequest, getLeaveDays } from "../api";
import { toLeaveErrorMessage } from "../errorMessages";
import { getErrorCode } from "../../../shared/api/client";
import type { ApproverCandidateResponse } from "../../member/types";
import { ApproverPicker } from "../../approval/components/ApproverPicker";
import { useNavigate } from "react-router";
import { Button } from "../../../shared/components/Button";

const LEAVE_TYPES = Object.keys(LEAVE_TYPE_LABELS) as LeaveType[];

export function LeaveApplyPage() {
  const navigate = useNavigate();

  const [leaveType, setLeaveType] = useState<LeaveType>("ANNUAL");
  const [startDate, setStartDate] = useState(todayString);
  const [endDate, setEndDate] = useState(todayString);
  const [reason, setReason] = useState("");

  const isHalfDay = leaveType === "HALF_AM" || leaveType === "HALF_PM";
  const effectiveEndDate = isHalfDay ? startDate : endDate;

  const [days, setDays] = useState<number | null>(null);
  const [daysError, setDaysError] = useState<string | null>(null);
  const [daysLoading, setDaysLoading] = useState(false);

  const [approvers, setApprovers] = useState<ApproverCandidateResponse[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit = days !== null &&
    days > 0 &&
    !daysLoading &&
    approvers.length >= 1 &&
    !submitting;


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

  async function handleSubmit() {
    if (!canSubmit) return;

    const request: LeaveApplyRequest = {
      leaveType,
      startDate,
      endDate: effectiveEndDate,
      reason: reason.trim() || undefined,
      approverIds: approvers.map((a) => a.id)
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await createLeaveRequest(request);
      navigate("/leave/me");
    } catch(error) {
      setSubmitError(toLeaveErrorMessage(getErrorCode(error)));
      setSubmitting(false);
    }
  }


  return (
    <div className="p-6">
      <PageHeader 
        title="휴가 신청"
        description="휴가 종류와 기간, 결재자를 선택해 신청합니다."
      />

      <form className="mt-5 max-w-xl space-y-4" onSubmit={(e) => e.preventDefault()}>
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

      <div className="mt-6 max-w-xl">
        <ApproverPicker selected={approvers} onChange={setApprovers} />
      </div>

      <div className="mt-6 flex max-w-xl items-center justify-end gap-2">
        <Button onClick={() => navigate("/leave/me")}>취소</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
          {submitting ? "신청중..." : "신청하기"}
        </Button>
      </div>

      {approvers.length === 0 && (
        <p className="mt-2 max-w-xl text-right text-sm text-fg-muted">결재자를 1명 이상 선택해야 신청할 수 있습니다.</p>
      )}
      {submitError && (
        <p role="alert" className="mt-2 max-w-xl text-right text-sm text-danger">{submitError}</p>
      )}
    </div>
  );
}