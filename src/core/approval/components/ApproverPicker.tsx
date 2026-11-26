import { useEffect, useState } from "react";
import type { ApproverCandidateResponse } from "../../member/types";
import { getApproverCandidates } from "../../member/api";
import { toApprovalErrorMessage } from "../errorMessages";
import { getErrorCode } from "../../../shared/api/client";
import { TextField } from "../../../shared/components/TextField";

const MAX_APPROVERS = 5;

// "이름 (부서 · 직급 · 직책)" — 없는 값은 뺌
function formatApprover(candidate: ApproverCandidateResponse): string {
  const parts = [candidate.departmentName, candidate.jobGradeName, candidate.jobTitleName].filter(Boolean);
  return parts.length > 0 ? `${candidate.name} (${parts.join(" · ")})` : candidate.name;
}

interface Props {
  selected: ApproverCandidateResponse[];
  onChange: (next: ApproverCandidateResponse[]) => void;
}

export function ApproverPicker({selected, onChange}: Props) {
  const [keyword, setKeyword] = useState("");
  const [candidates, setCandidates] = useState<ApproverCandidateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setErrorMessage(null);

    const timer = setTimeout(() => {
      getApproverCandidates(keyword.trim() || undefined)
        .then((data) => {
          if (ignore) return;
          setCandidates(data);
        })
        .catch((error) => {
          if (ignore) return;
          setCandidates([]);
          setErrorMessage(toApprovalErrorMessage(getErrorCode(error)));
        })
        .finally(() => {
          if (ignore) return;
          setLoading(false);
        });
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    }
  }, [keyword]);

  const visibleCandidates = candidates.filter((c) => !selected.some((s) => s.id === c.id));

  function add(candidate: ApproverCandidateResponse) {
    if(selected.length >= MAX_APPROVERS) return;
    onChange([...selected, candidate]);
  }

  return (
    <div>
      <p className="text-sm font-medium">결재자 (순서대로 결재)</p>

      {/* 고른 목록: 비었으면 안내, 있으면 번호 붙여서 */}
      {selected.length === 0 ? (
        <p className="mt-2 text-sm text-fg-muted">아직 선택한 결재자가 없습니다. 아래에서 검색해 추가하세요.</p>
      ) : (
        <ol className="mt-2 space-y-1">
          {selected.map((s, index) => (
            <li key={s.id} className="text-sm">{index + 1}. {formatApprover(s)}</li>
          ))}
        </ol>
      )}

      {/* 검색칸 */}
      <TextField 
        id="approver-keyword"
        label="결재자 검색"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      <div className="mt-3">
        {errorMessage ? (
          <p role="alert" className="text-sm text-danger">{errorMessage}</p>
        ) : loading ? (
          <p className="text-sm text-fg-muted">로딩 중...</p>
        ) : visibleCandidates.length === 0 ? (
          <p className="text-sm text-fg-muted">결과가 없습니다.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {visibleCandidates.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => add(c)} className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-hover">
                  {formatApprover(c)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}