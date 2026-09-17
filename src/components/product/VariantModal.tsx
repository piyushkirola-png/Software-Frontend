import { X } from "lucide-react";

export type Variant = { id: number; name: string; price: number; mrp?: number };

export default function VariantModal({
  open, onClose, productTitle, variants, onSelect,
}: {
  open: boolean;
  onClose: () => void;
  productTitle: string;
  variants: Variant[];
  onSelect: (v: Variant) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy">{productTitle}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <p className="text-sm text-muted mb-4">Select an option:</p>

        <div className="space-y-2">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => { onSelect(v); onClose(); }}
              className="w-full flex items-center justify-between border border-gray-200 hover:border-brand rounded-lg px-4 py-3 transition"
            >
              <span className="font-semibold text-navy text-sm">{v.name}</span>
              <span className="font-bold text-brand">₹{v.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}