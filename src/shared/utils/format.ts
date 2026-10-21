// 날짜·시간 표시 (Instant 문자열 → 브라우저 시간대 기준)
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {dateStyle: "medium", timeStyle: "short"});
}