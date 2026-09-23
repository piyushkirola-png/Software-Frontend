import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Twitter,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNewsletterMutation } from "../../api/mutations/publicMutations";
import { notify } from "../ui/toast";
import { getErrorMessage } from "../../lib/api-client";

const quickLinks = [
  { label: "About Us", to: "/about-us" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Condition", to: "/terms-condition" },
  { label: "Shipping & Delivery", to: "/shipping-delivery" },
  { label: "Cancellation & Refund", to: "/cancellation-refund" },
  { label: "Contact Us", to: "/contact-us" },
];

const accountLinks = [
  { label: "Dashboard", to: "/user/dashboard" },
  { label: "Cart", to: "/cart" },
  { label: "Checkout", to: "/checkout" },
  { label: "Order History", to: "/user/orders" },
];

const paymentIcons = [
  { src: "/payments/upi.png", alt: "UPI" },
  { src: "/payments/visa.png", alt: "Visa" },
  { src: "/payments/mastercard.png", alt: "Mastercard" },
  { src: "/payments/gpay.png", alt: "Google Pay" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const newsletter = useNewsletterMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return notify.error("Please enter your email");
    try {
      await newsletter.mutateAsync(email.trim());
      notify.success("Subscribed! Check your inbox.");
      setEmail("");
    } catch (err) {
      notify.error(getErrorMessage(err));
    }
  };

  return (
    <footer className="relative bg-navy text-gray-300 text-sm">
      {/* Top gradient divider */}
      <div className="h-1 bg-gradient-to-r from-brand via-brand-light to-brand" />

      <div className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-5">
            <img
              src="/assets/logo.png"
              alt="Softora"
              className="h-11 w-auto object-contain"
            />
            <div className="leading-tight">
              <div className="font-extrabold text-white text-lg tracking-tight">
                Softora
              </div>
            </div>
          </Link>
          <p className="mb-5 text-sm leading-relaxed">
            Your reliable partner for authentic software. Instant license
            delivery with GST invoice to your email ID (step-by-step
            instructions included).
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <MapPin size={14} className="text-brand-light mt-0.5 shrink-0" />
              <span>
                330A, Durga Enclave, Gali No-7, Sehatpur, Faridabad,
                Haryana-121003
              </span>
            </div>
            <a
              href="mailto:support@softora.in"
              className="flex gap-2 hover:text-brand-light transition-colors"
            >
              <Mail size={14} className="text-brand-light shrink-0" />
              support@softora.in
            </a>
            <a
              href="tel:+919911611207"
              className="flex gap-2 hover:text-brand-light transition-colors"
            >
              <Phone size={14} className="text-brand-light shrink-0" />
              +91 9911611207
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-1 text-base">Quick Links</h4>
          <div className="w-10 h-0.5 bg-navy-600 bg-blue-900 mb-4 rounded-full" />
          <ul className="space-y-3">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="text-sm hover:text-brand-light transition-colors inline-flex items-center gap-1 group"
                >
                  <span className="text-brand-light/50 group-hover:text-brand-light transition-colors">
                    ›
                  </span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="text-white font-bold mb-1 text-base">Account Info</h4>
          <div className="w-10 h-0.5 bg-navy-600 bg-blue-900 mb-4 rounded-full" />
          <ul className="space-y-3">
            {accountLinks.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="text-sm hover:text-brand-light transition-colors inline-flex items-center gap-1 group"
                >
                  <span className="text-brand-light/50 group-hover:text-brand-light transition-colors">
                    ›
                  </span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter + Social */}
        <div>
          <h4 className="text-white font-bold mb-1 text-base">Stay Updated</h4>
          <div className="w-10 h-0.5 bg-navy-600 bg-blue-900 mb-4 rounded-full" />
          <p className="text-sm mb-4">
            Get product updates, deals, and coupons in your inbox.
          </p>
          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
            />
            <button
              type="submit"
              disabled={newsletter.isPending}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold py-2.5 rounded-xl text-sm transition disabled:opacity-60"
            >
              {newsletter.isPending ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Subscribe <Send size={14} />
                </>
              )}
            </button>
          </form>

          <h5 className="text-white font-bold mt-6 mb-3 text-xs uppercase tracking-wider">
            Connect With Us
          </h5>
          <div className="flex gap-2">
            {[
              { Icon: Facebook, label: "Facebook" },
              { Icon: Instagram, label: "Instagram" },
              { Icon: Twitter, label: "Twitter" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-brand flex items-center justify-center transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>© 2026 Softora. All Rights Reserved.</span>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 inline-flex items-center gap-1">
              <ShieldCheck size={12} className="text-success" />
              100% SECURE CHECKOUT
            </span>
            <div className="flex items-center gap-2">
              {paymentIcons.map((p) => (
                <img
                  key={p.alt}
                  src={p.src}
                  alt={p.alt}
                  className="h-7 w-auto object-contain bg-white rounded px-1 py-0.5"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-6 text-center text-xs font-bold text-brand-light">
          Transparency Statement — Softora is an independent reseller of genuine
          software. We are not affiliated with or endorsed by the brands we
          sell. All trademarks and logos belong to their respective owners.
        </div>
      </div>
    </footer>
  );
}
