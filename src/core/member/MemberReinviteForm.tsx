import { useState } from "react";
import type { MemberInviteResponse, MemberResponse } from "./types";
import { reissueInvitation } from "./api";
import { toMemberErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { Dialog } from "../../shared/components/Dialog";
import { Button } from "../../shared/components/Button";
import { InviteLinkBox } from "./InviteLinkBox";

interface MemberReinviteFormProps {
  member: MemberResponse;
  onBack: () => void;  // 상세로 돌아가기
  onClose: () => void;
}

export function MemberReinviteForm({ member, onBack, onClose }: MemberReinviteFormProps) {
  const [result, setResult] = useState<MemberInviteResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleReissue() {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      setResult(await reissueInvitation(member.id));
    } catch (error) {
      setErrorMessage(toMemberErrorMessage(getErrorCode(error)));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open
      size="lg"
      title={`${member.name} 초대 재발급`}
      onClose={onClose}
      footer={
        result ? (
          <Button variant="primary" onClick={onBack}>
            확인
          </Button>
        ) : (
          <>
            <Button data-autofocus onClick={onBack} disabled={submitting}>
              취소
            </Button>
            <Button variant="primary" onClick={() => void handleReissue()} disabled={submitting}>
              {submitting ? "발급 중..." : "발급"}
            </Button>
          </>
        )
      }
    >
      {result ? (
        <div className="flex flex-col gap-4">
          <p>새 초대 링크를 발급했습니다. 이전에 전달한 링크는 더 이상 사용할 수 없습니다.</p>
          <InviteLinkBox inviteUrl={result.inviteUrl} expiresAt={result.expiresAt} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p>
            <strong className="font-semibold">{member.name}</strong>({member.email})님에게 전달할 새
            초대 링크를 발급합니다.
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-fg-muted">
            <li>이전에 발급한 링크는 즉시 사용할 수 없게 됩니다.</li>
            <li>링크를 잃어버렸거나 만료되었을 때 사용하세요.</li>
          </ul>
          {errorMessage && (
            <p role="alert" className="text-sm text-danger">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </Dialog>
  );
}