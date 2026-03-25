import { Instagram, ArrowUp } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import logo from "@/assets/logo-premium.png";

const NAV_LINKS = [
  { label: "Início", href: "#inicio" },
  { label: "Serviços", href: "#servicos" },
  { label: "Sobre", href: "#sobre" },
  { label: "Galeria", href: "#galeria" },
  { label: "Contato", href: "#contato" },
];

const SERVICE_LINKS = [
  "Corte Clássico",
  "Barba na Régua",
  "Combo Corte + Barba",
  "Fade / Degrade",
  "Corte Infantil",
  "Domicílio",
];

const adminPanelHref =
  (import.meta.env.VITE_ADMIN_PORTAL_URL ?? "").trim() ||
  (import.meta.env.DEV ? "http://localhost:3000/login" : "");

export default function Footer() {
  return (
    <footer className="bg-background border-t border-primary/20">
      <div className="container px-4 py-12 md:section-padding pb-8">
        <div className="flex flex-col gap-8 mb-10">
          <div>
            <div className="brand-logo-frame brand-logo-frame--footer mb-3 inline-flex">
              <img src={logo} alt="Bárbaros Barbershop" className="brand-logo-img brand-logo-img--footer" />
            </div>
            <p className="font-body text-sm text-muted-foreground italic">Elegância é igual a um bom corte</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Navegação</h4>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Serviços</h4>
              <ul className="space-y-2">
                {SERVICE_LINKS.map((s) => (
                  <li key={s}><span className="font-body text-sm text-muted-foreground">{s}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <a href="https://instagram.com/barbarosbarber1" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="https://wa.me/5571983542132" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 rounded border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
            <WhatsAppIcon className="h-5 w-5" />
          </a>
        </div>

        <div className="border-t border-primary/10 pt-6 flex items-center justify-between gap-4">
          <p className="font-body text-xs text-muted-foreground">
            &copy; 2026 Bárbaros Barbershop. Todos os direitos reservados.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-10 h-10 rounded border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all flex-shrink-0"
            aria-label="Voltar ao topo"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 pt-5 border-t border-primary/10 text-center space-y-2">
          <p className="font-body text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground/55">
            Área da equipe
          </p>
          {adminPanelHref ? (
            <a
              href={adminPanelHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body inline-block text-sm font-medium text-primary/90 hover:text-primary underline-offset-4 hover:underline transition-colors"
            >
              Entrar no painel administrativo
            </a>
          ) : import.meta.env.DEV ? (
            <p className="font-body text-xs text-muted-foreground/60 max-w-md mx-auto">
              Em produção, defina <code className="text-[11px]">VITE_ADMIN_PORTAL_URL</code> no <code className="text-[11px]">.env.local</code> ou na Vercel (URL do login do painel).
            </p>
          ) : (
            <p className="font-body text-xs text-muted-foreground/40">Acesso reservado à equipe.</p>
          )}
        </div>
      </div>
    </footer>
  );
}
