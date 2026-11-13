import type { LeaveType } from "./types";

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  ANNUAL: "연차",
  HALF_AM: "오전 반차",
  HALF_PM: "오후 반차",
  SICK: "병가"
}