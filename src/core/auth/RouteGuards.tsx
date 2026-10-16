import { Navigate, Outlet } from "react-router";
import { LoadingScreen } from "../../shared/components/LoadingScreen";
import { useAuthStore } from "./store";
import type { MemberRole } from "./types";

// 로그인한 사람만 통과, 아니면 로그인 화면으로
export function RequireAuth() {
  const status = useAuthStore((state) => state.status);

  if (status === "checking") return <LoadingScreen />;
  if (status === "guest") return <Navigate to="/login" replace />;
  return <Outlet />;
}

// 로그인 안 한 사람만 통과, 로그인했으면 메인으로
export function GuestOnly() {
  const status = useAuthStore((state) => state.status);

  if (status === "checking") return <LoadingScreen />;
  if (status === "authenticated") return <Navigate to="/" replace />;
  return <Outlet />;
}

interface RequireRoleProps {
  roles: MemberRole[];
}

// 지정한 권한만 통과, 아니면 홈으로 (RequireAuth 안쪽에서 사용)
export function RequireRole({ roles }: RequireRoleProps) {
  const role = useAuthStore((state) => state.me?.role);

  if (!role || !roles.includes(role)) return <Navigate to="/" replace />
  return <Outlet />;
}