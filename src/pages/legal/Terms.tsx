import { FileText } from "lucide-react";
import PageHero from "../../components/ui/PageHero";
import Reveal from "../../components/animations/Reveal";

export default function Terms() {
  return (
    <>
      <PageHero
        badge="Terms"
        icon={<FileText size={20} className="text-white" />}
        title="Terms & Conditions"
        subtitle="Last updated: January 2026"
      />

      <section className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Section title="1. General Information">
          <p>
            The content on this website is provided for your general information
            and use only. It is subject to change without prior notice.
          </p>
        </Section>

        <Section title="2. Warranties and Guarantees">
          <p>
            While we strive to provide accurate and timely information, we do
            not provide any warranty or guarantee as to the completeness or
            suitability of the information for any specific purpose. You
            acknowledge that materials on this website may contain inaccuracies
            or errors, and we expressly exclude liability for any such
            inaccuracies to the fullest extent permitted by law.
          </p>
        </Section>

        <Section title="3. Risk and Liability">
          <p>
            Your use of any information or materials on this website is entirely
            at your own risk, for which we shall not be liable. It is your own
            responsibility to ensure that any products, services, or information
            available through this website meet your specific requirements.
          </p>
        </Section>

        <Section title="4. Intellectual Property">
          <p>
            This website contains material which is owned by or licensed to us.
            This material includes, but is not limited to, the design, layout,
            look, appearance, and graphics. Unauthorized reproduction is
            prohibited, except in accordance with the copyright notice, which
            forms part of these terms and conditions.
          </p>
        </Section>

        <Section title="5. Trademarks">
          <p>
            All trademarks reproduced on this website which are not the property
            of, or licensed to, Softora are acknowledged.
          </p>
        </Section>

        <Section title="6. Unauthorized Use">
          <p>
            Unauthorized use of this website may give rise to a claim for
            damages and/or be considered a criminal offense.
          </p>
        </Section>

        <Section title="7. External Links">
          <p>
            From time to time, our website may include links to other websites
            for your convenience. These links do not signify that we endorse the
            website(s). We are not responsible for the content of the linked
            websites.
          </p>
        </Section>

        <Section title="8. Governing Law">
          <p>
            Your use of this website and any disputes arising from such use are
            subject to the laws of your country or other applicable regulatory
            authority.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            If you have any questions regarding these terms, please contact us
            at{" "}
            <a
              href="mailto:support@softora.in"
              className="text-brand hover:underline font-semibold"
            >
              support@softora.in
            </a>
            .
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
