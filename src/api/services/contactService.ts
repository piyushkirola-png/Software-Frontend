import { apiPost } from "../../lib/api-client";

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const contactService = {
  async submit(data: ContactRequest): Promise<void> {
    return apiPost<void>("/contact", data);
  },
};
