import { FormEvent, useState } from "react";
import {
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Loader2,
  AlertCircle,
  Send,
  Shield,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Input from "../../components/ui/Input";
import Reveal from "../../components/animations/Reveal";
import PageHero from "../../components/ui/PageHero";
import { useContactMutation } from "../../api/mutations/publicMutations";
import { getErrorMessage } from "../../lib/api-client";

export default function Contact() {
  const contact = useContactMutation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.name.trim()) return setError("Name is required");
    if (!form.email.trim()) return setError("Email is required");
    if (!form.message.trim()) return setError("Message is required");

    try {
      await contact.mutateAsync(form);
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <PageHero
        badge="Contact Us"
        title="Get in Touch"
        subtitle="We're here to help — get in touch anytime. Our team responds within 24 hours."
      />

      <section className="max-w-6xl mx-auto px-4 py-12">
        {/* Trust bar */}
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <TrustChip
              icon={<Send size={22} className="text-brand" />}
              label="Fast Response"
              sub="Within 24 hours"
            />
            <TrustChip
              icon={<Shield size={22} className="text-success" />}
              label="100% Secure"
              sub="Encrypted messages"
            />
            <TrustChip
              icon={<Clock size={22} className="text-purple-600" />}
              label="Support Hours"
              sub="Mon–Sat, 10am–7pm"
            />
            <TrustChip
              icon={<CheckCircle2 size={22} className="text-orange-600" />}
              label="Expert Team"
              sub="Real humans only"
            />
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Info cards */}
          <div className="lg:col-span-2 space-y-4">
            <ContactCard
              icon={<MapPin size={20} />}
              title="Address"
              value="330A, Durga Enclave, Gali No-7, Sehatpur, Faridabad, Haryana-121003"
              gradient="from-brand to-brand-light"
            />
            <ContactCard
              icon={<Mail size={20} />}
              title="Email"
              value="contact@softora.in"
              href="mailto:contact@softora.in"
              gradient="from-purple-500 to-indigo-500"
            />
            <ContactCard
              icon={<Phone size={20} />}
              title="Phone"
              value="+91 9911611207"
              href="tel:+919911611207"
              gradient="from-success to-emerald-500"
            />
            <ContactCard
              icon={<MessageCircle size={20} />}
              title="WhatsApp"
              value="Chat with us"
              href="https://wa.me/919911611207"
              gradient="from-green-500 to-emerald-600"
            />

            <Reveal delay={0.2}>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-brand/10">
                    <Clock size={14} className="text-brand" />
                  </div>
                  <h3 className="text-sm font-bold text-navy">
                    Support Hours
                  </h3>
                </div>
                <div className="space-y-1.5 text-sm text-muted">
                  <div className="flex justify-between">
                    <span>Monday – Saturday</span>
                    <span className="font-semibold text-navy">
                      10:00 AM – 07:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold text-danger">Closed</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal delay={0.1} className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 shadow-card">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
                <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white">
                  <Send size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy">
                    Send us a Message
                  </h2>
                  <p className="text-[11px] text-muted mt-0.5">
                    We'll get back to you within 24 hours
                  </p>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Name *"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                  <Input
                    label="Email *"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="you@example.com"
                  />
                </div>

                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="+91 9876543210"
                />

                <div>
                  <label className="block text-xs font-semibold text-navy mb-1.5 uppercase tracking-wider">
                    Message *
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-navy placeholder:text-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-success text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    Message sent! We'll get back to you soon.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={contact.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-sm font-bold px-6 py-3 rounded-xl transition shadow-md shadow-brand/25"
                >
                  {contact.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-[11px] text-muted text-center">
                  Your message will be delivered to{" "}
                  <span className="font-semibold text-navy">
                    contact@softora.in
                  </span>
                </p>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function ContactCard({
  icon,
  title,
  value,
  href,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
  gradient: string;
}) {
  const Wrapper: any = href ? "a" : "div";
  return (
    <Reveal>
      <Wrapper
        {...(href
          ? {
              href,
              target: href.startsWith("http") ? "_blank" : undefined,
              rel: "noopener noreferrer",
            }
          : {})}
        className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-3 hover:border-brand/30 hover:shadow-cardHover transition-all cursor-pointer"
      >
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shrink-0 shadow-md`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] text-muted uppercase tracking-wider font-bold">
            {title}
          </div>
          <div className="text-sm text-navy font-semibold mt-0.5 break-words">
            {value}
          </div>
        </div>
      </Wrapper>
    </Reveal>
  );
}

function TrustChip({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
      <div className="p-3.5 rounded-xl bg-soft shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-navy truncate">
          {label}
        </div>
        <div className="text-xs text-muted truncate mt-0.5">{sub}</div>
      </div>
    </div>
  );
}