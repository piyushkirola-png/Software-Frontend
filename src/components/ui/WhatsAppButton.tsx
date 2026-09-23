import { Headphones } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919911611207"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-brand hover:bg-brand-dark text-white font-bold text-sm px-5 py-3 rounded-full shadow-lg flex items-center gap-2"
    >
      <Headphones size={18} /> NEED HELP !
    </a>
  );
}
