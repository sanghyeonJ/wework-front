export type LeaveType = "ANNUAL" | "HALF_AM" | "HALF_PM" | "SICK";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";

export interface LeaveSummary {
  id: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  approvalRequestId: number;
}

export interface LeaveBalance {
  year: number;
  grantedDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
}