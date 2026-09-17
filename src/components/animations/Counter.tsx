import { useEffect, useState } from "react";

interface Props {
  to: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export default function Counter({ to, duration = 1500, suffix = "", className = "" }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * to));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return (
    <span className={className}>
      {count}
      {suffix}
    </span>
  );
}