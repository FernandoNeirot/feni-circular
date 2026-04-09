# Integración API Correo Argentino

## 📋 Requisitos Previos

### 1. Obtener Credenciales

Para usar la API del Correo Argentino, necesitas:

1. **Registrarte como Comercio/PYME:**
   - Ir a: https://sistemas.correoargentino.com.ar/
   - Registrarse o iniciar sesión con cuenta existente

2. **Solicitar Acceso a API:**
   - Contactar a: integraciones@correoargentino.com.ar
   - Solicitar credenciales para Tiendas Online/E-commerce
   - Proporcionar:
     - Nombre del comercio
     - CUIT/CUIL
     - URL del sitio web
     - Volumen estimado de envíos

3. **Variables de Entorno Requeridas:**
   ```env
   # .env.local
   CORREO_ARGENTINO_API_KEY=tu_api_key
   CORREO_ARGENTINO_API_SECRET=tu_secret
   CORREO_ARGENTINO_USER_ID=tu_user_id
   CORREO_ARGENTINO_BASE_URL=https://tintegraciones.correoargentino.com.ar/apis
   ```

## 🔌 Endpoints de la API

La API del Correo Argentino proporciona:

### 1. **Validar Dirección**

```
POST /direcciones/validar
Body: {
  calle: string,
  numero: number,
  piso?: string,
  departamento?: string,
  localidad: string,
  provincia: string,
  codigoPostal: string
}
Response: {
  valida: boolean,
  codigoPostal: string,
  zona: number
}
```

### 2. **Calcular Tarifa**

```
POST /precios/calcular
Body: {
  codePostalOrigin: string,
  codePostalDestination: string,
  peso: number (en kg),
  servicio: "clásico" | "express" | "premium"
}
Response: {
  tarifa: number,
  plazoEntrega: number (días),
  servicio: string
}
```

### 3. **Crear Envío**

```
POST /envios/crear
Body: {
  destinatario: {
    nombre: string,
    email: string,
    telefono: string,
    direccion: {
      calle: string,
      numero: number,
      localidad: string,
      provincia: string,
      codigoPostal: string
    }
  },
  contenido: {
    descripcion: string,
    peso: number,
    valor: number
  },
  servicio: string
}
Response: {
  numeroEnvio: string,
  codigoSegimiento: string,
  etiqueta: string (URL PDF)
}
```

### 4. **Trackear Envío**

```
GET /envios/track/{numeroEnvio}
Response: {
  estado: string,
  ubicacion: string,
  fechaActualizacion: date,
  detalles: array
}
```

## 🛠️ Estructura de Implementación

Se crearán los siguientes archivos:

```
app/
└── api/
    └── shipping/
        ├── validate-address/
        │   └── route.ts          # Validar dirección
        ├── calculate-shipping/
        │   └── route.ts          # Calcular costo de envío
        ├── create-shipment/
        │   └── route.ts          # Crear envío
        └── track/
            └── route.ts          # Trackear envío

shared/
├── configs/
│   └── correo-argentino.ts      # Configuración y cliente API
├── types/
│   └── shipping.ts              # Tipos para envíos
└── queries/
    └── shipping.ts              # Funciones de consulta
```

## 🔧 Archivos Creados

### Configuración

- `shared/configs/correo-argentino.ts` - Cliente API y configuración

### Tipos

- `shared/types/shipping.ts` - Interfaces TypeScript para envíos

### API Endpoints

- `app/api/shipping/validate-address/route.ts` - Validar dirección
- `app/api/shipping/calculate-shipping/route.ts` - Calcular costos
- `app/api/shipping/create-shipment/route.ts` - Crear envío
- `app/api/shipping/track/[shipmentNumber]/route.ts` - Rastrear envío

### Queries (Cliente)

- `shared/queries/shipping.ts` - Funciones para consumir APIs desde cliente

### Componentes

- `shared/components/AddressForm.tsx` - Formulario para ingresar dirección
- `shared/components/ShippingOptions.tsx` - Mostrar y seleccionar opciones de envío

