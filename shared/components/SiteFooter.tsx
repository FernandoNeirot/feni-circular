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
            <p className="text-xl font-bold mb-3 text-foreground">FENI</p>
            <p className="text-sm text-muted-foreground">
              Ropa infantil circular de excelente calidad.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-3 text-foreground">Navegación</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Productos", href: "/productos" },
                { label: "¿Cómo funciona?", href: "/como-funciona-feni" },
                { label: "Vendé con nosotros", href: "/vende-con-nosotros" },
                { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
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
            <p className="font-semibold mb-3 text-foreground">Contacto</p>
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
            © 2025 FENI. Todos los derechos reservados.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Desarrollado por{" "}
            <a
              href="https://www.linkedin.com/in/fernando-neirot/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Fernando Neirot
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
