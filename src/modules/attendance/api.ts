import { api } from "../../shared/api/client";
import type { PageResponse } from "../../shared/types/api";
import type { Attendance, AttendanceDayInfo, AttendanceRecord, EffectiveWorkSchedule, TodayAttendance, WorkSchedule, WorkScheduleBulkRequest, WorkScheduleRequest } from "./types";

const BASE = "/api/attendance";

// ---------- 사원 본인용 (/api/attendance) ----------

// 출근: 오늘 기록이 있으면 기존 기록을 그대로 돌려줌 (200)
export async function checkIn(): Promise<Attendance> {
  const res = await api.post<Attendance>(`${BASE}/check-in`);
  return res.data;
}

// 퇴근: 누를 때마다 퇴근 시각을 덮어씀, 출근 기록이 없으면 409 NOT_CHECKED_IN
export async function checkOut(): Promise<Attendance> {
  const res = await api.post<Attendance>(`${BASE}/check-out`);
  return res.data;
}

// 오늘 상태: 출근 전이면 attendance가 null
export async function fetchToday(): Promise<TodayAttendance> {
  const res = await api.get<TodayAttendance>(`${BASE}/today`);
  return res.data;
}

// 내 월별 기록 (month는 1~12, 날짜 오름차순)
export async function fetchMyAttendances(year: number, month: number): Promise<Attendance[]> {
  const res = await api.get<Attendance[]>(`${BASE}/me`, { params: {year, month} });
  return res.data;
}

// ---------- 기업관리자용 (/api/attendance/manage) ----------

export interface FetchRecordsParams {
  date: string;
  departmentId?: number;
  includeSubDepartments?: boolean;
  page?: number; // 0부터 (백엔드 기준), 없으면 첫 페이지
  size?: number; // 없으면 백엔드 기본값(20)
}

// 그날 재직 중이던 사원 한 페이지 + 기록 (기록이 없으면 attendance: null)
export async function fetchRecords(params: FetchRecordsParams):Promise<PageResponse<AttendanceRecord>> {
  const res = await api.get<PageResponse<AttendanceRecord>>(`${BASE}/manage/records`, { params });
  return res.data;
}

// 근무시간 설정 목록 (회사 설정이 먼저, 그다음 개인 설정)
export async function fetchSchedules(): Promise<WorkSchedule[]> {
  const res = await api.get<WorkSchedule[]>(`${BASE}/manage/schedules`);
  return res.data;
}

// 회사 일괄 설정 저장 (없으면 생성, 있으면 수정)
export async function saveCompanySchedule(body: WorkScheduleRequest): Promise<WorkSchedule> {
  const res = await api.put<WorkSchedule>(`${BASE}/manage/schedules/company`, body);
  return res.data;
}

// 개인 설정 저장 (없으면 생성, 있으면 수정)
export async function saveMemberSchedule(
  memberId: number,
  body: WorkScheduleRequest
): Promise<WorkSchedule> {
  const res = await api.put<WorkSchedule>(`${BASE}/manage/schedules/members/${memberId}`, body);
  return res.data;
}

// 여러 사원 개인 설정 일괄 저장 (전부 적용되거나 전부 취소, 요청한 순서대로 돌려줌)
// 한 명이라도 내 회사 사원이 아니면 404, 퇴사자가 있으면 409
export async function saveMemberSchedules(body: WorkScheduleBulkRequest): Promise<WorkSchedule[]> {
  const res = await api.put<WorkSchedule[]>(`${BASE}/manage/schedules/members`, body);
  return res.data;
}

// 개인 설정 삭제 → 회사 설정으로 복귀 (204, 설정이 없으면 404 WORK_SCHEDULE_NOT_FOUND)
export async function deleteMemberSchedule(memberId: number): Promise<void> {
  await api.delete(`${BASE}/manage/schedules/members/${memberId}`);
}

// 사원에게 실제로 적용되는 근무시간 (개인 > 회사 > 기본값)
export async function fetchEffectiveSchedule(memberId: number): Promise<EffectiveWorkSchedule> {
  const res = await api.get<EffectiveWorkSchedule>(`${BASE}/manage/schedules/effective`, { params: { memberId } });
  return res.data;
}

// 날짜 정보: 주말 여부 + 그날의 휴일 목록 (휴일이 없으면 holidays는 빈 배열)
export async function fetchDayInfo(date: string): Promise<AttendanceDayInfo> {
  const res = await api.get<AttendanceDayInfo>(`${BASE}/manage/day-info`, { params: { date } });
  return res.data;
}