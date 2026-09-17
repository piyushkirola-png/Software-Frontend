export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-navy mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted mb-8">Last updated: January 2026</p>

      <div className="space-y-6 text-sm text-muted leading-relaxed">
        <Section title="Information We Collect">
          <p>
            We collect personal information you provide when you register,
            purchase, or contact us. This includes your name, email, phone,
            billing address, and payment details (processed securely via our
            payment partners).
          </p>
        </Section>

        <Section title="How We Use Your Information">
          <p>
            We use your information to process orders, deliver license keys
            instantly via email, provide customer support, send order
            confirmations and invoices, and improve our services.
          </p>
        </Section>

        <Section title="Data Sharing">
          <p>
            We do not sell your personal information. We share data only with
            payment gateways (Razorpay, Cashfree) and email service providers,
            strictly to fulfill your orders.
          </p>
        </Section>

        <Section title="Data Security">
          <p>
            We use industry-standard encryption (SSL/TLS) for all data
            transmission. Your payment card information is never stored on our
            servers — it is processed directly by our PCI-DSS compliant
            payment partners.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            We use cookies to maintain your session, remember your cart, and
            analyze site traffic. You can disable cookies in your browser
            settings, though some site features may not work properly.
          </p>
        </Section>

        <Section title="Your Rights">
          <p>
            You have the right to access, correct, or delete your personal
            information. Contact us at{" "}
            <a href="mailto:support@softwareuniverse.in" className="text-brand hover:underline">
              support@softwareuniverse.in
            </a>{" "}
            to exercise these rights.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-navy mb-2">{title}</h2>
      {children}
    </section>
  );
}