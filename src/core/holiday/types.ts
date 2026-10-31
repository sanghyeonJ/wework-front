// 휴일의 출처: 국가 공휴일 / 회사 휴일
export type HolidayType = "PUBLIC" | "COMPANY";

export interface Holiday {
  date: string;
  name: string;
  type: HolidayType;
}