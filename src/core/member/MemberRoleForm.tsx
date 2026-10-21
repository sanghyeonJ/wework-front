import { useId, useState, type SubmitEvent } from "react";
import type { AssignableRole, MemberResponse } from "./types";
import { changeMemberRole } from "./api";
import { toMemberErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { Dialog } from "../../shared/components/Dialog";
import { Button } from "../../shared/components/Button";
import { ROLE_LABELS } from "./labels";

const ROLE_OPTIONS: AssignableRole[] = ["COMPANY_ADMIN", "EMPLOYEE"];

const ROLE_GUIDES: Record<AssignableRole, { summary: string; abilities: string[] }> = {
  COMPANY_ADMIN: {
    summary: "회사 전체를 관리하는 권한입니다.",
    abilities: [
      "회사 관리 메뉴 사용: 부서·직급·직책·사원 관리",
      "사원 계정 발급, 정보 수정, 퇴사 처리, 초대 재발급",
      "다른 사원에게 기업관리자 권한 부여·회수",
      "회사 휴일 등록, 근태·휴가 관리",
      "출퇴근 기록, 휴가 신청 등 사원 기능도 그대로 사용",
    ]
  },
  EMPLOYEE: {
    summary: "자기 업무를 처리하는 기본 권한입니다.",
    abilities: [
      "회사에서 사용하는 기능의 개인 업무만 사용 (출퇴근 기록, 휴가 신청 등)",
      "회사 관리 메뉴는 보이지 않으며 사용할 수 없음",
    ]
  }
}

interface MemberRoleFormProps {
  member: MemberResponse;
  isSelf: boolean;  // 로그인한 본인의 권한을 바꾸는 경우
  onCancel: () => void;
  onSaved: () => void;
  onClose: () => void;
}

export function MemberRoleForm({ member, isSelf, onCancel, onSaved, onClose }: MemberRoleFormProps) {
  const formId = useId();
  const currentRole: AssignableRole = member.role === "COMPANY_ADMIN" ? "COMPANY_ADMIN" : "EMPLOYEE";

  const [selected, setSelected] = useState<AssignableRole>(currentRole);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const demoting = currentRole === "COMPANY_ADMIN" && selected === "EMPLOYEE";

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || selected === currentRole) return;

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await changeMemberRole(member.id, selected);
      onSaved();
    } catch (error) {
      setErrorMessage(toMemberErrorMessage(getErrorCode(error)));
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open
      size="lg"
      title={`${member.name} 권한 변경`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onCancel} disabled={submitting}>
            취소
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            disabled={submitting || selected === currentRole}
          >
            {submitting ? "변경 중..." : "변경"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <p className="text-sm text-fg-muted">
          현재 권한: <span className="font-medium text-fg">{ROLE_LABELS[currentRole]}</span>
        </p>

        {/* 권한 선택 + 할 수 있는 일 */}
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">새 권한</legend>
          {ROLE_OPTIONS.map((role) => {
            const checked = selected === role;
            const guide = ROLE_GUIDES[role];
            return (
              <label 
                key={role}
                className={`flex gap-3 rounded-lg border p-3 ${
                  checked ? "border-accent ring-1 ring-accent" : "border-line hover:bg-hover/50"
                }`}
              >
                <input 
                  type="radio"
                  name={`${formId}-role`}
                  value={role}
                  checked={checked}
                  data-autofocus={checked ? true : undefined}
                  onChange={() => setSelected(role)}
                  className="mt-1 size-4 shrink-0 accent-accent"
                />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    {ROLE_LABELS[role]}
                    {role === currentRole && (
                      <span className="rounded px-1.5 text-xs font-medium text-fg-muted ring-1 ring-line">
                        현재
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-fg-muted">{guide.summary}</p>
                  <ul className="mt-2 list-disc space-y-0.5 pl-4 text-sm">
                    {guide.abilities.map((ability) => (
                      <li key={ability}>{ability}</li>
                    ))}
                  </ul>
                </div>
              </label>
            );
          })}
        </fieldset>

        {/* 알아둘 점 */}
        <div className="rounded-lg border border-line bg-app px-3 py-2.5 text-sm">
          <p className="font-medium">알아둘 점</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-fg-muted">
            <li>
              부서장 여부는 권한과 관계없습니다. 부서장은 권한이 사원이어도 소속 사원의 휴가를
              승인하고, 기업관리자라도 부서장이 아니면 결재선에 들어가지 않습니다.
            </li>
            <li>
              이미 로그인 중인 사람에게는 최대 1일 뒤에 완전히 반영됩니다. 바로 반영하려면 그
              사람이 로그아웃한 뒤 다시 로그인하면 됩니다.
            </li>
            {demoting && <li>회사에는 재직 중인 기업관리자가 최소 1명 있어야 합니다.</li>}
          </ul>
        </div>

        {/* 본인을 사원으로 바꾸는 경우 경고 */}
        {isSelf && demoting && (
          <p role="alert" className="text-sm text-danger">
            본인의 권한을 사원으로 바꾸면 저장 즉시 회사 관리 화면을 사용할 수 없게 됩니다. 다시
            기업관리자가 되려면 다른 기업관리자에게 요청해야 합니다.
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