# Cart Validation - Documentación de los Cambios

## Descripción

Se implementó un sistema de validación automática del carrito que:

- ✅ Detecta productos que ya no existen o fueron vendidos
- ✅ Los elimina automáticamente del carrito
- ✅ Notifica al usuario con un toast cuando se removieron productos
- ✅ Valida al cargar y cada vez que el usuario vuelve a la ventana

## Cambios Realizados

### 1. **cart-provider.tsx** - Validación al hidratar

Se agregó función `validateCartItems()` que:

- Obtiene todos los productos de la API (`/api/productos`)
- Filtra los que están disponibles (no `soldOut`)
- Remueve del carrito los que no existen o están vendidos
- Muestra un toast informando al usuario

Se agregó un nuevo `useEffect` que:

- Se ejecuta cuando el carrito se carga desde storage
- Valida automáticamente los items
- Actualiza el estado local del carrito

### 2. **useValidateCart.ts** - Hook personalizado

Nuevo hook que se puede usar en componentes para:

- Validar el carrito cuando se carga el componente
- Re-validar automáticamente cuando el usuario vuelve del focus (minimizó y vuelve a la app)
- Remover productos inválidos durante la sesión

## Cómo Usar

### Opción 1: Validación Automática (Recomendado)

La validación ocurre automáticamente cuando:

- Se carga la aplicación (al hidratar desde storage)
- El usuario vuelve a la ventana después de minimizarla

### Opción 2: Validación Manual en un Componente

```tsx
"use client";

import { useValidateCart } from "@/shared/hooks/useValidateCart";

export function MyComponent() {
  // Valida el carrito cuando se monta el componente
  useValidateCart();

  return <div>Mi componente</div>;
}
```

### Dónde Agregar el Hook

Puedes usarlo en:

- `(home)/page.client.tsx` - Punto de entrada principal
- `Layout.tsx` - Para validar en cada navegación
- Cualquier página importante donde quieras forzar validación

## Flujo de Validación

```
1. Usuario abre la app
   ↓
2. CartProvider carga desde localStorage
   ↓
3. Se ejecuta validación automática
   ↓
4. Se comparan productos del carrito con la API
   ↓
5. Se eliminan los no disponibles
   ↓
6. Toast notifica al usuario si hubo cambios
   ↓
7. Si el usuario vuelve a la ventana (focus event)
   ↓
8. Se re-valida el carrito nuevamente
```

## Ejemplos de Casos Manejados

✅ Producto no existe en la base de datos
✅ Producto fue vendido (soldOut = true)
✅ Múltiples productos inválidos se removieron juntos
✅ Error en la API retorna el carrito sin cambios

## Notas

- La validación usa `fetch`, por lo que requiere conexión
- Si la API no responde, el carrito se mantiene sin cambios
- Los errores se loguean en consola para debugging
- El toast muestra los nombres de los productos removidos
