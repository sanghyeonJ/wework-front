import { create } from "zustand";
import type { TodayAttendance } from "./types";
import * as attendanceApi from "./api";
import { useAuthStore } from "../../core/auth/store";
import { getErrorCode } from "../../shared/api/client";

// idle: 아직 안 불러옴 / ready: 불러옴 / error: 불러오기 실패
export type TodayStatus = "idle" | "ready" | "error";

interface AttendanceState {
  today: TodayAttendance | null;
  status: TodayStatus;
  loadToday: () => Promise<void>;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
}

// 지금 로그인한 사원 id (로그아웃 상태면 null)
const currentMemberId = () => useAuthStore.getState().me?.id ?? null;

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  today: null,
  status: "idle",

  // 오늘 상태 불러오기
  loadToday: async () => {
    const memberId = currentMemberId();
    try {
      const today = await attendanceApi.fetchToday();
      if (memberId !== currentMemberId()) return;
      set({ today, status: "ready" });
    } catch (error) {
      if (memberId !== currentMemberId()) return;
      set({ status: "error" });
    }
  },

  // 출근: 성공하면 응답으로 바로 갱신 (오늘 상태를 다시 부르지 않음)
  checkIn: async () => {
    try {
      const attendance = await attendanceApi.checkIn();
      set({ today: { workDate: attendance.workDate, attendance }, status: "ready" });
    } catch (error) {
      // 동시 클릭으로 이미 출근된 경우: 화면 상태를 서버와 맞춘 뒤 에러는 화면이 안내
      if (getErrorCode(error) === "ALREADY_CHECKED_IN") {
        await get().loadToday();
      }
      throw error;
    }
  },

  // 퇴근: 누를 때마다 시각이 갱신되므로 응답으로 덮어씀
  checkOut: async () => {
    try {
      const attendance = await attendanceApi.checkOut();
      set({ today: { workDate: attendance.workDate, attendance }, status: "ready" });
    } catch (error) {
      // 출근 기록이 없다는 응답이면 화면 상태가 낡은 것이므로 다시 불러옴
      if (getErrorCode(error) === "NOT_CHECKED_IN") {
        await get().loadToday();
      }
      throw error;
    }
  }
}));

// 로그아웃되면 오늘 상태 비우기 (다른 계정으로 로그인했을 때 이전 사람의 출근 상태가 보이지 않게)
useAuthStore.subscribe((state) => {
  if (state.me === null) {
    useAttendanceStore.setState({ today: null, status: "idle" });
  }
});