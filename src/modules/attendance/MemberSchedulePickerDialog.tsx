import { useEffect, useState, type SubmitEvent } from "react";
import { Dialog } from "../../shared/components/Dialog";
import { Button } from "../../shared/components/Button";
import { getMembers } from "../../core/member/api";
import type { PageResponse } from "../../shared/types/api";
import type { MemberResponse } from "../../core/member/types";
import { toMemberErrorMessage } from "../../core/member/errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { Search, X } from "lucide-react";
import { IconButton } from "../../shared/components/IconButton";
import { Pagination } from "../../shared/components/Pagination";
import { WorkScheduleFormDialog, type WorkScheduleFormValues } from "./WorkScheduleFormDialog";
import { saveMemberSchedules } from "./api";

const MAX_SELECTED = 100;
const PAGE_SIZE = 10;

interface MemberSchedulePickerDialogProps {
  formInitial: WorkScheduleFormValues;
  onClose: () => void;
  onSaved: () => void;
}

// 개인 근무시간을 적용할 사원 고르기
export function MemberSchedulePickerDialog({ formInitial, onClose, onSaved }: MemberSchedulePickerDialogProps) {
  const [data, setData] = useState<PageResponse<MemberResponse> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MemberResponse[]>([]); // 고른 사원 (정보 자체를 담음)
  const [formOpen, setFormOpen] = useState(false);

  const [keywordInput, setKeywordInput] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [page, setPage] = useState(0);

  // 재직 중(ACTIVE) 사원만 조회
  useEffect(() => {
    let ignore = false;
    getMembers({
      status: "ACTIVE",
      keyword: keyword || undefined,
      page: page,
      size: PAGE_SIZE
    })
      .then((result) => {
        if (ignore) return;
        setData(result);
        setLoadError(null);
      })
      .catch((error) => {
        if (!ignore) setLoadError(toMemberErrorMessage(getErrorCode(error)));
      });

    return () => {
      ignore = true;
    }
  }, [keyword, page]);

  const full = selected.length >= MAX_SELECTED;

  function addMember(member: MemberResponse) {
    setSelected((prev) => [...prev, member])
  }
  function removeMember(target: MemberResponse) {
    setSelected((prev) => prev.filter((member) => member.id !== target.id));
  }

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setKeyword(keywordInput.trim());
    setPage(0);
  }

  return (
    <>
      <Dialog
        open
        size="xl"
        title="개인 근무시간 추가"
        onClose={onClose}
        footer={
          <>
            <Button onClick={onClose}>
              닫기
            </Button>
            <Button variant="primary" disabled={selected.length === 0} onClick={() => setFormOpen(true)}>
              근무시간 설정{selected.length > 0 && ` (${selected.length}명)`}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <form role="search" onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="search"
              data-autofocus
              aria-label="이름 또는 이메일 검색"
              placeholder="이름·이메일 검색"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="h-9.5 w-64 rounded-md border border-line bg-panel px-2.5"
            />
            <Button type="submit">
              <Search aria-hidden="true" className="size-4" />
              검색
            </Button>
          </form>

          <section aria-label="사원 목록">
            {loadError ? (
              <p role="alert" className="text-sm text-danger">
                {loadError}
              </p>
            ) : data === null ? (
              <p role="status" className="text-sm text-fg-muted">
                불러오는 중
              </p>
            ) : data.content.length === 0 ? (
              <p className="text-sm text-fg-muted">
                {keyword ? "검색 결과가 없습니다." : "재직중인 사원이 없습니다."}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="overflow-hidden rounded-lg border border-line">
                  <table className="w-full whitespace-nowrap text-left">
                    <thead className="bg-chrome text-sm text-fg-muted">
                      <tr className="border-b border-line">
                        <th scope="col" className="px-4 py-2 font-normal">이름</th>
                        <th scope="col" className="px-4 py-2 font-normal">부서</th>
                        <th scope="col" className="px-4 py-2 font-normal">
                          <span className="sr-only">추가</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.content.map((member) => {
                        const added = selected.some((item) => item.id === member.id);
                        return (
                          <tr key={member.id} className="border-b border-line last:border-b-0">
                            <td className="px-4 py-2 font-medium">{member.name}</td>
                            <td className="px-4 py-2 text-fg-muted">{member.departmentName ?? "-"}</td>
                            <td className="px-4 py-2 text-right">
                              <Button disabled={added || full} onClick={() => addMember(member)}>
                                {added ? "추가됨" : "추가"}
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              
                <Pagination 
                  page={data.page.number}
                  totalPages={data.page.totalPages}
                  totalElements={data.page.totalElements}
                  unit="명"
                  onChange={setPage}
                />
              </div>
            )}
          </section>

          <section aria-labelledby="picker-selected-title">
            <h3 id="picker-selected-title" className="mb-2 text-sm font-medium">
              선택한 사원 ({selected.length}명)
            </h3>

            {selected.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line px-4 py-3 text-sm text-fg-muted">
                위 표에서 사원을 추가하세요.
              </p>
            ) : (
              <ul 
                role="list"
                className="flex max-h-32 flex-wrap content-start gap-2 overflow-y-auto rounded-lg border border-line p-2">
                {selected.map((member) => (
                  <li
                    key={member.id}
                    className="flex max-w-full items-center gap-1.5 rounded-md border border-line bg-chrome py-0.5 pl-2.5 pr-0.5"
                  >
                    <span className="font-medium">{member.name}</span>
                    <span className="truncate text-xs text-fg-muted">{member.departmentName ?? "-"}</span>
                    <IconButton label={`${member.name} 제거`} onClick={() => removeMember(member)}>
                      <X aria-hidden="true" className="size-4" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            )}

            {full && (
              <p role="status" className="mt-2 text-xs text-fg-muted">
                한 번에 최대 {MAX_SELECTED}명까지 선택할 수 있습니다.
              </p>
            )}
          </section>
        </div>
      </Dialog>

      {formOpen && (
        <WorkScheduleFormDialog 
          title={`선택한 사원 ${selected.length}명 근무시간`}
          initial={formInitial}
          save={(body) => saveMemberSchedules({ ...body, memberIds: selected.map((member) => member.id) })}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            onSaved();
            onClose();
          }}
        />
      )}
    </>
  );
}