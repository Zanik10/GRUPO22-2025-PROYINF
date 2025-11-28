
CREATE TABLE IF NOT EXISTS usuarios (
  id                      SERIAL PRIMARY KEY,
  full_name               TEXT NOT NULL,
  email                   TEXT NOT NULL UNIQUE,
  password_hash           TEXT NOT NULL,
  salario                 INTEGER NOT NULL DEFAULT 0,
  tiene_deuda             BOOLEAN NOT NULL DEFAULT FALSE,
  antiguedad_laboral_meses INTEGER NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);



CREATE TABLE IF NOT EXISTS simulaciones (
  id             BIGSERIAL PRIMARY KEY,
  usuario_id     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  monto          NUMERIC(15,2) NOT NULL,
  tasa_anual     NUMERIC(5,2)  NOT NULL,
  plazo_meses    INTEGER       NOT NULL,
  cuota_mensual  NUMERIC(15,2) NOT NULL,
  total_pagar    NUMERIC(15,2) NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_simulaciones_usuario
  ON simulaciones(usuario_id);



CREATE TABLE IF NOT EXISTS solicitudes_prestamo (
  id                BIGSERIAL PRIMARY KEY,
  usuario_id        INTEGER  NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  simulacion_id     BIGINT   NOT NULL REFERENCES simulaciones(id) ON DELETE CASCADE,

  estado            TEXT     NOT NULL, 
  motivo_rechazo    TEXT,
  score             NUMERIC(5,2),

  
  documento_subido  BOOLEAN  NOT NULL DEFAULT FALSE,
  documento_path    TEXT,
  documento_deadline TIMESTAMPTZ,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario
  ON solicitudes_prestamo(usuario_id);

CREATE INDEX IF NOT EXISTS idx_solicitudes_simulacion
  ON solicitudes_prestamo(simulacion_id);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estado
  ON solicitudes_prestamo(estado);



ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS salario                 INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tiene_deuda             BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS antiguedad_laboral_meses INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE solicitudes_prestamo
  ADD COLUMN IF NOT EXISTS documento_subido   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS documento_path     TEXT,
  ADD COLUMN IF NOT EXISTS documento_deadline TIMESTAMPTZ;

ALTER TABLE simulaciones
  ADD COLUMN IF NOT EXISTS cuota_mensual  NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS total_pagar    NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW();
