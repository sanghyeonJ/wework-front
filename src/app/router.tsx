import { createBrowserRouter } from "react-router";

import { LoginPage } from "../core/auth/LoginPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage />},
  { path: "/invite", element: <div>초대수락 화면</div> },
  { path: "/", element: <div>메인 화면</div> },
  { path: "*", element: <div>페이지를 찾을 수 없습니다.</div> },
]);