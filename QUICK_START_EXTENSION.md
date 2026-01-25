# ⚡ Quick Start - Snappy Extension

## 🚀 Uso Rápido (3 pasos)

### 1. Asegura que el servidor esté corriendo
```bash
cd /Users/nadalpiantini/Dev/snappy-platform
pnpm dev
# Servidor en http://localhost:3001
```

### 2. Ve a cualquier sitio web
Ejemplo: `https://yamdu.com`

### 3. Haz clic en el ícono de Snappy 🕷️
- El dominio se auto-completa
- Configura: Max pages (empieza con 10-20)
- Marca "Save to Snappy DB"
- Haz clic en "▶️ Start Crawling"
- ¡Listo! El crawler hace todo solo

---

## 📊 Ver Resultados

### En la Web App
```
http://localhost:3001
```
Verás todos los snapshots capturados

### En Supabase
```sql
SELECT COUNT(*) FROM snappy_snapshots;
```

---

## 🎯 Ejemplos de Uso

### Auditar un sitio completo
```
Domain: yamdu.com
Max pages: 50
Same domain: ✅
Save to DB: ✅
```

### Solo exportar archivos JSON
```
Domain: example.com
Max pages: 10
Save to DB: ⬜
Download files: ✅
```

### Test rápido (5 páginas)
```
Domain: cualquier-site.com
Max pages: 5
Same domain: ✅
```

---

## ⚠️ Importante

- **1 segundo de delay** entre páginas (respeta servidores)
- **Same domain only** evita irse a otros sitios
- **Stop button** para detener en cualquier momento
- **Max 500 páginas** por crawl

---

**📖 Guía completa**: `TEST_EXTENSION.md`
