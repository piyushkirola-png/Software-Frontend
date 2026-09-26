import { getCountryByCode } from "../../utils/countries";

interface Props {
  /** Country code like "IN", "US" — determines the dial code */
  countryCode: string;
  /** Phone number WITHOUT dial code (local number only) */
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Read-only dial code (bold), followed by an editable phone number input.
 * Matches the styling of regular text inputs.
 */
export default function PhoneInput({
  countryCode,
  value,
  onChange,
  label,
  placeholder = "98765 43210",
  error,
  className = "",
  disabled,
}: Props) {
  const country = getCountryByCode(countryCode);
  const dialCode = country?.dialCode || "+91";

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-navy mb-1">
          {label}
        </label>
      )}

      <div
        className={`flex items-center rounded-lg border bg-white focus-within:border-brand transition ${
          error ? "border-red-500" : "border-gray-200"
        }`}
      >
        {/* Bold dial code */}
        <span className="pl-3 pr-2 text-sm font-bold text-navy select-none shrink-0">
          {dialCode}
        </span>

        {/* Thin vertical separator */}
        <span className="h-4 w-px bg-gray-200 shrink-0" />

        {/* Phone number */}
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 15);
            onChange(digits);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 min-w-0 px-3 py-2.5 rounded-r-lg bg-white text-sm text-navy placeholder:text-muted focus:outline-none disabled:bg-soft disabled:cursor-not-allowed"
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}