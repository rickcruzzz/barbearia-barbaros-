import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import corte01 from "@/assets/corte-01.png";
import corte02 from "@/assets/corte-02.png";
import corte03 from "@/assets/corte-03.png";
import corte04 from "@/assets/corte-04.png";
import corte05 from "@/assets/corte-05.png";
import corte06 from "@/assets/corte-06.png";
import corte07 from "@/assets/corte-07.png";
import corte08 from "@/assets/corte-08.png";
import corte09 from "@/assets/corte-09.png";
import corte10 from "@/assets/corte-10.png";

type Category = "cortes" | "barba";
type GalleryImage = { src: string; alt: string; category: Category; span?: string };

const IMAGES: GalleryImage[] = [
  { src: corte01, alt: "Corte social com acabamento em degrade lateral", category: "cortes", span: "md:row-span-2" },
  { src: corte02, alt: "Acabamento frontal com navalha em corte masculino", category: "cortes" },
  { src: corte03, alt: "Corte masculino classico com finalizacao limpa", category: "cortes" },
  { src: corte04, alt: "Degrade com maquina e contorno preciso", category: "cortes" },
  { src: corte05, alt: "Fade lateral com penteado alinhado", category: "cortes" },
  { src: corte06, alt: "Modelagem de barba com navalha profissional", category: "barba" },
  { src: corte07, alt: "Corte em cabelo crespo com tecnica de transicao", category: "cortes" },
  { src: corte08, alt: "Acabamento de barba com tesoura e alinhamento", category: "barba", span: "md:row-span-2" },
  { src: corte09, alt: "Contorno lateral com maquina de precisao", category: "cortes" },
  { src: corte10, alt: "Resultado final de corte e barba em estilo premium", category: "barba", span: "md:col-span-2" },
];

const TABS: { value: Category; label: string }[] = [
  { value: "cortes", label: "Cortes" },
  { value: "barba", label: "Barba" },
];

export default function GallerySection() {
  const [filter, setFilter] = useState<Category>("cortes");
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const ref = useScrollAnimation<HTMLDivElement>([filter]);
  const isBarbaView = filter === "barba";

  const filtered = IMAGES.filter((img) => img.category === filter);

  return (
    <section id="galeria" className="section-padding bg-background">
      <div className="container" ref={ref}>
        <div className="text-center mb-10">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3 animate-on-scroll">Galeria</p>
          <h2 className="section-title text-foreground animate-on-scroll">Nossos trabalhos falam por si</h2>
        </div>

        <div className="flex justify-center gap-2 mb-10 animate-on-scroll">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`font-body text-xs uppercase tracking-wider px-4 py-2 rounded transition-all duration-200 ${
                filter === tab.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              aria-label={`Filtrar por ${tab.label}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((img, i) => (
            <button
              key={img.src + i}
              onClick={() => setLightbox(img)}
              className={`relative overflow-hidden rounded-lg group cursor-pointer ${isBarbaView ? "" : img.span || ""} animate-on-scroll`}
              style={{ transitionDelay: `${i * 60}ms` }}
              aria-label={`Ver ${img.alt}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className={`w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
                  isBarbaView ? "h-72 md:h-80" : "h-60 md:h-full"
                }`}
              />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                <ZoomIn className="h-6 w-6 text-primary" />
                <span className="font-body text-xs text-foreground uppercase tracking-wider">Ver trabalho</span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-10 animate-on-scroll">
          <a
            href="https://instagram.com/barbarosbarber1"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold text-xs"
          >
            Ver mais no Instagram &rarr;
          </a>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[9998] bg-background/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-foreground hover:text-primary transition-colors" aria-label="Fechar">
            <X className="h-8 w-8" />
          </button>
          <img src={lightbox.src} alt={lightbox.alt} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
        </div>
      )}
    </section>
  );
}
