import { useId, useState, type SubmitEvent } from "react";
import type { MemberResponse } from "./types";
import { resignMember } from "./api";
import { toMemberErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { Dialog } from "../../shared/components/Dialog";
import { Button } from "../../shared/components/Button";
import { todayString } from "../../shared/utils/format";
import { TextField } from "../../shared/components/TextField";

interface MemberResignFormProps{
  member: MemberResponse;
  onBack: () => void;
  onClose: () => void;
  onResigned: () => void;
}

export function MemberResignForm({ member, onBack, onClose, onResigned }: MemberResignFormProps) {
  const formId = useId();
  const invited = member.status === "INVITED";
  const blocked = member.leader;
  const today = todayString();

  const [resignDate, setResignDate] = useState(today);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || blocked) return;

    const beforeHire = member.hireDate !== null && resignDate < member.hireDate;
    if (resignDate === "" || resignDate > today || beforeHire) {
      setErrorMessage(toMemberErrorMessage("INVALID_RESIGN_DATE"));
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await resignMember(member.id, resignDate);
      onResigned();
    } catch (error) {
      setErrorMessage(toMemberErrorMessage(getErrorCode(error)));
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open
      size="lg"
      title={`${member.name} 퇴사 처리`}
      onClose={onClose}
      footer={
        <>
          <Button data-autofocus onClick={() => onBack()} disabled={submitting}>
            취소
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="danger"
            disabled={blocked || submitting}
          >
            {submitting ? "처리 중..." : "퇴사 처리"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <p>
          <strong className="font-semibold">{member.name}</strong>({member.email})님을 퇴사 처리합니다.
        </p>

        <TextField
          id={`${formId}-resign-date`}
          label="퇴사일"
          type="date"
          min={member.hireDate ?? undefined}
          max={today}
          hint={
            member.hireDate
              ? `입사일(${member.hireDate})부터 오늘까지 선택할 수 있습니다.`
              : "오늘 또는 그 이전 날짜를 선택할 수 있습니다."
          }
          disabled={blocked}
          value={resignDate}
          onChange={(e) => setResignDate(e.target.value)}
        />

        <ul className="list-disc space-y-1 pl-4 text-sm text-fg-muted">
          {invited ? (
            <li>초대 링크가 무효가 되어 더 이상 계정을 활성화할 수 없습니다.</li>
          ) : (
            <li>
              더 이상 로그인할 수 없습니다. 이미 로그인 중인 화면도 새로고침하면 로그아웃되며, 늦어도 1일 안에 접속이 끊깁니다.
            </li>
          )}
          <li>부서·직급·직책 등 기록은 보관되며, 사원 목록에는 &lsquo;퇴사&rsquo;로 표시됩니다.</li>
          <li>
            되돌릴 수 없습니다. 다시 근무하게 되면 새 계정을 발급해야 하며, 같은 이메일은 다시 사용할 수 없습니다.
          </li>
        </ul>

        {blocked && (
          <p role="alert" className="text-sm text-danger">
            부서장은 퇴사 처리할 수 없습니다. 부서 화면에서 {member.departmentName}의 부서장을 먼저
            해제하거나 변경하세요.
          </p>
        )}

        {errorMessage && (
          <p role="alert" className="text-sm text-danger">
            {errorMessage}
          </p>
        )}
      </form>
    </Dialog>
  );
}