import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
    if (totalPages <= 1) return null;

    const go = (p: number) => {
        if (p < 0 || p >= totalPages || p === page) return;
        onChange(p);
    };

    return (
        <div className="flex items-center justify-end gap-3 mt-8 text-sm">
            {/* Prev */}
            <button
                onClick={() => go(page - 1)}
                disabled={page === 0}
                className="flex items-center justify-center text-black hover:text-blue-600 disabled:opacity-30 disabled:hover:text-black transition"
                aria-label="Previous page"
            >
                <ChevronLeft size={16} />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-3">
                {Array.from({ length: totalPages }).map((_, i) => {
                    const active = i === page;
                    return (
                        <button
                            key={i}
                            onClick={() => go(i)}
                            className={
                                active
                                    ? "text-blue-600 font-bold"
                                    : "text-black font-medium hover:text-blue-600 transition"
                            }
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>

            {/* Next */}
            <button
                onClick={() => go(page + 1)}
                disabled={page === totalPages - 1}
                className="flex items-center justify-center text-black hover:text-blue-600 disabled:opacity-30 disabled:hover:text-black transition"
                aria-label="Next page"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
}