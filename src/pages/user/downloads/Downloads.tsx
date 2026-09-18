import { Link } from "react-router-dom";
import {
  Download as DownloadIcon,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import Reveal from "../../../components/animations/Reveal";
import { useMyDownloads } from "../../../api/queries/useDownloads";

const API_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:8081";

export default function Downloads() {
  const { data: downloads = [], isLoading, isError, refetch } =
    useMyDownloads();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (isError) {
    return (
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
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy">
          My Downloads
        </h1>
        <p className="text-muted mt-1 text-sm">
          {downloads.length} file{downloads.length !== 1 ? "s" : ""} ready
        </p>
      </div>

      {downloads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-4">
            <DownloadIcon className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-navy mb-1">
            No downloads yet
          </h2>
          <p className="text-sm text-muted mb-4">
            Downloads appear here after a successful purchase.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {downloads.map((d) => (
              <div
                key={d.productId}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-brand/20 transition"
              >
                <div className="w-16 h-16 bg-soft rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={
                      d.thumbnailUrl ||
                      "https://placehold.co/64x64?text=Img"
                    }
                    alt={d.productTitle}
                    className="max-h-full max-w-full object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy text-sm line-clamp-2">
                    {d.productTitle}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    Purchased{" "}
                    {new Date(d.purchasedAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
                <a
                  href={`${API_URL}${d.downloadUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 bg-brand hover:bg-brand-dark text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition"
                >
                  <DownloadIcon size={14} />
                  <span className="hidden sm:inline">Download</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}