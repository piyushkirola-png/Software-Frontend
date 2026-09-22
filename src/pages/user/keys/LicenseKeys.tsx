import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Key,
  Copy,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Reveal from "../../../components/animations/Reveal";
import { useAuthContext } from "../../../lib/AuthContext";
import { useMyOrders } from "../../../api/queries/useOrders";

interface FlatKey {
  id: number;
  productTitle: string;
  productSlug: string;
  variantName?: string | null;
  licenseKey: string;
  orderNumber: string;
  soldAt?: string | null;
}

export default function LicenseKeys() {
  const { showToast } = useAuthContext();
  const { data: orders = [], isLoading, isError, refetch } = useMyOrders();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const flatKeys: FlatKey[] = orders
    .filter((o) => o.status === "SUCCESS")
    .flatMap((o) =>
      o.items
        .filter((i) => i.licenseKey)
        .map((i) => ({
          id: i.id,
          productTitle: i.productTitle,
          productSlug: i.productSlug,
          variantName: i.variantName,
          licenseKey: i.licenseKey!,
          orderNumber: o.orderNumber,
          soldAt: o.createdAt,
        })),
    );

  const copy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("License key copied");
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-5">
      {/* ============ HEADER ============ */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy">
          My License Keys
        </h1>
        <p className="text-muted mt-1 text-sm">
          {flatKeys.length} key{flatKeys.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* ============ LOADING ============ */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
        </div>
      )}

      {/* ============ ERROR ============ */}
      {isError && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <AlertCircle className="h-7 w-7 text-danger mx-auto mb-3" />
          <p className="text-sm text-navy mb-3">Failed to load license keys</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-soft"
          >
            Retry
          </button>
        </div>
      )}

      {/* ============ EMPTY ============ */}
      {!isLoading && !isError && flatKeys.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <Key className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">
            No license keys yet
          </h2>
          <p className="text-sm text-muted mb-4">
            Purchase a product to receive your key.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition"
          >
            Browse Products
          </Link>
        </div>
      )}

      {/* ============ KEYS LIST ============ */}
      {!isLoading && !isError && flatKeys.length > 0 && (
        <Reveal>
          <div className="space-y-3">
            {flatKeys.map((k) => (
              <div
                key={k.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 lg:p-5 hover:border-brand/20 transition"
              >
                {/* Meta row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-light text-white flex items-center justify-center shrink-0">
                      <Key size={16} />
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/product/${k.productSlug}`}
                        className="font-semibold text-navy text-sm hover:text-brand line-clamp-1"
                      >
                        {k.productTitle}
                      </Link>
                      {k.variantName && (
                        <div className="text-xs text-muted mt-0.5">
                          {k.variantName}
                        </div>
                      )}
                      <div className="text-[11px] text-muted mt-1">
                        Order{" "}
                        <span className="font-mono font-semibold text-navy">
                          {k.orderNumber}
                        </span>
                        {k.soldAt && (
                          <>
                            {" • "}
                            {new Date(k.soldAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key box */}
                <div className="bg-soft rounded-xl p-3 flex items-center justify-between gap-3 border border-gray-100">
                  <code className="font-mono text-xs text-navy break-all">
                    {k.licenseKey}
                  </code>
                  <button
                    onClick={() => copy(k.licenseKey, k.id)}
                    className="shrink-0 inline-flex items-center gap-1 text-xs bg-brand hover:bg-brand-dark text-white px-3 py-2 rounded-lg font-semibold transition"
                  >
                    {copiedId === k.id ? (
                      <>
                        <CheckCircle size={12} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}