import { useEffect, useState } from "react";
import { todayString } from "../../../shared/utils/format";
import type { PublicHoliday, PublicHolidaySyncResult } from "../types";
import { getPublicHolidays, syncPublicHolidays } from "../api";
import { toHolidayErrorMessage } from "../errorMessages";
import { getErrorCode } from "../../../shared/api/client";
import { useSearchParams } from "react-router";
import { PageHeader } from "../../../shared/components/PageHeader";
import { SelectField } from "../../../shared/components/SelectField";
import { Button } from "../../../shared/components/Button";
import { RefreshCw } from "lucide-react";

const MIN_HOLIDAY_YEAR = 2015;
const COUNTRY_CODE = "KR";

export function PublicHolidaysPage() {

  const currentYear = Number(todayString().slice(0, 4));
  const maxYear = currentYear + 1;

  // 목록
  const [items, setItems] = useState<PublicHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // 연도 목록
  const yearCount = maxYear - MIN_HOLIDAY_YEAR + 1;
  const yearOptions = Array.from({length: yearCount}, (_, index) => MIN_HOLIDAY_YEAR + index);

  const [searchParams, setSearchParams] = useSearchParams();
  const paramYear = Number(searchParams.get("year"));
  const year = yearOptions.includes(paramYear) ? paramYear : currentYear;

  // 불러오기
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<PublicHolidaySyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  function reload() {
    setReloadKey((key) => key + 1);
  }

  useEffect(() => {
    let ignore = false;
    getPublicHolidays(COUNTRY_CODE, year)
      .then((data) => {
        if(ignore) return;
        setItems(data);
        setLoadError(null);
      })
      .catch((error) => {
        if (!ignore) setLoadError(toHolidayErrorMessage(getErrorCode(error)));
      })
      .finally(() => {
        if(!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    }
  }, [year, reloadKey]);

  async function handleSync() {
    if(syncing) return;

    setSyncResult(null);
    setSyncing(true);
    setSyncError(null);

    try {
      const res = await syncPublicHolidays(COUNTRY_CODE, year);
      setSyncResult(res);
      reload();
    } catch(error) {
      const code = getErrorCode(error);
      setSyncError(toHolidayErrorMessage(code));
    } finally {
      setSyncing(false);
    }
  }

  function toSyncMessage(result: PublicHolidaySyncResult): string {
    if (result.fetchedCount === 0) {
      return "공공 데이터에서 받은 공휴일이 없습니다. 연도와 서버 설정을 확인해 주세요.";
    }
    if (result.addedCount === 0) {
      return `${result.year}년 공휴일은 이미 최신입니다. (확인 ${result.fetchedCount}건)`;
    }
    return `${result.year}년 공휴일을 불러왔습니다. 확인 ${result.fetchedCount}건 중 ${result.addedCount}건을 새로 추가했습니다.`;
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader 
        title="공휴일 관리"
        description="국가공휴일을 관리합니다."
      />

      <div className="flex justify-between items-end">
        <div className="flex items-end gap-3">
          <SelectField
            id="paramYear"
            label="연도"
            value={year}
            onChange={(e) => setSearchParams({year: e.target.value}, {replace: true})}
          >
            {yearOptions.map((node) => (
              <option key={node} value={node}>{node}년</option>
            ))}
          </SelectField>
          <span className="py-2 text-sm text-fg-muted">대한민국 ({COUNTRY_CODE})</span>
        </div>
        <Button onClick={() => void handleSync()} disabled={syncing}>
          <RefreshCw aria-hidden="true" className="size-4" /> {syncing ? "불러오는 중" : "불러오기"}
        </Button>
      </div>

      {syncing && (
        <p role="status" className="text-sm text-fg-muted">
          공공 데이터에서 공휴일을 받아오는 중입니다. 몇 초 걸릴 수 있습니다.
        </p>
      )}
      {!syncing && syncError && (
        <p role="alert" className="text-sm text-danger">{syncError}</p>
      )}
      {!syncing && !syncError && syncResult && (
        <p role="status" className="text-sm text-fg-muted">{toSyncMessage(syncResult)}</p>
      )}

      {loading && <p role="status" className="text-sm text-fg-muted">불러오는 중입니다.</p>}
      {loadError && <p role="alert" className="text-sm text-danger">{loadError}</p>}
      {!loading && !loadError && (
        <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-line">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-fg-muted">공휴일이 없습니다.</p>
          ) : (
            <table className="w-full whitespace-nowrap text-left">
              <thead className="sticky top-0 bg-chrome text-sm text-fg-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-2 font-normal">날짜</th>
                  <th scope="col" className="px-4 py-2 font-normal">이름</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={`${item.holidayDate}-${item.name}`} className="border-b border-line last:border-b-0 hover:bg-hover/50">
                    <td className="px-4 py-2">{item.holidayDate}</td>
                    <td className="px-4 py-2">{item.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
  

}