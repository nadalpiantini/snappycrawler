# 🔧 FIX - Permitir Snapshots Anónimos

## Problema Identificado

La extensión no puede guardar snapshots porque la columna `user_id` tiene restricción `NOT NULL`, pero la extensión envía snapshots sin autenticación.

## Solución

### Paso 1: Ir a Supabase SQL Editor

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto: **nqzhxukuvmdlpewqytpv**
3. En el menú lateral, haz clic en **"SQL Editor"**
4. Haz clic en **"New query"**

### Paso 2: Ejecutar este SQL

Copia y pega este comando:

```sql
-- Fix user_id constraint to allow anonymous snapshots
ALTER TABLE public.snappy_snapshots
ALTER COLUMN user_id DROP NOT NULL;
```

Haz clic en **"Run"** o presiona `Cmd+Enter`

### Paso 3: Verificar

Deberías ver:
```
Success. No rows returned
```

### Paso 4: Probar

1. Ve a `https://example.com`
2. Haz clic en el ícono de Snappy 🕷️
3. Configura: Max pages = **3**
4. Haz clic en **"▶️ Start Crawling"**

**Ahora debería funcionar!** ✅

---

## ¿Por qué esto es seguro?

- Los snapshots anónimos solo tienen `user_id = NULL`
- Las políticas de RLS siguen protegiendo los snapshots de usuarios autenticados
- La extensión es una herramienta de auditoría, no necesita autenticación obligatoria
- Puedes filtrar por `user_id IS NOT NULL` para ver solo snapshots de usuarios
