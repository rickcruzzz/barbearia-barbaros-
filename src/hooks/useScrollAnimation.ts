import { useEffect, useRef, type DependencyList } from "react";

export function useScrollAnimation<T extends HTMLElement>(deps: DependencyList = []) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const targets = [
      ...Array.from(el.querySelectorAll<HTMLElement>(".animate-on-scroll")),
      ...(el.classList.contains("animate-on-scroll") ? [el] : []),
    ];

    targets
      .filter((target) => !target.classList.contains("visible"))
      .forEach((target) => {
        const rect = target.getBoundingClientRect();
        const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (alreadyVisible) {
          target.classList.add("visible");
          return;
        }

        observer.observe(target);
      });

    return () => observer.disconnect();
  }, deps);

  return ref;
}

export function useCountUp(end: number, duration = 2000) {
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const runCountUp = () => {
      if (counted.current) return;
      counted.current = true;

      let start = 0;
      const startTime = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        start = Math.floor(eased * end);
        el.textContent = start.toLocaleString("pt-BR");
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          runCountUp();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyVisible) {
      runCountUp();
    } else {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [end, duration]);

  return ref;
}
