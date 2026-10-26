import { useEffect, useState } from "react";
import type { WorkSchedule } from "./types";
import { deleteMemberSchedule, fetchSchedules, saveCompanySchedule, saveMemberSchedule } from "./api";
import { toAttendanceErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { PageHeader } from "../../shared/components/PageHeader";
import { Button } from "../../shared/components/Button";
import { WorkScheduleFormDialog, type WorkScheduleFormValues } from "./WorkScheduleFormDialog";
import { MemberSchedulePickerDialog } from "./MemberSchedulePickerDialog";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";

// 서버의 "09:00:00" → 화면의 "09:00"
function toClock(time: string): string {
  return time.slice(0, 5);
}

// 회사 설정이 없을 때 폼의 처음 값 (백엔드 기본값과 같음)
const DEFAULT_FORM: WorkScheduleFormValues = { startTime: "09:00", endTime: "18:00", graceMinutes: "0" };

// 서버의 설정 한 줄 → 폼의 처음 값 (회사 폼, 개인 수정 폼이 같이 씀)
function toFormValues(schedule: WorkSchedule): WorkScheduleFormValues {
  return {
    startTime: toClock(schedule.startTime),
    endTime: toClock(schedule.endTime),
    graceMinutes: String(schedule.graceMinutes),
  };
}

// 개인 설정 행에서 연 대화상자 (수정 / 삭제 확인)
type RowTarget =
  | { kind: "edit"; schedule: WorkSchedule }
  | { kind: "delete"; schedule: WorkSchedule };

// 근무시간 설정 (관리자)
export function WorkSchedulesPage() {
  const [schedules, setSchedules] = useState<WorkSchedule[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [target, setTarget] = useState<RowTarget | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const companySchedule = schedules?.find((schedule) => schedule.scopeType === "COMPANY") ?? null;
  const companyFormInitial = companySchedule ? toFormValues(companySchedule) : DEFAULT_FORM;

  // 수정 대상의 사원 id (const로 뽑아 두면 아래 콜백 안에서도 null이 아님이 유지됨)
  const editSchedule = target?.kind === "edit" ? target.schedule : null;
  const editMemberId = editSchedule?.memberId ?? null;
  const deleteSchedule = target?.kind === "delete" ? target.schedule : null;

  function reload() {
    setReloadKey((key) => key + 1);
  }

  // 삭제 확인창을 열 때 이전 상태를 비움 (닫았다 다시 열어도 옛 에러가 안 남게)
  function openDelete(schedule: WorkSchedule) {
    setDeleteBusy(false);
    setDeleteError(null);
    setTarget({ kind: "delete", schedule });
  }

  async function handleDelete(schedule: WorkSchedule) {
    if (schedule.memberId === null) return; // 개인 설정에서만 호출되므로 실제로는 없는 경우
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await deleteMemberSchedule(schedule.memberId);
      setTarget(null);
      reload();
    } catch (error) {
      const code = getErrorCode(error);
      setDeleteError(toAttendanceErrorMessage(code));
      // 다른 관리자가 먼저 지운 경우: 문구("목록을 새로 불러왔습니다")대로 실제로 다시 불러옴
      if (code === "WORK_SCHEDULE_NOT_FOUND") reload();
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="p-6">
      <PageHeader 
        title="근무시간 설정"
        description="회사 전체 근무시간과 사원별 근무시간을 관리합니다. 사원별 설정이 회사 설정보다 우선합니다."
        actions={
          <>
            <Button disabled={schedules === null} onClick={() => setPickerOpen(true)}>
              개인 설정 추가
            </Button>
            <Button variant="primary" disabled={schedules === null} onClick={() => setCompanyFormOpen(true)}>
              {companySchedule ? "회사 설정 수정" : "회사 설정 추가"}
            </Button>
          </>
        }
      />

      <div className="mt-5">
        {errorMessage ? (
          <div className="flex flex-col items-start gap-3">
            <p role="alert" className="text-danger">
              {errorMessage}
            </p>
            <Button onClick={reload}>다시 불러오기</Button>
          </div>
        ) : schedules === null ? (
          <p className="text-fg-muted">불러오는 중…</p>
        ) : (
          <>
            {!companySchedule && (
              <p className="mb-3 text-sm text-fg-muted">
                회사 설정이 없어 기본값(09:00~18:00, 지각 유예 0분)이 적용됩니다.
              </p>
            )}
            {schedules.length === 0 ? (
              <p className="text-fg-muted">저장된 설정이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-3xl text-left">
                  <colgroup>
                    <col className="w-[14%]" />
                    <col />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[14%]" />
                    <col className="w-[16%]" />
                  </colgroup>
                  <thead className="border-b border-line text-sm text-fg-muted">
                    <tr>
                      <th className="py-2 pr-4 font-medium">구분</th>
                      <th className="py-2 pr-4 font-medium">대상</th>
                      <th className="py-2 pr-4 font-medium">출근 기준</th>
                      <th className="py-2 pr-4 font-medium">퇴근 기준</th>
                      <th className="py-2 pr-4 font-medium">지각 유예</th>
                      <th className="py-2 font-medium ">
                        <span className="sr-only">작업</span>
                      </th>
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
                        <td className="py-2.5 pr-4">{schedule.graceMinutes}분</td>
                        <td className="py-1.5 text-right">
                          {/* 개인 설정에만 작업 버튼 (회사 설정은 위의 "회사 설정 수정") */}
                          {schedule.scopeType === "MEMBER" && (
                            <span className="inline-flex gap-2">
                              <Button
                                aria-label={`${schedule.memberName ?? "사원"} 수정`}
                                onClick={() => setTarget({ kind: "edit", schedule })}
                              >
                                수정
                              </Button>
                              <Button
                                variant="danger"
                                aria-label={`${schedule.memberName ?? "사원"} 삭제`}
                                onClick={() => openDelete(schedule)}
                              >
                                삭제
                              </Button>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {companyFormOpen && (
        <WorkScheduleFormDialog 
          title="회사 일괄 근무시간"
          initial={companyFormInitial}
          save={saveCompanySchedule}
          onClose={() => setCompanyFormOpen(false)}
          onSaved={reload}
        />
      )}

      {pickerOpen && (
        <MemberSchedulePickerDialog 
          formInitial={companyFormInitial}
          onClose={() => setPickerOpen(false)}
          onSaved={reload}
        />
      )}

      {editSchedule && editMemberId !== null && (
        <WorkScheduleFormDialog
          key={editSchedule.id}
          title={`${editSchedule.memberName ?? "사원"} 근무시간`}
          initial={toFormValues(editSchedule)}
          save={(body) => saveMemberSchedule(editMemberId, body)}
          onClose={() => setTarget(null)}
          onSaved={reload}
        />
      )}

      {deleteSchedule && (
        <ConfirmDialog
          open
          title="개인 근무시간 삭제"
          message={`${deleteSchedule.memberName ?? "사원"}님의 개인 설정을 삭제합니다. 삭제하면 회사 설정(없으면 기본값)이 적용됩니다.`}
          confirmLabel="삭제"
          busy={deleteBusy}
          errorMessage={deleteError}
          onConfirm={() => void handleDelete(deleteSchedule)}
          onClose={() => setTarget(null)}
        />
      )}
    </div>
  );
}