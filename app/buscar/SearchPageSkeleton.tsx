/** Misma estructura visual que SearchContent para bajar CLS mientras carga Suspense / datos. */
export function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <main
        className="max-w-7xl mx-auto px-4 py-8"
        aria-busy="true"
        aria-label="Cargando catálogo"
      >
        <h1 className="sr-only">Buscar ropa infantil</h1>
        <div className="mb-8">
          <div
            className="relative max-w-2xl mx-auto h-14 rounded-full bg-muted/80 border-2 border-transparent"
            aria-hidden
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-6 min-h-10">
          <div className="h-9 w-24 rounded-full bg-muted/80" aria-hidden />
          <div className="ml-auto h-5 w-28 rounded bg-muted/60" aria-hidden />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card overflow-hidden shadow-sm"
              aria-hidden
            >
              <div className="aspect-square bg-muted/70" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted/70 rounded w-4/5" />
                <div className="h-3 bg-muted/50 rounded w-3/5" />
                <div className="h-8 bg-muted/60 rounded w-2/5 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
