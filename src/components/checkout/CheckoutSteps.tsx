import { Check } from "lucide-react";

interface Props {
  current: 1 | 2 | 3;
}

const steps = [
  { num: 1, label: "Shopping Cart" },
  { num: 2, label: "Shipping & Checkout" },
  { num: 3, label: "Confirmation" },
];

export default function CheckoutSteps({ current }: Props) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-2">
          {steps.map((s, idx) => {
            const done = s.num < current;
            const active = s.num === current;

            return (
              <div key={s.num} className="flex-1 flex items-center gap-2">
                {/* Step */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      done
                        ? "bg-success text-white"
                        : active
                          ? "bg-success text-white ring-4 ring-success/20"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {done ? <Check size={16} /> : s.num}
                  </div>
                  <span
                    className={`text-sm font-bold whitespace-nowrap ${
                      active || done ? "text-navy" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 rounded-full ${
                      done ? "bg-success" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
