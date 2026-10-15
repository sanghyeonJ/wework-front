const ACCESS_TOKEN_KEY = "wework-access-token";
const REFRESH_TOKEN_KEY = "wework-refresh-token";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;  // localStorage를 못 쓰는 환경이면 토큰 없음으로 처리
  }
}

// 토큰은 화면을 다시 그릴 필요가 없는 값이라 Zustand가 아닌 일반 객체로 관리
export const tokenStorage = {
  getAccessToken(): string | null {
    return read(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return read(REFRESH_TOKEN_KEY);
  },
  save(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}