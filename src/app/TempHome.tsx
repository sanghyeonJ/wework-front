import { useAuthStore } from "../core/auth/store";

// 임시 메인 화면: 앱 레이아웃 단계에서 삭제
export function TempHome() {
  const me = useAuthStore((state) => state.me);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <p>
        {me?.name} / {me?.companyName ?? "회사 없음"} / {me?.role}
      </p>
      <button
        type="button"
        onClick={() => void logout()}
        className="h-8 rounded-md border border-line px-3 hover:bg-hover"
      >
        로그아웃
      </button>
    </div>
  );
}