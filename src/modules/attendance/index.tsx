// 근태 모듈 (백엔드 모듈 코드 ATTENDANCE)

import { RequireRole } from "../../core/auth/RouteGuards";
import type { ModuleDefinition } from "../../core/module/types";
import { PlaceholderPage } from "../../shared/components/PlaceholderPage";
import { AttendanceRecordsPage } from "./AttendanceRecordsPage";
import { MyAttendancePage } from "./MyAttendancePage";

// 화면은 아직 임시 화면
export const attendanceModule: ModuleDefinition = {
  code: "ATTENDENCE",
  routes: [
    // 내 근태 기록 (기업관리자, 사원)
    {
      element: <RequireRole roles={["COMPANY_ADMIN", "EMPLOYEE"]} />,
      children: [
        { path: "/attendance/me", element: <MyAttendancePage /> }
      ]
    },

    // 관리자 화면 (백엔드 /api/attendance/manage/**)
    {
      element: <RequireRole roles={["COMPANY_ADMIN"]} />,
      children: [
        { path: "/attendance/manage/records", element: <AttendanceRecordsPage /> },
        { path: "/attendance/manage/schedules", element: <PlaceholderPage title="근무시간 설정" /> }
      ]
    }
  ],
  navSections: [
    {
      title: "근태",
      roles: ["COMPANY_ADMIN", "EMPLOYEE"],
      items: [{ label: "내 근태 기록", path: "/attendance/me" }]
    },
    {
      roles: ["COMPANY_ADMIN"],
      items: [
        { label: "근태 조회", path: "/attendance/manage/records" },
        { label: "근무시간 설정", path: "/attendance/manage/schedules" }
      ]
    }
  ]
}