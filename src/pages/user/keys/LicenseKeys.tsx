import { useState } from "react";
import { Link } from "react-router-dom";
import { Key, Copy, CheckCircle, Loader2 } from "lucide-react";
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
  const { data: orders = [], isLoading } = useMyOrders();
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
        }))
    );

  const copy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 md:p-6">
      <h1 className="text-2xl font-extrabold text-navy mb-6">My License Keys</h1>

      {flatKeys.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold">No license keys yet</p>
          <p className="text-sm mt-1">Purchase a product to receive your key</p>
          <Link
            to="/products"
            className="text-brand text-sm mt-3 inline-block hover:underline"
          >
            Browse Products →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {flatKeys.map((k) => (
            <div
              key={k.id}
              className="border border-gray-100 rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <Link
                    to={`/product/${k.productSlug}`}
                    className="font-semibold text-navy text-sm hover:text-brand line-clamp-2"
                  >
                    {k.productTitle}
                  </Link>
                  {k.variantName && (
                    <div className="text-xs text-muted mt-0.5">{k.variantName}</div>
                  )}
                  <div className="text-[11px] text-muted mt-1">
                    Order: {k.orderNumber}
                    {k.soldAt && (
                      <>
                        {" • "}
                        {new Date(k.soldAt).toLocaleDateString("en-IN")}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-soft rounded-lg p-3 flex items-center justify-between gap-3">
                <code className="font-mono text-xs text-navy break-all">
                  {k.licenseKey}
                </code>
                <button
                  onClick={() => copy(k.licenseKey, k.id)}
                  className="shrink-0 flex items-center gap-1 text-xs bg-brand hover:bg-brand-dark text-white px-3 py-1.5 rounded font-semibold"
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
      )}
    </div>
  );
}