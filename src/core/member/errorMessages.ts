// 사원 관련 에러 코드 → 화면 문구
const MESSAGES: Record<string, string> = {
  MEMBER_NOT_FOUND: "이미 삭제되었거나 없는 사원입니다. 목록을 새로 불러왔습니다.",
  EMAIL_DUPLICATED: "이미 사용 중인 이메일입니다. 이메일은 모든 회사를 통틀어 하나만 쓸 수 있습니다.",
  INVALID_MEMBER_ROLE: "지정할 수 없는 권한입니다.",
  MEMBER_RESIGNED: "퇴사한 사원은 수정하거나 권한을 바꿀 수 없습니다.",
  MEMBER_NOT_INVITED: "초대 상태인 사원만 초대 링크를 다시 발급할 수 있습니다.",
  LEADER_CANNOT_CHANGE_DEPARTMENT:
    "부서장은 부서를 바꿀 수 없습니다. 부서 화면에서 부서장을 먼저 해제하거나 변경하세요.",
  LEADER_CANNOT_RESIGN:
    "부서장은 퇴사 처리할 수 없습니다. 부서 화면에서 부서장을 먼저 해제하거나 변경하세요.",
  LAST_COMPANY_ADMIN: "회사에는 재직 중인 기업관리자가 최소 1명 있어야 합니다.",
  DEPARTMENT_NOT_FOUND: "선택한 부서를 찾을 수 없습니다. 창을 닫고 다시 시도해 주세요.",
  JOB_GRADE_NOT_FOUND: "선택한 직급을 찾을 수 없습니다. 창을 닫고 다시 시도해 주세요.",
  JOB_TITLE_NOT_FOUND: "선택한 직책을 찾을 수 없습니다. 창을 닫고 다시 시도해 주세요.",
  INVALID_INPUT: "입력값을 확인해 주세요.",
  NETWORK_ERROR: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
};

export function toMemberErrorMessage(code: string): string {
  return MESSAGES[code] ?? "처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}