import { useEffect, useState } from "react";
import { PageHeader } from "../../../shared/components/PageHeader";
import type { CompanyHoliday } from "../types";
import { deleteCompanyHoliday, getCompanyHolidays } from "../api";
import { toHolidayErrorMessage } from "../errorMessages";
import { getErrorCode } from "../../../shared/api/client";
import { todayString } from "../../../shared/utils/format";
import { useSearchParams } from "react-router";
import { SelectField } from "../../../shared/components/SelectField";
import { HolidayFormDialog } from "../components/HolidayFormDialog";
import { Button } from "../../../shared/components/Button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { IconButton } from "../../../shared/components/IconButton";
import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";


// 백엔드의 2015와 같은 값
const MIN_HOLIDAY_YEAR = 2015;

// 대화상자 상태
type FormTarget = { mode: "create" } | { mode: "edit"; item: CompanyHoliday };

export function HolidaysPage() {
  const currentYear = Number(todayString().slice(0, 4));
  const maxYear = currentYear + 2;

  // 목록
  const [items, setItems] = useState<CompanyHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // 연도 목록
  const yearCount = maxYear - MIN_HOLIDAY_YEAR + 1;
  const yearOptions = Array.from({length: yearCount}, (_, index) => MIN_HOLIDAY_YEAR + index);

  const [searchParams, setSearchParams] = useSearchParams();
  const paramYear = Number(searchParams.get("year"));
  const year = yearOptions.includes(paramYear) ? paramYear : currentYear;

  // 대화상자
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);

  // 삭제
  const [deleteTarget, setDeleteTarget] = useState<CompanyHoliday | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 처음 열릴 때, 연도가 바뀔 때
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
  }, [year, reloadKey]);

  function reload() {
    setReloadKey((key) => key + 1);
  }

  function closeDelete() {
    setDeleteTarget(null);
    setDeleteError(null);
  }

  async function handleDelete() {
    if(!deleteTarget || deleting) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteCompanyHoliday(deleteTarget.id);
      closeDelete();
      reload();
    } catch(error) {
      const code = getErrorCode(error);
      setDeleteError(toHolidayErrorMessage(code));
      if(code === "HOLIDAY_NOT_FOUND") reload();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader 
        title="휴일 관리"
        description="회사 휴일을 등록·관리합니다. 근태 조회와 휴가 일수 계산에 반영됩니다."
      />

      <div className="flex justify-between items-end">
        <SelectField
          id = "paramYear"
          label = "연도"
          value={year}
          onChange={(e) => setSearchParams({year: e.target.value}, {replace: true})}
        >
          {yearOptions.map((node) => (
            <option key={node} value={node}>{node}년</option>
          ))}
        </SelectField>

        <Button onClick={() => setFormTarget({mode: "create"})}>
          <Plus className="size-4" aria-hidden="true" /> 추가
        </Button>
      </div>


      {loading && <p role="status" className="text-sm text-fg-muted">불러오는 중입니다.</p>}
      {loadError && <p role="alert" className="text-sm text-danger">{loadError}</p>}
      {!loading && !loadError && (
        <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-line">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-fg-muted">등록된 휴일이 없습니다.</p>
          ) : (
            <table className="w-full whitespace-nowrap text-left">
              <colgroup>
                <col style={{width: '22%'}} />
                <col />
                <col style={{width: '18%'}} />
                <col style={{width: '100px'}} />
              </colgroup>
              <thead className="sticky top-0 bg-chrome text-sm text-fg-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-2 font-normal">날짜</th>
                  <th scope="col" className="px-4 py-2 font-normal">이름</th>
                  <th scope="col" className="px-4 py-2 font-normal">반복</th>
                  <th scope="col" className="px-4 py-2 font-normal text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-line last:border-b-0 hover:bg-hover/50">
                    <td className="px-4 py-2">{item.recurring ? item.holidayDate.slice(5) : item.holidayDate}</td>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.recurring && "매년 반복"}</td>
                    <td className="px-4 py-2">
                      <div className="flex justify-center gap-1">
                        <IconButton
                          label={`${item.name} 수정`}
                          onClick={() => setFormTarget({mode: "edit", item})}
                        >
                          <Pencil aria-hidden="true" className="size-4" />
                        </IconButton>
                        <IconButton
                          label={`${item.name} 삭제`}
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {formTarget && 
        <HolidayFormDialog 
          onClose={() => setFormTarget(null)}
          onSaved={() => {
            setFormTarget(null);
            reload();
          }}
          editing={formTarget.mode === "edit" ? formTarget.item : undefined}
        />
      }

      {deleteTarget && 
        <ConfirmDialog 
          open
          title={`${deleteTarget.name} 삭제`}
          message={
            <>
              <strong className="font-semibold">{deleteTarget.name}</strong> 휴일을
              삭제합니다. <br />삭제한 뒤에는 되돌릴 수 없습니다.
              {deleteTarget.recurring && <span className="mt-2 block text-sm text-danger">매년 반복 휴일은 모든 해에서 삭제됩니다.</span>}
            </>
          }
          confirmLabel="삭제"
          busy={deleting}
          errorMessage={deleteError}
          onConfirm={() => void handleDelete()}
          onClose={closeDelete}
        />
      }
    </div>
  );
}