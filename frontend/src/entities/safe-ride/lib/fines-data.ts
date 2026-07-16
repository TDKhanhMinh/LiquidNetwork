import type { FineBand } from "../model/types";

/** Reference table inspired by Nghị định 100/2019 (summary for product UX — not legal advice). */
export const DECREE_100_FINES: FineBand[] = [
  {
    id: "moto-1",
    bloodAlcohol: "Vượt quá 0 — dưới 50 mg/100 ml máu",
    vehicle: "Xe máy",
    fineRange: "2–3 triệu",
    licenseAction: "Tước GPLX 10–12 tháng",
  },
  {
    id: "moto-2",
    bloodAlcohol: "50 — dưới 80 mg/100 ml máu",
    vehicle: "Xe máy",
    fineRange: "4–5 triệu",
    licenseAction: "Tước GPLX 16–18 tháng",
  },
  {
    id: "moto-3",
    bloodAlcohol: "≥ 80 mg/100 ml máu",
    vehicle: "Xe máy",
    fineRange: "6–8 triệu",
    licenseAction: "Tước GPLX 22–24 tháng",
  },
  {
    id: "car-1",
    bloodAlcohol: "Vượt quá 0 — dưới 50 mg/100 ml máu",
    vehicle: "Ô tô",
    fineRange: "6–8 triệu",
    licenseAction: "Tước GPLX 10–12 tháng",
  },
  {
    id: "car-2",
    bloodAlcohol: "50 — dưới 80 mg/100 ml máu",
    vehicle: "Ô tô",
    fineRange: "16–18 triệu",
    licenseAction: "Tước GPLX 16–18 tháng",
  },
  {
    id: "car-3",
    bloodAlcohol: "≥ 80 mg/100 ml máu",
    vehicle: "Ô tô",
    fineRange: "30–40 triệu",
    licenseAction: "Tước GPLX 22–24 tháng",
  },
];
