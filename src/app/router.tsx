import { createBrowserRouter } from "react-router";

import { LoginPage } from "../core/auth/LoginPage";
import { GuestOnly, RequireAuth, RequireRole } from "../core/auth/RouteGuards";
import { InvitePage } from "../core/auth/InvitePage";
import { AppLayout } from "./AppLayout";

import { PlaceholderPage } from "../shared/components/PlaceholderPage";
import { PositionsPage } from "../core/position/PositionsPage";
import { DepartmentsPage } from "../core/department/DepartmentsPage";
import { MembersPage } from "../core/member/MembersPage";
import { attendanceModule } from "../modules/attendance";

export const router = createBrowserRouter([

  // 로그인 안 한 사람만
  {
    element: <GuestOnly />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  // 누구나
  { path: "/invite", element: <InvitePage /> },
  // 로그인한 사람만 → 앱 레이아웃 안에 표시
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <PlaceholderPage title="홈" note="근태 현황" /> },
          // 기업관리자 (백엔드 /api/company/**)
          {
            element: <RequireRole roles={["COMPANY_ADMIN"]} />,  // 여러 권한 혀용을 대비한 배열로
            children: [
              { path: "/company/departments", element: <DepartmentsPage /> },
              { path: "/company/positions", element: <PositionsPage /> },
              { path: "/company/members", element: <MembersPage /> },
            ]
          },
          // 최고관리자 (백엔드 /api/admin/**)
          {
            element: <RequireRole roles={["SUPER_ADMIN"]} />,
            children: [
              { path: "/admin/companies", element: <PlaceholderPage title="회사" /> },
            ]
          },
          // 모듈 (모듈이 자기 라우트를 정의, app은 끼워 넣기만 함)
          ...attendanceModule.routes,
          // 없는 주소
          { path: "*", element: <PlaceholderPage title="페이지를 찾을 수 없습니다" note="주소를 다시 확인해 주세요." /> },
        ]
      }
    ],
  },
  { path: "*", element: <div>페이지를 찾을 수 없습니다.</div> },
]);