import { useId, useState, type SubmitEvent } from "react";
import { useMemberFormOptions } from "./useMemberFormOptions";
import { EMPTY_MEMBER_FORM, MemberFormFields, toNullableId, type MemberFormValues } from "./MemberFormFields";
import type { MemberInviteResponse } from "./types";
import { createMember } from "./api";
import { toMemberErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { Dialog } from "../../shared/components/Dialog";
import { Button } from "../../shared/components/Button";
import { InviteLinkBox } from "./InviteLinkBox";
import { TextField } from "../../shared/components/TextField";

// 간단한 이메일 형식 검사 (최종 검사는 백엔드 @Email)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface MemberCreateDialogProps {
  onClose: () => void;
  onCreated: () => void; // 발급되면 목록 새로고침
}

export function MemberCreateDialog({ onClose, onCreated }: MemberCreateDialogProps) {
  const formId = useId();
  const { options, error: optionsError } = useMemberFormOptions();

  const [email, setEmail] = useState("");
  const [values, setValues] = useState<MemberFormValues>(EMPTY_MEMBER_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<MemberInviteResponse | null>(null);

  function handleChange(field: keyof MemberFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const trimmedEmail = email.trim();
    const trimmedName = values.name.trim();
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setErrorMessage("이메일 형식을 확인해 주세요.");
      return;
    }
    if (trimmedName === "") {
      setErrorMessage("이름을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await createMember({
        email: trimmedEmail,
        name: trimmedName,
        departmentId: toNullableId(values.departmentId),
        jobGradeId: toNullableId(values.jobGradeId),
        jobTitleId: toNullableId(values.jobTitleId),
        hireDate: values.hireDate || null
      });
      setResult(response);
      onCreated();
    } catch (error) {
      setErrorMessage(toMemberErrorMessage(getErrorCode(error)));
    } finally {
      setSubmitting(false);
    }
  }

  // ===== 발급 완료 화면 =====
  if (result) {
    return (
      <Dialog
        open
        size="lg"
        title="계정 발급 완료"
        onClose={onClose}
        footer={
          <Button variant="primary" onClick={onClose}>
            닫기
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <p>
            <strong className="font-semibold">{result.member.name}</strong>({result.member.email})님의
            계정을 발급했습니다. 아래 링크를 전달하면 사원이 비밀번호를 설정하고 로그인할 수 있습니다.
          </p>
          <InviteLinkBox inviteUrl={result.inviteUrl} expiresAt={result.expiresAt} />
        </div>
      </Dialog>
    );
  }

  // ===== 입력 화면 =====
  return (
    <Dialog
      open
      size="lg"
      title="계정 발급"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={submitting}>
            취소
          </Button>
          <Button type="submit" form={formId} variant="primary" disabled={!options || submitting}>
            {submitting ? "발급 중..." : "발급"}
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
          <TextField 
            id={`${formId}-email`}
            label="이메일 (로그인 ID)"
            type="email"
            data-autofocus
            autoFocus
            maxLength={255}
            hint="모든 회사를 통틀어 하나만 사용할 수 있고, 발급 후에는 바꿀 수 없습니다."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <MemberFormFields 
            idPrefix={formId}
            values={values}
            options={options}
            onChange={handleChange}
          />

          <p className="text-xs text-fg-muted">
            발급한 계정은 사원 권한으로 시작합니다.<br />
            기업관리자 권한은 발급 후 사원 상세에서 줄 수 있습니다.
          </p>

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