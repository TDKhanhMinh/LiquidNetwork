import { ApiError, apiClient } from "@/shared/api";
import { env } from "@/shared/config";
import { routes } from "@/shared/config/routes";
import type { GlobalSearchResponse, SearchResultItem } from "../model/types";

function isNotReadyError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return (
      err.status === 0 ||
      err.status === 404 ||
      err.status === 501 ||
      err.status === 401
    );
  }
  const code = (err as { code?: string })?.code;
  return code === "ERR_NETWORK" || code === "ECONNABORTED";
}

const useMock =
  env.authMock ||
  process.env.NEXT_PUBLIC_SEARCH_MOCK === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_SEARCH_MOCK !== "false");

const CATALOG: SearchResultItem[] = [
  {
    id: "u-minh",
    type: "user",
    title: "Minh Bia",
    subtitle: "Sales · LEVEL_2",
    href: routes.userPublic("u-minh"),
    badge: "Bạn giao lưu",
  },
  {
    id: "u-lan",
    type: "user",
    title: "Lan Chill",
    subtitle: "Designer · LEVEL_1",
    href: routes.userPublic("u-lan"),
  },
  {
    id: "sess-q1",
    type: "session",
    title: "Bàn tối Q1",
    subtitle: "Nguyễn Huệ · Sắp tới",
    href: routes.sessions,
    badge: "Session",
  },
  {
    id: "queue-hub",
    type: "queue",
    title: "Invitation Queue",
    subtitle: "Tạo / theo dõi hàng chờ mời",
    href: routes.queue,
    badge: "Queue",
  },
  {
    id: "venue-bia",
    type: "venue",
    title: "Bia Craft Q1",
    subtitle: "Quán · có thể đặt bàn",
    href: routes.bookings,
    badge: "Quán",
  },
  {
    id: "voucher-welcome",
    type: "voucher",
    title: "Welcome 50K",
    subtitle: "Giảm 50k đơn đầu",
    href: routes.vouchers,
    badge: "Voucher",
  },
  {
    id: "u-ha",
    type: "user",
    title: "Hà Networking",
    subtitle: "HR · LEVEL_2",
    href: routes.userPublic("u-ha"),
  },
  {
    id: "premium",
    type: "voucher",
    title: "Premium VIP",
    subtitle: "Gói thành viên",
    href: routes.premium,
    badge: "Premium",
  },
];

export const searchApi = {
  async search(query: string): Promise<GlobalSearchResponse> {
    const q = query.trim();
    try {
      return await apiClient.get<GlobalSearchResponse>("/search", {
        params: { q },
      });
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        if (!q) {
          return { query: q, items: CATALOG.slice(0, 5), total: 5 };
        }
        const lower = q.toLowerCase();
        const items = CATALOG.filter(
          (i) =>
            i.title.toLowerCase().includes(lower) ||
            i.subtitle?.toLowerCase().includes(lower) ||
            i.type.includes(lower),
        );
        return { query: q, items, total: items.length };
      }
      throw err;
    }
  },
};
