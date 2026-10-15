// 백엔드 비밀번호 규칙과 동일하게 유지 (최종 검사는 백엔드 → INVALID_INPUT)
export const PASSWORD_HINT = "8~64자, 영문·숫자·특수문자를 각각 1개 이상 포함 (공백 불가)";

export function isValidPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    password.length <= 64 &&
    /[A-Za-z]/.test(password) && // 영문
    /\d/.test(password) && // 숫자
    /[^A-Za-z0-9\s]/.test(password) && // 특수문자 (영문·숫자·공백이 아닌 문자)
    !/\s/.test(password) // 공백 없음
  );
}