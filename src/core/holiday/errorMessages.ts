// 휴일 관련 에러 코드
const MESSAGE: Record<string, string> = {
  INVALID_INPUT: "입력값을 확인해 주세요.",
  NETWORK_ERROR: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
  HOLIDAY_DATE_DUPLICATED: "이미 같은 날짜에 등록된 휴일이 있습니다.",
  HOLIDAY_NOT_FOUND: "이미 삭제되었거나 없는 휴일입니다. 목록을 새로 불러왔습니다.",

  UNSUPPORTED_HOLIDAY_COUNTRY: "지원하지 않는 국가입니다.",
  INVALID_HOLIDAY_YEAR: "불러올 수 있는 연도는 2015년부터 내년까지입니다.",
  HOLIDAY_API_FAILED: "공공 데이터 서버에서 공휴일을 받지 못했습니다. 아무것도 저장되지 않았으니 잠시 후 다시 시도해 주세요.",
  HOLIDAY_API_KEY_NOT_CONFIGURED: "서버에 공공 데이터 서비스 키가 설정되어 있지 않습니다.",
}

export function toHolidayErrorMessage(code: string): string {
  return MESSAGE[code] ?? "처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}