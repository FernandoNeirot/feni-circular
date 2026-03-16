"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Hace scroll al inicio de la página cuando cambia la ruta (navegación).
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
