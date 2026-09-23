interface Gateway {
  id: string;
  name: string;
  description: string;
  logo?: string;
}

const GATEWAYS: Gateway[] = [
  {
    id: "razorpay",
    name: "Razorpay",
    description: "Pay securely via Razorpay.",
    logo: "/partners/razorpay.png",
  },
  {
    id: "cashfree",
    name: "Cashfree",
    description: "Pay securely via Cashfree.",
    logo: "/partners/cashfree.png",
  },
  {
    id: "payu",
    name: "PayU",
    description: "Pay securely via PayU.",
    logo: "/partners/payu.png",
  },
];

interface PaymentMethodBoxProps {
  selected: string;
  onSelect: (gatewayId: string) => void;
}

export default function PaymentMethodBox({
  selected,
  onSelect,
}: PaymentMethodBoxProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-navy">Payment method</h3>
      </div>

      <div className="p-4 space-y-3">
        {GATEWAYS.map((g) => {
          const isActive = selected === g.id;
          return (
            <label
              key={g.id}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                isActive
                  ? "border-brand bg-brand/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="payment-gateway"
                value={g.id}
                checked={isActive}
                onChange={() => onSelect(g.id)}
                className="sr-only"
              />

              {/* Custom radio */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                  isActive ? "border-brand" : "border-gray-300"
                }`}
              >
                {isActive && (
                  <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {g.logo && (
                    <img
                      src={g.logo}
                      alt={g.name}
                      className="h-5 object-contain"
                      onError={(e) => {
                        // hide broken logo silently
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <span className="text-sm font-semibold text-navy">
                    {g.name}
                  </span>
                </div>
                <p className="text-[11px] text-muted leading-snug">
                  {g.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
