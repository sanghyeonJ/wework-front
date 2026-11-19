import { api } from "../../shared/api/client";
import type { CompanyHoliday } from "./types";


export async function getCompanyHolidays(year: number): Promise<CompanyHoliday[]> {
  const res = await api.get<CompanyHoliday[]>("/api/company/holidays", { params: { year } });
  return res.data;
}