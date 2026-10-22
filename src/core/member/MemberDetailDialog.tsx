import { useId, useState, type SubmitEvent } from "react";
import type { MemberResponse } from "./types";
import { getMember, updateMember } from "./api";
import { useMemberFormOptions } from "./useMemberFormOptions";
import { fromNullableId, MemberFormFields, toNullableId, type MemberFormValues } from "./MemberFormFields";
import { toMemberErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { Dialog } from "../../shared/components/Dialog";
import { Button } from "../../shared/components/Button";
import { MailPlus, Pencil, ShieldCheck } from "lucide-react";
import { ROLE_LABELS, STATUS_LABELS } from "./labels";
import { LeaderBadge } from "./LeaderBadge";
import { useAuthStore } from "../auth/store";
import { MemberRoleForm } from "./MemberRoleForm";
import { MemberReinviteForm } from "./MemberReinviteForm";

interface MemberDetailDialogProps {
  member: MemberResponse;
  onClose: () => void;
  onChanged: () => void;
}

export function MemberDetailDialog({ member: initialMember, onClose, onChanged }: MemberDetailDialogProps) {
  const [member, setMember] = useState(initialMember);
  const [mode, setMode] = useState<"view" | "edit" | "role" | "reinvite">("view");
  const myId = useAuthStore((state) => state.me?.id);
  const isSelf = member.id === myId;
  const resigned = member.status === "RESIGNED";

  // 저장 후: 목록 새로고침 + 최신 정보로 상세 갱신
  async function handleSaved() {
    onChanged();
    try {
      setMember(await getMember(member.id));
    } catch (error) {
      // 상세 갱신에 실패해도 목록은 새로고침됨 → 이전 정보로 표시
    }
    setMode("view");
    if (isSelf) {
      // 이름·부서·권한이 바뀌었을 수 있음 → 타이틀바·상태바·메뉴 갱신
      // (권한이 사원이 되면 권한 가드가 홈으로 이동시킴)
      void useAuthStore.getState().loadMe();
    }
  }

  if (mode === "edit") {
    return (
      <MemberEditForm 
        member={member}
        onCancel={() => setMode("view")}
        onSaved={() => void handleSaved()}
        onClose={onClose}
      />
    );
  }

  if (mode === "role") {
    return (
      <MemberRoleForm 
        member={member}
        isSelf={isSelf}
        onCancel={() => setMode("view")}
        onSaved={() => void handleSaved()}
        onClose={onClose}
      />
    );
  }

  if (mode === "reinvite") {
    return (
      <MemberReinviteForm member={member} onBack={() => setMode("view")} onClose={onClose} />
    );
  }

  return (
    <Dialog
      open
      size="lg"
      title={member.name}
      onClose={onClose}
      footer={
        <>
          <div className="mr-auto flex flex-wrap gap-2">
            {!resigned && (
              <Button onClick={() => setMode("role")} className="mr-auto">
                <ShieldCheck aria-hidden="true" className="size-4" />
                권한 변경
              </Button>
            )}
            {member.status === "INVITED" && (
              <Button onClick={() => setMode("reinvite")}>
                <MailPlus aria-hidden="true" className="size-4" />
                초대 재발급
              </Button>
            )}
          </div>
          <Button onClick={onClose}>닫기</Button>
          {!resigned && (
            <Button variant="primary" data-autofocus onClick={() => setMode("edit")}>
              <Pencil aria-hidden="true" className="size-4" />
              정보 수정
            </Button>
          )}
        </>
      }
    >
      <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2.5">
        <dt className="text-fg-muted">이메일</dt>
        <dd className="break-all">{member.email}</dd>

        <dt className="text-fg-muted">권한</dt>
        <dd>{ROLE_LABELS[member.role]}</dd>

        <dt className="text-fg-muted">상태</dt>
        <dd>{STATUS_LABELS[member.status]}</dd>

        <dt className="text-fg-muted">부서</dt>
        <dd className="flex items-center gap-1.5">
          {member.departmentName ?? "-"}
          {member.leader && <LeaderBadge />}
        </dd>

        <dt className="text-fg-muted">직급</dt>
        <dd>{member.jobGradeName ?? "-"}</dd>

        <dt className="text-fg-muted">직책</dt>
        <dd>{member.jobTitleName ?? "-"}</dd>

        <dt className="text-fg-muted">입사일</dt>
        <dd className="tabular-nums">{member.hireDate ?? "-"}</dd>
      </dl>

      {resigned && (
        <p className="mt-4 text-sm text-fg-muted">
          퇴사한 사원은 수정하거나 권한을 바꿀 수 없습니다. 부서·직급 등 기록은 그대로 보관됩니다.
        </p>
      )}
    </Dialog>
  );
}

// ===== 정보 수정 =====
interface MemberEditFormProps {
  member: MemberResponse;
  onCancel: () => void; // 상세로 돌아가기
  onSaved: () => void;
  onClose: () => void; // Esc·X: 대화상자 닫기
}

function MemberEditForm({ member, onCancel, onSaved, onClose }: MemberEditFormProps) {
  const formId = useId();
  const { options, error: optionsError } = useMemberFormOptions();

  const [values, setValues] = useState<MemberFormValues>(() => ({
    name: member.name,
    departmentId: fromNullableId(member.departmentId),
    jobGradeId: fromNullableId(member.jobGradeId),
    jobTitleId: fromNullableId(member.jobTitleId),
    hireDate: member.hireDate ?? ""
  }));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field: keyof MemberFormValues, value: string) {
    setValues((prev) => ({...prev, [field]: value}));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const trimmedName = values.name.trim();
    if (trimmedName === "") {
      setErrorMessage("이름을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      // 보낸 값 = 새 값 (비워둔 칸은 null → 해제)
      await updateMember(member.id, {
        name: trimmedName,
        departmentId: toNullableId(values.departmentId),
        jobGradeId: toNullableId(values.jobGradeId),
        jobTitleId: toNullableId(values.jobTitleId),
        hireDate: values.hireDate || null
      });
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
      title={`${member.name} 정보 수정`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onCancel} disabled={submitting}>
            취소
          </Button>
          <Button type="submit" form={formId} variant="primary" disabled={!options || submitting}>
            {submitting ? "저장 중..." : "저장"}
          </Button>
        </>
      }
    >
      {optionsError ? (
        <p role="alert" className="text-sm text-danger">
          {optionsError}
        </p>
      ) : !options ? (
        <p role="status" className="text-sm text-fg-muted">
          불러오는 중…
        </p>
      ) : (
        <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-fg-muted">이메일 (로그인 ID)</p>
            <p className="break-all">{member.email}</p>
          </div>

          <MemberFormFields 
            idPrefix={formId}
            values={values}
            options={options}
            onChange={handleChange}
            nameAutoFocus
            departmentDisabled={member.leader}
            departmentHint={
              member.leader
                ? "부서장은 부서를 바꿀 수 없습니다. 부서 화면에서 부서장을 먼저 해제하거나 변경하세요."
                : undefined
            }
          />

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