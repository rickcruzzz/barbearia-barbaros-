import { MapPin, Phone, Clock, Instagram } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const CONTACT_ITEMS = [
  { icon: MapPin, label: "Stella Maris, Salvador/BA", href: "https://www.google.com/maps/search/Stella+Maris+Salvador+BA" },
  { icon: Phone, label: "(71) 98354-2132", href: "tel:+5571983542132" },
  { icon: Instagram, label: "@barbarosbarber1", href: "https://instagram.com/barbarosbarber1" },
  { icon: Clock, label: "Seg a Sex: 9h às 19h", href: null },
];

export default function LocationSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section id="contato" className="section-padding bg-secondary">
      <div className="container" ref={ref}>
        <div className="text-center mb-12">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3 animate-on-scroll">Contato</p>
          <h2 className="section-title text-foreground animate-on-scroll">Onde nos encontrar</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-lg overflow-hidden h-[350px] lg:h-auto animate-on-scroll">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15570.0!2d-38.35!3d-12.93!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sStella+Maris+Salvador+BA!5e0!3m2!1spt-BR!2sbr!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 350 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização da Bárbaros Barbershop em Stella Maris"
            />
          </div>

          <div className="flex flex-col gap-4">
            {CONTACT_ITEMS.map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="card-dark p-5 flex items-center gap-4 animate-on-scroll">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="font-body text-sm text-foreground">{item.label}</span>
                </div>
              );
              return item.href ? (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">{content}</a>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 animate-on-scroll">
              <a href="tel:+5571983542132" className="btn-outline-gold text-xs justify-center">Ligar agora</a>
              <a href="https://www.google.com/maps/search/Stella+Maris+Salvador+BA" target="_blank" rel="noopener noreferrer" className="btn-outline-gold text-xs justify-center">Abrir no Maps</a>
              <a href="https://wa.me/5571983542132" target="_blank" rel="noopener noreferrer" className="btn-gold text-xs justify-center">WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
