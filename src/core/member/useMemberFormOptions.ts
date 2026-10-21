import { useEffect, useState } from "react";
import { buildTree, flattenTree, type FlatDepartment } from "../department/tree";
import type { PositionResponse } from "../position/types";
import { getDepartments } from "../department/api";
import { getPositions } from "../position/api";
import { toMemberErrorMessage } from "./errorMessages";
import { getErrorCode } from "../../shared/api/client";

export interface MemberFormOptions {
  departments: FlatDepartment[];
  jobGrades: PositionResponse[];
  jobTitles: PositionResponse[];
}

// 사원 발급·수정 폼의 선택지(부서·직급·직책)를 한 번에 불러오기
export function useMemberFormOptions() {
  const [options, setOptions] = useState<MemberFormOptions | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    Promise.all([getDepartments(), getPositions("job-grades"), getPositions("job-titles")])
      .then(([departments, jobGrades, jobTitles]) => {
        if (ignore) return;
        setOptions({ departments: flattenTree(buildTree(departments)), jobGrades, jobTitles });
      })
      .catch((err) => {
        if (!ignore) setError(toMemberErrorMessage(getErrorCode(err)));
      });

    return () => {
      ignore = true;
    };
  }, []);

  return { options, error };
}