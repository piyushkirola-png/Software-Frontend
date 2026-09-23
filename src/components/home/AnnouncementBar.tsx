import { Zap, Shield, CheckCircle, BadgeCheck, FileText } from "lucide-react";

const items = [
  {
    icon: <Zap size={14} />,
    label: "Auto Delivery:",
    text: "Key & Download Link sent instantly.",
  },
  {
    icon: <CheckCircle size={14} />,
    label: "Easy Setup:",
    text: "Step-by-step instructions included.",
  },
  {
    icon: <Shield size={14} />,
    label: "Risk-Free:",
    text: "Full Refund if License doesn't work.",
  },
  {
    icon: <BadgeCheck size={14} />,
    label: "Genuine Licenses:",
    text: "100% authentic from authorized distributors.",
  },
  {
    icon: <FileText size={14} />,
    label: "GST Invoice:",
    text: "Provided with every purchase.",
  },
];

export default function AnnouncementBar() {
  return (
    <div className="bg-navy text-white text-xs py-2 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 px-8">
            <span className="text-success">{item.icon}</span>
            <span className="font-semibold">{item.label}</span>
            <span className="text-gray-300">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
