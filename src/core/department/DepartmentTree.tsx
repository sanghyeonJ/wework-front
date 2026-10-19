import { Building2, Folder } from "lucide-react";
import type { FlatDepartment } from "./tree";

interface DepartmentTreeProps {
  items: FlatDepartment[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

// 펼친 트리를 들여쓰기로 표시하는 목록
export function DepartmentTree({ items, selectedId, onSelect }: DepartmentTreeProps) {
  return (
    <ul className="flex flex-col gap-0.5 p-2">
      {items.map(({ node, depth }) => {
        const selected = node.id === selectedId;
        const Icon = depth === 0 ? Building2 : Folder;

        return (
          <li key={node.id}>
            <button
              type="button"
              aria-current={selected ? "true" : undefined}
              onClick={() => onSelect(node.id)}
              style={{ paddingLeft: `${ 8 + depth * 20 }px` }}
              className={`flex h-8.5 w-full items-center gap-2 rounded-md pr-2 text-left ${
                selected ? "bg-accent text-on-accent" : "hover:bg-hover"
              }`}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">{node.name}</span>
              {node.leaderName && (
                <span
                  className={`ml-auto shrink-0 text-sm ${
                    selected ? "text-on-accent/80" : "text-fg-muted"
                  }`}
                >
                  {node.leaderName}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}