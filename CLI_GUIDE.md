# 🖥️ Snappy CLI - Terminal Control

Comandos de terminal para automatizar Snappy desde la consola.

## 🚀 Instalación Completa

```bash
# Ya instalado con:
pnpm install
```

## 📋 Comandos Disponibles

### 1. **Crawl** - Crawlear un sitio completo
```bash
pnpm snappy crawl yamdu.com
pnpm snappy crawl yamdu.com --max-pages=100
```
**Qué hace:**
- Descubre automáticamente todas las páginas
- Navega por cada una
- Captura snapshots
- Guarda en Snappy DB automáticamente
- Filtra mismo dominio

**Opciones:**
- `--max-pages <n>`: Máximo de páginas (default: 50)
- `--same-domain`: Solo mismo dominio (default: true)
- `--headless`: Sin interfaz gráfica (default: false)

---

### 2. **Audit** - Auditar una página y generar reporte
```bash
pnpm snappy audit https://yamdu.com
```
**Qué hace:**
- Analiza estructura de la página
- Extrae todos los botones, links, forms
- Cuenta elementos
- Genera reporte detallado
- Guarda en Snappy DB
- Muestra estadísticas en consola

**Reporte incluye:**
- ✅ Título, descripción, keywords
- ✅ Número de botones, links, forms
- ✅ Imágenes, headings
- ✅ Links externos
- ✅ Estructura completa

---

### 3. **Test Buttons** - Probar funcionalidad de botones
```bash
pnpm snappy test-buttons https://yamdu.com
pnpm snappy test-buttons https://yamdu.com --all
```
**Qué hace:**
- Encuentra todos los botones de la página
- Click en cada uno automáticamente
- Verifica que funcionen
- Detecta alerts
- Genera reporte de éxito/fracaso
- Guarda resultados en Snappy DB

**Opciones:**
- `--all`: Probar TODOS los botones (default: primeros 20)
- `--interactive`: Modo interactivo (ve el navegador)

**Ejemplo de output:**
```
✅ "Contact" - Working
✅ "Submit" - Opens alert
❌ "Download" - Failed: Timeout
Success Rate: 66%
```

---

### 4. **Export** - Exportar página a JSON
```bash
pnpm snappy export https://yamdu.com
pnpm snappy export https://yamdu.com --output=./snapshot.json
```
**Qué hace:**
- Captura snapshot completo
- Guarda en Snappy DB
- Opcionalmente exporta a archivo local

---

## 🎯 Ejemplos de Uso

### Auditoría Completa de yamdu.com
```bash
# 1. Inicia servidor
pnpm dev

# 2. En otra terminal, ejecuta crawl
pnpm snappy crawl yamdu.com --max-pages=100

# 3. Ver resultados en http://localhost:3000
```

### Prueba Automatizada de Botones
```bash
# Test los primeros 20 botones
pnpm snappy test-buttons yamdu.com

# Test TODOS los botones (lento pero completo)
pnpm snappy test-buttons yamdu.com --all
```

### Auditoría Rápida
```bash
# Auditar y ver reporte en consola
pnpm snappy audit yamdu.com

# Exportar snapshot local
pnpm snappy export yamdu.com --output=./snapshot.json
```

---

## 📊 Ver Resultados

### En Terminal
Verás output colorido en tiempo real:
- 🟢 Progreso y éxito
- 🔴 Errores
- 🟡 Advertencias
- 📊 Estadísticas finales

### En Web App
http://localhost:3000
- Todos los snapshots capturados están guardados
- Snapshots organizados por fecha
- Viewer con búsqueda y filtros

---

## 🔧 Configuración

### Variables de Entorno
El CLI se conecta a:
- **API**: `http://localhost:3000/api/snapshot`
- **Database**: Supabase (configurado en .env.local)

### Rate Limiting
- 1 segundo entre páginas (respeta servidores)
- Timeouts de 10 segundos por página
- Máximo 500 páginas por crawl

---

## 🐛 Troubleshooting

**Error "Cannot find module 'cli.ts'"**
```bash
# Asegúrate estar en la raíz del proyecto
cd /Users/nadalpiantini/Dev/snappy-platform
```

**Error "ECONNREFUSED"**
```bash
# El servidor Next.js debe estar corriendo
pnpm dev
```

**Playwright no descarga chromium**
```bash
# Instalar playwright browsers manualmente
npx playwright install chromium
```

---

## 💡 Tips

- **Start pequeño**: Prueba con 5-10 páginas primero
- **Modo headless**: Usa `--headless` para producción (sin UI)
- **Background jobs**: Usa `nohup` para largos crawls
- **Logs**: Revisa `snappy.log` para debugging

---

## 🎉 ¡Listo para usar!

```bash
# Ejemplo: Audit completa de yamdu.com
pnpm snappy audit yamdu.com

# Ejemplo: Crawl automático
pnpm snappy crawl yamdu.com --max-pages=50

# Ejemplo: Test de botones
pnpm snappy test-buttons yamdu.com
```
