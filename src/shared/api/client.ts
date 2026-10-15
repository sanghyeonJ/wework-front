import axios from "axios";
import type { ErrorResponse } from "../types/api";
import { tokenStorage } from "./tokenStorage";

// 모든 API 요청은 이 인스턴스를 사용
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000
})

// 요청 인터셉터: 보내기 직전에 액세스 토큰을 헤더에 첨부
api.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
})

// 에러에서 백엔드 에러 코드 꺼내기
export function getErrorCode(error: unknown): string {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    // 응답이 없으면 서버 꺼짐·네트워크 문제·CORS 차단
    return error.response?.data?.code ?? "NETWORK_ERROR"
  }
  return "UNKNOWN_ERROR";
}