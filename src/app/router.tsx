import { createBrowserRouter } from "react-router";

import { LoginPage } from "../core/auth/pages/LoginPage";
import { GuestOnly, RequireAuth, RequireRole } from "../core/auth/components/RouteGuards";
import { InvitePage } from "../core/auth/pages/InvitePage";
import { AppLayout } from "./AppLayout";

import { PlaceholderPage } from "../shared/components/PlaceholderPage";
import { PositionsPage } from "../core/position/pages/PositionsPage";
import { DepartmentsPage } from "../core/department/pages/DepartmentsPage";
import { MembersPage } from "../core/member/pages/MembersPage";
import { attendanceModule } from "../modules/attendance";
import { HomePage } from "./HomePage";
import { HolidaysPage } from "../core/holiday/pages/HolidaysPage";
import { PublicHolidaysPage } from "../core/holiday/pages/PublicHolidaysPage";
import { MyLeavePage } from "../core/leave/pages/MyLeavePage";

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
          { path: "/", element: <HomePage /> },
          // 기업관리자 (백엔드 /api/company/**)
          {
            element: <RequireRole roles={["COMPANY_ADMIN"]} />,  // 여러 권한 혀용을 대비한 배열로
            children: [
              { path: "/company/departments", element: <DepartmentsPage /> },
              { path: "/company/positions", element: <PositionsPage /> },
              { path: "/company/members", element: <MembersPage /> },
              { path: "/company/holidays", element: <HolidaysPage /> },
            ]
          },
          // 사용자 + 기업관리자
          {
            element: <RequireRole roles={["COMPANY_ADMIN", "EMPLOYEE"]} />,
            children: [
              { path: "/leave/me", element: <MyLeavePage /> },
            ]
          },
          // 최고관리자 (백엔드 /api/admin/**)
          {
            element: <RequireRole roles={["SUPER_ADMIN"]} />,
            children: [
              { path: "/admin/companies", element: <PlaceholderPage title="회사" /> },
              { path: "/admin/public-holidays", element: <PublicHolidaysPage /> }
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