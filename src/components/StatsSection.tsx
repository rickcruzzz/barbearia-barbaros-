import { useCountUp } from "@/hooks/useScrollAnimation";

const STATS = [
  { value: 144, suffix: "+", label: "Posts no Instagram" },
  { value: 1190, suffix: "+", label: "Clientes satisfeitos" },
  { value: 5, suffix: "+", label: "Anos de experiência" },
  { value: 100, suffix: "%", label: "Dedicação em cada corte" },
];

function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useCountUp(value);
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-6 md:py-0">
      <p className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
        <span ref={ref}>0</span>{suffix}
      </p>
      <p className="font-body text-xs md:text-sm text-primary-foreground/80 uppercase tracking-wider text-center">
        {label}
      </p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section id="stats" className="gradient-gold py-10 md:py-14">
      <div className="container grid grid-cols-2 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-primary-foreground/20">
        {STATS.map((stat) => (
          <StatItem key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
