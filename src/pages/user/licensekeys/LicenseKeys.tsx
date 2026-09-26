import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Key,
  Copy,
  CheckCircle,
  Loader2,
  AlertCircle,
  Download,
  Package,
} from "lucide-react";
import Reveal from "../../../components/animations/Reveal";
import { useAuthContext } from "../../../lib/AuthContext";
import { useMyKeys } from "../../../api/queries/useKeys";
import { resolveImageUrl } from "../../../lib/upload";

export default function LicenseKeys() {
  const { showToast } = useAuthContext();
  const { data: keys = [], isLoading, isError, refetch } = useMyKeys();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("License key copied");
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy">
          My Licenses & Downloads
        </h1>
        <p className="text-muted mt-1 text-sm">
          See your software license keys inventory
        </p>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      )}

      {/* ERROR */}
      {isError && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <AlertCircle className="h-7 w-7 text-danger mx-auto mb-3" />
          <p className="text-sm text-navy mb-3">
            Failed to load your licenses
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-soft"
          >
            Retry
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!isLoading && !isError && keys.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <Key className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">
            No licenses yet
          </h2>
          <p className="text-sm text-muted mb-4">
            Purchase a product to receive your key and download link.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition"
          >
            <Package size={14} /> Browse Products
          </Link>
        </div>
      )}

      {/* LIST */}
      {!isLoading && !isError && keys.length > 0 && (
        <Reveal>
          <div className="space-y-4">
            {Object.values(
              keys.reduce<Record<string, typeof keys>>((acc, k) => {
                const key = `${k.productId}-${k.variantId ?? "none"}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(k);
                return acc;
              }, {}),
            ).map((group) => {
              const first = group[0];

              return (
                <div
                  key={`${first.productId}-${first.variantId ?? "none"}`}
                  className="bg-white border border-gray-100 rounded-2xl p-4 lg:p-5 hover:border-brand/20 transition"
                >
                  {/* Product row */}
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 bg-soft rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-100">
                      <img
                        src={resolveImageUrl(first.productThumbnailUrl)}
                        alt={first.productTitle}
                        className="max-h-full max-w-full object-contain p-1"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {first.productSlug ? (
                        <Link
                          to={`/product/${first.productSlug}`}
                          className="font-semibold text-navy text-sm hover:text-brand line-clamp-1"
                        >
                          {first.productTitle}
                        </Link>
                      ) : (
                        <div className="font-semibold text-navy text-sm line-clamp-1">
                          {first.productTitle}
                        </div>
                      )}
                      {first.variantName && (
                        <div className="text-xs text-muted mt-0.5">
                          {first.variantName}
                        </div>
                      )}
                      <div className="text-[11px] text-muted mt-1 flex flex-wrap items-center gap-x-2">
                        {first.orderNumber && (
                          <span>
                            Order{" "}
                            <span className="font-mono font-semibold text-navy">
                              {first.orderNumber}
                            </span>
                          </span>
                        )}
                        {first.soldAt && (
                          <span>
                            •{" "}
                            {new Date(first.soldAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        )}
                        {group.length > 1 && (
                          <span className="text-brand font-bold">
                            • {group.length} keys
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* License keys — one row per key */}
                  <div className="mt-4 bg-navy rounded-xl p-3">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Key size={10} /> License{" "}
                      {group.length > 1 ? "Keys" : "Key"}
                    </div>
                    <div className="space-y-2">
                      {group.map((k) => (
                        <div
                          key={k.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <code className="font-mono text-xs text-white break-all">
                            {k.licenseKey}
                          </code>
                          <button
                            onClick={() => copy(k.licenseKey, k.id)}
                            className="shrink-0 inline-flex items-center gap-1 text-[11px] bg-brand hover:bg-brand-dark px-2.5 py-1.5 rounded-lg font-semibold transition text-white"
                          >
                            {copiedId === k.id ? (
                              <>
                                <CheckCircle size={11} /> Copied
                              </>
                            ) : (
                              <>
                                <Copy size={11} /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {first.orderId && (
                      <Link
                        to={`/user/orders/${first.orderId}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 text-navy text-xs font-bold px-3 py-2.5 hover:bg-gray-50 transition"
                      >
                        View Order
                      </Link>
                    )}
                    {first.productDownloadUrl ? (
                      <a
                        href={first.productDownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold px-3 py-2.5 transition"
                      >
                        <Download size={12} /> Download Software
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-soft text-muted text-xs font-semibold px-3 py-2.5">
                        <Download size={12} /> Download link not provided
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      )}
    </div>
  );
}