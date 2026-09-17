import { Link } from "react-router-dom";
import { Download as DownloadIcon, Loader2, ExternalLink } from "lucide-react";
import { useMyDownloads } from "../../../api/queries/useDownloads";

const API_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:8081";

export default function Downloads() {
  const { data: downloads = [], isLoading } = useMyDownloads();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 md:p-6">
      <h1 className="text-2xl font-extrabold text-navy mb-6">My Downloads</h1>

      {downloads.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <DownloadIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold">No downloads yet</p>
          <p className="text-sm mt-1">
            Downloads appear here after a successful purchase
          </p>
          <Link
            to="/products"
            className="text-brand text-sm mt-3 inline-block hover:underline"
          >
            Browse Products →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {downloads.map((d) => (
            <div
              key={d.productId}
              className="border border-gray-100 rounded-lg p-4 flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-soft rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={d.thumbnailUrl || "https://placehold.co/64x64?text=Img"}
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
                className="shrink-0 flex items-center gap-1 bg-brand hover:bg-brand-dark text-white text-xs font-bold px-3 py-2 rounded-lg"
              >
                Download <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}