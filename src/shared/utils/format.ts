// 날짜·시간 12시간제 표시 (Instant 문자열 → 브라우저 시간대 기준)
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {dateStyle: "medium", timeStyle: "short"});
}

// 시각만 24시간제로 표시 (예: "09:02", 브라우저 시간대 기준)
// 상태바 "출근 09:02", 근태 표의 출근·퇴근 시각에 사용
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

// 오늘 날짜 (브라우저 시간대 기준, 날짜 입력칸 기본값용)
export function todayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}