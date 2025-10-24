-- Habilitar Row Level Security (RLS) en las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- NOTA: Las siguientes políticas son PERMISIVAS para el MVP
-- En un entorno de producción con autenticación real, estas políticas
-- deberían ser más restrictivas y basadas en el usuario autenticado.

-- Políticas para la tabla profiles
-- Permitir todas las operaciones (solo para MVP)
DROP POLICY IF EXISTS "Permitir todas las operaciones en profiles" ON profiles;
CREATE POLICY "Permitir todas las operaciones en profiles"
  ON profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para la tabla reports
-- Permitir todas las operaciones (solo para MVP)
DROP POLICY IF EXISTS "Permitir todas las operaciones en reports" ON reports;
CREATE POLICY "Permitir todas las operaciones en reports"
  ON reports
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ⚠️ IMPORTANTE: 
-- Estas políticas permisivas son SOLO para desarrollo/MVP sin autenticación.
-- Para producción, implementar políticas basadas en auth.uid() de Supabase Auth.
--
-- Ejemplo de políticas de producción:
-- CREATE POLICY "Los usuarios pueden ver sus propios perfiles"
--   ON profiles FOR SELECT
--   USING (auth.uid() = user_id);
--
-- CREATE POLICY "Los usuarios pueden ver sus propios reportes"
--   ON reports FOR SELECT
--   USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

