import { createBrowserRouter } from "react-router";

import { LoginPage } from "../core/auth/LoginPage";
import { GuestOnly, RequireAuth } from "../core/auth/RouteGuards";
import { TempHome } from "./TempHome";

export const router = createBrowserRouter([

  // 로그인 안 한 사람만
  {
    element: <GuestOnly />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  // 누구나
  { path: "/invite", element: <div>초대 수락 화면 (5단계에서 교체)</div> },
  // 로그인한 사람만
  {
    element: <RequireAuth />,
    children: [{ path: "/", element: <TempHome /> }],
  },
  { path: "*", element: <div>페이지를 찾을 수 없습니다.</div> },
]);