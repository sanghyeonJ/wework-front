// 직급·직책 공용 (백엔드 PositionResponse, PositionRequest)
export interface PositionResponse {
  id: number;
  name: string;
  level: number; // 작을수록 높음
}

export interface PositionRequest {
  name: string;
  level: number;
}