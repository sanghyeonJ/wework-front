import { useEffect, useId, useState, type SubmitEvent } from "react";
import type { DepartmentNode } from "./tree";
import type { MemberResponse } from "../member/types";
import { getMembers } from "../member/api";
import { toDepartmentErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { changeDepartmentLeader } from "./api";
import { Dialog } from "../../shared/components/Dialog";
import { Button } from "../../shared/components/Button";
import { SelectField } from "../../shared/components/SelectField";

interface DepartmentLeaderDialogProps {
  department: DepartmentNode;
  onClose: () => void;
  onSaved: () => void;
  onStale: () => void;
}

// 선택지에 표시할 이름: "홍길동 (과장, 팀장)"
function memberLabel(member: MemberResponse): string {
  const extra = [member.jobGradeName, member.jobTitleName].filter(Boolean).join(", ");
  return extra ? `${member.name} (${extra})` : member.name;
}

export function DepartmentLeaderDialog({
  department,
  onClose,
  onSaved,
  onStale
}: DepartmentLeaderDialogProps) {
  const formId = useId();

  const [members, setMembers] = useState<MemberResponse[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [leaderId, setLeaderId] = useState(
    department.leaderId !== null ? String(department.leaderId) : ""
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 이 부서의 재직 사원만 조회 (부서장 후보)
  useEffect(() => {
    let ignore = false;
    getMembers({ departmentId: department.id, status: "ACTIVE", size: 100 })
      .then((page) => {
        if (ignore) return;
        const sorted = [...page.content].sort((a, b) => a.name.localeCompare(b.name, "ko"));
        setMembers(sorted);
      })
      .catch((error) => {
        if (!ignore) setLoadError(toDepartmentErrorMessage(getErrorCode(error)));
      });
    
    return () => {
      ignore = true;
    }
  }, [department.id]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const nextLeaderId = leaderId === "" ? null : Number(leaderId);
    if (nextLeaderId === department.leaderId) {
      onClose();
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await changeDepartmentLeader(department.id, nextLeaderId);
      onSaved();
    } catch (error) {
      const code = getErrorCode(error);
      setErrorMessage(toDepartmentErrorMessage(code));
      if (code === "DEPARTMENT_NOT_FOUND") onStale();
      setSubmitting(false);
    }
  }

  const ready = members !== null && !loadError;

  return (
    <Dialog
      open
      title={`${department.name} 부서장 지정`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={submitting}>취소</Button>
          <Button type="submit" form={formId} variant="primary" disabled={!ready || submitting}>
            {submitting ? "저장 중..." : "저장"}
          </Button>
        </>
      }
    >
      {loadError ? (
        <p role="alert" className="text-sm text-danger">
          {loadError}
        </p>
      ) : members === null ? (
        <p role="status" className="text-sm text-fg-muted">
          사원 목록을 불러오는 중...
        </p>
      ) : (
        <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <SelectField
            id={`${formId}-leader`}
            label="부서장"
            hint={
              members.length === 0
                ? "이 부서에 소속된 재직 사원이 없습니다. 사원 화면에서 먼저 부서를 지정하세요."
                : "이 부서에 소속된 재직 사원만 선택할 수 있습니다."
            }
            value={leaderId}
            onChange={(e) => setLeaderId(e.target.value)}
          >
            <option value="">지정 안 함</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {memberLabel(member)}
              </option>
            ))}
          </SelectField>

          {errorMessage && (
            <p role="alert" className="text-sm text-danger">
              {errorMessage}
            </p>
          )}
        </form>
      )}
    </Dialog>
  );
}