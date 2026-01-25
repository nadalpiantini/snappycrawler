# 🕷️ Snappy Auto-Crawler - Guía de Uso

## 🚀 Cómo Usar

### 1. **Preparación**
- ✅ Asegúrate que el servidor esté corriendo: `http://localhost:3000`
- ✅ Recarga la extensión en `chrome://extensions/` (botón 🔄)
- ✅ Ve a cualquier página web (ej: https://google.com)

### 2. **Abrir el Crawler**
- Click en el icono de Snappy 📸 en la barra de herramientas
- Se abrirá el popup del **Crawler**

### 3. **Configurar**
- **Domain to crawl**: Escribe `yamdu.com` (o cualquier dominio)
- **Max pages**: 50 (o más, máximo recomendado: 100)
- **Same domain only**: ✅ Marcado (solo páginas del mismo sitio)
- **Save to Snappy DB**: ✅ Marcado (guarda en Supabase automáticamente)
- **Download JSON files**: Opcional (descarga archivos JSON localesmente)

### 4. **Iniciar Crawling**
- Click **"▶️ Start Crawling"**
- El crawler automáticamente:
  1. Navega a la primera página
  2. Captura el snapshot
  3. Extrae todos los links
  4. Filtra links del mismo dominio
  5. Los agrega a la cola
  6. Repite con cada link de la cola
  7. Guarda todo en Snappy DB

### 5. **Monitorear Progreso**
Vas a ver en tiempo real:
- **Status**: Página actual crawling
- **Pages**: X / Y (capturadas / total en cola)
- **Success**: Pexitosas
- **Errors**: Fallidas
- **Log**: Activity log detallado
- **Progress bar**: Porcentaje completado

### 6. **Detener (Opcional)**
- Click **"⏹️ Stop"** si quieres detener el crawl
- Procesará páginas hasta terminar la actual

## 📊 Después del Crawling

### Ver Snapshots en la App
1. Ve a `http://localhost:3000`
2. Los snapshots capturados están automáticamente en la base de datos
3. Puedes verlos en el Snapshot Viewer

### Archivos Descargados (Opcional)
Si activaste "Download JSON files":
- Encuéntralos en `~/Downloads/`
- Formato: `snappy-[domain]-[timestamp].json`

## ⚙️ Configuraciones Recomendadas

### Para Sitios Pequeños (<50 páginas)
- Max pages: 50
- Same domain: ✅
- Save to DB: ✅
- Download files: ❌ (no necesitas)

### Para Sitios Grandes (100+ páginas)
- Max pages: 100-200
- Same domain: ✅
- Save to DB: ✅
- Download files: ❌
- **ADVERTENCIA**: Tardará más tiempo

### Para Auditoría Completa
- Max pages: 500
- Same domain: ✅
- Save to DB: ✅
- Download files: ✅ (respaldo local)

## 🎯 Ejemplo: Auditando yamdu.com

```
1. Extension → Click icon 📸
2. Domain: "yamdu.com"
3. Max pages: 100
4. ✅ Save to DB
5. Click "Start Crawling"
6. Espera...
7. Resultado: 100 páginas capturadas y guardadas en Snappy DB
8. Ve a localhost:3000 para ver los snapshots
```

## ⚠️ Limitaciones

- **Rate Limiting**: 1 segundo entre páginas (no DDOSear servidores)
- **Memory**: Extensiones tienen límites de memoria
- **Timeouts**: Páginas lentas pueden fallar
- **JavaScript**: Apps complejas (React, SPA) pueden no capturar 100%

## 🐛 Troubleshooting

**Error "Cannot access chrome://"**
- ❌ No uses el crawler en `chrome://extensions/`
- ✅ Ve a un sitio web normal primero (google.com, etc.)

**Progreso se detiene**
- Revisa el log para ver errores
- Algunas páginas pueden bloquear bots
- Reduce "Max pages" si hay muchos errores

**No se guardan en DB**
- Verifica que `http://localhost:3000` esté corriendo
- Revisa la consola (F12) para errores de API

## 🎉 ¡Listo!

El crawler hará todo el trabajo automáticamente. Solo:
1. Configura
2. Start
3. Espera
4. Revisa snapshots en localhost:3000
