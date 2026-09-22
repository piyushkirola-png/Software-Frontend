import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { AddressRequest } from "../../types/address";
import { useAuthContext } from "../../lib/AuthContext";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const COUNTRIES = ["India"];

export interface BillingFormHandle {
  /** Returns AddressRequest ready for addressService.create(), or null if invalid */
  getAddressRequest: () => AddressRequest | null;
  /** Returns extra fields we will use later (Phase 5) */
  getExtra: () => { gstNumber: string; email: string; notes?: string };
  validate: () => boolean;
}

interface BillingFormProps {
  className?: string;
}

const BillingForm = forwardRef<BillingFormHandle, BillingFormProps>(
  ({ className = "" }, ref) => {
    const { user } = useAuthContext();

    // Split name into first / last
    const nameParts = (user?.name || "").trim().split(/\s+/);
    const defaultFirst = nameParts[0] || "";
    const defaultLast = nameParts.slice(1).join(" ") || "";

    const [firstName, setFirstName] = useState(defaultFirst);
    const [lastName, setLastName] = useState(defaultLast);
    const [gstNumber, setGstNumber] = useState("");
    const [country, setCountry] = useState("India");
    const [street, setStreet] = useState("");
    const [apartment, setApartment] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("Haryana");
    const [postcode, setPostcode] = useState("");
    const [phone, setPhone] = useState(user?.phone || "");
    const [email, setEmail] = useState(user?.email || "");

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Keep email/phone in sync if user changes (rare)
    useEffect(() => {
      if (user?.email) setEmail(user.email);
      if (user?.phone) setPhone(user.phone);
    }, [user?.email, user?.phone]);

    const validate = (): boolean => {
      const next: Record<string, string> = {};

      if (!firstName.trim()) next.firstName = "First name is required";
      if (!lastName.trim()) next.lastName = "Last name is required";
      if (!street.trim()) next.street = "Street address is required";
      if (!city.trim()) next.city = "Town / City is required";
      if (!state.trim()) next.state = "State is required";
      if (!postcode.trim()) next.postcode = "Postcode is required";
      else if (!/^\d{6}$/.test(postcode.trim()))
        next.postcode = "Enter a valid 6-digit pincode";
      if (!phone.trim()) next.phone = "Phone is required";
      else if (!/^[6-9]\d{9}$/.test(phone.trim()))
        next.phone = "Enter a valid 10-digit Indian mobile number";
      if (!email.trim()) next.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
        next.email = "Enter a valid email address";

      setErrors(next);
      return Object.keys(next).length === 0;
    };

    useImperativeHandle(ref, () => ({
      validate,
      getAddressRequest: () => {
        if (!validate()) return null;
        return {
          fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
          phone: phone.trim(),
          addressLine1: street.trim(),
          addressLine2: apartment.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          pincode: postcode.trim(),
          country: country.trim() || "India",
          isDefault: false,
        };
      },
      getExtra: () => ({
        gstNumber: gstNumber.trim(),
        email: email.trim(),
      }),
    }));

    const inputCls =
      "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition";
    const labelCls = "block text-xs font-semibold text-navy mb-1.5";
    const errorCls = "text-[11px] text-red-600 mt-1";

    return (
      <div className={`bg-white rounded-2xl border border-gray-100 p-5 lg:p-6 ${className}`}>
        <h3 className="text-sm font-bold text-navy mb-5">Billing details</h3>

        <div className="space-y-4">
          {/* First + Last */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                First name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputCls}
                autoComplete="given-name"
              />
              {errors.firstName && <p className={errorCls}>{errors.firstName}</p>}
            </div>
            <div>
              <label className={labelCls}>
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputCls}
                autoComplete="family-name"
              />
              {errors.lastName && <p className={errorCls}>{errors.lastName}</p>}
            </div>
          </div>

          {/* GST */}
          <div>
            <label className={labelCls}>GST Number (optional)</label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              placeholder="e.g. 06AAAAA0000A1Z5"
              className={inputCls}
              maxLength={15}
            />
          </div>

          {/* Country */}
          <div>
            <label className={labelCls}>
              Country / Region <span className="text-red-500">*</span>
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={inputCls}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Street */}
          <div>
            <label className={labelCls}>
              Street address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="House number and street name"
              className={inputCls}
              autoComplete="address-line1"
            />
            {errors.street && <p className={errorCls}>{errors.street}</p>}
          </div>

          {/* Apartment */}
          <div>
            <label className={labelCls}>
              Apartment, suite, unit, etc.{" "}
              <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              className={inputCls}
              autoComplete="address-line2"
            />
          </div>

          {/* City */}
          <div>
            <label className={labelCls}>
              Town / City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputCls}
              autoComplete="address-level2"
            />
            {errors.city && <p className={errorCls}>{errors.city}</p>}
          </div>

          {/* State + Postcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                State / County <span className="text-red-500">*</span>
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={inputCls}
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && <p className={errorCls}>{errors.state}</p>}
            </div>
            <div>
              <label className={labelCls}>
                Postcode / ZIP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={inputCls}
                autoComplete="postal-code"
                inputMode="numeric"
              />
              {errors.postcode && <p className={errorCls}>{errors.postcode}</p>}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className={labelCls}>
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              className={inputCls}
              autoComplete="tel"
              inputMode="numeric"
            />
            {errors.phone && <p className={errorCls}>{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              autoComplete="email"
            />
            {errors.email && <p className={errorCls}>{errors.email}</p>}
          </div>
        </div>
      </div>
    );
  },
);

BillingForm.displayName = "BillingForm";
export default BillingForm;