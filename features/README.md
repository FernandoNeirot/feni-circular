# Features (arquitectura por funcionalidad)

Cada carpeta agrupa la **lógica de una capacidad** de la app. Las páginas en `app/` importan desde aquí o desde `shared/`.

## Estructura

| Feature     | Contenido |
|------------|-----------|
| **products** | Queries (React Query), ProductCard, ProductGrid |
| **cart**     | CartProvider, useCart, Cart |
| **favorites**| FavoritesProvider, useFavorites |
| **auth**     | loginWithEmailPassword, logout (server actions) |
| **admin**    | Schemas de formularios (Zod), lógica de admin |

## Uso

```ts
// En lugar de importar desde rutas profundas de shared:
import { productsQueryOptions } from "@/features/products";
import { useCart, Cart } from "@/features/cart";
import { useFavorites } from "@/features/favorites";
import { productFormSchema } from "@/features/admin";
```

## Reglas

- Un feature **no** importa de otro feature.
- Código compartido entre features va en `shared/` (tipos, ui, lib, config, hooks).
- Cada feature expone su API pública en `index.ts`.

Ver [ARCHITECTURE.md](../ARCHITECTURE.md) para la arquitectura completa.
