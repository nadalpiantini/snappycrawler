# 🧪 Guía de Prueba - Snappy Extension Crawler

## 📋 Pre-requisitos

Antes de empezar, verifica que tengas todo corriendo:

1. ✅ **Servidor Next.js corriendo** en `http://localhost:3001`
   ```bash
   cd /Users/nadalpiantini/Dev/snappy-platform
   pnpm dev
   ```

2. ✅ **Extensión de Chrome cargada**
   - Ve a `chrome://extensions/`
   - Verifica que "Snappy - Page Snapshot Exporter" esté activada

3. ✅ **Base de datos Supabase conectada**
   - Las tablas `snappy_snapshots` y `snappy_normalized_snapshots` existen

---

## 🚀 TEST 1: Crawl Simple (5 páginas)

**Objetivo**: Verificar que la extensión puede crawlear un sitio pequeño y guardar en la DB.

### Pasos:

1. **Abre una nueva pestaña** y navega a `https://example.com`

2. **Haz clic en el ícono de Snappy** en la barra de extensiones
   - Deberías ver el popup "🕷️ Snappy Crawler" con fondo morado

3. **Verifica que el dominio esté pre-llenado**
   - El campo "Domain to crawl" debería decir `example.com`

4. **Configura las opciones:**
   - ✅ Max pages: `5` (cámbialo de 50 a 5)
   - ✅ Same domain only: **marcado**
   - ✅ Save to Snappy DB: **marcado**
   - ⬜ Download JSON files: **sin marcar** (no necesitamos descargar archivos)

5. **Haz clic en "▶️ Start Crawling"**

6. **Observa el progreso:**
   - El botón cambia a "⏹️ Stop"
   - La barra de progreso debería aparecer
   - Los contadores deberían aumentar:
     - Pages: `0 / X` → `1 / X` → `2 / X` ...
     - Success: debería aumentar
     - Errors: debería quedarse en 0
   - El log debería mostrar:
     ```
     [10:30:15] 🚀 Starting crawl: https://example.com
     [10:30:15] 📊 Max pages: 5
     [10:30:18] ✅ Saved to DB: https://example.com
     [10:30:20] ✅ Saved to DB: https://example.com/otra-pagina
     ...
     ```

7. **Cuando termine**, deberías ver:
   - Status: `Complete!`
   - Log final: `✅ Crawl complete! Captured N pages`
   - Botón "▶️ Start Crawling" vuelve a aparecer

---

## ✅ Verificación - TEST 1

### 1. Verifica en la Base de Datos

```sql
-- Ve a Supabase SQL Editor y ejecuta:
SELECT
  id,
  url,
  title,
  created_at
FROM snappy_snapshots
ORDER BY created_at DESC
LIMIT 10;
```

**Deberías ver**: 3-5 filas nuevas con URLs de example.com

### 2. Verifica en la Web App

1. Ve a `http://localhost:3001`
2. Deberías ver los snapshots capturados en el viewer
3. Haz clic en cualquiera para ver el contenido completo

---

## 🚨 TEST 2: Manejo de Errores

**Objetivo**: Verificar que la extensión maneja errores correctamente.

### Pasos:

1. **Abre una nueva pestaña** y navega a cualquier sitio

2. **Abre el popup de Snappy**

3. **Entra un dominio inválido**:
   - Domain: `not-a-real-domain-12345.com`
   - Max pages: `3`
   - Save to DB: **marcado**

4. **Haz clic en "▶️ Start Crawling"**

5. **Deberías ver**:
   - Status: `Crawling: not-a-real-domain-12345.com...`
   - Log: `❌ Failed: ...`
   - Errors counter: `1`
   - El crawler continúa intentando o muestra error de navegación

---

## 🚀 TEST 3: Crawl Completo (yamdu.com)

**Objetivo**: Crawlear un sitio real con múltiples páginas.

### Pasos:

1. **Abre una nueva pestaña** y navega a `https://yamdu.com`

2. **Abre el popup de Snappy**

3. **Configura:**
   - Domain: `yamdu.com` (debería estar pre-llenado)
   - Max pages: `20` (empezamos con 20, no 50)
   - Same domain only: **marcado**
   - Save to Snappy DB: **marcado**
   - Download JSON files: **sin marcar**

4. **Haz clic en "▶️ Start Crawling"**

