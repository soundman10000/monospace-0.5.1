const ICONS = [
  "medical_services",
  "health_and_safety",
  "local_hospital",
  "healing",
  "favorite",
  "visibility",
  "medication",
  "vaccines",
  "monitor_heart",
  "spa",
  "fitness_center",
  "self_improvement",
  "child_care",
  "elderly",
  "hearing",
  "psychology",
  "accessibility_new",
  "home",
  "pets",
  "star",
  "verified",
  "security",
  "volunteer_activism",
  "work",
  "school",
  "flight",
  "directions_car",
  "beach_access",
  "umbrella",
  "water_drop",
];

const COLORS = [
  "#2F80ED",
  "#27AE60",
  "#EB5757",
  "#9B51E0",
  "#F2994A",
  "#56CCF2",
  "#F2C94C",
  "#219653",
  "#BB6BD9",
  "#E35169",
  "#4A990A",
  "#FFA439",
  "#6644FF",
  "#0EA5A5",
  "#C2410C",
];

const BENEFIT_STYLE = {
  MEDICAL: { icon: "medical_services", color: "#2F80ED" },
  DENTAL: { icon: "healing", color: "#56CCF2" },
  VISION: { icon: "visibility", color: "#9B51E0" },
  LIFE: { icon: "favorite", color: "#EB5757" },
  DISABILITY: { icon: "accessibility_new", color: "#F2994A" },
  RX: { icon: "medication", color: "#27AE60" },
  PHARMACY: { icon: "medication", color: "#27AE60" },
};

const hash = (value) => {
  let h = 0;
  for (const char of String(value)) {
    h = (h * 31 + char.charCodeAt(0)) >>> 0;
  }
  return h;
};

const pick = (list, key) => list[hash(key) % list.length];

export const styleForBenefit = (row) =>
  BENEFIT_STYLE[String(row.code ?? "").toUpperCase()] ?? {
    icon: pick(ICONS, `${row.id}:icon`),
    color: pick(COLORS, `${row.id}:color`),
  };

export const styleForPlan = (row) => ({
  icon: pick(ICONS, `${row.id}:icon`),
  color: pick(COLORS, `${row.id}:color`),
});
