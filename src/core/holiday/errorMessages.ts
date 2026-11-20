// 휴일 관련 에러 코드
const MESSAGE: Record<string, string> = {
  INVALID_INPUT: "입력값을 확인해 주세요.",
  NETWORK_ERROR: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요."
}

export function toHolidayErrorMessage(code: string): string {
  return MESSAGE[code] ?? "처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}