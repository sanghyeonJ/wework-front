import { useSearchParams } from "react-router";
import { formatTime, todayString } from "../../../shared/utils/format";
import { useEffect, useState } from "react";
import type { Attendance } from "../types";
import { fetchMyAttendances } from "../api";
import { toAttendanceErrorMessage } from "../errorMessages";
import { getErrorCode } from "../../../shared/api/client";
import { PageHeader } from "../../../shared/components/PageHeader";
import { SelectField } from "../../../shared/components/SelectField";
import { Button } from "../../../shared/components/Button";
import { getYearHolidays } from "../../../core/holiday/api";
import type { Holiday } from "../../../core/holiday/types";
import type { LeaveSummary } from "../../../core/leave/types";
import { getMyLeaveRequests } from "../../../core/leave/api";
import { LEAVE_TYPE_LABELS } from "../../../core/leave/labels";

const YEAR_COUNT = 5; // 올해 포함 최근 5년

// 주소의 문자열을 정수로 (숫자가 아니면 null)
function parseInteger(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  return Number(value);
}

// "2026-10-23" → "10-23 (금)"  (new Date("YYYY-MM-DD")는 UTC로 해석되어 하루 밀릴 수 있어 숫자로 직접 만듦)
function formatWorkDate(workDate: string): string {
  const [year, month, day] = workDate.split("-").map(Number);
  const weekday = new Date(year, month - 1, day).toLocaleDateString("ko-KR", { weekday: "short" });
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} (${weekday})`;
}

function makeMonthDates(year: number, month: number): string[] {
  const lastDay = new Date(year, month, 0).getDate();
  const dates: string[] = [];
  for(let day = 1; day <= lastDay; day++) {
    dates.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  return dates;
}

function isWeekend(date: string): boolean {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(year, month - 1, day).getDay();
  return weekday === 0 || weekday === 6;
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function makeLeaveMap(leaves: LeaveSummary[]): Map<string, string> {
  const leaveMap = new Map<string, string>();
  for(const leave of leaves) {
    const [year, month, day] = leave.startDate.split("-").map(Number);
    const current = new Date(year, month - 1, day);
    let dateString = toDateString(current);
    do{
      leaveMap.set(dateString, LEAVE_TYPE_LABELS[leave.leaveType]);
      current.setDate(current.getDate() + 1);
      dateString = toDateString(current);
    }while(dateString <= leave.endDate);
  }
  return leaveMap;
}

// 내 근태 기록 (월별)
export function MyAttendancePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 조건은 주소에 저장 (새로고침·링크 공유 가능), 잘못된 값이면 이번 달로
  const today = todayString();
  const thisYear = Number(today.slice(0, 4));
  const thisMonth = Number(today.slice(5, 7));
  const years = Array.from({ length: YEAR_COUNT }, (_, i) => thisYear - i);

  const yearParams = parseInteger(searchParams.get("year"));
  const monthParams = parseInteger(searchParams.get("month"));
  const year = yearParams !== null && years.includes(yearParams) ? yearParams : thisYear;
  const month = monthParams !== null && monthParams >= 1 && monthParams <= 12 ? monthParams : thisMonth;

  const [records, setRecords] = useState<Attendance[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayLoadFailed, setHolidayLoadFailed] = useState(false);

  const [leaves, setLeaves] = useState<LeaveSummary[]>([]);
  const [leaveLoadFailed, setLeaveLoadFailed] = useState(false);

  // 내 근태
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setErrorMessage(null);

    fetchMyAttendances(year, month)
      .then((data) => {
        if (!ignore) {
          setRecords(data);
        }
      })
      .catch((error) => {
        if (ignore) return;
        setRecords(null);  // 다른 달의 기록이 남아 보이지 않게 비움
        setErrorMessage(toAttendanceErrorMessage(getErrorCode(error)));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    }
  }, [year, month, reloadKey]);

  // 휴일
  useEffect(() => {
    let ignore = false;
    setHolidayLoadFailed(false);

    getYearHolidays(year)
      .then((data) => {
        if(!ignore) {
          setHolidays(data);
        }
      })
      .catch(() => {
        if (ignore) return;
        setHolidays([]);
        setHolidayLoadFailed(true);
      });

    return () => {
      ignore = true
    }
  }, [year]);

  // 내 휴가
  useEffect(() => {
    let ignore = false;
    setLeaveLoadFailed(false);

    Promise.all([getMyLeaveRequests(year - 1, 0, 100, "APPROVED"), getMyLeaveRequests(year, 0, 100, "APPROVED")])
      .then(([previous, current]) => {
        if (!ignore) {
          setLeaves([...previous.content, ...current.content]);
        }
      })
      .catch(() => {
        if (ignore) return;
        setLeaves([]);
        setLeaveLoadFailed(true);
      });

    return () => {
      ignore = true;
    }
  }, [year]);

  function changeYear(value: string) {
    setSearchParams({ year: value, month: String(month) }, { replace: true });
  }

  function changeMonth(value: string) {
    setSearchParams({ year: String(year), month: value }, { replace: true });
  }

  const lateCount = records?.filter((record) => record.late).length ?? 0;
  const earlyLeaveCount = records?.filter((record) => record.earlyLeave).length ?? 0;

  const recordMap = new Map<string, Attendance>((records ?? []).map((record) => [record.workDate, record]));
  const dates = makeMonthDates(year, month);
  
  const holidayMap = new Map<string, string>();
  for (const holiday of holidays) {
    const existing = holidayMap.get(holiday.date);
    holidayMap.set(holiday.date, existing ? `${existing}, ${holiday.name}` : holiday.name);
  }

  const leaveMap = makeLeaveMap(leaves);


  return (
    <div className="p-6">
      <PageHeader title="내 근태 기록" description="월별 출근·퇴근 기록과 지각·조퇴를 확인합니다." />

      <div className="mt-5 flex items-end gap-3">
        <SelectField
          id="attendance-year"
          label="연도"
          className="w-28"
          value={year}
          onChange={(e) => changeYear(e.target.value)}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}년
            </option>
          ))}
        </SelectField>
        <SelectField
          id="attendance-month"
          label="월"
          className="w-24"
          value={month}
          onChange={(e) => changeMonth(e.target.value)}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month}>
              {month}월
            </option>
          ))}
        </SelectField>
      </div>

      <div className="mt-5">
        {errorMessage ? (
          <div className="flex flex-col items-start gap-3">
            <p role="alert" className="text-danger">
              {errorMessage}
            </p>
            <Button onClick={() => setReloadKey((key) => key + 1)}>다시 불러오기</Button>
          </div>
        ) : records === null ? (
          <p className="text-fg-muted">불러오는 중…</p>
        ) : (
          <div className={loading ? "opacity-60" : undefined}>
            <p className="mb-3 text-sm text-fg-muted">
              기록 {records.length}일 · 지각 {lateCount}회 · 조퇴 {earlyLeaveCount}회
            </p>
            {holidayLoadFailed && <p className="text-sm text-danger">휴일 조회에 실패했습니다.</p>}
            {leaveLoadFailed && <p className="text-sm text-danger">내 휴가 조회에 실패했습니다.</p>}
            <div className="overflow-x-auto">
              <table className="w-full min-w-96 text-left">
                <colgroup>
                  <col style={{width: "14%"}} />
                  <col style={{width: "22%"}} />
                  <col style={{width: "22%"}} />
                  <col style={{width: "22%"}} />
                  <col />
                </colgroup>
                <thead className="border-b border-line text-sm text-fg-muted">
                  <tr>
                    <th className="py-2 px-4 font-medium">날짜</th>
                    <th className="py-2 px-4 font-medium text-center">출근</th>
                    <th className="py-2 px-4 font-medium text-center">퇴근</th>
                    <th className="py-2 px-4 font-medium text-center">상태</th>
                    <th className="py-2 font-medium text-center">비고</th>
                  </tr>
                </thead>
                <tbody>
                  {dates.map((date) => {
                    const attendance = recordMap.get(date);
                    const holidayName = holidayMap.get(date);
                    const dayoff = isWeekend(date) || holidayName !== undefined;
                    const leaveLabel = dayoff ? undefined : leaveMap.get(date);
                    return (
                      <tr key={date} className={`border-b border-line ${dayoff ? "bg-app" : ""}`}>
                        <td className="py-2.5 px-4">{formatWorkDate(date)}</td>
                        <td className="py-2.5 px-4 text-center">{attendance && formatTime(attendance.checkInAt)}</td>
                        <td className="py-2.5 px-4 text-center">
                          {attendance && (attendance.checkOutAt ? formatTime(attendance.checkOutAt) : "-")}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {attendance && !dayoff && (
                            attendance.late || attendance.earlyLeave ? (
                              <span className="text-danger">
                                {[attendance.late && "지각", attendance.earlyLeave && "조퇴"]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </span>
                            ) : (
                              <span className="text-fg-muted">정상</span>
                            )
                          )}
                        </td>
                        <td className="py-2.5 text-center">{holidayName ?? leaveLabel}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}