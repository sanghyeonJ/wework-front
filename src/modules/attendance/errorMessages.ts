// 근태 관련 에러 코드 → 화면 문구
const MESSAGES: Record<string, string> = {
  // 출퇴근
  NOT_CHECKED_IN: "오늘 출근 기록이 없어 퇴근할 수 없습니다. 먼저 출근해 주세요.",
  ALREADY_CHECKED_IN: "이미 출근 처리되었습니다. 오늘 상태를 다시 불러왔습니다.",
  // 근무시간 설정
  INVALID_WORK_TIME:
    "퇴근 기준 시각은 출근 기준 시각보다 늦어야 합니다. (자정을 넘는 근무는 지원하지 않습니다)",
  WORK_SCHEDULE_NOT_FOUND: "삭제할 개인 설정이 없습니다. 목록을 새로 불러왔습니다.",
  // 다른 영역과 공유하는 코드 (근태 화면 기준 문구)
  MEMBER_NOT_FOUND: "선택한 사원을 찾을 수 없습니다. 창을 닫고 다시 시도해 주세요.",
  MEMBER_RESIGNED: "퇴사한 사원은 출근·퇴근하거나 근무시간을 설정할 수 없습니다.",
  DEPARTMENT_NOT_FOUND: "선택한 부서를 찾을 수 없습니다. 창을 닫고 다시 시도해 주세요.",
  INVALID_INPUT: "입력값을 확인해 주세요.",
  NETWORK_ERROR: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
};

export function toAttendanceErrorMessage(code: string): string {
  return MESSAGES[code] ?? "처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}