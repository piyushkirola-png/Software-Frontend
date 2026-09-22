import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import {
    uploadProductImage,
    uploadCategoryImage,
    resolveImageUrl,
} from "../../lib/upload";

interface Props {
    value?: string | null;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
    endpoint?: "product" | "category";
}

export default function ImageUploader({
    value,
    onChange,
    label = "Image",
    className = "",
    endpoint = "product",
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");

    const handleFile = async (file: File) => {
        setError("");
        if (!file.type.startsWith("image/")) {
            setError("Only image files allowed");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Max 5 MB");
            return;
        }

        setUploading(true);
        setProgress(0);
        try {
            const uploader =
                endpoint === "category"
                    ? uploadCategoryImage
                    : uploadProductImage;
            const url = await uploader(file, setProgress);
            onChange(url);
        } catch (e: any) {
            setError(e?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
        e.target.value = "";
    };

    const preview = value ? resolveImageUrl(value) : "";

    return (
        <div className={className}>
            <label className="block text-[10px] font-bold text-navy mb-1 uppercase tracking-wider">
                {label}
            </label>

            <div className="flex items-center gap-2">
                <div className="w-16 h-16 shrink-0 rounded-lg border border-gray-200 bg-soft overflow-hidden flex items-center justify-center">
                    {preview ? (
                        <img
                            src={preview}
                            alt=""
                            className="max-h-full max-w-full object-contain p-1"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <ImageIcon className="h-5 w-5 text-gray-300" />
                    )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                    <input
                        type="text"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={
                            endpoint === "category"
                                ? "/uploads/categories/..."
                                : "/uploads/products/..."
                        }
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand"
                    />

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-navy hover:bg-gray-50 disabled:opacity-60"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    {progress}%
                                </>
                            ) : (
                                <>
                                    <Upload className="h-3 w-3" />
                                    Upload
                                </>
                            )}
                        </button>

                        {value && (
                            <button
                                type="button"
                                onClick={() => onChange("")}
                                disabled={uploading}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                            >
                                <X className="h-3 w-3" />
                                Clear
                            </button>
                        )}
                    </div>

                    {error && <p className="text-[10px] text-red-600">{error}</p>}
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={onPick}
                className="hidden"
            />
        </div>
    );
}