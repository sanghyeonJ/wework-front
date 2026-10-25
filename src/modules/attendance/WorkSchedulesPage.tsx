import { useEffect, useState } from "react";
import type { WorkSchedule } from "./types";
import { fetchSchedules } from "./api";
import { toAttendanceErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { PageHeader } from "../../shared/components/PageHeader";
import { Button } from "../../shared/components/Button";

// 서버의 "09:00:00" → 화면의 "09:00"
function toClock(time: string): string {
  return time.slice(0, 5);
}

// 근무시간 설정 (관리자)
export function WorkSchedulesPage() {
  const [schedules, setSchedules] = useState<WorkSchedule[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setErrorMessage(null);

    fetchSchedules()
      .then((data) => {
        if (!ignore) setSchedules(data);
      })
      .catch((error) => {
        if (!ignore) setErrorMessage(toAttendanceErrorMessage(getErrorCode(error)));
      });
    
    return () => {
      ignore = true;
    }
  }, [reloadKey]);

  const hasCompanySchedule = schedules?.some((schedule) => schedule.scopeType === "COMPANY") ?? false;

  return (
    <div className="p-6">
      <PageHeader 
        title="근무시간 설정"
        description="회사 전체 근무시간과 사원별 근무시간을 관리합니다. 사원별 설정이 회사 설정보다 우선합니다."
      />

      <div className="mt-5">
        {errorMessage ? (
          <div className="flex flex-col items-start gap-3">
            <p role="alert" className="text-danger">
              {errorMessage}
            </p>
            <Button onClick={() => setReloadKey((key) => key + 1)}>다시 불러오기</Button>
          </div>
        ) : schedules === null ? (
          <p className="text-fg-muted">불러오는 중…</p>
        ) : (
          <>
            {!hasCompanySchedule && (
              <p className="mb-3 text-sm text-fg-muted">
                회사 설정이 없어 기본값(09:00~18:00, 지각 유예 0분)이 적용됩니다.
              </p>
            )}
            {schedules.length === 0 ? (
              <p className="text-fg-muted">저장된 설정이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-xl text-left">
                  <thead className="border-b border-line text-sm text-fg-muted">
                    <tr>
                      <th className="py-2 pr-4 font-medium">구분</th>
                      <th className="py-2 pr-4 font-medium">대상</th>
                      <th className="py-2 pr-4 font-medium">출근 기준</th>
                      <th className="py-2 pr-4 font-medium">퇴근 기준</th>
                      <th className="py-2 font-medium">지각 유예</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule) => (
                      <tr key={schedule.id} className="border-b border-line">
                        <td className="py-2.5 pr-4">
                          {schedule.scopeType === "COMPANY" ? "회사 일괄" : "개인"}
                        </td>
                        <td className="py-2.5 pr-4">
                          {schedule.scopeType === "COMPANY" ? "전체 사원" : (schedule.memberName ?? "-")}
                        </td>
                        <td className="py-2.5 pr-4">{toClock(schedule.startTime)}</td>
                        <td className="py-2.5 pr-4">{toClock(schedule.endTime)}</td>
                        <td className="py-2.5">{schedule.graceMinutes}분</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}