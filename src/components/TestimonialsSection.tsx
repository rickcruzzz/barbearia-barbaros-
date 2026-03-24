import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const TESTIMONIALS = [
  { name: "Rafael S.", text: "Vim pela primeira vez na Barbaros e nao troco mais. Sai com a barba afiada e o cabelo no ponto. Ambiente top demais.", date: "Mar 2025" },
  { name: "Lucas M.", text: "O atendimento e outro nivel. O cara te escuta, entende o que voce quer e entrega. Recomendo de olhos fechados.", date: "Fev 2025" },
  { name: "Pedro H.", text: "Melhor barbearia de Stella Maris, sem discussao. Ambiente massa, cerveja gelada e o corte fica impecavel.", date: "Jan 2025" },
  { name: "Thiago R.", text: "Pedi o atendimento a domicilio e foi perfeito. Profissional, pontual e o resultado ficou show. Nota 10.", date: "Dez 2024" },
  { name: "Carlos A.", text: "Meu filho de 5 anos adorou cortar o cabelo la. Paciencia, carinho e ficou estiloso demais. Voltaremos sempre.", date: "Nov 2024" },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const ref = useScrollAnimation<HTMLDivElement>();

  useEffect(() => {
    const interval = setInterval(() => setCurrent((c) => (c + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);
  const t = TESTIMONIALS[current];

  return (
    <section id="depoimentos" className="section-padding bg-secondary">
      <div className="container max-w-3xl" ref={ref}>
        <div className="text-center mb-12">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3 animate-on-scroll">Depoimentos</p>
          <h2 className="section-title text-foreground animate-on-scroll">O que nossos clientes dizem</h2>
        </div>

        <div className="relative animate-on-scroll">
          <div className="card-dark p-8 md:p-12 text-center min-h-[280px] flex flex-col items-center justify-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="font-display text-lg font-bold text-primary-foreground">{t.name[0]}</span>
              </div>
              <div className="text-left">
                <p className="font-body text-sm font-semibold text-foreground">{t.name}</p>
                <p className="font-body text-xs text-muted-foreground">{t.date}</p>
              </div>
            </div>
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 star-gold" fill="currentColor" />
              ))}
            </div>
            <blockquote className="font-body text-foreground/80 leading-relaxed text-base md:text-lg italic">
              &ldquo;{t.text}&rdquo;
            </blockquote>
          </div>

          <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-2 text-muted-foreground hover:text-primary transition-colors" aria-label="Anterior">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-2 text-muted-foreground hover:text-primary transition-colors" aria-label="Proximo">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current ? "bg-primary scale-125" : "bg-muted-foreground/30"}`}
              aria-label={`Depoimento ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
