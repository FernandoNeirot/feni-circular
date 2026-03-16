import Link from "next/link";

type SiteFooterProps = {
  whatsappHref: string;
};

export function SiteFooter({ whatsappHref }: SiteFooterProps) {
  return (
    <footer className="bg-muted/50 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-3">FENI</h3>
            <p className="text-sm text-muted-foreground">
              Ropa infantil circular de excelente calidad.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Navegación</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "Productos", href: "/buscar" },
                { label: "¿Cómo funciona?", href: "/como-funciona" },
                { label: "Vendé con nosotros", href: "/vender" },
                { label: "Preguntas frecuentes", href: "/faq" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-muted-foreground hover:text-primary text-left transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contacto</h4>
            <p className="text-sm text-muted-foreground">
              WhatsApp:{" "}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                +54 11-3315-0864
              </a>
            </p>
            <p className="text-sm text-muted-foreground">Instagram: @fenicircular</p>
          </div>
        </div>
        <div className="border-t pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 FENI. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

