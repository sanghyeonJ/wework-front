// 백엔드 MemberRole enum → 문자열 3개 중 하나만 허용
export type MemberRole = "SUPER_ADMIN" | "COMPANY_ADMIN" | "EMPLOYEE";

export interface LoginRequest{
  email: string;
  password: string
}

export interface TokenResponse{
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse{
  id: number;
  email: string;
  name: string;
  role: MemberRole;
  companyId: number | null;
  companyName: number | null;
  departmentId: number | null;
  departmentName: string | null;
  jobGradeName: string | null;
  jobTitleName: string | null;
}

export interface InvitationResponse {
  email: string;
  name: string;
  companyName: string;
  expiresAt: string;
}

export interface InvitationAcceptRequest {
  token: string;
  password: string;
}