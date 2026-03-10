"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Camera,
  Send,
  Sparkles,
  DollarSign,
  Recycle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const benefits = [
  {
    icon: DollarSign,
    title: "Ganá dinero",
    text: "Vendé lo que ya no usan y recuperá parte de tu inversión.",
  },
  {
    icon: Recycle,
    title: "Dales nueva vida",
    text: "Esa ropa que guardás en un cajón puede hacer feliz a otra familia.",
  },
  {
    icon: Clock,
    title: "Sin esfuerzo",
    text: "Vos nos mandás las fotos, nosotros nos encargamos del resto.",
  },
];

export default function SellWithUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    brand: "",
    ageRange: "",
    condition: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Por favor completá tu nombre y teléfono");
      return;
    }

    const message =
      `¡Hola! Quiero vender/consignar ropa infantil 👶\n\n` +
      `👤 ${formData.name.trim()}\n📱 ${formData.phone.trim()}\n📍 ${formData.city.trim() || "No especificó"}\n\n` +
      `👕 Marca: ${formData.brand || "Varias"}\n` +
      `📏 Edad: ${formData.ageRange || "No especificó"}\n` +
      `✨ Estado: ${formData.condition || "No especificó"}\n\n` +
      `📝 ${formData.description.trim() || "Sin descripción adicional"}`;

    const whatsappNumber = "+5491139009696";
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    toast.success("Redirigiendo a WhatsApp...");
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 px-4 text-center bg-gradient-to-b from-secondary/5 via-background to-background">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Sumate al movimiento circular
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Vendé con nosotros
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ¿Tenés ropa infantil en buen estado que ya no usan? Dales una segunda
            vida y ganá dinero con eso que ya no necesitás.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="text-center space-y-3 p-6 rounded-2xl bg-card border"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <b.icon className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-bold text-foreground">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-4 md:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
            ¿Cómo es el proceso?
          </h2>
          <div className="space-y-4">
            {[
              "Completá el formulario con los datos de las prendas",
              "Envianos fotos por WhatsApp (las revisamos en 24-48hs)",
              "Te confirmamos cuáles aceptamos y el precio",
              "Coordinamos el retiro o envío y ¡listo!",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2 text-foreground">
            Contanos qué tenés
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Completá el formulario y te contactamos por WhatsApp
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-card p-6 md:p-8 rounded-2xl border"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tu nombre *</Label>
                <Input
                  id="name"
                  placeholder="María García"
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp *</Label>
                <Input
                  id="phone"
                  placeholder="+54 9 11 1234-5678"
                  maxLength={20}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad / Zona</Label>
              <Input
                id="city"
                placeholder="Ej: Palermo, CABA"
                maxLength={100}
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca principal</Label>
                <Input
                  placeholder="Ej: Mimo, Zara Kids, H&M..."
                  maxLength={100}
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Rango de edad</Label>
                <Select
                  value={formData.ageRange}
                  onValueChange={(v) =>
                    setFormData({ ...formData, ageRange: v })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Seleccioná" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-12 meses">0-12 meses</SelectItem>
                    <SelectItem value="1-3 años">1-3 años</SelectItem>
                    <SelectItem value="3-6 años">3-6 años</SelectItem>
                    <SelectItem value="6-10 años">6-10 años</SelectItem>
                    <SelectItem value="Varios">Varios rangos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado general</Label>
              <Select
                value={formData.condition}
                onValueChange={(v) =>
                  setFormData({ ...formData, condition: v })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="¿En qué estado están?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Como nuevo">
                    Como nuevo (1-2 usos)
                  </SelectItem>
                  <SelectItem value="Muy bueno">
                    Muy bueno (poco uso)
                  </SelectItem>
                  <SelectItem value="Bueno">
                    Bueno (uso normal, sin defectos)
                  </SelectItem>
                  <SelectItem value="Variado">Variado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Descripción / Comentarios</Label>
              <Textarea
                id="desc"
                placeholder="Contanos cuántas prendas tenés, tipo de ropa, cualquier detalle que nos ayude..."
                maxLength={1000}
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-xl resize-none"
              />
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground">
              <Camera className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
              <p>
                <strong className="text-foreground">Tip:</strong> Al enviarnos el
                mensaje por WhatsApp, adjuntá fotos de las prendas. Con 2-3 fotos
                por prenda alcanza (frente, espalda y etiqueta).
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full gap-2"
            >
              <Send className="h-5 w-5" />
              Enviar por WhatsApp
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
