import { api } from "../../shared/api/client";
import type { PageResponse } from "../../shared/types/api";
import type { ApprovalDetail, ApprovalSummary } from "./types";

export async function cancelApproval(approvalRequestId: number, comment?: string): Promise<void> {
  const trimmed = comment ? comment.trim() : null;
  const body = trimmed ? { comment: trimmed } : {};
  await api.post(`/api/approvals/${approvalRequestId}/cancel`, body);
}


export async function getPendingApprovals(page: number, size: number): Promise<PageResponse<ApprovalSummary>> {
  const res = await api.get<PageResponse<ApprovalSummary>>("/api/approvals/pending", { params: { page, size } });
  return res.data;
}

export async function getProcessedApprovals(page: number, size: number): Promise<PageResponse<ApprovalSummary>> {
  const res = await api.get<PageResponse<ApprovalSummary>>("/api/approvals/processed", {params: { page, size }});
  return res.data;
}

export async function getApprovalDetail(id: number): Promise<ApprovalDetail> {
  const res = await api.get<ApprovalDetail>(`/api/approvals/${id}`);
  return res.data;
}

export async function approveApproval(id: number, comment?: string): Promise<void> {
  const trimmed = comment ? comment.trim() : null;
  const body = trimmed ? {comment: trimmed} : {};
  await api.post(`/api/approvals/${id}/approve`, body);
}

export async function rejectApproval(id: number, comment?: string): Promise<void> {
  const trimmed = comment ? comment.trim() : null;
  const body = trimmed ? { comment: trimmed } : {};
  await api.post(`/api/approvals/${id}/reject`, body);
}