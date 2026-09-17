import { ArrowRight, Zap, Shield, Headphones } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold mb-5">
            <Zap size={12} className="text-yellow-400" />
            INSTANT LICENSE DELIVERY
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            Genuine Software.
            <br />
            <span className="text-brand-light">Unbeatable Prices.</span>
          </h1>
          <p className="text-gray-300 text-sm md:text-base mb-6 max-w-lg">
            Windows, Office, Server, Antivirus — delivered instantly to your
            email with GST invoice. 100% authentic licenses from authorized
            distributors.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold px-6 py-3 rounded-lg transition"
            >
              Shop Now <ArrowRight size={16} />
            </Link>
            <Link
              to="/about-us"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white text-white font-bold px-6 py-3 rounded-lg transition"
            >
              Learn More
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-10">
            <div className="text-center">
              <Shield className="w-6 h-6 text-brand-light mx-auto mb-1" />
              <div className="text-[11px] text-gray-400 font-semibold">
                100% Genuine
              </div>
            </div>
            <div className="text-center">
              <Zap className="w-6 h-6 text-brand-light mx-auto mb-1" />
              <div className="text-[11px] text-gray-400 font-semibold">
                Instant Delivery
              </div>
            </div>
            <div className="text-center">
              <Headphones className="w-6 h-6 text-brand-light mx-auto mb-1" />
              <div className="text-[11px] text-gray-400 font-semibold">
                Expert Support
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block relative">
          <div className="aspect-square bg-gradient-to-br from-brand/30 to-brand/5 rounded-2xl border border-white/10 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-5xl font-extrabold text-white mb-2">10K+</div>
              <div className="text-sm text-gray-300">
                Happy Customers
              </div>
              <div className="mt-6 text-5xl font-extrabold text-white mb-2">
                4.9★
              </div>
              <div className="text-sm text-gray-300">
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}