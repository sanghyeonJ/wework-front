import { Navigate, Outlet } from "react-router";
import { LoadingScreen } from "../../shared/components/LoadingScreen";
import { useAuthStore } from "./store";

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