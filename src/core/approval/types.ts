
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";
export type ApprovalStepStatus = "WAITING" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "SKIPPED";

export interface ApprovalSummary {
  id: number;
  targetType: string;
  targetId: number;
  title: string;
  requesterName: string;
  status: ApprovalStatus;
  requestedAt: string;
}

export interface ApprovalStep {
  step: number;
  approverName: string;
  processedByName: string | null;
  status: ApprovalStepStatus;
  comment: string | null;
  processedAt: string | null;
}

export interface ApprovalDetail extends ApprovalSummary {
  canceledByName: string | null;
  canceledAt: string | null;
  cancelReason: string | null;
  steps: ApprovalStep[];
}