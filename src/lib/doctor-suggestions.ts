// Maps abnormal analyte names to the specialist who typically interprets them.
const ANALYTE_SPECIALTY: { match: RegExp; specialty: string }[] = [
  { match: /tsh|t3|t4|thyroid/i, specialty: "Endocrinologist" },
  { match: /glucose|hba1c|sugar|insulin|fasting blood/i, specialty: "Diabetologist" },
  { match: /cholesterol|ldl|hdl|triglyceride|lipid/i, specialty: "Cardiologist" },
  {
    match: /haemoglobin|hemoglobin|\brbc\b|\bwbc\b|platelet|hematocrit|\bmcv\b/i,
    specialty: "Hematologist",
  },
  { match: /creatinine|urea|egfr|uric acid|\bbun\b/i, specialty: "Nephrologist" },
  {
    match: /sgpt|sgot|\balt\b|\bast\b|bilirubin|alkaline phosphatase|liver/i,
    specialty: "Gastroenterologist",
  },
  { match: /vitamin d|calcium|vitamin b12|\bb12\b|phosphor/i, specialty: "General Physician" },
  { match: /psa|testosterone/i, specialty: "Urologist" },
  { match: /estrogen|progesterone|prolactin|\bfsh\b|\blh\b/i, specialty: "Gynaecologist" },
];

// Canonical specialties (used to populate the admin form's datalist).
export const SPECIALTIES = [
  "General Physician",
  "Endocrinologist",
  "Diabetologist",
  "Cardiologist",
  "Hematologist",
  "Nephrologist",
  "Gastroenterologist",
  "Urologist",
  "Gynaecologist",
  "Dermatologist",
  "Orthopaedician",
];

// Given abnormal analyte names, suggest distinct specialties (falls back to GP).
export function suggestSpecialties(names: string[]): string[] {
  const set = new Set<string>();
  for (const n of names) {
    for (const m of ANALYTE_SPECIALTY) {
      if (m.match.test(n)) set.add(m.specialty);
    }
  }
  if (set.size === 0 && names.length > 0) set.add("General Physician");
  return [...set];
}
