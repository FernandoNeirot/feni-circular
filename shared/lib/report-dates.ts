import { format, isValid, parse, parseISO } from "date-fns";

/** Fecha calendario en UTC (Firestore guarda segundos UTC). */
function utcYmdFromMs(ms: number): string | null {
  const d = new Date(ms);
  if (!isValid(d)) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Convierte fechas guardadas en productos (string ISO, Timestamp serializado, etc.)
 * a `yyyy-MM-dd` para comparar rangos de reportes.
 */
export function normalizeReportDateKey(value: unknown): string | null {
  if (value == null) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value > 1e12 ? value : value * 1000;
    return utcYmdFromMs(ms);
  }

  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return null;
    const ymd = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (ymd) return ymd[1];
    let parsed = parseISO(s);
    if (isValid(parsed)) {
      // ISO con hora / Z: usar día en UTC para alinear con Firestore y evitar corrimientos locales
      if (s.includes("T") || s.endsWith("Z")) return utcYmdFromMs(parsed.getTime());
      return format(parsed, "yyyy-MM-dd");
    }
    parsed = parse(s, "dd/MM/yyyy", new Date());
    if (isValid(parsed)) return format(parsed, "yyyy-MM-dd");
    parsed = parse(s, "d/M/yyyy", new Date());
    if (isValid(parsed)) return format(parsed, "yyyy-MM-dd");
    return null;
  }

  if (typeof value === "object" && value !== null) {
    const o = value as Record<string, unknown> & { toDate?: () => Date };
    if (typeof o.toDate === "function") {
      try {
        const d = o.toDate();
        if (d instanceof Date && isValid(d)) return utcYmdFromMs(d.getTime());
      } catch {
        /* ignore */
      }
    }
    const sec =
      typeof o.seconds === "number"
        ? o.seconds
        : typeof o._seconds === "number"
          ? o._seconds
          : null;
    if (sec != null) return utcYmdFromMs(sec * 1000);
  }

  return null;
}

export function formatReportDateDisplay(isoYmd: string): string {
  if (!isoYmd?.trim()) return "—";
  try {
    const parsed = parseISO(isoYmd);
    if (!isValid(parsed)) return "—";
    return format(parsed, "dd/MM/yyyy");
  } catch {
    return "—";
  }
}
