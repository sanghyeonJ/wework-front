import { api } from "../../shared/api/client";
import type { LoginRequest, MeResponse, TokenResponse } from "./types";

export async function login(request: LoginRequest): Promise<TokenResponse> {
  const res = await api.post<TokenResponse>("/api/auth/login", request);
  return res.data;
}

export async function getMe(): Promise<MeResponse> {
  const res = await api.get<MeResponse>("/api/me");
  return res.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post("/api/auth/logout", { refreshToken });
}