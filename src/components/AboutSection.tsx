import { CheckCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import spaceImg from "@/assets/space.jpg";

const FEATURES = [
  "Espaço climatizado e confortável",
  "Produtos premium selecionados",
  "Profissionais treinados e apaixonados pelo ofício",
  "Ambiente pensado para o seu bem-estar",
];

export default function AboutSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section id="sobre" className="section-padding bg-secondary">
      <div className="container" ref={ref}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="animate-on-scroll order-2 lg:order-1">
            <img
              src={spaceImg}
              alt="Espaço da Bárbaros Barbershop em Stella Maris"
              className="w-full h-[400px] lg:h-[500px] object-cover rounded-lg"
              loading="lazy"
              width={640}
              height={500}
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3 animate-on-scroll">Nossa história</p>
            <h2 className="section-title text-foreground mb-6 animate-on-scroll">Mais do que uma barbearia</h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-6 animate-on-scroll">
              A Bárbaros nasceu de uma paixão por fazer o homem se sentir bem consigo mesmo. Não é só tesoura e navalha — é o momento que você reserva para você. Em 2025 a gente reinaugurou o espaço, mas a essência é a mesma desde o primeiro dia: cuidado de verdade, respeito pelo seu tempo e atenção em cada detalhe.
            </p>
            <ul className="space-y-3 mb-8">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 animate-on-scroll">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" strokeWidth={1.5} />
                  <span className="font-body text-sm text-foreground/80">{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://instagram.com/barbarosbarber1"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold text-xs animate-on-scroll inline-flex"
            >
              Conheça nosso espaço &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
