import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  children?: ReactNode;
}

export default function SectionHeading({
  title,
  subtitle,
  align = "center",
  children,
}: Props) {
  const alignment = align === "center" ? "text-center" : "text-left";
  return (
    <div className={`${alignment} mb-10`}>
      <h2 className="text-3xl md:text-4xl font-extrabold text-navy">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted mt-3 text-sm md:text-base max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}