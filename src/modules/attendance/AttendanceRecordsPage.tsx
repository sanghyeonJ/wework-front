import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { buildTree, flattenTree, indentLabel, type FlatDepartment } from "../../core/department/tree";
import type { AttendanceDayInfo, AttendanceRecord } from "./types";
import { formatTime, todayString } from "../../shared/utils/format";
import { getDepartments } from "../../core/department/api";
import { toAttendanceErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { fetchDayInfo, fetchRecords } from "./api";
import { PageHeader } from "../../shared/components/PageHeader";
import { TextField } from "../../shared/components/TextField";
import { SelectField } from "../../shared/components/SelectField";
import { Button } from "../../shared/components/Button";
import type { PageResponse } from "../../shared/types/api";
import { Pagination } from "../../shared/components/Pagination";

const PAGE_SIZE = 20; // 한 페이지에 보여줄 사원 수 (백엔드 기본값과 같음)

// 주소의 문자열을 정수로 (숫자가 아니면 null)
function parseInteger(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  return Number(value);
}

// "YYYY-MM-DD" 형식이고 실제로 있는 날짜인지 (2026-02-31 같은 값 거르기)
function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

// 관리자 근태 조회 (날짜별)
export function AttendanceRecordsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [departments, setDepartments] = useState<FlatDepartment[] | null>(null);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [result, setResult] = useState<PageResponse<AttendanceRecord> | null>(null);
  const records = result?.content ?? null;  // 이번 페이지의 사원 목록 (아직 못 받았으면 null)
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [dayInfo, setDayInfo] = useState<AttendanceDayInfo | null>(null);

  // ----- 조건 (주소에 저장, 잘못된 값이면 기본값) -----
  const dateParam = searchParams.get("date");
  const date = dateParam !== null && isValidDate(dateParam) ? dateParam : todayString();

  // 목록에 없는 부서 id(삭제된 부서, 직접 고친 주소)는 "전체"로 취급
  const rawDepartmentId = parseInteger(searchParams.get("departmentId"));
  const departmentId = rawDepartmentId !== null && departments?.some((item) => item.node.id === rawDepartmentId)
    ? rawDepartmentId
    : null;
  
  // 하위 부서 포함은 기본 켬 (사원 목록 화면과 맞춤), 끌 때만 sub=false 저장
  const includeSub = searchParams.get("sub") !== "false";

  // 페이지: 주소는 1부터, API는 0부터 (없거나 잘못된 값이면 첫 페이지)
  const pageParam = parseInteger(searchParams.get("page"));
  const page = pageParam !== null && pageParam >= 1 ? pageParam - 1 : 0;

  function updateConditions(next: { date?: string; departmentId?: number | null; includeSub?: boolean; page?: number }) {
    const nextDate = next.date ?? date;
    const nextDepartmentId = next.departmentId === undefined ? departmentId : next.departmentId;
    const nextIncludeSub = next.includeSub ?? includeSub;

    const params: Record<string, string> = { date: nextDate };
    if (nextDepartmentId !== null) params.departmentId = String(nextDepartmentId);
    if (!nextIncludeSub) params.sub = "false";
    // 페이지는 넘길 때만 저장 (조건을 바꾸면 page를 안 넘기므로 자동으로 첫 페이지)
    if (next.page !== undefined && next.page > 0) params.page = String(next.page + 1);
    setSearchParams(params, { replace: true });
  }

  // ----- 부서 목록 (선택 상자용) -----
  useEffect(() => {
    let ignore = false;
    setDepartmentError(null);

    getDepartments()
      .then((data) => {
        if (!ignore) setDepartments(flattenTree(buildTree(data)));
      })
      .catch((error) => {
        if (!ignore) setDepartmentError(toAttendanceErrorMessage(getErrorCode(error)));
      });

    return () => {
      ignore = true;
    }
  }, [reloadKey]);

  // ----- 근태 기록 (부서 목록을 받은 뒤에 조회: 주소의 부서 id가 유효한지 먼저 확인하기 위해) -----
  const departmentsReady = departments !== null;
  useEffect(() => {
    if (!departmentsReady) return;

    let ignore = false;
    setLoading(true);
    setRecordsError(null);

    fetchRecords({
      date,
      departmentId: departmentId ?? undefined,
      includeSubDepartments: departmentId !== null ? includeSub : undefined,
      page,
      size: PAGE_SIZE
    })
      .then((data) => {
        if (!ignore) setResult(data);
      })
      .catch((error) => {
        if (ignore) return;
        setResult(null); // 다른 조건의 목록이 남아 보이지 않게 비움
        setRecordsError(toAttendanceErrorMessage(getErrorCode(error)));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return (() => {
      ignore = true;
    });
  }, [departmentsReady, date, departmentId, includeSub, page, reloadKey]);

  // ----- 날짜 정보 (주말·휴일 표시용, 실패해도 기록 목록은 그대로 보여줌) -----
  useEffect(() => {
    let ignore = false;

    fetchDayInfo(date)
      .then((data) => {
        if (!ignore) setDayInfo(data);
      })
      .catch(() => {
        if (!ignore) setDayInfo(null);
      });

    return () => {
      ignore = true
    }
  }, [date, reloadKey]);

  // 지금 고른 날짜의 정보만 사용 (다른 날짜의 응답이 남아 있어도 보이지 않게)
  const currentDayInfo = dayInfo?.date === date ? dayInfo : null;

  const errorMessage = departmentError ?? recordsError;

  return (
    <div className="p-6">
      <PageHeader 
        title="근태 조회"
        description="날짜별로 재직 중이던 사원의 출근·퇴근 기록을 확인합니다. 휴가 여부는 반영되지 않습니다."
      />

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <TextField 
          id="records-date"
          label="날짜"
          type="date"
          className="w-44"
          value={date}
          onChange={(e) => {
            if (e.target.value !== "") updateConditions({ date: e.target.value });
          }}
        />
        <SelectField
          id="records-department"
          label="부서"
          className="w-56"
          value={departmentId === null ? "" : String(departmentId)}
          onChange={(e) => updateConditions({ departmentId: e.target.value === "" ? null : Number(e.target.value) })}
          disabled={departments === null}
        >
          <option value="">전체 부서</option>
          {departments?.map(({ node, depth }) => (
            <option key={node.id} value={node.id}>
              {indentLabel(node.name, depth)}
            </option>
          ))}
        </SelectField>
        <label className="flex h-9.5 items-center gap-2">
          <input 
            type="checkbox"
            className="size-4 accent-accent"
            checked={includeSub}
            disabled={departmentId === null}
            onChange={(e) => updateConditions({ includeSub: e.target.checked })}
          />
          <span className={departmentId === null ? "text-fg-muted" : undefined}>하위 부서 포함</span>
        </label>
      </div>

      {currentDayInfo && (currentDayInfo.weekend || currentDayInfo.holidays.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {currentDayInfo.weekend && (
            <span className="rounded border border-line px-2 py-0.5 text-xs text-fg-muted">주말</span>
          )}
          {currentDayInfo.holidays.map((holiday) => (
            <span key={`${holiday.type}-${holiday.name}`} className={holiday.type == "PUBLIC" ? "rounded bg-accent px-2 py-0.5 text-xs text-on-accent" : "rounded bg-hover px-2 py-0.5 text-xs"}>
              {holiday.type === "COMPANY" && "회사 · "}
              {holiday.name}
            </span>
          ))}
        </div>
      )}

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
            {records.length === 0 ? (
              <p className="text-fg-muted">이 날 재직 중이던 사원이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-xl text-left">
                  <thead className="border-b border-line text-sm text-fg-muted">
                    <tr>
                      <th className="py-2 pr-4 font-medium">사원</th>
                      <th className="py-2 pr-4 font-medium">부서</th>
                      <th className="py-2 pr-4 font-medium">출근</th>
                      <th className="py-2 pr-4 font-medium">퇴근</th>
                      <th className="py-2 font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(({ memberId, memberName,  departmentName, attendance }) => (
                      <tr key={memberId} className="border-b border-line">
                        <td className="py-2.5 pr-4">{memberName}</td>
                        <td className="py-2.5 pr-4 text-fg-muted">{departmentName ?? "-"}</td>
                        <td className="py-2.5 pr-4">{attendance ? formatTime(attendance.checkInAt) : "-"}</td>
                        <td className="py-2.5 pr-4">{attendance?.checkOutAt ? formatTime(attendance.checkOutAt) : "-"}</td>
                        <td className="py-2.5">
                          {attendance === null ? (
                            <span className="text-fg-muted">기록 없음</span>
                          ) : attendance.late || attendance.earlyLeave ? (
                            <span className="text-danger">
                              {[attendance.late && "지각", attendance.earlyLeave && "조퇴"]
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

            {result && (
              <div className="mt-3">
                <Pagination 
                  page={result.page.number}
                  totalPages={result.page.totalPages}
                  totalElements={result.page.totalElements}
                  unit="명"
                  onChange={(next) => updateConditions({ page: next })}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}