import { useEffect, useState } from "react";
import { useAttendanceStore } from "./store";
import { toAttendanceErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { Button } from "../../shared/components/Button";
import { formatTime } from "../../shared/utils/format";

// 홈 화면 출퇴근 카드
export function CheckInCard() {
  const today = useAttendanceStore((state) => state.today);
  const status = useAttendanceStore((state) => state.status);
  const loadToday = useAttendanceStore((state) => state.loadToday);
  const checkIn = useAttendanceStore((state) => state.checkIn);
  const checkOut = useAttendanceStore((state) => state.checkOut);

  const [busy, setBusy] = useState(false);  // 요청 중이면 버튼 잠금 (연속 클릭 방지)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 홈에 들어올 때마다 서버 기준으로 오늘 상태를 새로 불러옴
  useEffect(() => {
    void loadToday();
  }, [loadToday]);

  // 출근·퇴근 공통: 요청 중 잠금 + 실패 시 에러 코드 → 문구
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setErrorMessage(null);
    try {
      await action();
    } catch (error) {
      setErrorMessage(toAttendanceErrorMessage(getErrorCode(error)));
    } finally {
      setBusy(false);
    }
  }

  // 아직 오늘 상태를 한 번도 못 받은 경우
  if (today === null) {
    return (
      <section className="max-w-md rounded-md border border-line p-5">
        <h2 className="text-lg font-semibold">오늘 근태</h2>
        {status === "error" ? (
          <div className="mt-3 flex flex-col items-start gap-3">
            <p role="alert" className="text-danger">
              오늘 근태를 불러오지 못했습니다.
            </p>
            <Button onClick={() => void loadToday()}>다시 불러오기</Button>
          </div>
        ) : (
          <p className="mt-3 text-fg-muted">불러오는 중...</p>
        )}
      </section>
    );
  }

  const {workDate, attendance} = today;
  const checkedIn = attendance !== null;
  const checkedOut = attendance !== null && attendance.checkOutAt !== null;

  return (
    <section className="max-w-md rounded-md border border-line p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">오늘 근태</h2>
        <span className="text-sm text-fg-muted">{workDate}</span>
      </div>

      <dl className="mt-4 grid grid-cols-[4rem_1fr] gap-y-2">
        <dt className="text-fg-muted">출근</dt>
        <dd className="flex items-center gap-2">
          {attendance ? formatTime(attendance.checkInAt) : "기록 없음"}
          {attendance?.late && <span className="text-sm text-danger">지각</span>}
        </dd>
        <dt className="text-fg-muted">퇴근</dt>
        <dd className="flex items-center gap-2">
          {attendance?.checkOutAt ? formatTime(attendance.checkOutAt) : "기록 없음"}
          {checkedOut && attendance.earlyLeave && (
            <span className="text-sm text-danger">조퇴</span>
          )}
        </dd>
      </dl>

      <div className="mt-5 flex gap-2">
        <Button variant="primary" disabled={busy || checkedIn} onClick={() => void run(checkIn)}>
          출근
        </Button>
        <Button disabled={busy || !checkedIn} onClick={() => void run(checkOut)}>
          {checkedOut ? "퇴근 시각 갱신" : "퇴근"}
        </Button>
      </div>

      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {errorMessage}
        </p>
      )}
    </section>
  );


}