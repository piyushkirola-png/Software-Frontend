import { Zap, Shield, Headphones, RotateCcw } from "lucide-react";
import Reveal from "../animations/Reveal";

const items = [
  {
    icon: <Zap size={26} />,
    title: "Instant Delivery",
    sub: "via E-mail",
  },
  {
    icon: <Shield size={26} />,
    title: "Secured Payment",
    sub: "Safe Gateway",
  },
  {
    icon: <Headphones size={26} />,
    title: "Customer Support",
    sub: "10:00 AM - 07:00 PM",
  },
  {
    icon: <RotateCcw size={26} />,
    title: "Easy Replacement",
    sub: "Policy",
  },
];

export default function TrustStrip() {
  return (
    <section className="bg-navy text-white py-14">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-full bg-brand/20 flex items-center justify-center text-brand-light mb-4 group-hover:bg-brand group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <div className="font-bold text-white">{item.title}</div>
                <div className="text-xs text-gray-400 mt-1">{item.sub}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
