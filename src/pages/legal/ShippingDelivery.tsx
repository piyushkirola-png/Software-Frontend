import { Mail, Zap, FileText, Truck } from "lucide-react";
import PageHero from "../../components/ui/PageHero";
import Reveal from "../../components/animations/Reveal";

export default function ShippingDelivery() {
  return (
    <>
      <PageHero
        badge="Shipping"
        icon={<Truck size={20} className="text-white" />}
        title="Shipping & Delivery"
        subtitle="We sell digital products only — no physical shipping."
      />

      <section className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Reveal>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-start gap-4 hover:border-brand/30 transition">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white shrink-0 shadow-md">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="font-bold text-navy mb-2">Instant Delivery</h2>
              <p className="text-sm text-muted leading-relaxed">
                All license keys are delivered instantly to your email address
                within seconds of successful payment confirmation.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-start gap-4 hover:border-brand/30 transition">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="font-bold text-navy mb-2">
                What You'll Receive
              </h2>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted leading-relaxed">
                <li>Your license key(s)</li>
                <li>Step-by-step activation instructions</li>
                <li>Download link for the software</li>
                <li>GST tax invoice (PDF attachment)</li>
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-start gap-4 hover:border-brand/30 transition">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-success to-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="font-bold text-navy mb-2">
                Delivery Confirmation
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                You will receive an email confirmation immediately after
                purchase. If you don't see it within 5 minutes, check your spam
                folder or contact support.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-sm text-muted leading-relaxed">
              <strong className="text-navy">Support Hours:</strong> 10:00 AM to
              07:00 PM IST (Mon–Sat).
              <br />
              <strong className="text-navy">Contact:</strong>{" "}
              <a
                href="mailto:support@softora.in"
                className="text-brand hover:underline font-semibold"
              >
                support@softora.in
              </a>{" "}
              or WhatsApp{" "}
              <a
                href="https://wa.me/919911611207"
                className="text-brand hover:underline font-semibold"
              >
                +91 9911611207
              </a>
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}