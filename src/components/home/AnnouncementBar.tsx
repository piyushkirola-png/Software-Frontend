import { Zap, Shield, CheckCircle, MessageCircle } from "lucide-react";

const items = [
  { icon: <Zap size={14} />, label: "Auto Delivery:", text: "Key & Download Link sent instantly." },
  { icon: <CheckCircle size={14} />, label: "Easy Setup:", text: "Step-by-step instructions included." },
  { icon: <Shield size={14} />, label: "Risk-Free:", text: "Full Refund if License doesn't work." },
  { icon: <MessageCircle size={14} />, label: "Bulk Discount?", text: "Chat on WhatsApp" },
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