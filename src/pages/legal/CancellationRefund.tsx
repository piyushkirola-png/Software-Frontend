export default function CancellationRefund() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-navy mb-2">
        Cancellation & Refund Policy
      </h1>
      <p className="text-sm text-muted mb-8">Last updated: January 2026</p>

      <div className="space-y-6 text-sm text-muted leading-relaxed">
        <Section title="Digital Product Policy">
          <p>
            All products sold on Software Universe are digital license keys
            delivered instantly via email. Because keys are non-returnable
            once revealed, our refund policy is limited to specific cases
            described below.
          </p>
        </Section>

        <Section title="Eligibility for Refund">
          <p>You may be eligible for a full refund if:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>The license key provided is invalid or non-functional</li>
            <li>The key has already been used/activated by another party</li>
            <li>You received a wrong product different from what you ordered</li>
            <li>We are unable to resolve your activation issue within 7 days</li>
          </ul>
        </Section>

        <Section title="Non-Refundable Cases">
          <ul className="list-disc list-inside space-y-1">
            <li>Keys that have been successfully activated</li>
            <li>Change of mind after purchase</li>
            <li>Incompatibility with your device (check requirements first)</li>
            <li>Requests made after 7 days of purchase</li>
          </ul>
        </Section>

        <Section title="How to Request a Refund">
          <p>
            Email{" "}
            <a href="mailto:support@softwareuniverse.in" className="text-brand hover:underline">
              support@softwareuniverse.in
            </a>{" "}
            with your order number and a description of the issue. Our team
            will respond within 24 hours.
          </p>
        </Section>

        <Section title="Processing Time">
          <p>
            Approved refunds are processed to the original payment method
            within 5–7 business days.
          </p>
        </Section>

        <Section title="Replacement Policy">
          <p>
            For invalid keys, we offer a free replacement first. If a
            replacement is not available, a full refund is issued.
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