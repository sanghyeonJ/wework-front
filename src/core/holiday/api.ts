import { api } from "../../shared/api/client";
import type { CompanyHoliday, CompanyHolidayRequest, Holiday, PublicHoliday, PublicHolidaySyncResult } from "./types";


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


export async function getPublicHolidays(countryCode: string, year: number): Promise<PublicHoliday[]> {
  const res = await api.get<PublicHoliday[]>("/api/admin/public-holidays", { params: {countryCode, year} });
  return res.data;
}

export async function syncPublicHolidays(countryCode: string, year: number): Promise<PublicHolidaySyncResult> {
  const res = await api.post<PublicHolidaySyncResult>("/api/admin/public-holidays/sync", null, {params: {countryCode, year}});
  return res.data;
}

export async function getYearHolidays(year: number): Promise<Holiday[]> {
  const res = await api.get<Holiday[]>("/api/holidays", { params: { year } });
  return res.data;
}