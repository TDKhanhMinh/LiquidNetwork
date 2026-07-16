export type SearchResultType =
  | "user"
  | "session"
  | "queue"
  | "venue"
  | "voucher";

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href: string;
  badge?: string;
}

export interface GlobalSearchResponse {
  query: string;
  items: SearchResultItem[];
  total: number;
}
