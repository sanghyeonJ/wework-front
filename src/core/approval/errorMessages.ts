// 걀재 관련 에러 코드
const MESSAGE: Record<string, string> = {
  NETWORK_ERROR: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
  INVALID_INPUT: "입력값을 확인해 주세요.",
  APPROVAL_NOT_FOUND: "찾을 수 없는 신청입니다.",
  APPROVAL_ALREADY_CLOSED: "이미 처리가 끝난 신청입니다.",
  CANCEL_NOT_ALLOWED: "승인이 끝난 신청은 직접 취소할 수 없습니다.",
  NOT_APPROVER: "취소할 권한이 없습니다.",
  CONCURRENT_MODIFICATION: "다른 사용자가 먼저 처리했습니다. 다시 확인해 주세요.",
}

export function toApprovalErrorMessage(code: string): string {
  return MESSAGE[code] ?? "처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}