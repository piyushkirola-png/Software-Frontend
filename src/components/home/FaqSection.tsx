import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  { q: "How are product keys handled?", a: "All license keys are sourced from authorized distributors and delivered instantly via email after payment." },
  { q: "Why are your prices lower than retail?", a: "We source licenses through authorized channels, refurbishers, and surplus inventory, then pass the savings to you." },
  { q: 'What does "Lifetime" or "Perpetual" license mean?', a: "It means the license is valid forever — no recurring subscription needed." },
  { q: "Are order invoices available?", a: "Yes, a GST invoice is emailed to you immediately after purchase and can be downloaded from your dashboard." },
  { q: "Do you provide installation support?", a: "Yes, our support team is available on WhatsApp and email to help with installation." },
  { q: "How are purchase issues resolved?", a: "Contact support with your order ID — most issues are resolved within hours." },
  { q: "What is the software download process?", a: "After purchase, you receive the download link and license key on your registered email." },
  { q: "Are software updates included?", a: "Yes, updates are included for the duration of the license validity." },
  { q: "What is the license delivery time?", a: "Instantly. Keys are delivered to your email within minutes of payment confirmation." },
  { q: "When will I get my physical order delivered?", a: "We sell digital products only — no physical shipping. Everything is delivered by email." },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy">Frequently Asked Questions</h2>
          <p className="text-muted mt-3 text-sm">Find answers to common questions about our products and services.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`bg-navy rounded-xl overflow-hidden transition-all ${isOpen ? "shadow-cardHover" : ""}`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-semibold text-white text-sm">{f.q}</span>
                  <span className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-gray-300 leading-relaxed border-t border-white/10 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}