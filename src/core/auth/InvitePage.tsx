import { useNavigate, useSearchParams } from "react-router";
import type { InvitationResponse } from "./types";
import { useEffect, useState, type SubmitEvent } from "react";
import { acceptInvitation, getInvitation } from "./api";
import { getErrorCode } from "../../shared/api/client";
import { AuthWindow } from "./AuthWindow";
import { isValidPassword, PASSWORD_HINT } from "./passwordRule";
import { TextField } from "../../shared/components/TextField";
import { Button } from "../../shared/components/Button";

// 링크 자체를 쓸 수 없는 경우의 문구
const LINK_ERROR_MESSAGES: Record<string, string> = {
  INVITATION_NOT_FOUND: "유효하지 않은 초대 링크입니다. 받은 링크 주소를 다시 확인해 주세요.",
  INVITATION_EXPIRED: "초대 링크가 만료되었습니다. 회사 관리자에게 초대 재발급을 요청하세요.",
  INVITATION_ALREADY_USED: "이미 사용된 초대 링크입니다. 설정한 비밀번호로 로그인하세요.",
  NETWORK_ERROR: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
};
const DEFAULT_LINK_ERROR_MESSAGE = "초대 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

// 화면 상태: 네 가지 중 하나
type PageState = 
  | { kind: "loading" }
  | { kind: "invalid", message: string }
  | { kind: "form", invitation: InvitationResponse }
  | { kind: "done" };

export function InvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, setState] = useState<PageState>(() => 
    token
      ? { kind: "loading" }
      : { kind: "invalid", message: LINK_ERROR_MESSAGES.INVITATION_NOT_FOUND });
  
  // 화면이 열리면 초대 정보 조회
  useEffect(() => {
    if (!token) return;

    let ignore = false;
    getInvitation(token)
      .then((invitation) => {
        if (!ignore) setState({ kind: "form", invitation });
      })
      .catch((error) => {
        if (!ignore) {
          const message = LINK_ERROR_MESSAGES[getErrorCode(error)] ?? DEFAULT_LINK_ERROR_MESSAGE;
          setState({ kind: "invalid", message });
        }
      });
    
    return () => {
      ignore = true;  // 화면을 떠난 뒤 도착한 응답은 무시
    }
  }, [token]);

  return (
    <AuthWindow footer="비밀번호를 설정하면 계정이 활성화되고 로그인할 수 있습니다.">
      {state.kind === "loading" && (
        <p role="status" className="px-6 py-8 text-sm text-fg-muted">
          초대 정보를 확인하는 중...
        </p>
      )}

      {state.kind === "invalid" && (
        <Notice title="초대 링크를 사용할 수 없습니다" message={state.message} />
      )}

      {state.kind === "form" && (
        <AcceptForm
          token={token}
          invitation={state.invitation}
          onDone={() => setState({ kind: "done" })}
          onInvalid={(message) => setState({ kind: "invalid", message })}
        />
      )}

      {state.kind === "done" && (
        <Notice title="계정이 활성화되었습니다." message="설정한 비밀번호로 로그인하세요." />
      )}
    </AuthWindow>
  );
}

// ===== 비밀번호 설정 폼 =====

const LINK_ERROR_CODES = ["INVITATION_NOT_FOUND", "INVITATION_EXPIRED", "INVITATION_ALREADY_USED"];

const ACCEPT_ERROR_MESSAGES: Record<string, string> = {
  INVALID_INPUT: "비밀번호 규칙을 확인해 주세요.",
  NETWORK_ERROR: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
};
const DEFAULT_ACCEPT_ERROR_MESSAGE = "계정을 활성화하지 못했습니다. 잠시 후 다시 시도해 주세요.";

interface AcceptFormProps {
  token: string;
  invitation: InvitationResponse;
  onDone: () => void;
  onInvalid: (message: string) => void;
}

function AcceptForm({ token, invitation, onDone, onInvalid }: AcceptFormProps) {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = password !== "" && passwordConfirm !== "" && !submitting;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    // 서버에 보내기 전에 화면에서 먼저 검사
    if (!isValidPassword(password)) {
      setErrorMessage("비밀번호 규칙을 확인해 주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await acceptInvitation({ token, password });
      onDone();
    } catch (error) {
      const code = getErrorCode(error);
      // 입력하는 사이 만료되거나 다른 곳에서 사용된 경우 → 안내 화면으로 전환
      if (LINK_ERROR_CODES.includes(code)) {
        onInvalid(LINK_ERROR_MESSAGES[code]);
        return;
      }
      setErrorMessage(ACCEPT_ERROR_MESSAGES[code] ?? DEFAULT_ACCEPT_ERROR_MESSAGE);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 px-6 pb-6 pt-5">
      <div>
        <h1 className="text-lg font-semibold">계정 활성화</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {invitation.companyName}에서 {invitation.name}님을 초대했습니다.
        </p>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-md border border-line bg-app px-3 py-2 text-sm">
        <dt className="text-fg-muted">이메일</dt>
        <dd className="truncate">{invitation.email}</dd>
        <dt className="text-fg-muted">링크 만료</dt>
        <dd>{formatDateTime(invitation.expiresAt)}</dd>
      </dl>

      {/* 비밀번호 관리자가 어떤 계정의 비밀번호인지 알 수 있게 (화면에는 안 보임) */}
      <input type="email" autoComplete="username" value={invitation.email} readOnly hidden />

      <TextField 
        id="password"
        label="비밀번호"
        type="password"
        autoComplete="new-password"
        autoFocus
        hint={PASSWORD_HINT}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <TextField 
        id="passwordConfirm"
        label="비밀번호 확인"
        type="password"
        autoComplete="new-password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
      />

      {errorMessage && (
        <p role="alert" className="text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={!canSubmit}>
        {submitting ? "활성화 중..." : "계정 활성화"}
      </Button>
    </form>
  );
}

// ===== 안내 화면 (사용 불가, 완료 공용) =====
function Notice({ title, message }: {title: string, message: string}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 px-6 pb-6 pt-5">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-fg-muted">{message}</p>
      </div>
      <Button variant="primary" onClick={() => navigate("/login")}>
        로그인 화면으로
      </Button>
    </div>
  );
}

// 날짜·시간 표시 (다국어 모듈 때 공통 유틸로 이동)
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
}