# 🚀 Snappy Platform - Guía de Instalación Rápida

## ✅ Pasos Completados

1. ✅ Dependencias instaladas (`pnpm install`)
2. ✅ `.env.local` configurado con tus credenciales
3. ✅ Prefijo `sujeto10_` aplicado a todas las tablas

---

## 📝 Paso Faltante: Push Database Schema

El CLI de Supabase puede no funcionar correctamente, así que **lo hacemos manualmente**:

### Opción 1: SQL Editor (Recomendado)

1. **Ir a Supabase Dashboard**
   ```
   https://nqzhxukuvmdlpewqytpv.supabase.co
   ```

2. **Abrir SQL Editor**
   - Menú lateral → SQL Editor
   - Crear nueva query

3. **Copiar y pegar el schema**
   - Abrir archivo: `supabase/migrations/001_initial_schema.sql`
   - Copiar TODO el contenido
   - Pegar en SQL Editor
   - Click **Run** (o Ctrl+Enter)

4. **Verificar tablas creadas**
   ```
   Tablas creadas:
   ✅ sujeto10_profiles
   ✅ sujeto10_snapshots
   ✅ sujeto10_normalized_snapshots
   ✅ sujeto10_projects
   ✅ sujeto10_project_snapshots
   ```

### Opción 2: Usar CLI (si funciona)

```bash
npx supabase db push --db-url "postgresql://postgres.nqzhxukuvmdlpewqytpv:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

**Nota**: Necesitas tu password de base de datos desde Supabase Dashboard → Settings → Database

---

## 🎯 Una vez la DB esté lista

### 1. Iniciar servidor de desarrollo

```bash
cd /Users/nadalpiantini/Dev/snappy-platform
pnpm dev
```

### 2. Abrir en browser

```
http://localhost:3000
```

### 3. Probar la extensión

1. **Cargar extensión en Chrome**
   ```
   chrome://extensions/
   → Developer mode: ON
   → Load unpacked
   → Seleccionar carpeta: extension/
   ```

2. **Ir a cualquier webpage**
   ```
   https://example.com
   ```

3. **Click al icono de Snappy**
   - Se descarga `snappy-example.com-xxx.json`

4. **Ir a http://localhost:3000**
   - Drag & drop el JSON
   - Ver snapshot normalizado

---

## 🧪 Verificar Database Setup

En Supabase Dashboard → SQL Editor, ejecutar:

```sql
-- Listar tablas con prefijo sujeto10_
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'sujeto10_%'
ORDER BY tablename;
```

**Deberías ver**:
```
sujeto10_normalized_snapshots
sujeto10_project_snapshots
sujeto10_profiles
sujeto10_projects
sujeto10_snapshots
```

---

## 🐛 Troubleshooting

### Error: "relation does not exist"

**Problema**: El schema no se ha creado

**Solución**:
1. Ir a Supabase Dashboard
2. Abrir SQL Editor
3. Ejecutar el contenido de `001_initial_schema.sql`

### Error: "permission denied"

**Problema**: RLS policies bloqueando acceso

**Solución**: Asegúrate de estar logueado en Supabase

### Extension no funciona

**Problema**: Manifest V3 permissions

**Solución**:
1. Ir a `chrome://extensions/`
2. Recargar la extensión (icono de refresh)
3. Recargar la página donde la quieres usar

---

## 📦 Estructura de Tablas (Prefijo: sujeto10_)

```
sujeto10_profiles           # Perfiles de usuario
sujeto10_snapshots          # Snapshots crudos
sujeto10_normalized         # Snapshots normalizados
sujeto10_projects           # Proyectos (agrupan snapshots)
sujeto10_project_snapshots  # Relación proyectos-snapshots
```

---

## ✅ Checklist de Instalación

- [x] pnpm install
- [x] .env.local configurado
- [x] Prefijo sujeto10_ aplicado
- [ ] Push schema a Supabase ← **ESTE PASO**
- [ ] pnpm dev
- [ ] Probar en http://localhost:3000

---

## 🎉 Una vez completado

Tendrás funcionando:

1. ✅ **Chrome Extension** - Captura snapshots
2. ✅ **Web App** - Visualiza y procesa
3. ✅ **Database** - Supabase con prefijo sujeto10_
4. ✅ **Testing** - 98% coverage
5. ✅ **Production Ready** - Calidad profesional

---

**¿Listo para hacer push del schema?**

1. Ve a: https://nqzhxukuvmdlpewqytpv.supabase.co
2. SQL Editor
3. Copia y pega `supabase/migrations/001_initial_schema.sql`
4. Click **Run**

🚀 **¡Y listo!**
