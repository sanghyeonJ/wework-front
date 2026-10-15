import axios, { type InternalAxiosRequestConfig } from "axios";
import type { ErrorResponse } from "../types/api";
import { tokenStorage } from "./tokenStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 모든 API 요청은 이 인스턴스를 사용
export const api = axios.create({
  baseURL: BASE_URL,
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

// 인증 끊김 알림 (core/auth가 처리 함수를 등록)
let authFailureHandler: (() => void) | null = null;

export function onAuthFailure(handle: () => void) {
  authFailureHandler = handle;
}

function handleAuthFailure() {
  tokenStorage.clear();
  authFailureHandler?.();
}

// ===== 토큰 재발급 =====
interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// 진행 중인 재발급 (동시에 여러 요청이 만료돼도 재발급은 한 번만)
let refreshPromise: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error("리프레시 토큰 없음");
  }
  // api 인스턴스가 아닌 기본 axios 사용 → 인터셉터를 거치지 않음 (무한 반복 방지)
  const res = await axios.post<RefreshResponse>(
    `${BASE_URL}/api/auth/refresh`,
    { refreshToken },
    { timeout: 10000 }
  );
  tokenStorage.save(res.data.accessToken, res.data.refreshToken);
}

// 재시도 여부 표시를 위해 요청 설정에 _retried 필드 추가
type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// 응답 인터셉터: 만료면 재발급 후 원래 요청 재시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError<ErrorResponse>(error) || !error.config) {
      throw error;
    }

    const original = error.config as RetryableConfig;
    const code = error.response?.data?.code;

    // 1) 액세스 토큰 만료 → 재발급 후 한 번만 재시도
    if (code === "TOKEN_EXPIRED" && !original._retried) {
      original._retried = true;
      try {
        refreshPromise ??= refreshTokens().finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
      } catch (refreshError) {
        // 서버 연결 실패면 토큰 유지, 그 외(INVALID_REFRESH_TOKEN 등)는 로그아웃
        if (getErrorCode(refreshError) !== "NETWORK_ERROR") {
          handleAuthFailure();
        }
        throw refreshError;
      }
      return api(original);  // 요청 인터셉터가 새 토큰을 붙여서 다시 보냄
    }

    // 2) 토큰을 보냈는데 401 (잘못된 토큰, 퇴사자 등) → 로그아웃
    if (error.response?.status === 401 && original.headers.Authorization) {
      handleAuthFailure();
    }

    throw error;
  }
);

// 에러에서 백엔드 에러 코드 꺼내기
export function getErrorCode(error: unknown): string {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    // 응답이 없으면 서버 꺼짐·네트워크 문제·CORS 차단
    return error.response?.data?.code ?? "NETWORK_ERROR"
  }
  return "UNKNOWN_ERROR";
}