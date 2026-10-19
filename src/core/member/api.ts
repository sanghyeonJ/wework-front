import { api } from "../../shared/api/client";
import type { PageResponse } from "../../shared/types/api";
import type { MemberResponse, MemberSearchParams } from "./types";

export async function getMembers(params: MemberSearchParams): Promise<PageResponse<MemberResponse>> {
  const res = await api.get<PageResponse<MemberResponse>>("/api/company/members", { params });
  return res.data;
}