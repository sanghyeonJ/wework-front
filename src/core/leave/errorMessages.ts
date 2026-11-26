const MESSAGES: Record<string, string> = {
  NETWORK_ERROR: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
  INVALID_INPUT: "입력값을 확인해 주세요.",
  INVALID_LEAVE_YEAR: "조회할 수 없는 연도입니다.",
  NO_WORKING_DAY: "선택한 기간에 근무일이 없습니다.",
  INVALID_LEAVE_PERIOD: "기간을 확인해 주세요.",
  INSUFFICIENT_LEAVE_BALANCE: "신청 가능한 연차가 부족합니다.",
  LEAVE_OVERLAPPED: "이미 신청한 휴가와 기간이 겹칩니다.",
  INVALID_APPROVER: "선택할 수 없는 결재자가 있습니다. 다시 선택해 주세요.",
  INVALID_APPROVER_COUNT: "결재자는 1명 이상 5명 이하로 지정해 주세요.",
  MEMBER_NOT_FOUND: "선택한 결재자를 찾을 수 없습니다. 다시 선택해 주세요.",
}

export function toLeaveErrorMessage(code: string): string {
  return MESSAGES[code] ?? "처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}