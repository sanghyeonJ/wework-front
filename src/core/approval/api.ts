import { api } from "../../shared/api/client";

export async function cancelApproval(approvalRequestId: number, comment?: string): Promise<void> {
  const trimmed = comment ? comment.trim() : null;
  const body = trimmed ? { comment: trimmed } : {};
  await api.post(`/api/approvals/${approvalRequestId}/cancel`, body);
}