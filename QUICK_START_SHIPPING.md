# Guía de Integración Correo Argentino - Resumen Rápido

## 📦 Qué se implementó

### API del Correo Argentino ✅

- Validar direcciones
- Calcular costos de envío
- Crear envíos y obtener etiquetas
- Rastrear paquetes

### Componentes React ✅

- `AddressForm` - Ingresa y valida dirección
- `ShippingOptions` - Selecciona opción de envío
- `EXAMPLE_CHECKOUT_WITH_SHIPPING` - Ejemplo completo

## 🔌 Arquitectura

```
Cliente (React)
    ↓
AddressForm / ShippingOptions (componentes)
    ↓
shared/queries/shipping.ts (fetch functions)
    ↓
app/api/shipping/** (Next.js API routes)
    ↓
shared/configs/correo-argentino.ts (cliente HTTP)
    ↓
API Correo Argentino
```

## 🚀 Pasos para Activar

### 1️⃣ Obtener Credenciales

```
Escribi a: integraciones@correoargentino.com.ar

Necesitas:
- CORREO_ARGENTINO_API_KEY
- CORREO_ARGENTINO_API_SECRET
- CORREO_ARGENTINO_USER_ID
```

### 2️⃣ Configuración (.env.local)

```env
CORREO_ARGENTINO_API_KEY=xxx
CORREO_ARGENTINO_API_SECRET=xxx
CORREO_ARGENTINO_USER_ID=xxx
CORREO_ARGENTINO_BASE_URL=https://tintegraciones.correoargentino.com.ar/apis
```

### 3️⃣ Reemplazar tu Checkout

Copia la estructura de `EXAMPLE_CHECKOUT_WITH_SHIPPING.tsx` a tu página de checkout actual.

Cambios mínimos:

```tsx
// Antes: solo carrito + WhatsApp
<Cart />
<Button onClick={checkout}>Ir a WhatsApp</Button>

// Después: agregar dirección y envío
<Cart />
<AddressForm ... />
<ShippingOptions ... />
<Button onClick={handleCheckoutWithShipping}>Ir a WhatsApp</Button>
```

## 📁 Archivos Principales

| Archivo                                            | Propósito                           |
| -------------------------------------------------- | ----------------------------------- |
| `shared/configs/correo-argentino.ts`               | Cliente HTTP (credenciales + fetch) |
| `shared/types/shipping.ts`                         | Interfaces TypeScript               |
| `app/api/shipping/validate-address/route.ts`       | Validar dirección                   |
| `app/api/shipping/calculate-shipping/route.ts`     | Calcular envío                      |
| `app/api/shipping/create-shipment/route.ts`        | Crear envío                         |
| `app/api/shipping/track/[shipmentNumber]/route.ts` | Rastrear                            |
| `shared/queries/shipping.ts`                       | Funciones cliente                   |
| `shared/components/AddressForm.tsx`                | Formulario dirección                |
| `shared/components/ShippingOptions.tsx`            | Opciones envío                      |

## 💡 Flujo de Usuario

```
1. Usuario agrega productos al carrito
   ↓
2. Va a checkout
   ↓
3. Elige "Envío a domicilio"
   ↓
4. Ingresa dirección
   ↓
5. Sistema valida dirección ✓
   ↓
6. Calcula opciones de envío
   ↓
7. Usuario selecciona opción
   ↓
8. Confirma y va a WhatsApp
   ↓
9. Mensaje incluye dirección + costo envío + total
```

## 🔒 Seguridad

- ✅ API claves en server (`.env.local`)
- ✅ No se exponen en cliente
- ✅ Validación en servidor
- ✅ HTTPS con Correo Argentino

## 🧪 Testear

```bash
# 1. Configura .env.local
# 2. npm run dev
# 3. Ingresa dirección de prueba:
#    - Calle: Acoyte
#    - Número: 1234
#    - Ciudad: CABA
#    - Provincia: Buenos Aires
#    - CP: 1402
```

## 📞 Contacto Correo Argentino

- API Base: https://tintegraciones.correoargentino.com.ar/apis
- Email soporte: integraciones@correoargentino.com.ar
- Para problemas de API: revisar logs en console

## ✅ Checklist para Implementación

- [ ] Solicitar credenciales a Correo Argentino
- [ ] Configurar variables de entorno
- [ ] Integrar AddressForm en página de checkout
- [ ] Integrar ShippingOptions en página de checkout
- [ ] Conectar lógica de WhatsApp con envío
- [ ] Testear con dirección de prueba
- [ ] Documentar para equipo
- [ ] Deploy a producción
