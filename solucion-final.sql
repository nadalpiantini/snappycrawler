-- SOLUCIÓN FINAL: Remover restricción de foreign key
-- Esto permite que la extensión guarde snapshots sin necesidad de usuario

-- Paso 1: Remover la foreign key constraint
ALTER TABLE public.snappy_snapshots
DROP CONSTRAINT IF EXISTS snappy_snapshots_user_id_fkey;

-- Paso 2: Hacer user_id nullable (si no lo está ya)
ALTER TABLE public.snappy_snapshots
ALTER COLUMN user_id DROP NOT NULL;

-- Paso 3: Verificar los cambios
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'snappy_snapshots';

-- No debería aparecer snappy_snapshots_user_id_fkey
