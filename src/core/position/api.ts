import { api } from "../../shared/api/client";
import type { PositionRequest, PositionResponse } from "./types";

// 직급·직책은 주소만 다르고 요청·응답이 같음 → 주소 이름으로 구분
export type PositionKind = "job-grades" | "job-titles";

export async function getPositions(kind: PositionKind): Promise<PositionResponse[]> {
  const res = await api.get<PositionResponse[]>(`/api/company/${kind}`);
  return res.data;
}

export async function createPosition(kind: PositionKind, request: PositionRequest): Promise<void> {
  await api.post(`/api/company/${kind}`, request);
}

export async function updatePosition(kind: PositionKind, id: number, request: PositionRequest) {
  await api.patch(`/api/company/${kind}/${id}`, request);
}

export async function deletePosition(kind: PositionKind, id: number): Promise<void> {
  await api.delete(`/api/company/${kind}/${id}`);
}