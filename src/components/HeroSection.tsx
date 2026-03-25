import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import heroBg from "@/assets/hero-bg.jpg";
import heroBgMobile from "@/assets/hero-bg-mobile.png";

const WHATSAPP_URL = "https://wa.me/5571983542132?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio.";

export default function HeroSection() {
  return (
    <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden">
      <picture className="absolute inset-0">
        <source media="(max-width: 767px)" srcSet={heroBgMobile} />
        <img
          src={heroBg}
          alt="Interior da Bárbaros Barbershop"
          className="hero-bg-media absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
        />
      </picture>
      <div className="absolute inset-0 gradient-hero" />

      <div className="relative z-10 text-center px-5 sm:px-6 max-w-5xl mx-auto">
        <p className="font-body text-sm sm:text-base md:text-lg tracking-[0.22em] sm:tracking-[0.3em] md:tracking-[0.35em] uppercase text-primary font-medium mb-4 md:mb-6">
          Stella Maris, Salvador/BA
        </p>
        <h1 className="section-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground leading-[1.08] sm:leading-tight mb-4 md:mb-6">
          Seu estilo,<br />nossa arte.
        </h1>
        <p className="font-body text-lg sm:text-xl lg:text-2xl text-foreground/75 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed font-medium">
          Cortes modernos, barba na régua e uma experiência que vai além da cadeira.
        </p>
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3">
          <Link
            to="/agendar"
            className="btn-gold w-full sm:w-auto text-base py-3.5 sm:py-3 inline-flex items-center justify-center gap-2"
          >
            <Calendar className="h-5 w-5 shrink-0" aria-hidden />
            Reservar horário
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold w-full sm:w-auto text-base py-3.5 sm:py-3 inline-flex items-center justify-center gap-2"
          >
            <WhatsAppIcon className="h-5 w-5 shrink-0" />
            Falar no WhatsApp
          </a>
          <a href="#servicos" className="btn-outline-gold w-full sm:w-auto text-base py-3.5 sm:py-3">
            Ver serviços
          </a>
        </div>
      </div>

    </section>
  );
}
