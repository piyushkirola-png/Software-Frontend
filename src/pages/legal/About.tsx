import { Link } from "react-router-dom";
import { Shield, Zap, Users, Headphones, Award, Heart } from "lucide-react";

export default function About() {
  const features = [
    { icon: <Shield size={22} />, title: "Guaranteed Genuine", desc: "Fully verifiable, authentic, legitimate licenses." },
    { icon: <Zap size={22} />, title: "Exceptional Value", desc: "Strategic sourcing passes savings directly to you." },
    { icon: <Headphones size={22} />, title: "Expert Support", desc: "Available via web chat and WhatsApp for immediate help." },
    { icon: <Users size={22} />, title: "Customer Centric", desc: "We prioritize satisfaction and use feedback to improve." },
    { icon: <Award size={22} />, title: "Honesty & Trust", desc: "We operate with transparency for long-term relationships." },
    { icon: <Heart size={22} />, title: "Seamless Experience", desc: "Easy navigation, secure checkout, straightforward delivery." },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            About Software Universe
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Your reliable partner for authentic software at unbeatable rates.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-extrabold text-navy mb-4">Who We Are</h2>
        <div className="text-sm text-muted leading-relaxed space-y-4">
          <p>
            Welcome to Software Universe! We are a customer-centric digital
            retailer committed to making legitimate software both accessible
            and affordable. Our primary goal is to supply you with genuine
            software licenses from top-tier brands at highly competitive
            prices, all supported by a responsive and expert support team.
          </p>
          <p>
            Our team is dedicated to establishing a trusted reputation by
            delivering real value and superior service. We conduct our business
            with integrity and a laser focus on ensuring customer satisfaction.
          </p>
        </div>

        <h2 className="text-2xl font-extrabold text-navy mt-10 mb-4">
          Our Business Model
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          Software Universe functions as an independent reseller. We carefully
          source our licenses through a network of authorized distributors,
          trusted refurbishers, and by purchasing volume or surplus inventory.
          This strategic sourcing enables us to acquire genuine products at
          reduced costs, and we pass those savings directly on to you.
        </p>

        <h2 className="text-2xl font-extrabold text-navy mt-10 mb-4">
          Why Choose Us?
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {features.map((f) => (
            <div key={f.title} className="border border-gray-100 rounded-xl p-5">
              <div className="w-11 h-11 rounded-lg bg-brand/10 text-brand flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="font-bold text-navy mb-1">{f.title}</h3>
              <p className="text-xs text-muted">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold px-6 py-3 rounded-lg"
          >
            Browse Products →
          </Link>
        </div>
      </section>
    </div>
  );
}