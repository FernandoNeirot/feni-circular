import {
  Search as SearchIcon,
  CheckCircle,
  Sparkles,
  Camera,
  Shirt,
  Package,
  ShieldCheck,
  Droplets,
  Eye,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { SiteFooter } from "@/shared/components/SiteFooter";

const steps = [
  {
    icon: Camera,
    title: "Recibimos la prenda",
    description:
      "Cada prenda llega a nuestras manos. Solo aceptamos ropa de marcas reconocidas y en buen estado general.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Eye,
    title: "Inspección detallada",
    description:
      "Revisamos cada centímetro: buscamos manchas, roturas, decoloración, peeling y desgaste en cierres o botones. Si no pasa, no entra.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Droplets,
    title: "Higienización profesional",
    description:
      "Lavamos y desinfectamos cada prenda con productos hipoalergénicos aptos para bebés y niños. Planchado y control de olores incluido.",
    color: "bg-info/10 text-info",
  },
  {
    icon: Shirt,
    title: "Medición real",
    description:
      'Medimos largo, ancho, manga y entrepierna de cada prenda para que sepas exactamente si le va a quedar. Nada de "talle 4" sin contexto.',
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Camera,
    title: "Fotos reales",
    description:
      "Fotografiamos la prenda real, sin filtros engañosos. Si tiene un detalle mínimo, lo mostramos y lo describimos.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Package,
    title: "Lista para vos",
    description:
      "Se empaqueta con cuidado y cariño, lista para su nueva historia. Enviamos a todo el país o coordinamos retiro.",
    color: "bg-secondary/10 text-secondary",
  },
];

const guarantees = [
  {
    icon: ShieldCheck,
    title: "Garantía de estado",
    text: "Si la prenda no coincide con la descripción, te devolvemos el dinero.",
  },
  {
    icon: CheckCircle,
    title: "Solo lo mejor",
    text: "Rechazamos más del 40% de las prendas que recibimos por no cumplir nuestro estándar.",
  },
  {
    icon: Heart,
    title: "Con propósito",
    text: "Cada compra evita que ropa en perfecto estado termine en un vertedero.",
  },
];

export default function HowItWorksPage() {
  const whatsappHref = `https://wa.me/541133150864?text=${encodeURIComponent(
    "hola, te queria consultar por la ropa de FENI"
  )}`;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 px-4 text-center bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Transparencia total
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            ¿Cómo funciona FENI?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No vendemos ropa usada &quot;así nomás&quot;. Cada prenda pasa por un
            proceso riguroso para que recibas algo que se sienta como nuevo.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 items-start group">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center`}
                >
                  <step.icon className="h-7 w-7" />
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 h-12 bg-border rounded-full" />
                )}
              </div>
              <div className="pt-2 space-y-1">
                <h3 className="text-xl font-bold text-foreground">
                  <span className="text-primary mr-2">{i + 1}.</span>
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Nuestras garantías
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {guarantees.map((g, i) => (
              <div
                key={i}
                className="text-center space-y-4 p-6 rounded-2xl bg-card border"
              >
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <g.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground">{g.title}</h3>
                <p className="text-sm text-muted-foreground">{g.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            ¿Lista para encontrar tesoros?
          </h2>
          <p className="text-muted-foreground">
            Explorá nuestro catálogo y descubrí prendas increíbles a precios
            justos.
          </p>
          <Button size="lg" className="rounded-full gap-2" asChild>
            <Link href="/buscar">
              Ver productos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter whatsappHref={whatsappHref} />
    </div>
  );
}
