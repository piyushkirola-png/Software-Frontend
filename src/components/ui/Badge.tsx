interface Props {
  color?: "green" | "red" | "yellow" | "blue" | "gray";
  children: React.ReactNode;
}

const COLORS: Record<string, string> = {
  green: "bg-success/10 text-success",
  red: "bg-red-100 text-red-600",
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-brand/10 text-brand",
  gray: "bg-gray-100 text-gray-600",
};

export default function Badge({ color = "gray", children }: Props) {
  return (
    <span
      className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${COLORS[color]}`}
    >
      {children}
    </span>
  );
}