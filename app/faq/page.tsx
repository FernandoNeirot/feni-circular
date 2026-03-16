"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import { MessageCircle, Sparkles } from "lucide-react";
import { SiteFooter } from "@/shared/components/SiteFooter";

const faqSections = [
  {
    title: "🛒 Compras y Pedidos",
    questions: [
      {
        q: "¿Cómo compro en FENI?",
        a: 'Elegí los productos que te gusten, agregalos al carrito y hacé clic en "Pedir por WhatsApp". Te redirigimos a un chat con el detalle de tu pedido para que coordinemos pago y envío.',
      },
      {
        q: "¿Puedo reservar un producto?",
        a: "Sí, pero la reserva dura máximo 24 horas. Como cada prenda es única, no podemos garantizar disponibilidad si no se confirma el pago en ese plazo.",
      },
      {
        q: "¿Qué métodos de pago aceptan?",
        a: "Transferencia bancaria, Mercado Pago (link de pago) y efectivo en caso de retiro en persona.",
      },
      {
        q: "¿Los precios incluyen IVA?",
        a: "Sí, todos los precios publicados son finales.",
      },
    ],
  },
  {
    title: "🚚 Envíos y Entregas",
    questions: [
      {
        q: "¿Hacen envíos a todo el país?",
        a: "Sí, enviamos a todo Argentina a través de Correo Argentino, Andreani u OCA. El costo de envío se calcula según destino y peso.",
      },
      {
        q: "¿Cuánto tarda en llegar mi pedido?",
        a: "CABA y GBA: 2-4 días hábiles. Interior: 4-7 días hábiles. Te enviamos el código de seguimiento por WhatsApp.",
      },
      {
        q: "¿Puedo retirar en persona?",
        a: "Sí, coordinamos punto de encuentro en zona CABA. ¡Es gratis!",
      },
      {
        q: "¿Cuánto cuesta el envío?",
        a: "Depende del destino y la cantidad de prendas. Te lo informamos antes de confirmar la compra por WhatsApp.",
      },
    ],
  },
  {
    title: "👕 Estado de las Prendas",
    questions: [
      {
        q: "¿Cómo garantizan la calidad?",
        a: "Cada prenda pasa por una inspección detallada de 6 pasos: revisamos manchas, roturas, olores, funcionalidad de cierres, y las higienizamos profesionalmente. Rechazamos más del 40% de lo que recibimos.",
      },
      {
        q: '¿Qué significan los estados (Excelente, Como nuevo, Muy bueno)?',
        a: '"Como nuevo" = 1-2 usos, sin marcas visibles. "Excelente" = poco uso, perfecto estado. "Muy bueno" = uso normal sin defectos, puede tener mínimo desgaste en etiquetas.',
      },
      {
        q: "¿Las medidas son exactas?",
        a: "Sí, medimos cada prenda con cinta métrica sobre una superficie plana. Publicamos largo, ancho, manga y entrepierna (cuando aplica) en centímetros reales. Los talles de etiqueta son orientativos, las medidas no mienten.",
      },
      {
        q: "¿Las fotos son reales?",
        a: "100%. Fotografiamos cada prenda que vendemos, sin filtros ni retoques. Si tiene algún detalle menor, lo mostramos y lo describimos.",
      },
    ],
  },
  {
    title: "🔄 Cambios y Devoluciones",
    questions: [
      {
        q: "¿Puedo devolver un producto?",
        a: "Si la prenda no coincide con la descripción publicada, te ofrecemos cambio o devolución del dinero dentro de las 48hs de recibida. Debés contactarnos por WhatsApp con fotos.",
      },
      {
        q: "¿Hacen cambios de talle?",
        a: "Como cada prenda es única, los cambios de talle dependen de la disponibilidad. Por eso es tan importante revisar las medidas reales antes de comprar.",
      },
      {
        q: "¿Quién paga el envío de devolución?",
        a: "Si la devolución es por un error nuestro (prenda distinta a la publicada), el envío corre por nuestra cuenta. Si es por arrepentimiento, el costo es del comprador.",
      },
    ],
  },
  {
    title: "🤝 Vender con FENI",
    questions: [
      {
        q: "¿Puedo vender ropa de mis hijos?",
        a: '¡Sí! Aceptamos ropa infantil de marcas reconocidas en buen estado. Completá el formulario en nuestra sección "Vendé con nosotros" y te contactamos.',
      },
      {
        q: "¿Cómo funciona la consignación?",
        a: "Recibimos tus prendas, las evaluamos, fotografiamos y publicamos. Cuando se venden, te transferimos tu porcentaje. Todo coordinado por WhatsApp.",
      },
      {
        q: "¿Qué marcas aceptan?",
        a: "Marcas nacionales e internacionales de buena calidad: Mimo & Co, Cheeky, Zara Kids, H&M, Carters, Gap, entre otras. Consultanos si tenés dudas sobre una marca.",
      },
    ],
  },
];

export default function FAQPage() {
  const whatsappHref = `https://wa.me/541133150864?text=${encodeURIComponent(
    "hola, te queria consultar por la ropa de FENI"
  )}`;

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 px-4 text-center bg-gradient-to-b from-info/5 via-background to-background">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-info/10 text-info text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Resolvemos tus dudas
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Preguntas Frecuentes
          </h1>
          <p className="text-lg text-muted-foreground">
            Todo lo que necesitás saber antes de comprar o vender en FENI.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 md:px-8">
        <div className="max-w-3xl mx-auto space-y-10">
          {faqSections.map((section, i) => (
            <div key={i}>
              <h2 className="text-xl font-bold mb-4 text-foreground">
                {section.title}
              </h2>
              <Accordion
                type="single"
                collapsible
                className="bg-card rounded-2xl border overflow-hidden"
              >
                {section.questions.map((faq, j) => (
                  <AccordionItem
                    key={j}
                    value={`${i}-${j}`}
                    className="border-border/50"
                  >
                    <AccordionTrigger className="px-5 text-left hover:no-underline hover:bg-muted/30 text-foreground">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 text-center">
        <div className="max-w-md mx-auto space-y-4 p-8 rounded-2xl bg-card border">
          <MessageCircle className="h-10 w-10 text-primary mx-auto" />
          <h3 className="text-xl font-bold text-foreground">
            ¿No encontraste tu respuesta?
          </h3>
          <p className="text-sm text-muted-foreground">
            Escribinos por WhatsApp y te respondemos en minutos.
          </p>
          <Button
            className="rounded-full gap-2"
            onClick={() =>
              window.open(
                "https://wa.me/+541133150864?text=Hola! Tengo una consulta sobre FENI",
                "_blank",
              )
            }
          >
            <MessageCircle className="h-4 w-4" />
            Chateá con nosotros
          </Button>
        </div>
      </section>

      <SiteFooter whatsappHref={whatsappHref} />
    </div>
  );
}
