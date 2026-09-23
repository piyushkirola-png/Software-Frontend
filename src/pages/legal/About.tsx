import { Shield, Zap, Users, Headphones, Award, Heart } from "lucide-react";
import PageHero from "../../components/ui/PageHero";
import Reveal from "../../components/animations/Reveal";

const features = [
  {
    icon: <Shield size={22} />,
    title: "Guaranteed Genuine",
    desc: "Receive only fully verifiable, authentic, and legitimate licenses.",
  },
  {
    icon: <Zap size={22} />,
    title: "Exceptional Value",
    desc: "Strategic sourcing allows us to pass significant savings on to you.",
  },
  {
    icon: <Headphones size={22} />,
    title: "Expert Support",
    desc: "Our dedicated team is available via web chat and WhatsApp for immediate assistance.",
  },
  {
    icon: <Users size={22} />,
    title: "Customer Centric",
    desc: "We prioritize your satisfaction and use your feedback to constantly improve.",
  },
  {
    icon: <Award size={22} />,
    title: "Honesty & Trust",
    desc: "We operate with transparency, aiming to build long-term relationships based on trust.",
  },
  {
    icon: <Heart size={22} />,
    title: "Seamless Experience",
    desc: "Enjoy easy navigation, secure checkout, and straightforward delivery.",
  },
];

// Reusable heading with full-width underline
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-3xl font-bold text-navy pb-3">{children}</h2>
      <div className="h-0.5 w-full bg-gradient-to-r from-brand via-brand-light to-transparent rounded-full" />
    </div>
  );
}

export default function About() {
  return (
    <>
      <PageHero
        title="About Softora"
        subtitle="Your Reliable Partner for Authentic Software at Unbeatable Rates."
      />

      <section className="max-w-4xl mx-auto px-4 py-14">
        {/* Who We Are */}
        <Reveal>
          <SectionHeading>Who We Are</SectionHeading>
          <div className="text-base text-muted leading-relaxed space-y-4">
            <p>
              Welcome to Softora! We are a customer-centric digital retailer
              committed to making legitimate software both accessible and
              affordable. Our primary goal is to supply you with genuine
              software licenses from top-tier brands at highly competitive
              prices, all supported by a responsive and expert support team.
            </p>
            <p>
              Our team is dedicated to establishing a trusted reputation by
              delivering real value and superior service. We conduct our
              business with integrity and a laser focus on ensuring customer
              satisfaction.
            </p>
          </div>
        </Reveal>

        {/* Our Business Model & Brand Independence */}
        <Reveal delay={0.1}>
          <div className="mt-12">
            <SectionHeading>
              Our Business Model &amp; Brand Independence
            </SectionHeading>
          </div>
          <div className="text-base text-muted leading-relaxed space-y-4">
            <p>
              You might ask how we manage to offer such significant discounts on
              genuine software. Our method is simple and transparent: Software
              Universe functions as an independent reseller. We carefully source
              our licenses through a network of authorized distributors, trusted
              refurbishers, and by purchasing volume or surplus inventory. This
              strategic sourcing enables us to acquire genuine products at
              reduced costs, and we pass those savings directly on to you.
            </p>
            <p>
              <span className="font-bold text-navy">Important Note:</span> The
              software brands we retail (such as Microsoft, Adobe, Kaspersky,
              CorelDRAW, or Autodesk). All trademarks, logos, and brand names
              belong to their respective owners and are used on our platform
              strictly for identification purposes.
            </p>
            <p>
              Our streamlined operational model also helps keep our overhead
              low, ensuring you receive the best possible price without
              sacrificing authenticity.
            </p>
          </div>
        </Reveal>

        {/* Our Promise of Authenticity */}
        <Reveal delay={0.15}>
          <div className="mt-12">
            <SectionHeading>Our Promise of Authenticity</SectionHeading>
          </div>
          <div className="text-base text-muted leading-relaxed space-y-4">
            <p>
              At Softora, authenticity is the foundation of our operations. We
              recognize the critical need for using legitimate software. Every
              license we offer is rigorously sourced to ensure it is valid and
              compliant. We take a firm stand against software piracy and are
              committed to delivering only genuine products.
            </p>
            <p>
              We offer clear instructions for installation and activation,
              utilizing official channels whenever possible, to ensure your
              software experience is seamless, secure, and legal.
            </p>
          </div>
        </Reveal>

        {/* Why Choose Softora? */}
        <Reveal delay={0.2}>
          <div className="mt-12">
            <SectionHeading>Why Choose Softora?</SectionHeading>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="bg-gray-50 rounded-2xl p-5 shadow-md border-l-4 border-navy hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-navy">{f.icon}</div>
                  <h3 className="font-bold text-navy text-lg">{f.title}</h3>
                </div>
                <p className="text-sm text-black leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Our Vision & Path Forward */}
        <Reveal delay={0.3}>
          <div className="mt-12">
            <SectionHeading>Our Vision &amp; Path Forward</SectionHeading>
          </div>
          <div className="text-base text-muted leading-relaxed space-y-4">
            <p>
              As an evolving business, our goal is to become your preferred
              online source for affordable, authentic software. We are
              continuously expanding our catalog and refining our services to
              exceed your expectations. We believe in empowering both
              individuals and businesses by making essential digital tools more
              attainable.
            </p>
            <p>
              We aim to earn and maintain your trust daily through reliable
              service, genuine products, and a dedication to your success.
            </p>
          </div>
        </Reveal>

        {/* Final tagline */}
        <Reveal delay={0.35}>
          <div className="mt-10 bg-brand-light/30 rounded-2xl px-6 py-5 text-center">
            <p className="text-sm sm:text-base font-bold text-black leading-snug whitespace-nowrap">
              Discover the Softora difference – where authenticity, value, and
              support converge.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
