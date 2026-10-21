import { useEffect, useId, useRef, useState } from "react";
import { Button } from "../../shared/components/Button";
import { Check, Copy } from "lucide-react";
import { formatDateTime } from "../../shared/utils/format";

interface InviteLinkBoxProps {
  inviteUrl: string;
  expiresAt: string;
}

// 초대 링크 표시 + 복사 (발급·재발급 공용)
export function InviteLinkBox({ inviteUrl, expiresAt }: InviteLinkBoxProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  // "복사됨" 표시는 2초 뒤 원래대로
  useEffect(() => {
    if(!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
    } catch (error) {
      // 클립보드 권한이 없으면 글자를 선택해 둠 → 사용자가 직접 ⌘C
      inputRef.current?.select();
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm text-fg-muted">
        초대 링크
      </label>
      <div className="flex gap-2">
        <input 
          id={inputId}
          ref={inputRef}
          readOnly
          value={inviteUrl}
          onFocus={(e) => e.target.select()}
          className="h-9.5 min-w-0 flex-1 rounded-md border border-line bg-app px-2.5 text-sm"
        />

        <Button data-autofocus onClick={() => void handleCopy()}>
          {copied ? (
            <Check aria-hidden="true" className="size-4" />
          ) : (
            <Copy aria-hidden="true" className="size-4" />
          )}
          {copied ? "복사됨" : "복사"}
        </Button>
      </div>

      <p className="text-xs text-fg-muted">
        {formatDateTime(expiresAt)}까지 사용할 수 있습니다.<br />
        링크는 지금만 표시되며, 다시 필요하면 사원 상세에서 초대를 재발급하세요.
      </p>
      {/* 화면 낭독기에 복사 완료 알림 */}
      <span aria-live="polite" className="sr-only">
        {copied ? "초대 링크를 복사했습니다." : ""}
      </span>
    </div>
  );
}