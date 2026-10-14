import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  { path: "/login", element: <div>로그인 화면</div> },
  { path: "/invite", element: <div>초대수락 화면</div> },
  { path: "/", element: <div>메인 화면</div> },
  { path: "*", element: <div>페이지를 찾을 수 없습니다.</div> },
]);