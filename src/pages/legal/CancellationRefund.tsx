import { RotateCcw } from "lucide-react";
import PageHero from "../../components/ui/PageHero";
import Reveal from "../../components/animations/Reveal";

export default function CancellationRefund() {
  return (
    <>
      <PageHero
        badge="Refunds"
        icon={<RotateCcw size={20} className="text-white" />}
        title="Cancellation & Refund Policy"
        subtitle="Last updated: January 2026"
      />

      <section className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Section title="Digital Product Policy">
          <p>
            All products sold on Softora are digital license keys
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
            <li>
              You received a wrong product different from what you ordered
            </li>
            <li>
              We are unable to resolve your activation issue within 7 days
            </li>
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
            <a
              href="mailto:support@softora.in"
              className="text-brand hover:underline font-semibold"
            >
              support@softora.in
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
      </section>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-navy mb-3">{title}</h2>
        <div className="text-sm text-muted leading-relaxed">{children}</div>
      </section>
    </Reveal>
  );
}