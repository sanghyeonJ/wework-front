import { api } from "../../shared/api/client";
import type { PageResponse } from "../../shared/types/api";
import type { 
  AssignableRole,
  MemberCreateRequest,
  MemberInviteResponse,
  MemberResponse,
  MemberSearchParams,
  MemberUpdateRequest,
 } from "./types";

 const BASE = "/api/company/members";

export async function getMembers(params: MemberSearchParams): Promise<PageResponse<MemberResponse>> {
  const res = await api.get<PageResponse<MemberResponse>>(BASE, { params });
  return res.data;
}

export async function getMember(id: number): Promise<MemberResponse> {
  const res = await api.get<MemberResponse>(`${BASE}/${id}`);
  return res.data;
}

// 계정 발급 → 초대 링크 포함 응답
export async function createMember(request: MemberCreateRequest): Promise<MemberInviteResponse> {
  const res = await api.post<MemberInviteResponse>(BASE, request);
  return res.data;
}

export async function updateMember(id: number, request: MemberUpdateRequest): Promise<void> {
  await api.patch(`${BASE}/${id}`, request);
}

export async function changeMemberRole(id: number, role: AssignableRole): Promise<void> {
  await api.patch(`${BASE}/${id}/role`, { role });
}

export async function resignMember(id: number, resignDate: string): Promise<void> {
  await api.post(`${BASE}/${id}/resign`, {resignDate});
}

// 초대 재발급 (INVITED만) → 새 초대 링크
export async function reissueInvitation(id: number): Promise<MemberInviteResponse> {
  const res = await api.post<MemberInviteResponse>(`${BASE}/${id}/invitation`);
  return res.data;
}