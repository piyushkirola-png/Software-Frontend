interface AdditionalInfoProps {
  notes: string;
  onChange: (value: string) => void;
}

export default function AdditionalInfo({
  notes,
  onChange,
}: AdditionalInfoProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
      <h3 className="text-sm font-bold text-navy mb-4">
        Additional information
      </h3>
      <div>
        <label className="block text-xs font-semibold text-navy mb-1.5">
          Order notes <span className="text-muted font-normal">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="Notes about your order, e.g. special notes for delivery."
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition resize-y min-h-[100px]"
        />
      </div>
    </div>
  );
}
