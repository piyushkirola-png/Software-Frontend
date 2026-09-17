import { Mail, Zap, FileText } from "lucide-react";

export default function ShippingDelivery() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-navy mb-2">
        Shipping & Delivery
      </h1>
      <p className="text-sm text-muted mb-8">
        We sell digital products only — no physical shipping.
      </p>

      <div className="space-y-6 text-sm text-muted leading-relaxed">
        <div className="bg-soft rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Zap className="w-6 h-6 text-brand shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-navy mb-1">Instant Delivery</h2>
              <p>
                All license keys are delivered instantly to your email address
                within seconds of successful payment confirmation.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-soft rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Mail className="w-6 h-6 text-brand shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-navy mb-1">
                What You'll Receive
              </h2>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your license key(s)</li>
                <li>Step-by-step activation instructions</li>
                <li>Download link for the software</li>
                <li>GST tax invoice (PDF attachment)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-soft rounded-xl p-6">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-brand shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-navy mb-1">Delivery Confirmation</h2>
              <p>
                You will receive an email confirmation immediately after
                purchase. If you don't see it within 5 minutes, check your spam
                folder or contact support.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p>
            <strong className="text-navy">Support Hours:</strong> 10:00 AM to
            07:00 PM IST (Mon–Sat).
            <br />
            <strong className="text-navy">Contact:</strong>{" "}
            <a href="mailto:support@softwareuniverse.in" className="text-brand hover:underline">
              support@softwareuniverse.in
            </a>{" "}
            or WhatsApp{" "}
            <a href="https://wa.me/919911611207" className="text-brand hover:underline">
              +91 9911611207
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}