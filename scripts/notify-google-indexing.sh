#!/bin/bash

# Script para notificar a Google sobre URLs nuevas/actualizadas
# Requiere: gcloud CLI y credenciales de Google Cloud

# URLs a indexar
URLS=(
  "https://fenicircular.com"
  "https://fenicircular.com/buscar"
  "https://fenicircular.com/como-funciona"
  "https://fenicircular.com/vender"
  "https://fenicircular.com/faq"
)

# Endpoint de Google Indexing API
API_ENDPOINT="https://indexing.googleapis.com/batch"

echo "🔔 Notificando a Google sobre nuevas URLs..."

for url in "${URLS[@]}"; do
  echo "📝 Procesando: $url"
  
  curl -X POST \
    "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "{
      'url': '$url',
      'type': 'URL_UPDATED'
    }" \
    -H "Authorization: Bearer $(gcloud auth print-access-token)"
done

echo "✅ Notificación completada"
echo ""
echo "ℹ️  Verifica el progreso en:"
echo "   https://search.google.com/search-console"
