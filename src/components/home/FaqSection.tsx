import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";
import Reveal from "../animations/Reveal";

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
  const [open, setOpen] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpen((prev) => (prev === i ? null : i));
  };

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <Reveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-brand/10 text-brand text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <HelpCircle size={12} /> HELP CENTER
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy">
              Frequently Asked Questions
            </h2>
            <p className="text-muted mt-3 text-sm md:text-base">
              Find answers to common questions about our products and services.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <motion.div
                  key={i}
                  layout
                  transition={{
                    layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                  }}
                  className={`rounded-2xl overflow-hidden border transition-colors duration-300 ${
                    isOpen
                      ? "bg-navy border-brand shadow-cardHover"
                      : "bg-navy border-navy hover:border-brand/40"
                  }`}
                >
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left group"
                  >
                    <span className="font-semibold text-sm text-white">
                      {f.q}
                    </span>
                    <span
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? "bg-brand text-white rotate-180"
                          : "bg-white/10 text-white group-hover:bg-white/20"
                      }`}
                    >
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 text-sm text-gray-300 leading-relaxed border-t border-white/10 pt-3">
                          {f.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}