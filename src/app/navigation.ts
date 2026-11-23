import type { NavSection } from "../core/module/types";
import { attendanceModule } from "../modules/attendance";

// 사이드바 메뉴
export const NAV_SECTIONS: NavSection[] = [
  {
    roles: ["SUPER_ADMIN", "COMPANY_ADMIN", "EMPLOYEE"],
    items: [{ label: "홈", path: "/" }]
  },
  {
    title: "회사 관리",
    roles: ["COMPANY_ADMIN"],
    items: [
      { label: "부서", path: "/company/departments" },
      { label: "직급·직책", path: "/company/positions" },
      { label: "사원", path: "/company/members" },
      { label: "휴일", path: "/company/holidays" }
    ]
  },
  ...attendanceModule.navSections,
  {
    title: "휴가",
    roles: ["COMPANY_ADMIN", "EMPLOYEE"],
    items: [
      { label: "내 휴가", path: "/leave/me" },
    ]
  },
  {
    title: "시스템 관리",
    roles: ["SUPER_ADMIN"],
    items: [
      { label: "회사", path: "/admin/companies" },
      { label: "공휴일", path: "/admin/public-holidays" }
    ]
  }
];