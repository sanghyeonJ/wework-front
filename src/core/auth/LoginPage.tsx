import { useState, type FormEvent } from "react";
import { getErrorCode } from "../../shared/api/client";
import { ThemeSwitcher } from "../../shared/components/ThemeSwitcher";
import { useAuthStore } from "./store";
import { AuthWindow } from "./AuthWindow";
import { TextField } from "../../shared/components/TextField";
import { Button } from "../../shared/components/Button";


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
    <AuthWindow footer={
      <>
        계정은 회사 관리자가 발급합니다.
        <br />
        비밀번호를 잊었다면 관리자에게 문의하세요.
      </>
    }>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 px-6 pb-6 pt-5">
        <div>
          <h1 className="text-lg font-semibold">로그인</h1>
          <p className="mt-1 text-sm text-fg-muted">회사에서 발급받은 계정으로 로그인하세요.</p>
        </div>

        <TextField 
          id="email"
          label="이메일"
          type="email"
          autoComplete="username"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField 
          id="password"
          label="이메일"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMessage && (
          <p role="alert" className="text-sm text-danger">
            {errorMessage}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {submitting ? "로그인 중..." : "로그인"}
        </Button>
      </form>
    </AuthWindow>
  );
}