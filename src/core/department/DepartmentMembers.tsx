import { useEffect, useState } from "react";
import type { MemberResponse } from "../member/types";
import { getMembers } from "../member/api";
import { toMemberErrorMessage } from "../member/errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { LeaderBadge } from "../member/LeaderBadge";

interface DepartmentMembersProps {
  departmentId: number;
  reloadKey: number;  // 부서장 변경 등으로 부서 목록을 다시 불러오면 함께 갱신
}

// 정렬: 부서장 → 재직 → 초대됨, 같은 그룹은 가나다순
function compareMembers(a: MemberResponse, b:MemberResponse) {
  if (a.leader !== b.leader) return a.leader ? -1 : 1;
  if (a.status !== b.status) return a.status === "ACTIVE" ? -1 : 1;
  return a.name.localeCompare(b.name, "ko");
}

// 부서의 직속 인원 (재직 + 초대됨), 보기 전용
export function DepartmentMembers({ departmentId, reloadKey }: DepartmentMembersProps) {
  const [members, setMembers] = useState<MemberResponse[] | null>(null);  // null = 불러오는 중
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    // 상태 조건은 하나만 보낼 수 있어서 재직·초대됨을 동시에 두 번 조회
    Promise.all([
      getMembers({ departmentId, status: "ACTIVE", size: 100 }),
      getMembers({ departmentId, status: "INVITED", size: 100 })
    ])
      .then(([active, invited]) => {
        if (ignore) return;
        setMembers([...active.content, ...invited.content].sort(compareMembers));
        setError(null);
      })
      .catch((err) => {
        if (!ignore) setError(toMemberErrorMessage(getErrorCode(err)));
      });

    return () => {
      ignore = true;
    }
  }, [departmentId, reloadKey]);

  return (
    <div className="border-t border-line">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <h3 className="font-semibold">
          소속 인원
          {members && (
            <span className="ml-1.5 text-sm font-normal text-fg-muted">{members.length}</span>
          )}
        </h3>
        <Link
          to={`/company/members?departmentId=${departmentId}`}
          className="inline-flex shrink-0 items-center gap-1 text-sm text-accent hover:underline"
        >
          사원 화면에서 보기
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      {error ? (
        <p role="alert" className="px-4 pb-3 text-sm text-danger">
          {error}
        </p>
      ) : members === null ? (
        <p role="status" className="px-4 pb-3 text-sm text-fg-muted">
          불러오는 중…
        </p>
      ) : members.length === 0 ? (
        <p className="px-4 pb-3 text-sm text-fg-muted">이 부서에 직접 소속된 재직 사원이 없습니다.</p>
      ) : (
        <ul className="max-h-80 divide-y divide-line overflow-y-auto border-t border-line">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3 px-4 py-2">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate font-medium">{member.name}</span>
                {member.leader && <LeaderBadge />}
              </span>
              <span className="min-w-0 truncate text-sm text-fg-muted">
                {[member.jobGradeName, member.jobTitleName].filter(Boolean).join(", ")}
              </span>
              {member.status === "INVITED" && (
                <span className="ml-auto shrink-0 text-sm text-accent">초대됨</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="px-4 pb-3 pt-2 text-xs text-fg-muted">
        직속 인원만 표시합니다. 하위 부서 인원까지 보려면 사원 화면을 이용하세요.
      </p>
    </div>
  );
}