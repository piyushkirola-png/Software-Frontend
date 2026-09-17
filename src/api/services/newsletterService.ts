import { apiPost } from "../../lib/api-client";

export const newsletterService = {
  async subscribe(email: string): Promise<void> {
    return apiPost<void>("/newsletter/subscribe", { email });
  },
};