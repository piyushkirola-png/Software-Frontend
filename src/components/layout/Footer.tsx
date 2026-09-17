import { MapPin, Mail, Phone, Facebook, Instagram, Twitter } from "lucide-react";

const FRONTEND_URL = import.meta.env.FRONTEND_URL;

const quickLinks = [
  { label: "About Us", href: `${FRONTEND_URL}/about-us` },
  { label: "Privacy Policy", href: `${FRONTEND_URL}/privacy-policy` },
  { label: "Terms & Condition", href: `${FRONTEND_URL}/terms-condition` },
  { label: "Shipping & Delivery", href: `${FRONTEND_URL}/shipping-delivery` },
  { label: "Cancellation & Refund", href: `${FRONTEND_URL}/cancellation-refund` },
  { label: "Contact Us", href: `${FRONTEND_URL}/contact-us` },
];

const accountLinks = [
  { label: "Dashboard", href: `${FRONTEND_URL}/user/dashboard` },
  { label: "Cart", href: `${FRONTEND_URL}/cart` },
  { label: "Check Out", href: `${FRONTEND_URL}/checkout` },
  { label: "Order History", href: `${FRONTEND_URL}/user/orders` },
];

const paymentIcons = [
  { src: "/payments/upi.png", alt: "UPI" },
  { src: "/payments/visa.png", alt: "Visa" },
  { src: "/payments/mastercard.png", alt: "Mastercard" },
  { src: "/payments/gpay.png", alt: "Google Pay" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-gray-300 text-sm">
      <div className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="/assets/logo.png" alt="Software Universe" className="h-12 w-auto object-contain" />
            <div className="leading-tight">
              <div className="font-extrabold text-white text-lg tracking-tight">SOFTWARE</div>
              <div className="text-[10px] tracking-[0.28em] text-gray-400 font-semibold">UNIVERSE</div>
            </div>
          </div>
          <p className="mb-5 text-xs leading-relaxed">
            Your reliable partner for authentic software. Instant license delivery with GST invoice to your email ID (step-by-step instructions included).
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex gap-2"><MapPin size={14} className="text-brand-light mt-0.5 shrink-0" /> 330A, Durga Enclave, Gali No-7, Sehatpur, Faridabad, Haryana-121003</div>
            <div className="flex gap-2"><Mail size={14} className="text-brand-light" /> support@softwareuniverse.in</div>
            <div className="flex gap-2"><Phone size={14} className="text-brand-light" /> +91 9911611207</div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="hover:text-brand transition-colors">› {l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Account Info */}
        <div>
          <h4 className="text-white font-bold mb-4">Account Info</h4>
          <ul className="space-y-2">
            {accountLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="hover:text-brand transition-colors">› {l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-bold mb-4">Stay Updated</h4>
          <p className="text-xs mb-3">Sign up now to get updates on promotions & coupons!</p>
          <input type="email" placeholder="Your email address"
            className="w-full bg-navy-light border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 mb-3 focus:outline-none focus:border-brand" />
          <button className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-2.5 rounded-lg text-sm transition">
            Sign up
          </button>
          <h5 className="text-white font-bold mt-6 mb-3 text-sm">Connect With Us</h5>
          <div className="flex gap-2">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/5 hover:bg-brand flex items-center justify-center transition">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span>© 2026 Software Universe. All Rights Reserved.</span>
          <div className="flex items-center gap-3">
            <span className="text-gray-500">100% SECURE CHECKOUT</span>
            <div className="flex items-center gap-2">
              {paymentIcons.map((p) => (
                <img key={p.alt} src={p.src} alt={p.alt} className="h-7 w-auto object-contain bg-white rounded px-1 py-0.5" />
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-6 text-center text-[11px] text-gray-500">
          Transparency Statement: Software Universe is an independent reseller of genuine software. We are not affiliated with or endorsed by the brands we sell. All trademarks and logos belong to their respective owners.
        </div>
      </div>
    </footer>
  );
}