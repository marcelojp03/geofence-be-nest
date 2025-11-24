-- Script para agregar PostGIS y columnas geom manualmente
-- Ejecutar en tu base de datos PostgreSQL

-- Activar extensión PostGIS (debe ejecutarse como superusuario o en esquema public)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Agregar columna geom a schools (POLYGON para área segura del colegio)
ALTER TABLE "sig"."schools" 
ADD COLUMN IF NOT EXISTS geom geometry(POLYGON, 4326);

-- Agregar columna geom a child_positions (POINT para ubicación exacta)
ALTER TABLE "sig"."child_positions" 
ADD COLUMN IF NOT EXISTS geom geometry(POINT, 4326);

-- Crear índices espaciales para mejorar el rendimiento de consultas ST_Within
CREATE INDEX IF NOT EXISTS idx_schools_geom ON "sig"."schools" USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_child_positions_geom ON "sig"."child_positions" USING GIST (geom);

-- Comentarios para documentación
COMMENT ON COLUMN "sig"."schools".geom IS 'Polígono que define el área segura del colegio (SRID 4326 - WGS84)';
COMMENT ON COLUMN "sig"."child_positions".geom IS 'Punto de ubicación del niño (SRID 4326 - WGS84)';

-- Verificar que las columnas fueron creadas correctamente
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_schema = 'sig' 
  AND table_name IN ('schools', 'child_positions')
  AND column_name = 'geom';
