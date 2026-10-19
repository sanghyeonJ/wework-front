// 부서 관련 에러 코드 → 화면 문구
const MESSAGES: Record<string, string> = {
  DEPARTMENT_NOT_FOUND: "이미 삭제되었거나 없는 부서입니다. 목록을 새로 불러왔습니다.",
  DEPARTMENT_NAME_DUPLICATED: "이미 같은 이름의 부서가 있습니다.",
  ROOT_DEPARTMENT_ALREADY_EXISTS: "최상위 부서는 회사에 하나만 만들 수 있습니다.",
  ROOT_DEPARTMENT_CANNOT_MOVE: "최상위 부서는 다른 부서 아래로 옮길 수 없습니다.",
  CIRCULAR_DEPARTMENT: "자기 자신이나 자기 하위 부서 아래로는 옮길 수 없습니다.",
  DEPARTMENT_HAS_CHILDREN: "하위 부서가 있어 삭제할 수 없습니다. 하위 부서를 먼저 옮기거나 삭제하세요.",
  DEPARTMENT_HAS_MEMBERS: "소속된 사원(초대 중 포함)이 있어 삭제할 수 없습니다. 사원의 부서를 먼저 바꾸세요.",
  INVALID_DEPARTMENT_LEADER: "부서장은 이 부서에 소속된 재직 중인 사원만 지정할 수 있습니다.",
  MEMBER_NOT_FOUND: "선택한 사원을 찾을 수 없습니다. 목록을 새로 불러왔습니다.",
  INVALID_INPUT: "입력값을 확인해 주세요.",
  NETWORK_ERROR: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
};

export function toDepartmentErrorMessage(code: string): string {
  return MESSAGES[code] ?? "처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}