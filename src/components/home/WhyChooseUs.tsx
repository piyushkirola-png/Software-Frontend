import {
  Zap,
  Shield,
  Headphones,
  RotateCcw,
  BadgeCheck,
  Wallet,
} from "lucide-react";
import Reveal from "../animations/Reveal";

const features = [
  {
    icon: Zap,
    title: "Instant Delivery",
    desc: "Keys and download links are sent to your email within seconds of payment.",
  },
  {
    icon: Shield,
    title: "100% Genuine Licenses",
    desc: "Sourced only from authorized distributors. Every key is verifiable and legit.",
  },
  {
    icon: Wallet,
    title: "Best Price Guarantee",
    desc: "We source from surplus inventory and pass the savings straight to you.",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    desc: "Real humans on WhatsApp and email to help with setup and activation.",
  },
  {
    icon: RotateCcw,
    title: "Easy Replacement",
    desc: "Key not working? We replace it — no questions asked. Refund as a fallback.",
  },
  {
    icon: BadgeCheck,
    title: "GST Invoice Included",
    desc: "Every purchase comes with a proper GST invoice for your business records.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-navy py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal>
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Why Softora?
            </h2>
            <p className="text-gray-300 mt-4 text-base md:text-lg leading-relaxed">
              We make quality software simple to access — delivered fast, backed
              by helpful support, and protected by a secure checkout.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] hover:border-white/20 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand/20 text-brand-light flex items-center justify-center mb-5 group-hover:bg-brand group-hover:text-white transition-colors">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
