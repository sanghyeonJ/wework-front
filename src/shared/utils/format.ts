// 날짜·시간 표시 (Instant 문자열 → 브라우저 시간대 기준)
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {dateStyle: "medium", timeStyle: "short"});
}

// 오늘 날짜 (브라우저 시간대 기준, 날짜 입력칸 기본값용)
export function todayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}