import type { ReactNode } from "react";
import { ThemeSwitcher } from "../../shared/components/ThemeSwitcher";

interface AuthWindowProps {
  footer?: ReactNode;
  children: ReactNode;
}

// 로그인 전 화면(로그인, 초대 수락 등)의 공통 창 틀
export function AuthWindow({ footer, children }: AuthWindowProps) {
  return (
    <div className="flex h-full overflow-y-auto p-4">
      <div className="m-auto w-full max-w-[360px] overflow-hidden rounded-lg border border-line bg-panel">
        {/** 타이틀 바 */}
        <div className="flex h-10 select-none items-center justify-between border-b border-line bg-chrome pl-3 pr-1.5">
          <span className="text-sm font-semibold">위워크</span>
          <ThemeSwitcher />
        </div>

        {children}

        {/** 하단 안내줄 */}
        {footer && (
          <p className="select-none border-t border-line bg-chrome px-6 py-2.5 text-xs text-fg-muted">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}