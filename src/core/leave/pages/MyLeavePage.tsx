import { useSearchParams } from "react-router";
import { todayString } from "../../../shared/utils/format";
import { useEffect, useState } from "react";
import type { LeaveBalance, LeaveStatus } from "../types";
import { getMyBalance } from "../api";
import { toLeaveErrorMessage } from "../errorMessages";
import { getErrorCode } from "../../../shared/api/client";
import { PageHeader } from "../../../shared/components/PageHeader";
import { SelectField } from "../../../shared/components/SelectField";
import { Button } from "../../../shared/components/Button";
import { LEAVE_STATUS_LABELS } from "../labels";
import { LeaveRequestList } from "../components/LeaveRequestList";

// 백엔드의 2015와 같은 값
const MIN_LEAVE_YEAR = 2015;

// 주소의 문자열을 정수로 (숫자가 아니면 null)
function parseInteger(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  return Number(value);
}

const STATUSES = Object.keys(LEAVE_STATUS_LABELS) as LeaveStatus[];

function parseStatus(value: string | null): LeaveStatus | undefined {
  if (value === null) return undefined;
  if (STATUSES.includes(value as LeaveStatus)) return value as LeaveStatus;
  return undefined;
}

export function MyLeavePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const thisYear = Number(todayString().slice(0, 4));
  const maxYear = thisYear + 1;
  const years = Array.from({ length: maxYear - MIN_LEAVE_YEAR + 1 }, (_, i) => maxYear - i);

  const yearParams = parseInteger(searchParams.get("year"));
  const year = yearParams !== null && years.includes(yearParams) ? yearParams : thisYear;

  const status = parseStatus(searchParams.get("status"));

  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // 잔액 불러오기
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setErrorMessage(null);

    getMyBalance(year)
      .then((data) => {
        if(!ignore) {
          setBalance(data);
        }
      })
      .catch((error) => {
        if (ignore) return;
        setBalance(null);
        setErrorMessage(toLeaveErrorMessage(getErrorCode(error)));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    }
  }, [year, reloadKey]);

  function moveTo(nextYear: number, nextStatus: LeaveStatus | undefined) {
    const params: Record<string, string> = { year: String(nextYear) };
    if (nextStatus !== undefined) {
      params.status = nextStatus;
    }
    setSearchParams(params, { replace: true });
  }
  function changeYear(value: string) {
    moveTo(Number(value), status);
  }
  function changeStatus(value: string) {
    moveTo(year, parseStatus(value));
  }

  return (
    <div className="p-6">
      <PageHeader title="내 휴가" description="연차 잔여와 휴가 신청 내역을 확인합니다." />

      <div className="mt-5 flex items-end gap-3">
        <SelectField
          id="leave-year"
          label="연도"
          className="w-28"
          value={year}
          onChange={(e) => changeYear(e.target.value)}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </SelectField>
        <SelectField
          id="leave-status"
          label="상태"
          className="w-32"
          value={status ?? ""}
          onChange={(e) => changeStatus(e.target.value)}
        >
          <option value="">전체</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{LEAVE_STATUS_LABELS[s]}</option>
          ))}
        </SelectField>
      </div>

      <div className="mt-5">
        {errorMessage ? (
          <div className="flex flex-col items-start gap-3">
            <p role="alert" className="text-danger">{errorMessage}</p>
            <Button onClick={() => setReloadKey((key) => key + 1)}>다시 불러오기</Button>
          </div>
        ) : balance === null ? (
          <p className="text-fg-muted">불러오는 중...</p>
        ) : (
          <div className={loading ? "opacity-60" : undefined}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-md border border-line p-4">
                <p className="text-sm text-fg-muted">지급</p>
                <p className="mt-1 text-xl font-semibold">{balance.grantedDays}일</p>
              </div>
              <div className="rounded-md border border-line p-4">
                <p className="text-sm text-fg-muted">사용</p>
                <p className="mt-1 text-xl font-semibold">{balance.usedDays}일</p>
              </div>
              <div className="rounded-md border border-line p-4">
                <p className="text-sm text-fg-muted">승인 대기</p>
                <p className="mt-1 text-xl font-semibold">{balance.pendingDays}일</p>
              </div>
              <div className="rounded-md border border-line p-4">
                <p className="text-sm text-fg-muted">잔여</p>
                <p className="mt-1 text-xl font-semibold">{balance.remainingDays}일</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-fg-muted">
              신청 가능 {balance.remainingDays - balance.pendingDays}일 (잔여에서 승인 대기를 뺀 값)
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <LeaveRequestList 
          key={`${year}-${status ?? "ALL"}`}
          year={year}
          status={status}
        />
      </div>
    </div>
  );
}