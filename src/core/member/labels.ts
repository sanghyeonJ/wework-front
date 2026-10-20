import type { MemberRole } from "../auth/types";
import type { MemberStatus } from "./types";

export const ROLE_LABELS: Record<MemberRole, string> = {
  SUPER_ADMIN: "최고관리자",
  COMPANY_ADMIN: "기업관리자",
  EMPLOYEE: "사원",
};

export const STATUS_LABELS: Record<MemberStatus, string> = {
  INVITED: "초대됨",
  ACTIVE: "재직",
  RESIGNED: "퇴사",
};