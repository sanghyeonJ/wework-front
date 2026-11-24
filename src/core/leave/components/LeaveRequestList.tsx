import { useEffect, useState } from "react";
import type { LeaveStatus, LeaveSummary } from "../types"
import type { PageResponse } from "../../../shared/types/api";
import { getMyLeaveRequests } from "../api";
import { toLeaveErrorMessage } from "../errorMessages";
import { getErrorCode } from "../../../shared/api/client";
import { Button } from "../../../shared/components/Button";
import { LEAVE_STATUS_LABELS, LEAVE_TYPE_LABELS } from "../labels";
import { Pagination } from "../../../shared/components/Pagination";
import { LeaveCancelDialog } from "./LeaveCancelDialog";

export type LeaveRequestListProps = {
  year: number,
  status?: LeaveStatus;
}

const PAGE_SIZE = 10;

export function LeaveRequestList({year, status}: LeaveRequestListProps) {

  const [result, setResult] = useState<PageResponse<LeaveSummary> | null>(null);
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [cancelTarget, setCancelTarget] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setErrorMessage(null);

    getMyLeaveRequests(year, page, PAGE_SIZE, status)
      .then((data) => {
        if (!ignore) {
          setResult(data);
        }
      })
      .catch((error) => {
        if (ignore) return;
        setResult(null);
        setErrorMessage(toLeaveErrorMessage(getErrorCode(error)));
      })
      .finally(() => {
        if(!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    }
  }, [year, status, page, reloadKey]);


  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">신청 내역</h2>

      {errorMessage ? (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-danger">{errorMessage}</p>
          <Button onClick={() => setReloadKey((key) => key + 1)}>다시 불러오기</Button>
        </div>
      ) : result === null ? (
        <p className="text-fg-muted">불러오는 중...</p>
      ) : result.content.length === 0 ? (
        <p className="text-fg-muted">이 조건에 해당하는 신청이 없습니다.</p>
      ) : (
        <div className={loading ? "opacity-60": undefined}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-96 text-left">
              <thead className="border-b border-line text-sm text-fg-muted">
                <tr>
                  <th className="py-2 pr-4 font-medium">기간</th>
                  <th className="py-2 pr-4 font-medium">종류</th>
                  <th className="py-2 pr-4 font-medium">일수</th>
                  <th className="py-2 pr-4 font-medium">상태</th>
                  <th className="py-2 font-medium">작업</th>
                </tr>
              </thead>
              <tbody>
                {result.content.map((leave) => (
                  <tr key={leave.id} className="border-b border-line">
                    <td className="py-2.5 pr-4">
                      {leave.startDate === leave.endDate
                      ? leave.startDate
                      : `${leave.startDate} ~ ${leave.endDate}`}
                    </td>
                    <td className="py-2.5 pr-4">{LEAVE_TYPE_LABELS[leave.leaveType]}</td>
                    <td className="py-2.5 pr-4">{leave.days}일</td>
                    <td className="py-2.5 pr-4">{LEAVE_STATUS_LABELS[leave.status]}</td>
                    <td className="py-2.5">
                      {leave.status === "PENDING" &&
                       <Button onClick={() => setCancelTarget(leave.approvalRequestId)}>취소</Button> 
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <Pagination 
              page={page}
              totalPages={result.page.totalPages}
              totalElements={result.page.totalElements}
              onChange={setPage}
            />
          </div>
        </div>
      )}

      {cancelTarget !== null && (
        <LeaveCancelDialog 
          approvalRequestId={cancelTarget}
          onClose={() => { setCancelTarget(null); setReloadKey((key) => key + 1) }}
          onCanceled={() => { setCancelTarget(null); setReloadKey((key) => key + 1) }}
        />
      )}
    </section>
  );
}