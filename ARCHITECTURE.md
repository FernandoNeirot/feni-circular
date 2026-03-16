# Arquitectura del proyecto — FENI Circular

Proyecto Next.js (App Router) organizado por **funcionalidades** y principios de **clean code**, pensado como base sólida y escalable.

---

## 1. Estructura de carpetas

```
feni-circular/
├── app/                    # Capa de rutas (Next.js App Router)
│   ├── (home)/             # Grupo: landing
│   ├── buscar/             # Búsqueda de productos
│   ├── producto/[id]/      # Detalle de producto
│   ├── admin/              # Panel de administración
│   ├── api/                # API Routes (REST)
│   └── layout.tsx          # Layout raíz
│
├── features/               # Lógica por funcionalidad (feature-based)
│   ├── products/           # Catálogo, listado, detalle
│   ├── cart/               # Carrito de compras
│   ├── favorites/          # Favoritos (likes)
│   ├── auth/               # Autenticación (admin)
│   └── admin/              # Formularios y lógica de admin
│
├── shared/                 # Código transversal (no pertenece a una feature)
│   ├── components/        # Design system (ui/) y componentes compartidos
│   ├── lib/                # Utilidades, helpers
│   ├── configs/            # Configuración (Firebase, SEO, etc.)
│   ├── types/              # Tipos de dominio compartidos
│   ├── hooks/              # Hooks reutilizables entre features
│   ├── queries/            # React Query (claves y opciones, ej. productos)
│   └── serverActions/      # Server actions transversales (productos, imágenes, auth)
│
└── public/
```

---

## 2. Responsabilidades por capa

### `app/` — Solo rutas y composición

- **Páginas**: importan de `features/` y `shared/`, componen UI y enlazan datos.
- **API routes**: reciben requests, delegan en server actions o servicios, devuelven JSON.
- No debe haber lógica de negocio ni estado complejo; solo orquestación.

### `features/` — Lógica por funcionalidad

Cada feature agrupa todo lo que pertenece a una capacidad de la app:

| Feature       | Contiene                                                                          |
| ------------- | --------------------------------------------------------------------------------- |
| **products**  | Reexportaciones/index; queries y componentes de listado en shared (queries/productos, ProductCard, ProductGrid). |
| **cart**      | Provider del carrito, componente Cart, persistencia en localStorage.              |
| **favorites** | Provider de favoritos, persistencia en localStorage.                              |
| **auth**      | Server actions de login/sesión, helpers para rutas protegidas.                    |
| **admin**     | Schemas de formularios (Zod), lógica específica de administración.                |

Reglas:

- Un feature **no** importa de otro feature (evitar acoplamiento).
- Comparten solo lo que está en `shared/` (tipos, ui, lib, config, hooks).
- Cada feature puede exponer un `index.ts` con su API pública.

### `shared/` — Transversal

- **components/**: botones, inputs, dialogs, cards, etc. (design system en `ui/`) y componentes compartidos (Header, ProductGrid, etc.).
- **lib/**: `cn()`, formateos, validaciones genéricas, upload/borrado de imágenes en servidor.
- **configs/**: Firebase (client/admin), SEO, constantes de app.
- **types/**: modelos de dominio (Product, CartItem, etc.) usados en varias features.
- **hooks/**: por ejemplo `useShare`, hooks que usan varias features.
- **queries/**: opciones y claves de React Query (ej. `productsQueryOptions`, `productsQueryKey`).
- **serverActions/**: acciones de servidor transversales: productos (crear, actualizar, eliminar), subida de imágenes, auth.

---

## 3. Flujos de datos

### Lectura de productos (listado / detalle)

```
app/(home) o app/buscar o app/producto/[id]
  → useQuery(productsQueryOptions)  [shared/queries/productos]
  → GET /api/productos (o /api/productos/[id])
  → Firestore (server)
  → JSON → React Query cache → UI (ProductCard, ProductGrid, etc.)
```

### Carrito y favoritos

- Estado en **React context** + **localStorage**.
- Providers en `app/layout.tsx`; componentes y hooks en sus features (`cart`, `favorites`).

### Autenticación (admin)

- Login vía **Firebase Auth**; sesión en cookie/API (`/api/auth/*`).
- Server actions en `features/auth`; rutas protegidas comprueban sesión.

### Escritura (admin: crear/editar producto)

```
app/admin/producto/[id]
  → Form (react-hook-form + schema en features/admin)
  → onSubmit → buildProductFromForm → server actions (uploadProductImage, createProductWithData, updateProduct)
  → Server actions llaman a API (PUT/POST /api/productos) → Firestore
  → setQueryData(productsQueryKey) en éxito
```

---

## 4. Convenciones de código

- **Nombres**: PascalCase componentes, camelCase funciones y variables, kebab-case para rutas y archivos de página.
- **Client/Server**: marcar con `"use client"` solo los componentes que usan hooks, contexto o eventos; el resto puede ser server component.
- **Imports**: usar alias `@/features/*`, `@/shared/*`, `@/*` (según `tsconfig.json`).
- **Tipos**: definir interfaces en `shared/types` cuando se usan en más de una feature; tipos locales dentro del feature.
- **Queries**: React Query en `shared/queries` (clave y opciones exportadas para reutilizar, invalidar o setQueryData).

---

## 5. Dónde agregar código nuevo

| Necesidad                                   | Dónde colocarlo                                      |
| ------------------------------------------- | ---------------------------------------------------- |
| Nueva página o ruta                         | `app/...`                                            |
| Nuevo endpoint REST                         | `app/api/...`                                        |
| Lógica de productos                         | `features/products` / `shared/queries` (queries)     |
| Lógica de carrito                           | `features/cart`                                      |
| Lógica de favoritos                         | `features/favorites`                                 |
| Lógica de auth                              | `features/auth`                                      |
| Formularios/schemas admin                   | `features/admin`                                     |
| Server actions (productos, imágenes, auth)  | `shared/serverActions/`                              |
| Componente reutilizable (botón, card, etc.) | `shared/components/` (design system en `ui/`)        |
| Utilidad o helper                           | `shared/lib`                                         |
| Tipo usado en varias features               | `shared/types`                                       |
| Hook reutilizable                           | `shared/hooks` o dentro del feature si es específico  |

---

## 6. Stack principal

- **Framework**: Next.js (App Router).
- **UI**: React, Tailwind CSS, componentes en `shared/ui`.
- **Estado**: React Query (servidor), Context + localStorage (carrito, favoritos).
- **Backend**: API Routes + Firestore (Firebase Admin en server). Escrituras desde la app vía Server Actions (`shared/serverActions/`) que llaman a la API.
- **Validación**: Zod (schemas en `features/admin` y donde haga falta).
- **Formularios**: react-hook-form + Zod.
