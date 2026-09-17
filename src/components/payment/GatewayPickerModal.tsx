import Modal from "../ui/Modal";
import { CreditCard, Wallet, Building2, Loader2 } from "lucide-react";

const GATEWAYS = [
  {
    key: "RAZORPAY",
    label: "Razorpay",
    desc: "Cards, UPI, Netbanking, Wallets",
    icon: <CreditCard size={20} />,
  },
  {
    key: "CASHFREE",
    label: "Cashfree",
    desc: "UPI, Cards, Netbanking",
    icon: <Wallet size={20} />,
  },
  {
    key: "PAYU",
    label: "PayU",
    desc: "Cards, UPI, Netbanking",
    icon: <Building2 size={20} />,
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (gateway: string) => void;
  loading?: boolean;
  amount: number;
}

export default function GatewayPickerModal({
  open,
  onClose,
  onSelect,
  loading,
  amount,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Choose Payment Method">
      <div className="mb-4 pb-4 border-b border-gray-100">
        <div className="text-xs text-muted">Amount to pay</div>
        <div className="text-2xl font-extrabold text-navy">
          ₹{amount.toFixed(2)}
        </div>
      </div>

      <div className="space-y-2">
        {GATEWAYS.map((g) => (
          <button
            key={g.key}
            disabled={loading}
            onClick={() => onSelect(g.key)}
            className="w-full flex items-center gap-3 border border-gray-200 hover:border-brand hover:bg-brand/5 rounded-lg px-4 py-3 transition text-left disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
              {loading ? <Loader2 size={18} className="animate-spin" /> : g.icon}
            </div>
            <div className="flex-1">
              <div className="font-bold text-navy text-sm">{g.label}</div>
              <div className="text-xs text-muted">{g.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-[11px] text-muted text-center mt-4">
        🔒 100% Secure Checkout
      </p>
    </Modal>
  );
}