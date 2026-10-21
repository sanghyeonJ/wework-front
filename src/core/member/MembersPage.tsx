import { useSearchParams } from "react-router";
import type { MemberResponse, MemberStatus } from "./types";
import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import type { PageResponse } from "../../shared/types/api";
import type { DepartmentResponse } from "../department/types";
import { getMembers } from "./api";
import { toMemberErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { getDepartments } from "../department/api";
import { buildTree, flattenTree } from "../department/tree";
import { PageHeader } from "../../shared/components/PageHeader";
import { Button } from "../../shared/components/Button";
import { Search, UserPlus } from "lucide-react";
import { ROLE_LABELS, STATUS_LABELS } from "./labels";
import { Pagination } from "../../shared/components/Pagination";
import { Select } from "../../shared/components/Select";
import { MemberCreateDialog } from "./MemberCreateDialog";
import { LeaderBadge } from "./LeaderBadge";
import { MemberDetailDialog } from "./MemberDetailDialog";

const PAGE_SIZE = 20;
const STATUSES: MemberStatus[] = ["INVITED", "ACTIVE", "RESIGNED"];
const INDENT = "\u00A0\u00A0\u00A0\u00A0";

const STATUS_STYLES: Record<MemberStatus, string> = {
  INVITED: "text-accent ring-accent/50",
  ACTIVE: "text-fg ring-line",
  RESIGNED: "text-fg-muted ring-line",
};

// 주소의 값 → 검색 조건 (잘못된 값이면 무시)
function parseStatus(value: string | null): MemberStatus | undefined {
  return STATUSES.find((status) => status === value);
}

function parsePositiveNumber(value: string | null): number | undefined {
  const number = Number(value);
  return value && Number.isInteger(number) && number > 0 ? number : undefined;
}

export function MembersPage() {
  // 검색 조건은 주소(?status=...&page=...)에 저장
  const [searchParams, setSearchParams] = useSearchParams();
  const status = parseStatus(searchParams.get("status"));
  const departmentId = parsePositiveNumber(searchParams.get("departmentId"));
  const includeSub = searchParams.get("includeSub") !== "0";  // 기본은 포함, 꺼둔 경우만 주소에 "0"
  const keyword = searchParams.get("keyword") ?? "";
  const page = (parsePositiveNumber(searchParams.get("page")) ?? 1) - 1;  // 주소는 1부터, API는 0부터

  const [keywordInput, setKeywordInput] = useState(keyword);
  const [data, setData] = useState<PageResponse<MemberResponse> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<MemberResponse | null>(null);

  // 사원 목록: 조건이 바뀔 때마다 조회
  useEffect(() => {
    let ignore = false;
    getMembers({ 
      status, 
      departmentId, 
      includeSubDepartments: departmentId ? includeSub : undefined,
      keyword: keyword || undefined, 
      page, 
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
  }, [status, departmentId, includeSub, keyword, page, reloadKey]);

  // 부서 필터 선택지: 처음 한 번 조회 (실패하면 선택지 없이 표시)
  useEffect(() => {
    let ignore = false;
    getDepartments()
      .then((result) => {
        if (!ignore) setDepartments(result);
      })
      .catch(() => {});

    return () => {
      ignore = true;
    }
  }, []);

  const departmentOptions = useMemo(() => flattenTree(buildTree(departments)), [departments]);

  // 주소의 검색 조건 바꾸기 (page를 직접 바꾸는 경우가 아니면 1페이지로)
  function updateParams(changes: Record<string, string | null>) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          if (value === null || value === "") {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        }
        if (!("page" in changes)) next.delete("page");
        return next;
      },
      { replace: true }
    );
  }

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParams({ keyword: keywordInput.trim() });
  }

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <PageHeader 
        title="사원"
        description="계정 발급, 정보 수정, 권한 변경, 퇴사 처리를 할 수 있습니다."
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <UserPlus aria-hidden="true" className="size-4" />
            계정 발급
          </Button>
        }
      />

      {/* 검색·필터 */}
      <div className="flex flex-wrap items-center gap-2">
        <form role="search" onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="search"
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

        <Select
          aria-label="상태"
          value={status ?? ""}
          onChange={(e) => updateParams({ status: e.target.value })}
        >
          <option value="">상태: 전체</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </Select>

        <Select
          aria-label="부서"
          value={departmentId ?? ""}
          onChange={(e) => updateParams({ departmentId: e.target.value })}
        >
          <option value="">부서: 전체</option>
          {departmentOptions.map(({ node, depth }) => (
            <option key={node.id} value={node.id}>
              {`${INDENT.repeat(depth)}${node.name}`}
            </option>
          ))}
        </Select>
        <label
          className={`flex h-9.5 select-none items-center gap-2 ${
            departmentId ? "" : "text-fg-muted opacity-60"
          }`}
        >
          <input
            type="checkbox"
            checked={includeSub}
            disabled={departmentId === undefined}
            onChange={(e) => updateParams({ includeSub: e.target.checked ? null : "0" })}
            className="size-4 accent-accent"
          />
          하위 부서 포함
        </label>
      </div>

      {/* 목록 */}
      {loadError ? (
        <p role="alert" className="text-sm text-danger">
          {loadError}
        </p>
      ) : data === null ? (
        <p role="status" className="text-sm text-fg-muted">
          불러오는 중…
        </p>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-line">
            {data.content.length === 0 ? (
              <p className="px-4 py-6 text-sm text-fg-muted">조건에 맞는 사원이 없습니다.</p>
            ) : (
              <table className="w-full whitespace-nowrap text-left">
                <thead className="sticky top-0 bg-chrome text-sm text-fg-muted">
                  <tr className="border-b border-line">
                    <th scope="col" className="px-4 py-2 font-normal">이름</th>
                    <th scope="col" className="px-4 py-2 font-normal">이메일</th>
                    <th scope="col" className="px-4 py-2 font-normal">부서</th>
                    <th scope="col" className="px-4 py-2 font-normal">직급</th>
                    <th scope="col" className="px-4 py-2 font-normal">직책</th>
                    <th scope="col" className="px-4 py-2 font-normal">권한</th>
                    <th scope="col" className="px-4 py-2 font-normal">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((member) => (
                    <tr
                      key={member.id}
                      onClick={() => setDetailTarget(member)}
                      className={`border-b border-line last:border-b-0 hover:bg-hover/50 ${
                        member.status === "RESIGNED" ? "text-fg-muted opacity-40" : ""
                      }`}
                    >
                      <td className="px-4 py-2">
                        <span className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailTarget(member)}
                            className="font-medium hover:underline"
                          >
                            {member.name}
                          </button>
                          {member.leader && <LeaderBadge />}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-fg-muted">{member.email}</td>
                      <td className="px-4 py-2">{member.departmentName ?? "-"}</td>
                      <td className="px-4 py-2">{member.jobGradeName ?? "-"}</td>
                      <td className="px-4 py-2">{member.jobTitleName ?? "-"}</td>
                      <td className="px-4 py-2">{ROLE_LABELS[member.role]}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex h-6 items-center rounded-full px-2 text-sm ring-1 ${STATUS_STYLES[member.status]}`}>
                          {STATUS_LABELS[member.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <Pagination 
            page={data.page.number}
            totalPages={data.page.totalPages}
            totalElements={data.page.totalElements}
            unit="명"
            onChange={(next) => updateParams({ page: String(next + 1) })}
          />
        </>
      )}

      {createOpen && (
        <MemberCreateDialog
          onClose={() => setCreateOpen(false)}
          onCreated={() => setReloadKey((key) => key + 1)}
        />
      )}

      {detailTarget && (
        <MemberDetailDialog
          key={detailTarget.id}
          member={detailTarget}
          onClose={() => setDetailTarget(null)}
          onChanged={() => setReloadKey((key) => key + 1)}
        />
      )}
    </div>
  );
}