export interface PostcodeLookupResult {
  city: string;
  state: string;
}

/**
 * Look up city + state for a given country code + postcode.
 * Uses free public APIs (no key required):
 *   - India: https://api.postalpincode.in (PostalPincode.in)
 *   - Others: https://api.zippopotam.us (Zippopotam.us)
 *
 * Results are cached in sessionStorage to avoid repeated calls.
 */
export async function lookupPostcode(
  countryCode: string,
  postcode: string,
): Promise<PostcodeLookupResult | null> {
  const cc = (countryCode || "").toUpperCase().trim();
  const pc = (postcode || "").trim();
  if (!cc || !pc) return null;

  const cacheKey = `pc:${cc}:${pc}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as PostcodeLookupResult;
    }
  } catch {
    // sessionStorage unavailable — continue without cache
  }

  let result: PostcodeLookupResult | null = null;

  try {
    if (cc === "IN") {
      result = await lookupIndia(pc);
    } else {
      result = await lookupZippopotam(cc, pc);
    }
  } catch {
    result = null;
  }

  if (result) {
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(result));
    } catch {
      // ignore cache write failures
    }
  }

  return result;
}

// ============ INDIA ============
async function lookupIndia(
  postcode: string,
): Promise<PostcodeLookupResult | null> {
  const res = await fetch(
    `https://api.postalpincode.in/pincode/${encodeURIComponent(postcode)}`,
  );
  if (!res.ok) return null;

  const data = await res.json();
  // Response shape: [{ Status: "Success", PostOffice: [{ District, State, ... }] }]
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = data[0];
  if (first?.Status !== "Success") return null;
  if (!Array.isArray(first?.PostOffice) || first.PostOffice.length === 0) {
    return null;
  }

  const po = first.PostOffice[0];
  const city = po?.District || po?.Block || po?.Name || "";
  const state = po?.State || "";

  if (!city && !state) return null;
  return { city: city || "", state: state || "" };
}

// ============ OTHERS (Zippopotam.us) ============
async function lookupZippopotam(
  countryCode: string,
  postcode: string,
): Promise<PostcodeLookupResult | null> {
  const res = await fetch(
    `https://api.zippopotam.us/${countryCode}/${encodeURIComponent(postcode)}`,
  );
  if (!res.ok) return null;

  const data = await res.json();
  // Response shape: { places: [{ "place name": "...", "state": "...", ... }] }
  const place = data?.places?.[0];
  if (!place) return null;

  const city = place["place name"] || "";
  const state = place["state"] || "";
  if (!city && !state) return null;

  return { city: city || "", state: state || "" };
}

/**
 * Returns true if the postcode looks complete for the given country.
 * Used to decide when to trigger the lookup on input change.
 */
export function isPostcodeComplete(
  countryCode: string,
  postcode: string,
): boolean {
  const cc = (countryCode || "").toUpperCase();
  const pc = (postcode || "").trim();
  if (!pc) return false;

  switch (cc) {
    case "IN":
      return /^\d{6}$/.test(pc);
    case "US":
      return /^\d{5}(-\d{4})?$/.test(pc);
    case "GB":
      return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(pc);
    case "CA":
      return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(pc);
    case "AU":
    case "NZ":
    case "DE":
    case "FR":
    case "IT":
    case "ES":
    case "NL":
    case "BE":
    case "CH":
    case "AT":
    case "SE":
    case "NO":
    case "DK":
    case "FI":
      return pc.length >= 4;
    default:
      // best-effort: any 4+ char postcode
      return pc.length >= 4;
  }
}
