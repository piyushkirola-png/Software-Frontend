import { ArrowRight, Zap, Shield, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "../animations/Reveal";

export default function HeroSection() {
  return (
    <section className="relative w-full bg-white overflow-hidden">
      {/* Full-bleed banner image */}
      <img
        src="/assets/banner.png"
        alt="Software Universe"
        className="w-full h-auto block select-none"
        draggable={false}
      />

      {/* Text overlay */}
      <div className="absolute inset-0">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <Reveal>
            <div className="max-w-md lg:max-w-lg">
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-navy/10 rounded-full px-4 py-1.5 text-xs font-bold mb-5 text-navy">
                <Zap size={12} className="text-brand" />
                INSTANT LICENSE DELIVERY
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight mb-4 text-navy">
                Genuine Software.
                <br />
                <span className="text-brand">Unbeatable Prices.</span>
              </h1>

              <p className="text-navy/80 text-sm md:text-base mb-6 max-w-md leading-relaxed">
                Windows, Office, Server, Antivirus — delivered instantly to
                your email with GST invoice. 100% authentic licenses from
                authorized distributors.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-brand/30 text-sm md:text-base"
                >
                  Shop Now <ArrowRight size={16} />
                </Link>
                <Link
                  to="/about-us"
                  className="inline-flex items-center gap-2 border-2 border-navy/20 hover:border-navy hover:bg-navy/5 text-navy font-bold px-6 py-3 rounded-xl transition text-sm md:text-base"
                >
                  Learn More
                </Link>
              </div>

              <div className="hidden sm:grid grid-cols-3 gap-4 pt-5 border-t border-navy/10 max-w-md">
                <div>
                  <Shield className="w-5 h-5 text-brand mb-1.5" />
                  <div className="text-[11px] text-navy font-semibold">
                    100% Genuine
                  </div>
                </div>
                <div>
                  <Zap className="w-5 h-5 text-brand mb-1.5" />
                  <div className="text-[11px] text-navy font-semibold">
                    Instant Delivery
                  </div>
                </div>
                <div>
                  <Headphones className="w-5 h-5 text-brand mb-1.5" />
                  <div className="text-[11px] text-navy font-semibold">
                    Expert Support
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}