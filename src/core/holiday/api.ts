import { api } from "../../shared/api/client";
import type { CompanyHoliday, CompanyHolidayRequest } from "./types";


export async function getCompanyHolidays(year: number): Promise<CompanyHoliday[]> {
  const res = await api.get<CompanyHoliday[]>("/api/company/holidays", { params: { year } });
  return res.data;
}

export async function createCompanyHoliday(request: CompanyHolidayRequest): Promise<void> {
  await api.post("/api/company/holidays", request);
}

export async function updateCompanyHoliday(id: number, request: CompanyHolidayRequest): Promise<void> {
  await api.patch(`/api/company/holidays/${id}`, request);
}

export async function deleteCompanyHoliday(id: number): Promise<void> {
  await api.delete(`/api/company/holidays/${id}`);
}