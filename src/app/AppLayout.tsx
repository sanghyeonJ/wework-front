import { NavLink, Outlet } from "react-router";
import { useAuthStore } from "../core/auth/store";
import type { MemberRole, MeResponse } from "../core/auth/types";
import { ThemeSwitcher } from "../shared/components/ThemeSwitcher";
import { NAV_SECTIONS } from "./navigation";
import { ChevronDown } from "lucide-react";

import { ROLE_LABELS } from "../core/member/labels";

// 로그인 후 모든 화면의 공통 틀
export function AppLayout() {
  const me = useAuthStore((state) => state.me);
  if (!me) return null;

  return (
    <div className="flex h-full flex-col">
      <TitleBar me={me} />
      <div className="flex min-h-0 flex-1">
        <Sidebar role={me.role} />
        <main className="min-w-0 flex-1 overflow-auto bg-panel">
          <Outlet />
        </main>
      </div>
      <StatusBar me={me} />
    </div>
  );
}

// ===== 타이틀바 =====
function TitleBar({ me }: { me: MeResponse }) {
  return (
    <header className="flex h-12 shrink-0 select-none items-center justify-between border-b border-line bg-chrome pl-3 pr-1.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="font-semibold">위워크</span>
        <span aria-hidden="true" className="h-4 border-l border-line" />
        <span className="truncate text-fg-muted">{me.companyName ?? "시스템 관리"}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <ThemeSwitcher />
        <UserMenu me={me} />
      </div>
    </header>
  );
}

function UserMenu({ me }: { me: MeResponse }) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <>
      <button
        type="button"
        popoverTarget="user-menu"
        className="flex h-8.5 items-center gap-1 rounded-md px-2 hover:bg-hover"
      >
        <span className="font-medium text-sm">{me.name}</span>
        <ChevronDown aria-hidden="true" className="size-4 text-fg-muted" />
      </button>

      {/* popover: 바깥 클릭·Esc로 닫히는 브라우저 기본 기능 */}
      <div
        id="user-menu"
        popover="auto"
        className="fixed bottom-auto left-auto right-1.5 top-12 m-0 w-64 rounded-md border border-line bg-panel p-1 text-fg shadow-lg"
      >
        <div className="px-2.5 py-2">
          <p className="font-medium">{me.name}</p>
          <p className="truncate text-sm text-fg-muted">{me.email}</p>
          <p className="text-sm text-fg-muted">{ROLE_LABELS[me.role]}</p>
        </div>
        <div className="my-1 border-t border-line" />
        <button
          type="button"
          onClick={() => void logout()}
          className="flex h-9.5 w-full items-center rounded px-2.5 text-left hover:bg-hover"
        >
          로그아웃
        </button>
      </div>
    </>
  );
}

// ===== 사이드바 =====
function Sidebar({ role }: { role: MemberRole }) {
  const sections = NAV_SECTIONS.filter((section) => section.roles.includes(role));

  return (
    <nav
      aria-label="메뉴"
      className="w-60 shrink-0 select-none overflow-y-auto border-r border-line bg-chrome p-2"
    >
      {sections.map((section, index) => (
        <div key={section.title ?? index} className="mb-3">
          {section.title && (
            <p className="px-2 pb-1 pt-2 text-xs text-fg-muted">{section.title}</p>
          )}
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) => 
                    `flex h-8.5 items-center rounded-md px-2 ${
                      isActive
                        ? "bg-panel font-medium text-fg ring-1 ring-line"
                        : "text-fg-muted hover:bg-hover hover:text-fg"
                    }`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

// ===== 상태바 =====
function StatusBar({ me }: { me: MeResponse }) {
  const items = [me.companyName ?? "시스템 관리", ROLE_LABELS[me.role], me.departmentName];

  return (
    <footer className="flex h-7 shrink-0 select-none items-center border-t border-line bg-chrome px-3 text-xs text-fg-muted">
      {items
        .filter((item) => item)
        .map((item, index) => (
          <span key={index} className="flex items-center">
            {index > 0 && <span aria-hidden="true" className="mx-2.5 h-3 border-l border-line" />}
            {item}
          </span>
        ))
      }
    </footer>
  );
}