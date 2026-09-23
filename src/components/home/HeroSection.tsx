import { ArrowRight, Zap, Shield, Headphones, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Counter from "../animations/Counter";
import Reveal from "../animations/Reveal";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      {/* Background layers */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-brand-light/10 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        {/* Left column */}
        <Reveal>
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold mb-6 backdrop-blur-sm">
              <Zap size={12} className="text-yellow-400" />
              INSTANT LICENSE DELIVERY
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Genuine Software.
              <br />
              <span className="text-brand-light">Unbeatable Prices.</span>
            </h1>

            <p className="text-gray-300 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
              Windows, Office, Server, Antivirus — delivered instantly to your
              email with GST invoice. 100% authentic licenses from authorized
              distributors.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold px-7 py-3.5 rounded-xl transition shadow-lg shadow-brand/30"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link
                to="/about-us"
                className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white hover:bg-white/5 text-white font-bold px-7 py-3.5 rounded-xl transition"
              >
                Learn More
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <Shield className="w-6 h-6 text-brand-light mb-2" />
                <div className="text-xs text-gray-400 font-semibold">
                  100% Genuine
                </div>
              </div>
              <div>
                <Zap className="w-6 h-6 text-brand-light mb-2" />
                <div className="text-xs text-gray-400 font-semibold">
                  Instant Delivery
                </div>
              </div>
              <div>
                <Headphones className="w-6 h-6 text-brand-light mb-2" />
                <div className="text-xs text-gray-400 font-semibold">
                  Expert Support
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Right column */}
        <Reveal delay={150}>
          <div className="hidden md:block relative">
            <div className="relative aspect-square max-w-lg ml-auto">
              {/* Glow */}
              <div className="absolute inset-6 bg-gradient-to-br from-brand/40 to-brand-light/10 rounded-3xl blur-2xl" />

              {/* Card */}
              <div className="relative h-full rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-10 flex flex-col justify-center gap-10">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="#facc15" stroke="#facc15" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-400">
                    Rated by customers
                  </div>
                </div>

                <div>
                  <div className="text-6xl font-extrabold text-white mb-2">
                    <Counter to={10} suffix="K+" duration={1500} />
                  </div>
                  <div className="text-sm text-gray-400">Happy Customers</div>
                </div>

                <div>
                  <div className="text-6xl font-extrabold text-white mb-2">
                    4.9<span className="text-brand-light">★</span>
                  </div>
                  <div className="text-sm text-gray-400">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
