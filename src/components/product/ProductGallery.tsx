import { useState } from "react";

interface Props {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const list = images && images.length > 0 ? images : ["https://placehold.co/600x400?text=No+Image"];

  return (
    <div className="w-full">
      {/* Main image */}
      <div className="bg-soft rounded-xl overflow-hidden aspect-square flex items-center justify-center mb-3">
        <img
          src={list[active]}
          alt={alt}
          className="max-h-full max-w-full object-contain p-6"
        />
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {list.slice(0, 5).map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                i === active ? "border-brand" : "border-gray-100 hover:border-gray-300"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}