## 📋 Pasos para Implementar

### 1. Obtener Credenciales

```bash
# Contacta a: integraciones@correoargentino.com.ar
# Proporciona:
# - Nombre del comercio
# - CUIT/CUIL
# - URL del sitio
# - Volumen estimado de envíos
```

### 2. Configurar Variables de Entorno

Crear archivo `.env.local`:

```env
CORREO_ARGENTINO_API_KEY=tu_api_key_aqui
CORREO_ARGENTINO_API_SECRET=tu_secret_aqui
CORREO_ARGENTINO_USER_ID=tu_user_id_aqui
CORREO_ARGENTINO_BASE_URL=https://tintegraciones.correoargentino.com.ar/apis
```

### 3. Integrar en Checkout (Opción A: Antes de WhatsApp)

```tsx
// En tu página de checkout o cart component
import { AddressForm } from "@/shared/components/AddressForm";
import { ShippingOptions } from "@/shared/components/ShippingOptions";
import type { Address, ShippingOption } from "@/shared/types/shipping";

export function CheckoutPage() {
  const [address, setAddress] = useState<Address | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

  return (
    <div className="space-y-6">
      <AddressForm
        onAddressValidated={setAddress}
        onShippingOptionsCalculated={setShippingOptions}
      />

      {shippingOptions.length > 0 && (
        <ShippingOptions options={shippingOptions} onSelectOption={setSelectedShipping} />
      )}

      {address && selectedShipping && (
        <button
          onClick={() => {
            // Ir a WhatsApp con dirección y costo de envío
            handleCheckoutWithShipping(address, selectedShipping);
          }}
        >
          Continuar con WhatsApp
        </button>
      )}
    </div>
  );
}
```

### 4. Usar desde Server Actions (Opcional)

```tsx
// En shared/serverActions/shipping.ts
"use server";

import { createShipment } from "@/shared/queries/shipping";
import type { CreateShipmentRequest } from "@/shared/types/shipping";

export async function createShipmentFromOrder(orderData: CreateShipmentRequest) {
  try {
    const result = await createShipment(orderData);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
```

### 5. Rastrear Envío (Adicional)

```tsx
// Cliente puede rastrear su envío
import { trackShipment } from "@/shared/queries/shipping";

async function handleTrack(shipmentNumber: string) {
  try {
    const status = await trackShipment(shipmentNumber);
    console.log("Estado:", status.status);
    console.log("Ubicación:", status.location);
  } catch (error) {
    console.error("Error rastreando:", error);
  }
}
```

## ✅ Flujo Completo Sugerido

1. **Usuario selecciona productos** → Los agrega al carrito
2. **Va a checkout** → Ve opción "Con envío" o "Retirar"
3. **Si elige envío**:
   - Ingresa dirección
   - Sistema valida dirección
   - Calcula opciones de envío
   - Usuario selecciona opción
4. **Confirma pedido**:
   - Se crea envío en Correo Argentino
   - Recibe número de seguimiento
   - Envía detalles a WhatsApp O email
5. **Cliente puede rastrear** desde el email/WhatsApp

## 🧪 Testear Localmente

```bash
# 1. Asegúrate de tener variables de entorno configuradas
# 2. Corre dev server
npm run dev

# 3. Abre http://localhost:3000 y prueba AddressForm
# 4. Valida dirección de ejemplo: Acoyte 1234, CABA, Buenos Aires, 1402

# 5. Revisa logs en consola para debugging
```

## 🔒 Seguridad

- ✅ Credenciales en `.env.local` (no versionadas)
- ✅ Llamadas a Correo Argentino desde servidor (API routes)
- ✅ Cliente usa fetch a endpoints propios
- ✅ Headers con autenticación en server

## 📞 Soporte

- Documentación API: https://tintegraciones.correoargentino.com.ar/apis
- Email: integraciones@correoargentino.com.ar
- Telefono: Consultar con tu cuenta
