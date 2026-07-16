import type { MatchCandidate, MatchFilters, MatchMode } from "../model/types";

const ALL: MatchCandidate[] = [
  {
    id: "u-minh",
    name: "Minh Bia",
    occupation: "Sales",
    alcoholToleranceLevel: "LEVEL_2",
    distanceKm: 1.2,
    matchScore: 92,
    modes: ["networking", "comfort"],
    bio: "Thích bàn vui, networking nhẹ.",
  },
  {
    id: "u-lan",
    name: "Lan Chill",
    occupation: "Designer",
    alcoholToleranceLevel: "LEVEL_1",
    distanceKm: 2.5,
    matchScore: 88,
    modes: ["comfort"],
    bio: "Tâm sự nhẹ nhàng, không ép uống.",
  },
  {
    id: "u-huy",
    name: "Huy Chiến",
    occupation: "Engineer",
    alcoholToleranceLevel: "LEVEL_3",
    distanceKm: 3.1,
    matchScore: 85,
    modes: ["debate", "networking"],
    bio: "Debate tech + bia.",
  },
  {
    id: "u-trang",
    name: "Trang Debater",
    occupation: "Lawyer",
    alcoholToleranceLevel: "LEVEL_2",
    distanceKm: 4.0,
    matchScore: 90,
    modes: ["debate"],
    bio: "Thích tranh luận có văn hóa.",
  },
  {
    id: "u-phong",
    name: "Phong Trần",
    occupation: "Founder",
    alcoholToleranceLevel: "LEVEL_4",
    distanceKm: 5.5,
    matchScore: 78,
    modes: ["fight", "networking"],
    bio: "Chế độ mạnh — tôn trọng an toàn.",
  },
  {
    id: "u-ha",
    name: "Hà Networking",
    occupation: "HR",
    alcoholToleranceLevel: "LEVEL_2",
    distanceKm: 0.8,
    matchScore: 94,
    modes: ["networking"],
    bio: "Kết nối ngành nghề.",
  },
  {
    id: "u-duc",
    name: "Đức Tài",
    occupation: "Teacher",
    alcoholToleranceLevel: "LEVEL_1",
    distanceKm: 6.2,
    matchScore: 81,
    modes: ["comfort", "debate"],
    bio: "Nghe chuyện, chill.",
  },
  {
    id: "u-vy",
    name: "Vy Vui Vẻ",
    occupation: "Marketer",
    alcoholToleranceLevel: "LEVEL_3",
    distanceKm: 2.0,
    matchScore: 87,
    modes: ["networking", "fight", "comfort"],
    bio: "Bàn đông vui.",
  },
];

export function filterCandidates(filters: MatchFilters): MatchCandidate[] {
  return ALL.filter((c) => {
    if (!c.modes.includes(filters.mode)) return false;
    if (
      filters.level !== "any" &&
      c.alcoholToleranceLevel !== filters.level
    ) {
      return false;
    }
    if (c.distanceKm > filters.maxDistanceKm) return false;
    if (filters.occupation?.trim()) {
      const q = filters.occupation.trim().toLowerCase();
      if (!c.occupation?.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => b.matchScore - a.matchScore);
}

export const DEFAULT_FILTERS: MatchFilters = {
  mode: "networking",
  level: "any",
  maxDistanceKm: 10,
  occupation: "",
};

export const MATCH_MODES: MatchMode[] = [
  "networking",
  "comfort",
  "debate",
  "fight",
];
