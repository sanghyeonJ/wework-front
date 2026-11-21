import { api } from "../../shared/api/client";
import type { PageResponse } from "../../shared/types/api";
import type { LeaveStatus, LeaveSummary } from "./types";

export async function getMyLeaveRequests(year: number, status: LeaveStatus, page: number, size: number): Promise<PageResponse<LeaveSummary>> {
  const res = await api.get<PageResponse<LeaveSummary>>("/api/leave/requests/me", {params: { year, status, page, size }});
  return res.data;
}