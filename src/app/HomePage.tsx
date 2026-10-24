import { useAuthStore } from "../core/auth/store";
import { CheckInCard } from "../modules/attendance/CheckInCard";
import { PlaceholderPage } from "../shared/components/PlaceholderPage";

// 홈 화면: 권한에 따라 보여줄 내용을 나눔
export function HomePage() {
  const me = useAuthStore((state) => state.me);
  if (!me) return null;

  // 최고관리자는 회사가 없어서 근태 API를 쓸 수 없음 (백엔드 403) → 카드를 그리지 않음
  if (me.role === "SUPER_ADMIN") {
    return <PlaceholderPage title="홈" note="회사 관리 기능은 준비 중입니다." />
  }

  return (
    <div className="p-6">
      <CheckInCard />
    </div>
  );
}