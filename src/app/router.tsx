import { createBrowserRouter } from "react-router";
import { ThemeSwitcher } from "../shared/components/ThemeSwitcher";

export const router = createBrowserRouter([
  { path: "/login", element: (
    <div className="flex h-full items-center justify-center gap-3">
        <span>로그인 화면 (3단계에서 교체)</span>
        <ThemeSwitcher />
      </div>
  ) },
  { path: "/invite", element: <div>초대수락 화면</div> },
  { path: "/", element: <div>메인 화면</div> },
  { path: "*", element: <div>페이지를 찾을 수 없습니다.</div> },
]);