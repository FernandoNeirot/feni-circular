# 📊 Guía de Optimización SEO - Feni Circular

## ✅ Cambios Implementados

### 1. **Archivos de Configuración para Motores de Búsqueda**

✓ `robots.txt` - Instrucciones para crawlers (Google, Bing, LLMs)
✓ `sitemap.ts` - Mapa de sitio dinámico
✓ `llm.txt` - Información para LLMs (Gemini, ChatGPT, Claude)
✓ `gpt.txt` - Instrucciones personalizadas para ChatGPT
✓ `.well-known/ai.txt` - Estándar para IA
✓ `manifest.json` - PWA manifest
✓ `schema.json` - JSON-LD estructurado

### 2. **Metadatos Mejorados**

✓ **Layout Principal** (`app/layout.tsx`)

- Title y description optimizados
- Meta tags completos (keywords, robots, etc)
- Open Graph para redes sociales
- JSON-LD schema para buscadores
- Twitter Card

✓ **Página de Búsqueda** (`app/buscar/page.tsx`)

- Title único optimizado
- Description específica
- Canonical URL

✓ **Keywords SEO** (`shared/configs/seo.ts`)

- Palabras clave relevantes por volumen
- Enfoque en "ropa infantil usada Argentina"
- Variaciones de búsqueda comunes

### 3. **Estrategia de Palabras Clave**

Estas palabras clave tienen alto potencial en Argentina:

- "ropa infantil usada"
- "ropa infantil segunda mano"
- "economía circular ropa"
- "feni circular"
- "ropa usada CABA"
- "consignación ropa infantil"

---

## 🚀 Próximos Pasos (MANUAL)

### Paso 1: Google Search Console

```
1. Ir a: https://search.google.com/search-console
2. Agregar propiedad: https://fenicircular.com
3. Verificar propiedad (HTML tag o archivo)
4. Enviar sitemap: https://fenicircular.com/sitemap.xml
5. Monitorear indexación
```

### Paso 2: Google My Business

```
1. Crear cuenta: https://business.google.com
2. Agregar negocio "Feni Circular"
3. Ubicación: CABA, Argentina
4. Categoría: Tienda de ropa / E-commerce
5. Descripción: "Ropa infantil usada de calidad"
6. Contacto: WhatsApp +54 11 3315-0864
```

### Paso 3: Verificar en Google

```
URL para verificar indexación:
site:feni-circular.vercel.app
```

### Paso 4: Solicitar Indexación de Gemini

```
Email a: llm-discovery@google.com
Asunto: "Solicitud de inclusión en Gemini - Feni Circular"

Mensaje:
Hola,

Solicitamos que nuestro sitio sea incluido en Gemini.

- Sitio: https://fenicircular.com
- Archivo LLM: https://fenicircular.com/llm.txt
- Descripción: Plataforma de ropa infantil usada

Gracias.
```

---

## 📝 Archivos de Soporte

| Archivo              | Ubicación                    | Propósito                   |
| -------------------- | ---------------------------- | --------------------------- |
| `robots.txt`         | `/public/robots.txt`         | Instrucciones para crawlers |
| `sitemap.xml/ts`     | `/app/sitemap.ts`            | Mapa dinámico de sitio      |
| `manifest.json`      | `/public/manifest.json`      | PWA & Web App               |
| `llm.txt`            | `/public/llm.txt`            | Para LLMs                   |
| `gpt.txt`            | `/public/gpt.txt`            | Para ChatGPT                |
| `.well-known/ai.txt` | `/public/.well-known/ai.txt` | Estándar IA                 |
| `schema.json`        | `/public/schema.json`        | JSON-LD                     |
| `layout.tsx`         | `/app/layout.tsx`            | Metadata principal          |

---

## 🔍 Pruebas

### Verificar Robots.txt

```
https://fenicircular.com/robots.txt
```

### Verificar Sitemap

```
https://fenicircular.com/sitemap.xml
```

### Verificar JSON-LD

```
Chrome DevTools → Sources → search for "schema"
```

### Probar Open Graph

```
https://www.opengraphcheck.com/
https://fenicircular.com
```

---

## 🎯 Resultados Esperados

Cuando alguien busque:

- ✅ "ropa infantil usada" → Feni debe aparecer
- ✅ "feni circular" → Debe salir primero
- ✅ "comprar ropa niños segunda mano" → Debe incluirse
- ✅ En Gemini → Si pregunta sobre ropa infantil usada, debe aparecer
- ✅ En ChatGPT → Similar comportamiento

---

## ⚠️ Notas Importantes

1. **Google tarda 2-4 semanas** en rastrear e indexar nuevo contenido
2. **Rankings mejoran con:** Links externos, autoridad de dominio, contenido de calidad
3. **LLMs necesitan:** robots.txt correcto + archivos llm.txt presentes
4. **Vercel proporciona:** HTTPS automático, uptime 99.99%, buena velocidad (importante para SEO)

---

## 📞 Recursos

- Google Search Central: https://developers.google.com/search
- Schema.org: https://schema.org/
- Open Graph: https://ogp.me/
- Gemini Indexing: https://support.google.com/gemini

---

**Última actualización:** Abril 2026
