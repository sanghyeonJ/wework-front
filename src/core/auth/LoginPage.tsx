import { useState, type FormEvent } from "react";
import { getErrorCode } from "../../shared/api/client";
import { ThemeSwitcher } from "../../shared/components/ThemeSwitcher";
import { useAuthStore } from "./store";


// 에러 코드 → 화면 문구 (다국어 모듈 때 번역 파일로 이동)
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.",
  INVALID_INPUT: "이메일 형식을 확인해 주세요.",
  NETWORK_ERROR: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
};
const DEFAULT_ERROR_MESSAGE = "로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.";

const INPUT_CLASS = "h-8 rounded-md border border-line bg-panel px-2.5 text-base";

export function LoginPage() {
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim() !== "" && password.trim() !== "" && !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await login(email.trim(), password);
    } catch (error) {
      setErrorMessage(ERROR_MESSAGES[getErrorCode(error)] ?? DEFAULT_ERROR_MESSAGE);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="w-full max-w-[360px] overflow-hidden rounded-lg border border-line bg-panel">
        {/* 타이틀바 */}
        <div className="flex h-10 select-none items-center justify-between border-b border-line bg-chrome pl-3 pr-1.5">
          <span className="text-sm font-semibold">위워크</span>
          <ThemeSwitcher />
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 px-6 pb-6 pt-5">
          <div>
            <h1 className="text-lg font-semibold">로그인</h1>
            <p className="mt-1 text-sm text-fg-muted">회사에서 발급받은 계정으로 로그인하세요.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-fg-muted">
              이메일
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-fg-muted">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm text-danger">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="h-8 rounded-md bg-accent font-medium text-on-accent hover:bg-accent-hover disabled:opacity-50"
          >
            {submitting ? "로그인 중…" : "로그인"}
          </button>
        </form>

        {/* 하단 안내줄 */}
        <p className="select-none border-t border-line bg-chrome px-6 py-2.5 text-xs text-fg-muted">
          계정은 회사 관리자가 발급합니다.<br />비밀번호를 잊었다면 관리자에게 문의하세요.
        </p>
      </div>
    </div>
  );
}