import { useId } from "react";
import type { DepartmentNode } from "./tree";

interface DepartmentDetailProps {
  department: DepartmentNode;
  parentName: string | null;
}

// 선택한 부서의 정보
export function DepartmentDetail({ department, parentName }: DepartmentDetailProps) {
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
    </section>
  );
}