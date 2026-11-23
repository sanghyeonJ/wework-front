const MESSAGES: Record<string, string> = {
  NETWORK_ERROR: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
  INVALID_INPUT: "입력값을 확인해 주세요.",
  INVALID_LEAVE_YEAR: "조회할 수 없는 연도입니다.",
}

export function toLeaveErrorMessage(code: string): string {
  return MESSAGES[code] ?? "처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}