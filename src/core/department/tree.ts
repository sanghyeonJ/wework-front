import type { DepartmentResponse } from "./types";

export interface DepartmentNode extends DepartmentResponse {
  children: DepartmentNode[];
}

export interface FlatDepartment {
  node: DepartmentNode;
  depth: number;  // 0 최상위
}

// 백엔드의 평평한 목록(parentId 포함) → 트리
export function buildTree(departments: DepartmentResponse[]): DepartmentNode[] {
  const nodes = new Map<number, DepartmentNode>();
  for(const department of departments) {
    nodes.set(department.id, {...department, children: []});
  }

  const roots: DepartmentNode[] = [];
  for(const node of nodes.values()) {
    const parent = node.parentId !== null ? nodes.get(node.parentId) : undefined;
    if(parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // 같은 단계에서는 만든 순서(id)대로
  const sortById = (list: DepartmentNode[]) => {
    list.sort((a, b) => a.id - b.id);
    list.forEach((node) => sortById(node.children));
  }
  sortById(roots);

  return roots;
}

// 트리 → 위에서부터 차례대로 펼친 목록 (들여쓰기 깊이 포함)
export function flattenTree(nodes: DepartmentNode[], depth = 0): FlatDepartment[] {
  return nodes.flatMap((node) => [{ node, depth }, ...flattenTree(node.children, depth + 1)]);
}

// 자기 자신 + 모든 하위 부서 id (상위 부서 선택에서 제외할 대상)
export function collectSubtreeIds(node: DepartmentNode): Set<number> {
  const ids = new Set<number>([node.id]);
  for(const child of node.children) {
    collectSubtreeIds(child).forEach((id) => ids.add(id));
  }
  return ids;
}