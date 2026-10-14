// 백엔드 GlobalExceptionHandler 응답: { code, message }
export interface ErrorResponse {
  code: string;
  message: string;
}

// 백엔드 페이징 응답 (via-dto 형식)
export interface PageResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  }
}