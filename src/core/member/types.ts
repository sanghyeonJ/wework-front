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
}

// GET /api/company/members 검색 조건 (전부 선택)
export interface MemberSearchParams {
  status?: MemberStatus;
  departmentId?: number;
  keyword?: string;
  page?: number; // 0부터
  size?: number;
  sort?: string; // 예: "name,asc"
}