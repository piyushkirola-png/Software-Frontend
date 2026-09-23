import { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger" | "navy";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed";

  const sizes = {
    sm: "text-xs px-3.5 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-6 py-3",
  }[size];

  const variants = {
    primary:
      "bg-brand hover:bg-brand-dark text-white shadow-md shadow-brand/25 hover:shadow-lg hover:shadow-brand/35",
    navy: "bg-navy hover:bg-navy-light text-white shadow-md shadow-navy/25 hover:shadow-lg",
    outline: "border-2 border-brand text-brand hover:bg-brand hover:text-white",
    ghost: "text-brand hover:bg-brand/10",
    danger: "bg-danger hover:bg-red-700 text-white",
  }[variant];

  return (
    <button
      className={`${base} ${sizes} ${variants} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
