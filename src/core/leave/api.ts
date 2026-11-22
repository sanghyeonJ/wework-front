import { api } from "../../shared/api/client";
import type { PageResponse } from "../../shared/types/api";
import type { LeaveStatus, LeaveSummary } from "./types";

export async function getMyLeaveRequests(year: number, page: number, size: number, status?: LeaveStatus): Promise<PageResponse<LeaveSummary>> {
  const res = await api.get<PageResponse<LeaveSummary>>("/api/leave/requests/me", { params: { year, status, page, size } });
  return res.data;
}