import type { LeaveStatus, LeaveType } from "./types";

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  ANNUAL: "연차",
  HALF_AM: "오전 반차",
  HALF_PM: "오후 반차",
  SICK: "병가"
}

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  PENDING: "승인 대기",
  APPROVED: "승인",
  REJECTED: "반려",
  CANCELED: "취소"
}