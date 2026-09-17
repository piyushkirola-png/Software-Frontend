import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function PageHero({ title, subtitle, children }: Props) {
  return (
    <section className="bg-navy text-white py-14">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{title}</h1>
        {subtitle && (
          <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}