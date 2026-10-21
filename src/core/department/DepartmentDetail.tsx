import { useId } from "react";
import type { DepartmentNode } from "./tree";
import { Button } from "../../shared/components/Button";
import { Pencil, Plus, Trash2, UserCog } from "lucide-react";
import { DepartmentMembers } from "./DepartmentMembers";

interface DepartmentDetailProps {
  department: DepartmentNode;
  parentName: string | null;
  reloadKey: number;
  onEdit: () => void;
  onAddChild: () => void;
  onChangeLeader: () => void;
  onDelete: () => void;
}

// 선택한 부서의 정보
export function DepartmentDetail({ department, parentName, reloadKey, onEdit, onAddChild, onChangeLeader, onDelete }: DepartmentDetailProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col overflow-hidden rounded-lg border border-line"
    >
      <div className="flex h-12 shrink-0 items-center border-b border-line bg-chrome px-4">
        <h2 id={headingId} className="truncate font-semibold">
          {department.name}
        </h2>
      </div>

      <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-3 p-4">
        <dt className="text-fg-muted">상위 부서</dt>
        <dd>{parentName ?? "없음 (최상위 부서)"}</dd>

        <dt className="text-fg-muted">부서장</dt>
        <dd className="flex flex-wrap items-center gap-3">
          <span>
            {department.leaderName ?? <span className="text-fg-muted">지정되지 않음</span>}
          </span>
          <Button onClick={onChangeLeader}>
            <UserCog aria-hidden="true" className="size-4" />
            부서장 지정
          </Button>
        </dd>

        <dt className="text-fg-muted">하위 부서</dt>
        <dd>{department.children.length}개</dd>
      </dl>

      <DepartmentMembers 
        key={department.id}
        departmentId={department.id}
        reloadKey={reloadKey}
      />

      {/* 작업 버튼 */}
      <div className="flex flex-wrap gap-2 border-t border-line bg-chrome px-4 py-3">
        <Button onClick={onEdit}>
          <Pencil aria-hidden="true" className="size-4" />
          이름·상위 부서 수정
        </Button>
        <Button onClick={onAddChild}>
          <Plus aria-hidden="true" className="size-4" />
          하위 부서 추가
        </Button>
        <Button variant="danger" onClick={onDelete} className="ml-auto">
          <Trash2 aria-hidden="true" className="size-4" />
          삭제
        </Button>
      </div>
    </section>
  );
}