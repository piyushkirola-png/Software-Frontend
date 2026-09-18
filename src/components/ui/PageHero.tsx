import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface PageHeroProps {
  badge?: string;
  title: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
}

export default function PageHero({
  badge,
  title,
  subtitle,
  icon,
}: PageHeroProps) {
  return (
    <section className="relative pt-16 pb-12 overflow-hidden bg-navy text-white">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Glow */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-brand-light/10 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 text-center">
        {icon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-5"
          >
            {icon}
          </motion.div>
        )}

        {badge && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider mb-4 backdrop-blur-sm"
          >
            {badge}
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}