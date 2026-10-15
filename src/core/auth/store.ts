import { create } from "zustand";
import { getErrorCode, onAuthFailure } from "../../shared/api/client";
import { tokenStorage } from "../../shared/api/tokenStorage";
import * as authApi from "./api";
import type { MeResponse } from "./types";

// checking: 저장된 토큰으로 확인 중 / authenticated: 로그인됨 / guest: 로그인 안 됨
export type AuthStatus = "checking" | "authenticated" | "guest";

interface AuthState {
  me: MeResponse | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  me: null,
  status: "checking",

  // 로그인
  login: async (email, password) => {
    const tokens = await authApi.login({ email, password });
    tokenStorage.save(tokens.accessToken, tokens.refreshToken);
    try {
      const me = await authApi.getMe();
      set({ me, status: "authenticated" });
    } catch (error) {
      tokenStorage.clear();
      throw error;
    }
  },

  // 앱 시작·새로고침 시 저장된 토큰으로 내 정보 다시 불러오기
  loadMe: async () => {
    if (!tokenStorage.getAccessToken()) {
      set({ me: null, status: "guest" })
      return;
    }
    try {
      const me = await authApi.getMe();
      set({ me, status: "authenticated" });
    } catch (error) {
      // 서버 연결 실패면 토큰은 남겨둠 (서버가 살아나면 다시 사용)
      if (getErrorCode(error) !== "NETWORK_ERROR") {
        tokenStorage.clear();
      }
      set({ me: null, status: "guest" });
    }
  },

  // 서버에서 리프레시 토큰 삭제 → 이 기기의 토큰·내 정보 삭제
  logout: async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (error) {
        // 서버 요청이 실패해도 이 기기에서는 로그아웃 진행
      }
    }
    tokenStorage.clear();
    set({ me: null, status: "guest" });
  }
}))

// 재발급 실패 등으로 인증이 끊기면 로그아웃 상태로 → 가드가 로그인 화면으로 이동
onAuthFailure(() => {
  useAuthStore.setState({ me: null, status: "guest" });
});
