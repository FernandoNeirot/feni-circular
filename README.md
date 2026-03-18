# FENI Circular

E-commerce de ropa infantil circular (segunda vida). Next.js (App Router), React Query, Firebase/Firestore, Zod, react-hook-form.

## Arquitectura

El proyecto está organizado por **funcionalidades** y principios de **clean code**:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Estructura de carpetas, capas, flujos de datos, testing y convenciones.
- **`app/`** — Rutas (Next.js App Router): landing, buscar, producto, admin, API.
- **`features/`** — Lógica por feature: products, cart, favorites, auth, admin (schemas Zod, formularios).
- **`shared/`** — Código transversal: components (ui), lib, configs, types, hooks, queries, serverActions.

Ver [features/README.md](./features/README.md) para el uso de cada feature.

## Scripts

| Comando           | Descripción                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Servidor de desarrollo         |
| `npm run build`   | Build de producción            |
| `npm run start`   | Servidor de producción         |
| `npm run lint`    | ESLint                         |
| `npm run format`  | Prettier (escribir)            |
| `npm run format:check` | Prettier (solo verificar) |
| `npm run test`    | Tests (Jest + React Testing Library) |
| `npm run test:watch` | Tests en modo watch         |
| `npm run test:coverage` | Tests con cobertura        |
| `npm run test:api` | Tests de API routes (entorno node) |

## Getting Started

1. Instalar dependencias:

```bash
npm install
```

2. Configurar variables de entorno (Firebase, etc.) según el proyecto.

3. Arrancar el servidor de desarrollo:

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Testing

Tests unitarios y de integración para la parte admin y API (Jest, React Testing Library). Detalle en [ARCHITECTURE.md](./ARCHITECTURE.md#3-testing).

## Deploy

Para desplegar en Vercel u otra plataforma, ver la [documentación de despliegue de Next.js](https://nextjs.org/docs/app/building-your-application/deploying).
