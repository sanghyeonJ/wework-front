export interface DepartmentResponse {
  id: number;
  name: string;
  parentId: number | null; // null이면 최상위 부서
  leaderId: number | null;
  leaderName: string | null;
}

// 생성·수정 공용 모양 (수정 시 이름과 상위 부서를 항상 함께 보냄)
export interface DepartmentRequest {
  name: string;
  parentId: number | null;
}