import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { COUNTRIES, Country } from "../../utils/countries";

interface Props {
  value: string;      // Country name (e.g. "India")
  onChange: (name: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

/**
 * Searchable country dropdown.
 * - Click to open
 * - Type to filter
 * - ~5 items visible at once, rest scrolls
 */
export default function CountrySelect({
  value,
  onChange,
  label,
  placeholder = "Select country",
  error,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRIES.find((c) => c.name === value);

  const filtered: Country[] = query.trim()
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : COUNTRIES;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // Autofocus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const handleSelect = (c: Country) => {
    onChange(c.name);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-navy mb-1">
          {label}
        </label>
      )}

      <div ref={wrapperRef} className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border bg-white text-sm text-left transition ${
            error
              ? "border-red-500"
              : open
              ? "border-brand"
              : "border-gray-200"
          }`}
        >
          <span className={selected ? "text-navy" : "text-muted"}>
            {selected ? selected.name : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-muted transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Panel */}
        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="border-b border-gray-100 p-2">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country..."
                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-navy placeholder:text-muted focus:outline-none focus:border-brand"
              />
            </div>

            {/* Options list — 5 visible, rest scroll */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: 5 * 40 }} // 5 items × ~40px each
            >
              {filtered.length === 0 && (
                <div className="px-3 py-3 text-xs text-muted text-center">
                  No matches
                </div>
              )}
              {filtered.map((c) => {
                const isSelected = c.name === value;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm text-left transition ${
                      isSelected
                        ? "bg-brand/5 text-brand font-semibold"
                        : "text-navy hover:bg-soft"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {isSelected && (
                      <Check size={14} className="shrink-0 text-brand" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}