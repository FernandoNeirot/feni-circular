"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Cart } from "./Cart";
import Image from "next/image";
import { Search, X, Menu, User, ShieldCheck } from "lucide-react";
import { productsQueryOptions } from "@/shared/queries/productos";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useWhatsAppVisibility } from "@/shared/components/WhatsAppVisibilityContext";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "/buscar" },
  { label: "¿Cómo funciona?", href: "/como-funciona" },
  { label: "Vendé con nosotros", href: "/vender" },
  { label: "Preguntas frecuentes", href: "/faq" },
];

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const [session, setSession] = useState<{ user: { uid: string; email: string | null } } | null>(
    null
  );
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: products = [] } = useQuery(productsQueryOptions);
  const { setSearchOpen: setVisibilitySearch, setMenuOpen: setVisibilityMenu } =
    useWhatsAppVisibility();

  useEffect(() => {
    setVisibilitySearch(searchOpen);
  }, [searchOpen, setVisibilitySearch]);

  useEffect(() => {
    setVisibilityMenu(menuOpen);
  }, [menuOpen, setVisibilityMenu]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSession(data?.user ? data : null))
      .catch(() => setSession(null));
  }, [loginOpen]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      toast.error("Ingresá email y contraseña");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
          action: "login",
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (res.ok) {
        setLoginOpen(false);
        setLoginEmail("");
        setLoginPassword("");
        toast.success("Sesión iniciada");
        const sessionRes = await fetch("/api/auth/session", { credentials: "include" });
        const sessionData = await sessionRes.json();
        setSession(sessionData?.user ? sessionData : null);
        router.push("/admin");
      } else {
        toast.error(data.error ?? "Error al iniciar sesión");
      }
    } catch {
      toast.error("Error al iniciar sesión");
    } finally {
      setLoginLoading(false);
    }
  };

  const isSearchPage = pathname === "/buscar";
  const isAdminSection = pathname?.startsWith("/admin") ?? false;
  const navLinksToShow = isAdminSection ? navLinks.filter((l) => l.href === "/") : navLinks;

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const suggestions =
    query.length >= 2
      ? products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(query.toLowerCase()) ||
              p.category.toLowerCase().includes(query.toLowerCase()) ||
              p.brand.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 4)
      : [];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/images/feni-logo.png"
            alt="FENI Logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <div className="hidden sm:block text-left">
            <h1 className="text-lg font-bold leading-tight">FENI</h1>
            <p className="text-[10px] text-muted-foreground leading-none">Ropa Infantil</p>
          </div>
        </Link>

        <nav
          className={
            isAdminSection ? "flex items-center gap-1" : "hidden lg:flex items-center gap-1"
          }
        >
          {navLinksToShow.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                pathname === link.href
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {!isSearchPage && !isAdminSection && (
          <div className="hidden md:block flex-1 max-w-xs relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.length >= 3) {
                  window.location.href = `/buscar?q=${encodeURIComponent(query)}`;
                }
                if (e.key === "Escape") {
                  setSearchOpen(false);
                  setQuery("");
                }
              }}
              placeholder="Buscar..."
              className="pl-9 pr-8 h-9 rounded-full border-2 border-primary/20 focus-visible:ring-primary/30 bg-muted/50 text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {suggestions.length > 0 && query.length >= 2 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-card border rounded-xl shadow-lg overflow-hidden z-50">
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    href={`/producto/${p.slug || p.id}`}
                    onClick={() => setQuery("")}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.brand} · ${p.price}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link
                  href={`/buscar?q=${encodeURIComponent(query)}`}
                  onClick={() => setQuery("")}
                  className="w-full p-3 text-sm text-primary font-medium hover:bg-muted/50 border-t block"
                >
                  Ver todos los resultados →
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {!isSearchPage && !isAdminSection && (
            <button
              onClick={() => {
                if (searchOpen && query) setQuery("");
                setSearchOpen(!searchOpen);
              }}
              className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
          )}

          {!isAdminSection && <Cart />}

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label="Cuenta"
                >
                  <User className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href="/admin">Ir al panel</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/auth", {
                        method: "DELETE",
                        credentials: "include",
                      });
                      if (res.ok) {
                        setSession(null);
                        router.refresh();
                        toast.success("Sesión cerrada");
                      } else {
                        const data = await res.json().catch(() => ({}));
                        toast.error((data as { error?: string }).error ?? "Error al cerrar sesión");
                      }
                    } catch {
                      toast.error("Error al cerrar sesión");
                    }
                  }}
                >
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Iniciar sesión"
            >
              <User className="h-5 w-5" />
            </button>
          )}

          {!isAdminSection && (
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 rounded-full hover:bg-muted transition-colors">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-12">
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`px-4 py-3 text-left rounded-xl transition-colors ${
                        pathname === link.href
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center pt-2 pb-1">
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <ShieldCheck className="h-8 w-8 text-primary" aria-hidden />
            </div>
            <DialogHeader className="space-y-1.5">
              <DialogTitle>Iniciar sesión</DialogTitle>
              <p className="text-sm text-muted-foreground font-normal">
                Acceso solo para administradores. Si no tenés permisos, no necesitás iniciar sesión
                para comprar.
              </p>
            </DialogHeader>
          </div>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email de administrador</Label>
              <Input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@ejemplo.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Contraseña</Label>
              <Input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Contraseña"
                autoComplete="current-password"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLoginOpen(false)}
                disabled={loginLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loginLoading}>
                {loginLoading ? "Entrando..." : "Entrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {searchOpen && !isSearchPage && !isAdminSection && (
        <div className="md:hidden px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.length >= 3) {
                  window.location.href = `/buscar?q=${encodeURIComponent(query)}`;
                }
                if (e.key === "Escape") {
                  setSearchOpen(false);
                  setQuery("");
                }
              }}
              placeholder="Buscar productos..."
              className="pl-10 h-10 rounded-full border-2 border-primary/20 focus-visible:ring-primary/30 bg-muted/50"
            />
          </div>
          {suggestions.length > 0 && query.length >= 2 && (
            <div className="mt-2 bg-card border rounded-xl shadow-lg overflow-hidden">
              {suggestions.map((p) => (
                <Link
                  key={p.id}
                  href={`/producto/${p.slug || p.id}`}
                  onClick={() => {
                    setQuery("");
                    setSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.brand} · ${p.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
