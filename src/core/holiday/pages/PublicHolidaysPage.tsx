import { useEffect, useState } from "react";
import { todayString } from "../../../shared/utils/format";
import type { PublicHoliday } from "../types";
import { getPublicHolidays } from "../api";
import { toHolidayErrorMessage } from "../errorMessages";
import { getErrorCode } from "../../../shared/api/client";
import { useSearchParams } from "react-router";
import { PageHeader } from "../../../shared/components/PageHeader";
import { SelectField } from "../../../shared/components/SelectField";

const MIN_HOLIDAY_YEAR = 2015;
const COUNTRY_CODE = "KR";

export function PublicHolidaysPage() {

  const currentYear = Number(todayString().slice(0, 4));
  const maxYear = currentYear + 1;

  // 목록
  const [items, setItems] = useState<PublicHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 연도 목록
  const yearCount = maxYear - MIN_HOLIDAY_YEAR + 1;
  const yearOptions = Array.from({length: yearCount}, (_, index) => MIN_HOLIDAY_YEAR + index);

  const [searchParams, setSearchParams] = useSearchParams();
  const paramYear = Number(searchParams.get("year"));
  const year = yearOptions.includes(paramYear) ? paramYear : currentYear;


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
  }, [year]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader 
        title="공휴일 관리"
        description="국가공휴일을 관리합니다."
      />

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