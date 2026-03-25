import { useEffect, useState } from "react";
import logo from "@/assets/logo-premium.png";

const NAV_LINKS = [
  { label: "Início", href: "#inicio" },
  { label: "Serviços", href: "#servicos" },
  { label: "Sobre", href: "#sobre" },
  { label: "Galeria", href: "#galeria" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Agendamento", href: "/agendar" },
  { label: "Contato", href: "#contato" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b-2 border-primary/40"
          : "bg-transparent"
      }`}
    >
      <nav className="container flex items-center justify-between h-14 md:h-20">
        <a href="#inicio" aria-label="Bárbaros Barbershop - Início" className="brand-logo-frame brand-logo-frame--header">
          <img src={logo} alt="Bárbaros Barbershop" className="brand-logo-img brand-logo-img--header" />
        </a>

        <ul className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-body text-base text-foreground/80 uppercase tracking-wider transition-colors duration-200 hover:text-primary"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="/agendar" className="hidden lg:inline-flex btn-gold text-sm py-2.5 px-6">
          Agendar Agora
        </a>

        <button
          className={`lg:hidden flex flex-col gap-1.5 p-2 ${menuOpen ? "hamburger-open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      {menuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-t border-primary/20">
          <ul className="container flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 font-body text-base text-foreground/80 uppercase tracking-wider transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="mt-2">
              <a href="/agendar" onClick={() => setMenuOpen(false)} className="btn-gold w-full text-center text-base py-3.5">
                Agendar Agora
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
