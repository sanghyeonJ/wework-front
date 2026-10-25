// 근태 모듈 타입 (백엔드 dto와 같은 모양)

// 근태 기록 한 줄 (AttendanceResponse) /dto/AttendanceResponse
export interface Attendance {
  id: number;
  workDate: string;
  checkInAt: string;
  checkOutAt: string | null;
  late: boolean;
  earlyLeave: boolean;
}

// 오늘 상태 (TodayAttendanceResponse) /dto/TodayAttendanceResponse
export interface TodayAttendance {
  workDate: string;
  attendance: Attendance | null;
}

// 관리자 근태 조회 한 줄 (AttendanceRecordResponse) /dto/AttendanceRecordResponse
export interface AttendanceRecord {
  memberId: number;
  memberName: string;
  departmentName: string | null;
  attendance: Attendance | null;
}

// 근무시간 설정
export type WorkScheduleScope = "COMPANY" | "MEMBER";  // WorkScheduleScope.enum
export type WorkScheduleSource = "MEMBER" | "COMPANY" | "DEFAULT";  // WorkScheduleSource.enum

// 설정 목록 한 줄 (WorkScheduleResponse) dto/WorkScheduleResponse
export interface WorkSchedule {
  id: number;
  scopeType: WorkScheduleScope;
  memberId: number | null;
  memberName: string | null;
  startTime: string;
  endTime: string;
  graceMinutes: number;
}

// 설정 저장 요청 (WorkScheduleRequest) /dto/WorkScheduleRequest
export interface WorkScheduleRequest {
  startTime: string;
  endTime: string;
  graceMinutes: number;
}

// 여러 사원에게 같은 개인 근무시간을 한 번에 저장 (백엔드 WorkScheduleBulkRequest)
export interface WorkScheduleBulkRequest extends WorkScheduleRequest {
  memberIds: number[];
}

// 적용 근무시간 (EffectiveWorkSchedule) /EffectiveWorkSchedule
export interface EffectiveWorkSchedule {
  source: WorkScheduleSource;  // 어느 설정이 적용됐는지
  startTime: string;
  endTime: string;
  graceMinutes: number;
}