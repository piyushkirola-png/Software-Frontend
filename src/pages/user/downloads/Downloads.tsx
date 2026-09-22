import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Download as DownloadIcon,
  Loader2,
  AlertCircle,
  Key as KeyIcon,
  Copy,
  Check,
  ExternalLink,
  Package,
} from "lucide-react";
import Reveal from "../../../components/animations/Reveal";
import { useMyDownloads } from "../../../api/queries/useDownloads";
import { resolveImageUrl } from "../../../lib/upload";

export default function Downloads() {
  const { data: downloads = [], isLoading, isError, refetch } =
    useMyDownloads();

  return (
    <div className="space-y-5">
      {/* ============ HEADER ============ */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy">
          My Downloads
        </h1>
        <p className="text-muted mt-1 text-sm">
          {downloads.length} product{downloads.length !== 1 ? "s" : ""} purchased
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
          <p className="text-sm text-navy mb-3">Failed to load downloads</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg px-4 py-2 border border-gray-200 text-xs font-semibold text-navy hover:bg-soft"
          >
            Retry
          </button>
        </div>
      )}

      {/* ============ EMPTY ============ */}
      {!isLoading && !isError && downloads.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <Package className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">
            No purchases yet
          </h2>
          <p className="text-sm text-muted mb-4">
            Your purchased products and license keys will appear here.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition"
          >
            Browse Products
          </Link>
        </div>
      )}

      {/* ============ LIST ============ */}
      {!isLoading && !isError && downloads.length > 0 && (
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {downloads.map((d) => (
              <DownloadCard key={d.productId} download={d} />
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}

// ============ CARD ============

function DownloadCard({ download }: { download: any }) {
  const [copied, setCopied] = useState(false);

  const licenseKey: string | undefined = download.licenseKey;
  const vendorUrl: string | undefined = download.vendorUrl;

  const copyKey = () => {
    if (!licenseKey) return;
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-brand/20 transition">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 bg-soft rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-100">
          <img
            src={resolveImageUrl(download.thumbnailUrl)}
            alt={download.productTitle}
            className="max-h-full max-w-full object-contain p-1"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-navy text-sm line-clamp-2">
            {download.productTitle}
          </div>
          <div className="text-xs text-muted mt-1">
            Purchased{" "}
            {new Date(download.purchasedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* License key block */}
      {licenseKey ? (
        <div className="mt-4 bg-navy rounded-xl p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <KeyIcon size={10} /> License Key
          </div>
          <div className="flex items-center justify-between gap-2">
            <code className="font-mono text-xs text-white break-all">
              {licenseKey}
            </code>
            <button
              onClick={copyKey}
              className="shrink-0 inline-flex items-center gap-1 text-[11px] bg-brand hover:bg-brand-dark px-2.5 py-1.5 rounded-lg font-semibold transition text-white"
            >
              {copied ? (
                <>
                  <Check size={11} /> Copied
                </>
              ) : (
                <>
                  <Copy size={11} /> Copy
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 bg-soft rounded-xl p-3 text-xs text-muted flex items-center gap-2">
          <KeyIcon size={12} />
          <span>
            Your license key is available in{" "}
            <Link
              to="/user/orders"
              className="text-brand font-semibold hover:underline"
            >
              My Orders
            </Link>
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        <Link
          to="/user/orders"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 text-navy text-xs font-bold px-3 py-2.5 hover:bg-gray-50 transition"
        >
          View Order
        </Link>
        {vendorUrl && (
          <a
            href={vendorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold px-3 py-2.5 transition"
          >
            <DownloadIcon size={12} />
            Get Installer
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}