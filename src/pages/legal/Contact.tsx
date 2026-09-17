import { FormEvent, useState } from "react";
import { MapPin, Mail, Phone, MessageCircle, Loader2 } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
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
    <div className="bg-soft min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-navy">
            Contact Us
          </h1>
          <p className="text-muted mt-2">
            We're here to help — get in touch anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Info */}
          <div className="space-y-4">
            <ContactCard
              icon={<MapPin size={20} />}
              title="Address"
              value="330A, Durga Enclave, Gali No-7, Sehatpur, Faridabad, Haryana-121003"
            />
            <ContactCard
              icon={<Mail size={20} />}
              title="Email"
              value="support@softwareuniverse.in"
              href="mailto:support@softwareuniverse.in"
            />
            <ContactCard
              icon={<Phone size={20} />}
              title="Phone"
              value="+91 9911611207"
              href="tel:+919911611207"
            />
            <ContactCard
              icon={<MessageCircle size={20} />}
              title="WhatsApp"
              value="Chat with us"
              href="https://wa.me/919911611207"
            />

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-bold text-navy mb-2">Support Hours</h3>
              <p className="text-sm text-muted">
                Monday – Saturday: 10:00 AM – 07:00 PM
                <br />
                Sunday: Closed
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-navy mb-5">
              Send us a Message
            </h2>
            <form onSubmit={submit} className="space-y-4">
              <Input
                label="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
              <Input
                label="Phone (optional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 9911611207"
              />
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"
                  placeholder="Tell us how we can help..."
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}
              {success && (
                <p className="text-xs text-success">
                  ✓ Message sent! We'll get back to you soon.
                </p>
              )}

              <Button type="submit" fullWidth loading={contact.isPending}>
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  value,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
}) {
  const Wrapper: any = href ? "a" : "div";
  return (
    <Wrapper
      {...(href
        ? {
            href,
            target: href.startsWith("http") ? "_blank" : undefined,
            rel: "noopener noreferrer",
          }
        : {})}
      className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-3 hover:border-brand transition"
    >
      <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted uppercase font-semibold">{title}</div>
        <div className="text-sm text-navy font-semibold mt-0.5">{value}</div>
      </div>
    </Wrapper>
  );
}