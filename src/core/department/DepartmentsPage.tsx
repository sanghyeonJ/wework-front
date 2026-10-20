import { useEffect, useMemo, useState } from "react";
import type { DepartmentResponse } from "./types";
import { deleteDepartment, getDepartments } from "./api";
import { toDepartmentErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";
import { buildTree, flattenTree, type DepartmentNode } from "./tree";
import { PageHeader } from "../../shared/components/PageHeader";
import { Button } from "../../shared/components/Button";
import { DepartmentTree } from "./DepartmentTree";
import { DepartmentDetail } from "./DepartmentDetail";
import { DepartmentFormDialog, type DepartmentFormTarget } from "./DepartmentFormDialog";
import { Plus } from "lucide-react";
import { DepartmentLeaderDialog } from "./DepartmentLeaderDialog";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";

// 대화상자 key: 대상이 바뀌면 새로 생성되도록
function formKey(target: DepartmentFormTarget): string {
  if (target.mode === "edit") return `edit-${target.department.id}`;
  if (target.mode === "create-child") return `child-${target.parent.id}`;
  return "root";
}

export function DepartmentsPage() {
  // 목록
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // 대화상자
  const [formTarget, setFormTarget] = useState<DepartmentFormTarget | null>(null);
  const [leaderTarget, setLeaderTarget] = useState<DepartmentNode | null>(null);
  // 삭제
  const [deleteTarget, setDeleteTarget] = useState<DepartmentNode | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  function closeDelete() {
    setDeleteTarget(null);
    setDeleteError(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteDepartment(deleteTarget.id);
      setSelectedId(deleteTarget.parentId);  // 삭제 후 상위 부서 선택
      closeDelete();
      reload();
    } catch (error) {
      const code = getErrorCode(error);
      setDeleteError(toDepartmentErrorMessage(code));
      if (code === "DEPARTMENT_NOT_FOUND") reload();
    } finally {
      setDeleting(false);
    }
  }

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
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-fg-muted">
            아직 부서가 없습니다. 회사 전체를 나타내는 최상위 부서를 먼저 만드세요.
          </p>
          <Button variant="primary" onClick={() => setFormTarget({ mode: "create-root" })}>
            <Plus aria-hidden="true" className="size-4" />
            최상위 부서 만들기
          </Button>
        </div>
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
          {selected && (
            <DepartmentDetail 
              department={selected} 
              parentName={parentName} 
              onEdit={() => setFormTarget({ mode: "edit", department: selected })}
              onAddChild={() => setFormTarget({ mode: "create-child", parent: selected })}
              onChangeLeader={() => setLeaderTarget(selected)}
              onDelete={() => setDeleteTarget(selected)}
            />
          )}
        </div>
      )}

      {/* 추가·수정 대화상자 */}
      {formTarget && (
        <DepartmentFormDialog 
          key={formKey(formTarget)}
          target={formTarget}
          flatItems={flatItems}
          onClose={() => setFormTarget(null)}
          onSaved={() => {
            setFormTarget(null);
            reload();
          }}
          onStale={reload}
        />
      )}

      {/* 부서장 지정 대화상자 */}
      {leaderTarget && (
        <DepartmentLeaderDialog 
          key={leaderTarget.id}
          department={leaderTarget}
          onClose={() => setLeaderTarget(null)}
          onSaved={() => {
            setLeaderTarget(null);
            reload();
          }}
          onStale={reload}
        />
      )}

      {/* 삭제 확인창 */}
      <ConfirmDialog 
        open={deleteTarget !== null}
        title="부서 삭제"
        message={
          <>
            <strong className="font-semibold">{deleteTarget?.name}</strong> 부서를 삭제합니다.<br />
            하위 부서나 소속 사원(초대 중 포함)이 있으면 삭제할 수 없습니다. <br />
            퇴사한 사원의 부서기록은 그대로 남습니다.
          </>
        }
        confirmLabel="삭제"
        busy={deleting}
        errorMessage={deleteError}
        onConfirm={() => void handleDelete()}
        onClose={closeDelete}
      />
    </div>
  );
}