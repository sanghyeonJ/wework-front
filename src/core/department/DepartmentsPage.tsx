import { useEffect, useMemo, useState } from "react";
import type { DepartmentResponse } from "./types";
import { getDepartments } from "./api";
import { toDepartmentErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { buildTree, flattenTree } from "./tree";
import { PageHeader } from "../../shared/components/PageHeader";
import { Button } from "../../shared/components/Button";
import { DepartmentTree } from "./DepartmentTree";
import { DepartmentDetail } from "./DepartmentDetail";

export function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    getDepartments()
      .then((data) => {
        if (ignore) return;
        setDepartments(data);
        setLoadError(null);
      })
      .catch((error) => {
        if (!ignore) setLoadError(toDepartmentErrorMessage(getErrorCode(error)));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    
    return () => {
      ignore = true;
    }
  }, [reloadKey]);

  function reload() {
    setReloadKey((key) => key + 1);
  }

  // 평평한 목록 → 트리 → 화면 표시 순서 (departments가 바뀔 때만 다시 계산)
  const flatItems = useMemo(() => flattenTree(buildTree(departments)), [departments]);

  // 선택한 부서가 없으면(처음, 또는 삭제됨) 맨 위 부서를 선택한 것으로 처리
  const selected =
    flatItems.find(({ node }) => node.id === selectedId)?.node ?? flatItems[0]?.node ?? null;
  const parentName = selected
    ? (departments.find((department) => department.id === selected.parentId)?.name ?? null)
    : null;

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <PageHeader 
        title="부서"
        description="부서는 결재선의 기준입니다. 각 부서의 부서장이 소속 사원의 휴가를 승인합니다."
      />
      {loading ? (
        <p role="status" className="text-sm text-fg-muted">
          불러오는 중...
        </p>
      ) : loadError ? (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-sm text-danger">
            {loadError}
          </p>
          <Button onClick={reload}>다시 시도</Button>
        </div>
      ) : flatItems.length === 0 ? (
        <p className="text-sm text-fg-muted">
          아직 부서가 없습니다. 회사 전체를 나타내는 최상위 부서를 먼저 만드세요.
        </p>
      ) : (
        <div className="grid min-h-0 flex-1 items-start gap-4 md:grid-cols-[minmax(16rem,1fr)_2fr]">
          {/* 왼쪽: 트리 */}
          <nav 
            aria-label="부서 목록"
            className="max-h-full min-h-0 overflow-auto rounded-lg border border-line bg-chrome"
          >
            <DepartmentTree 
              items={flatItems}
              selectedId={selected?.id ?? null}
              onSelect={setSelectedId}
            />
          </nav>

          {/* 오른쪽: 상세 */}
          {selected && <DepartmentDetail department={selected} parentName={parentName} />}
        </div>
      )}
    </div>
  );
}