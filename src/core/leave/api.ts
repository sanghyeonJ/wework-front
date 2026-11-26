import { api } from "../../shared/api/client";
import type { PageResponse } from "../../shared/types/api";
import type { LeaveApplyRequest, LeaveApplyResponse, LeaveBalance, LeaveDays, LeaveStatus, LeaveSummary, LeaveType } from "./types";

export async function getMyLeaveRequests(year: number, page: number, size: number, status?: LeaveStatus): Promise<PageResponse<LeaveSummary>> {
  const res = await api.get<PageResponse<LeaveSummary>>("/api/leave/requests/me", { params: { year, status, page, size } });
  return res.data;
}

export async function getMyBalance(year: number): Promise<LeaveBalance> {
  const res = await api.get<LeaveBalance>("/api/leave/balance", { params: {year} });
  return res.data;
}

export async function createLeaveRequest(request: LeaveApplyRequest): Promise<LeaveApplyResponse> {
  const res = await api.post<LeaveApplyResponse>("/api/leave/requests", request);
  return res.data;
}

export async function getLeaveDays(leaveType: LeaveType, startDate: string, endDate: string): Promise<LeaveDays> {
  const res = await api.get<LeaveDays>("/api/leave/days", { params: {leaveType: leaveType, startDate: startDate, endDate: endDate} });
  return res.data;
}