import { useState } from "react";
import { Clock, Home as HomeIcon } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import ctaBg from "@/assets/cta-bg.jpg";

const SERVICES = [
  "Corte Clássico",
  "Barba na Régua",
  "Combo Corte + Barba",
  "Fade / Degradê",
  "Corte Infantil",
  "Atendimento a Domicílio",
];

export default function BookingSection() {
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const ref = useScrollAnimation<HTMLDivElement>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Olá! Sou ${name || "cliente"} e gostaria de agendar ${service || "um serviço"} para ${date || "o próximo horário disponível"}.`;
    window.open(`https://wa.me/5571983542132?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <section id="agendamento" className="relative py-20 md:py-32 overflow-hidden">
      <img src={ctaBg} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" aria-hidden="true" />
      <div className="absolute inset-0 bg-background/85" />

      <div className="container relative z-10" ref={ref}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3 animate-on-scroll">Agendamento</p>
          <h2 className="section-title text-foreground mb-4 animate-on-scroll">Pronto para se cuidar?</h2>
          <p className="section-subtitle mx-auto mb-10 animate-on-scroll">
            Agende seu horário em menos de 1 minuto pelo WhatsApp. Sem complicação, sem fila.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8 animate-on-scroll">
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-secondary border border-primary/20 rounded px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full bg-secondary border border-primary/20 rounded px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Selecione o serviço</option>
              {SERVICES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-secondary border border-primary/20 rounded px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <button type="submit" className="btn-gold w-full py-4">
              Agendar pelo WhatsApp
            </button>
            <a href="/agendar" className="btn-outline-gold w-full py-4 justify-center">
              Agendamento online completo
            </a>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground animate-on-scroll">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Seg a Sex: 9h - 19h
            </span>
            <span className="flex items-center gap-2">
              <HomeIcon className="h-4 w-4 text-primary" />
              Atendimento a domicílio disponível
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
