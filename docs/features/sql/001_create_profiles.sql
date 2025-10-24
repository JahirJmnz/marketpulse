-- Crear tabla de perfiles de empresas
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por fecha de creación
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Comentarios para documentación
COMMENT ON TABLE profiles IS 'Perfiles de empresas configurados por los usuarios';
COMMENT ON COLUMN profiles.company_name IS 'Nombre de la empresa';
COMMENT ON COLUMN profiles.company_description IS 'Descripción del negocio y mercado de la empresa';

