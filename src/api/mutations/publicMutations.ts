import { useMutation } from "@tanstack/react-query";
import { contactService, ContactRequest } from "../services/contactService";
import { newsletterService } from "../services/newsletterService";

export function useContactMutation() {
  return useMutation({
    mutationFn: (data: ContactRequest) => contactService.submit(data),
  });
}

export function useNewsletterMutation() {
  return useMutation({
    mutationFn: (email: string) => newsletterService.subscribe(email),
  });
}