const WHATSAPP_URL = "https://wa.me/5571983542132?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio.";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.129 6.745 3.047 9.383L1.054 31.4l6.247-1.965A15.89 15.89 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.35 22.606c-.39 1.1-1.932 2.013-3.17 2.28-.847.18-1.953.323-5.675-1.22-4.763-1.974-7.827-6.81-8.065-7.125-.228-.315-1.919-2.556-1.919-4.875s1.215-3.456 1.647-3.928c.39-.427.912-.593 1.218-.593.152 0 .29.008.413.014.432.019.648.044 .933.723.357.85 1.227 2.992 1.334 3.21.109.218.218.513.07.808-.14.3-.262.433-.48.682-.218.249-.426.44-.644.71-.198.237-.42.49-.175.922.246.427 1.094 1.806 2.35 2.926 1.614 1.44 2.974 1.886 3.396 2.094.432.218.685.184.936-.109.256-.3 1.089-1.268 1.38-1.703.285-.432.575-.36.966-.218.395.14 2.504 1.18 2.932 1.395.432.218.718.323.823.504.104.18.104 1.053-.286 2.153z"/>
    </svg>
  );
}

export { WhatsAppIcon };

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg whatsapp-pulse transition-transform duration-200 hover:scale-110 group"
      style={{ backgroundColor: "#25D366" }}
    >
      <WhatsAppIcon className="h-8 w-8 text-foreground" />
      <span className="absolute right-full mr-3 whitespace-nowrap rounded bg-secondary px-3 py-1.5 text-xs font-body text-foreground opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
        Fale conosco
      </span>
    </a>
  );
}
