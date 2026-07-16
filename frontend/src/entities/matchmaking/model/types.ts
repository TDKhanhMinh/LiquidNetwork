export type MatchMode =
  | "networking"
  | "comfort"
  | "debate"
  | "fight";

export type AlcoholLevelFilter =
  | "LEVEL_1"
  | "LEVEL_2"
  | "LEVEL_3"
  | "LEVEL_4"
  | "any";

export interface MatchFilters {
  mode: MatchMode;
  level: AlcoholLevelFilter;
  /** km radius */
  maxDistanceKm: number;
  occupation?: string;
}

export interface MatchCandidate {
  id: string;
  name: string;
  avatar?: string;
  occupation?: string;
  alcoholToleranceLevel?: string;
  distanceKm: number;
  matchScore: number;
  modes: MatchMode[];
  bio?: string;
}

export interface MatchSearchResult {
  filters: MatchFilters;
  items: MatchCandidate[];
  total: number;
}