5. **Observa el progreso:**
   - El crawler debería:
     - Navegar a cada página automáticamente
     - Extraer links de cada página
     - Agregar nuevos links a la cola
     - Ir saltando entre pestañas/URLs
   - La pestaña del navegador debería ir cambiando de página

6. **Déjalo correr** hasta que:
   - Llegue a 20 páginas capturadas, O
   - Se quede sin nuevas páginas para visitar

---

## ✅ Verificación - TEST 3

### 1. Revisa la DB

```sql
-- Cuenta cuántos snapshots se crearon
SELECT COUNT(*) as total_snapshots
FROM snappy_snapshots
WHERE url LIKE '%yamdu.com%';

-- Ve los URLs únicos capturados
SELECT DISTINCT url
FROM snappy_snapshots
WHERE url LIKE '%yamdu.com%'
ORDER BY url;
```

**Deberías ver**: 20 o menos URLs diferentes de yamdu.com

### 2. Revisa el contenido

```sql
-- Mira el título y contenido de un snapshot
SELECT
  title,
  raw_data->'meta'->>'timestamp' as captured_at,
  jsonb_array_length(raw_data->'text') as text_elements_count
FROM snappy_snapshots
WHERE url LIKE '%yamdu.com%'
ORDER BY created_at DESC
LIMIT 1;
```

### 3. Verifica normalización

```sql
-- Revisa si la normalización funcionó
SELECT
  ns.normalized_data->>'description' as description,
  jsonb_array_length(ns.normalized_data->'headings') as headings_count,
  jsonb_array_length(ns.normalized_data->'links') as links_count,
  jsonb_array_length(ns.normalized_data->'images') as images_count
FROM snappy_normalized_snapshots ns
JOIN snappy_snapshots s ON s.id = ns.snapshot_id
WHERE s.url LIKE '%yamdu.com%'
LIMIT 1;
```

---

## 🎯 TEST 4: Stop Button

**Objetivo**: Verificar que puedes detener el crawler manualmente.

### Pasos:

1. **Inicia un crawl** con max pages: `50`

2. **Después de 2-3 páginas**, haz clic en "⏹️ Stop"

3. **Deberías ver**:
   - Status: `Stopped by user`
   - Log: `⏹️ Crawl stopped by user`
   - El crawler deja de visitar nuevas páginas
   - Buttons vuelve a "▶️ Start Crawling"

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"
**Causa**: El servidor Next.js no está corriendo
**Solución**:
```bash
cd /Users/nadalpiantini/Dev/snappy-platform
pnpm dev
```

### Error: "API error: 500"
**Causa**: Error del servidor o de Supabase
**Solución**:
1. Revisa la terminal donde corre `pnpm dev`
2. Busca errores en los logs
3. Verifica que `.env.local` tenga las credenciales correctas

### No se guarda nada en la DB
**Causa**: RLS policies bloqueando inserts anónimos
**Solución**:
```sql
-- Ejecuta en Supabase SQL Editor:
ALTER TABLE snappy_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous inserts" ON snappy_snapshots;
CREATE POLICY "Allow anonymous inserts"
ON snappy_snapshots
FOR INSERT
WITH CHECK (true);
```

### El crawler se queda trabado
**Causa**: Página con JavaScript infinito o muy lenta
**Solución**:
1. Haz clic en "⏹️ Stop"
2. Prueba con max pages más pequeño (5-10)
3. Aumenta el delay en `crawler.js` línea 333 (cambia 1000 a 2000)

---

## 📊 Resultados Esperados

Después de todos los tests, deberías tener:

- ✅ **20+ snapshots** en `snappy_snapshots`
- ✅ **20+ normalized snapshots** en `snappy_normalized_snapshots`
- ✅ **Web app funcionando** en `http://localhost:3001`
- ✅ **Extensión funcionando** sin errores

---

## 🎉 ¡Éxito!

Si todo funciona correctamente, ahora tienes:
1. **Crawler automatizado** que descubre y captura páginas
2. **Base de datos** con snapshots estructurados
3. **Web app** para ver y analizar los resultados
4. **Sistema completo** para auditoría web

---

## 📝 Notas

- El crawler usa **1 segundo de delay** entre páginas para ser amable con los servidores
- **Same domain only** evita que el crawler se vaya a otros sitios
- Los **UX events** se capturan automáticamente (clicks, form submits)
- La **normalización** extrae headings, links, images, y forms automáticamente

---

**¡Listo para probar!** 🚀
