import type { RouteObject } from "react-router";
import type { MemberRole } from "../auth/types";

// 사이드바 메뉴 한 줄
export interface NavItem {
  label: string;
  path: string;
}

// 사이드바 메뉴 묶음 (roles에 있는 권한만 보임)
export interface NavSection {
  title?: string;
  roles: MemberRole[];
  items: NavItem[];
}

// 모듈이 app에 넘겨주는 자기소개서
export interface ModuleDefinition {
  code: string;  // 모듈 코드 (백엔드 company_module.module_code와 같은 값, 예: "ATTENDANCE")
  routes: RouteObject[];  // 이 모듈의 화면 주소 목록
  navSections: NavSection[];  // 이 모듈의 사이드바 메뉴
}