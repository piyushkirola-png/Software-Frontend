import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Shield, CreditCard } from "lucide-react";

interface GatewayOption {
  key: string;
  label: string;
  desc: string;
  logo: string;
}

const GATEWAYS: GatewayOption[] = [
  {
    key: "RAZORPAY",
    label: "Razorpay",
    desc: "Cards, UPI, Netbanking, Wallets",
    logo: "/partners/razorpay.png",
  },
  {
    key: "CASHFREE",
    label: "Cashfree",
    desc: "UPI, Cards, Netbanking",
    logo: "/partners/cashfree.png",
  },
  {
    key: "PAYU",
    label: "PayU",
    desc: "Cards, UPI, Netbanking",
    logo: "/partners/payu.png",
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
  const [selected, setSelected] = useState<string>("RAZORPAY");
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-navy">
                Choose Payment Method
              </h3>
              <p className="text-[11px] text-muted mt-0.5">
                Secure checkout
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-soft text-muted transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Amount strip */}
          <div className="px-5 py-4 bg-soft border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted uppercase tracking-wider font-semibold">
                Amount to pay
              </span>
              <span className="text-2xl font-bold text-navy">
                ₹{amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Gateways */}
          <div className="p-4 space-y-2">
            {GATEWAYS.map((g) => {
              const active = selected === g.key;
              const failed = imgFailed[g.key];

              return (
                <button
                  key={g.key}
                  disabled={loading}
                  onClick={() => setSelected(g.key)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 transition text-left border-2 ${
                    active
                      ? "border-brand bg-brand/5"
                      : "border-gray-100 hover:border-gray-200 hover:bg-soft/50"
                  } disabled:opacity-50`}
                >
                  {/* Logo box */}
                  <div className="w-14 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 p-1.5">
                    {!failed ? (
                      <img
                        src={g.logo}
                        alt={g.label}
                        className="max-h-full max-w-full object-contain"
                        onError={() =>
                          setImgFailed((prev) => ({
                            ...prev,
                            [g.key]: true,
                          }))
                        }
                      />
                    ) : (
                      <CreditCard size={18} className="text-muted" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-navy text-sm">
                      {g.label}
                    </div>
                    <div className="text-[11px] text-muted truncate">
                      {g.desc}
                    </div>
                  </div>

                  {/* Radio */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                      active
                        ? "border-brand bg-brand"
                        : "border-gray-300"
                    }`}
                  >
                    {active && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 pt-2">
            <button
              onClick={() => onSelect(selected)}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 bg-brand hover:bg-brand-dark text-white text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand/25"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Pay ₹{amount.toFixed(2)}
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-muted mt-3">
              🔒 You'll be redirected to a secure payment page
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}