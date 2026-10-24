import { useSearchParams } from "react-router";
import { formatTime, todayString } from "../../shared/utils/format";
import { useEffect, useState } from "react";
import type { Attendance } from "./types";
import { fetchMyAttendances } from "./api";
import { toAttendanceErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { PageHeader } from "../../shared/components/PageHeader";
import { SelectField } from "../../shared/components/SelectField";
import { Button } from "../../shared/components/Button";

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

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setErrorMessage(null);

    fetchMyAttendances(year, month)
      .then((data) => {
        if (!ignore) setRecords(data);
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

  function changeYear(value: string) {
    setSearchParams({ year: value, month: String(month) }, { replace: true });
  }

  function changeMonth(value: string) {
    setSearchParams({ year: String(year), month: value }, { replace: true });
  }

  const lateCount = records?.filter((record) => record.late).length ?? 0;
  const earlyLeaveCount = records?.filter((record) => record.earlyLeave).length ?? 0;

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
            {records.length === 0 ? (
              <p className="text-fg-muted">이 달에는 근태 기록이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-96 text-left">
                  <thead className="border-b border-line text-sm text-fg-muted">
                    <tr>
                      <th className="py-2 pr-4 font-medium">날짜</th>
                      <th className="py-2 pr-4 font-medium">출근</th>
                      <th className="py-2 pr-4 font-medium">퇴근</th>
                      <th className="py-2 font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b border-line">
                        <td className="py-2.5 pr-4">{formatWorkDate(record.workDate)}</td>
                        <td className="py-2.5 pr-4">{formatTime(record.checkInAt)}</td>
                        <td className="py-2.5 pr-4">
                          {record.checkOutAt ? formatTime(record.checkOutAt) : "-"}
                        </td>
                        <td className="py-2.5">
                          {record.late || record.earlyLeave ? (
                            <span className="text-danger">
                              {[record.late && "지각", record.earlyLeave && "조퇴"]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          ) : (
                            <span className="text-fg-muted">정상</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}