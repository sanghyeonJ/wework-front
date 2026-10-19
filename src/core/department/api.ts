import { api } from "../../shared/api/client";
import type { DepartmentRequest, DepartmentResponse } from "./types";

const BASE = "/api/company/departments";

export async function getDepartments(): Promise<DepartmentResponse[]> {
  const res = await api.get<DepartmentResponse[]>(BASE);
  return res.data;
}

export async function createDepartment(request: DepartmentRequest): Promise<void> {
  await api.post(BASE, request);
}

export async function updateDepartment(id: number, request: DepartmentRequest): Promise<void> {
  await api.patch(`${BASE}/${id}`, request);
}

export async function changeDepartmentLeader(id: number, leaderId: number | null): Promise<void> {
  await api.patch(`${BASE}/${id}/leader`, { leaderId });
}

export async function deleteDepartment(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}