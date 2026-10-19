import { useId } from "react";
import type { DepartmentNode } from "./tree";
import { Button } from "../../shared/components/Button";
import { Pencil, Plus } from "lucide-react";

interface DepartmentDetailProps {
  department: DepartmentNode;
  parentName: string | null;
  onEdit: () => void;
  onAddChild: () => void;
}

// 선택한 부서의 정보
export function DepartmentDetail({ department, parentName, onEdit, onAddChild }: DepartmentDetailProps) {
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
        <dd>{department.leaderName ?? <span className="text-fg-muted">지정되지 않음</span>}</dd>

        <dt className="text-fg-muted">하위 부서</dt>
        <dd>{department.children.length}개</dd>
      </dl>

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
      </div>
    </section>
  );
}