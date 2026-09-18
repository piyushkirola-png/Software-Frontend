interface Props {
  color?: "green" | "red" | "yellow" | "blue" | "gray" | "navy";
  children: React.ReactNode;
}

const COLORS: Record<string, string> = {
  green: "bg-success/10 text-success",
  red: "bg-red-100 text-red-600",
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-brand/10 text-brand",
  gray: "bg-gray-100 text-gray-600",
  navy: "bg-navy/10 text-navy",
};

export default function Badge({ color = "gray", children }: Props) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${COLORS[color]}`}
    >
      {children}
    </span>
  );
}