import { create } from "zustand";

export type ThemeMode = "system" | "light" | "dark";

// index.html 스크립트와 같은 키, 값은 문자열 그대로 저장
const STORAGE_KEY = "wework-theme";
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

function readMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "system" || saved === "light" || saved === "dark") {
      return saved;
    }
  } catch {
    // localStorage를 못 쓰는 환경이면 기본값 사용
  }
  return "system";
}

// 선택값 → 실제 적용할 테마(light/dark)를 <html>에 반영
function applyTheme(mode: ThemeMode) {
  const isDark = mode === "dark" || (mode === "system" && darkQuery.matches);
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
}

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: readMode(),
  setMode: (mode) => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // 저장에 실패해도 현재 화면 적용에는 문제 없음
    }
    applyTheme(mode);
    set({ mode });
  }
}))

// "시스템" 선택 중 OS 화면 모드가 바뀌면 바로 반영
darkQuery.addEventListener("change", () => {
  if (useThemeStore.getState().mode === "system") {
    applyTheme("system");
  }
});