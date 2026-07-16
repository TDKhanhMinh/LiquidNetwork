import { apiClient } from "@/shared/api";
import type { DrinkingSession } from "../model/types";

export interface CreateDrinkingSessionInput {
  title?: string;
}

export const drinkingSessionApi = {
  create(input: CreateDrinkingSessionInput) {
    return apiClient.post<DrinkingSession>("/drinking-sessions", input);
  },
};
