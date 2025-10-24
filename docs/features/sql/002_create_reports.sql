-- Crear tipo ENUM para el estado de los reportes
CREATE TYPE report_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- Crear tabla de reportes
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  status report_status DEFAULT 'PENDING',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_reports_profile_id ON reports(profile_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_profile_created ON reports(profile_id, created_at DESC);

-- Comentarios para documentación
COMMENT ON TABLE reports IS 'Reportes de inteligencia competitiva generados';
COMMENT ON COLUMN reports.profile_id IS 'Referencia al perfil de empresa';
COMMENT ON COLUMN reports.content IS 'Contenido del reporte en formato Markdown';
COMMENT ON COLUMN reports.status IS 'Estado actual del reporte: PENDING, PROCESSING, COMPLETED, FAILED';
COMMENT ON COLUMN reports.error_message IS 'Mensaje de error si el reporte falló';
COMMENT ON COLUMN reports.completed_at IS 'Fecha y hora cuando el reporte fue completado';
COMMENT ON COLUMN reports.metadata IS 'Metadatos adicionales en formato JSON (competidores analizados, tiempo de generación, etc.)';

