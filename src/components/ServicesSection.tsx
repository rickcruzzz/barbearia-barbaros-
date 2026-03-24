import { Scissors, Brush as Razor, Sparkles, TrendingUp, Baby, Home } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const SERVICES = [
  { icon: Scissors, title: "Corte Clássico", desc: "Degradê, social, disfarçado e tesoura. Cada detalhe pensado no seu estilo.", price: "Consulte" },
  { icon: Razor, title: "Barba na Régua", desc: "Navalha, toalha quente e acabamento preciso. Barba afiada de verdade.", price: "Consulte" },
  { icon: Sparkles, title: "Combo Corte + Barba", desc: "Pacote completo para sair renovado. Visual e autoestima no ponto.", price: "Consulte" },
  { icon: TrendingUp, title: "Fade / Degradê", desc: "Low, mid e high fade com precisão milimétrica. Tendência e técnica.", price: "Consulte" },
  { icon: Baby, title: "Corte Infantil", desc: "Cuidado especial para os pequenos. Paciência e carinho no atendimento.", price: "Consulte" },
  { icon: Home, title: "Atendimento a Domicílio", desc: "Vamos até você com todo o equipamento. Conforto sem sair de casa.", price: "Consulte" },
];

const WHATSAPP_BASE = "https://wa.me/5571983542132?text=";

export default function ServicesSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section id="servicos" className="section-padding bg-background">
      <div className="container" ref={ref}>
        <div className="text-center mb-12 md:mb-16">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3 animate-on-scroll">Serviços</p>
          <h2 className="section-title text-foreground animate-on-scroll">O que fazemos de melhor</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            const whatsappUrl = `${WHATSAPP_BASE}${encodeURIComponent(`Olá! Gostaria de agendar ${s.title}.`)}`;
            return (
              <div
                key={s.title}
                className="card-dark p-6 md:p-8 flex flex-col animate-on-scroll"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <Icon className="h-8 w-8 text-primary mb-4" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{s.desc}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-body text-xs text-primary uppercase tracking-wider">{s.price}</span>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-body text-xs text-foreground/60 hover:text-primary transition-colors duration-200">
                    Agendar este serviço &rarr;
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
