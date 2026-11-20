import { useEffect, useState } from "react";
import { PageHeader } from "../../../shared/components/PageHeader";
import type { CompanyHoliday } from "../types";
import { getCompanyHolidays } from "../api";
import { toHolidayErrorMessage } from "../errorMessages";
import { getErrorCode } from "../../../shared/api/client";
import { todayString } from "../../../shared/utils/format";

export function HolidaysPage() {
  const year = Number(todayString().slice(0, 4));

  // 목록
  const [items, setItems] = useState<CompanyHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 처음 열릴 때, reloadKey가 바뀔 때
  useEffect(() => {
    let ignore = false;
    getCompanyHolidays(year)
      .then((data) => {
        if(ignore) return;
        setItems(data);
        setLoadError(null);
      })
      .catch((error) => {
        if (!ignore) setLoadError(toHolidayErrorMessage(getErrorCode(error)));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    }
  }, [year]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader 
        title="휴일 관리"
        description="회사 휴일을 등록·관리합니다. 근태 조회와 휴가 일수 계산에 반영됩니다."
      />
      {loading && <p>불러오는 중입니다.</p>}
      {loadError && <p className="text-danger">{loadError}</p>}
      {!loading && !loadError && items.length === 0 && <p>등록된 휴일이 없습니다.</p>}
      {!loading && !loadError && items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>{item.name} {item.holidayDate} {item.recurring && "매년 반복"}</li>
          ))}
        </ul>
      )}
    </div>
  );
}