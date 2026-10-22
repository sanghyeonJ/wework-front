import type { MemberRole } from "../auth/types";

export type MemberStatus = "INVITED" | "ACTIVE" | "RESIGNED";

export interface MemberResponse {
  id: number;
  email: string;
  name: string;
  role: MemberRole;
  status: MemberStatus;
  departmentId: number | null;
  departmentName: string | null;
  jobGradeId: number | null;
  jobGradeName: string | null;
  jobTitleId: number | null;
  jobTitleName: string | null;
  hireDate: string | null;
  resignDate: string | null;
  leader: boolean;
}

// GET /api/company/members 검색 조건 (전부 선택)
export interface MemberSearchParams {
  status?: MemberStatus;
  departmentId?: number;
  includeSubDepartments?: boolean; // true면 하위 부서 사원 포함 (기본 false = 직접 소속만)
  keyword?: string;
  page?: number; // 0부터
  size?: number;
  sort?: string; // 예: "name,asc"
}

// 계정 발급 (항상 EMPLOYEE·INVITED로 생성)
export interface MemberCreateRequest {
  email: string;
  name: string;
  departmentId: number | null;
  jobGradeId: number | null;
  jobTitleId: number | null;
  hireDate: string | null;
}

// 정보 수정 (보낸 값 = 새 값, null이면 해제)
export interface MemberUpdateRequest {
  name: string;
  departmentId: number | null;
  jobGradeId: number | null;
  jobTitleId: number | null;
  hireDate: string | null;
}

// 권한 변경으로 줄 수 있는 권한 (최고관리자 제외)
export type AssignableRole = Exclude<MemberRole, "SUPER_ADMIN">;

// 발급·초대 재발급 응답
export interface MemberInviteResponse {
  member: MemberResponse;
  inviteUrl: string;
  expiresAt: string;
}