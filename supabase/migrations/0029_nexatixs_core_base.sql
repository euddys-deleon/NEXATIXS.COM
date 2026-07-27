-- NEXATIXS CORE - Master Data & Multi-Product Ecosystem
-- Created: 2026-07-27
-- Purpose: Foundation for multi-product management, licensing, and provisioning

-- ============================================================================
-- 1. NXT-ID Sequence Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS nxt_id_sequences (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL DEFAULT 2026,
  sequence INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(year)
);

COMMENT ON TABLE nxt_id_sequences IS 'Manages NXT-ID generation sequence per year (format: NXT-2026-00042)';

-- ============================================================================
-- 2. Master Clients (with NXT-ID)
-- ============================================================================

CREATE TABLE IF NOT EXISTS nxt_master_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nxt_id VARCHAR(20) UNIQUE NOT NULL,  -- Format: NXT-{YEAR}-{SEQUENTIAL}
  razon_social VARCHAR NOT NULL,
  nombre_comercial VARCHAR,
  email_contacto VARCHAR,
  telefono VARCHAR,
  estado VARCHAR DEFAULT 'activo',     -- activo, suspendido, cancelado
  tipo_empresa VARCHAR,                -- individual, srl, sa, cooperative

  -- NEXATIXS internal
  cliente_id UUID REFERENCES auth.users(id),  -- Link to NEXATIXS user (superadmin)

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE nxt_master_clients IS 'Master client registry with NXT-ID (unique identifier across all products)';
CREATE INDEX idx_nxt_clients_nxt_id ON nxt_master_clients(nxt_id);
CREATE INDEX idx_nxt_clients_estado ON nxt_master_clients(estado);

-- ============================================================================
-- 3. Available Products
-- ============================================================================

CREATE TABLE IF NOT EXISTS nxt_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR UNIQUE NOT NULL,      -- CreditFlow, NAH, etc
  slug VARCHAR UNIQUE NOT NULL,        -- creditflow, nah
  descripcion TEXT,
  url VARCHAR,
  icono VARCHAR,                        -- emoji or icon identifier
  estado VARCHAR DEFAULT 'active',     -- active, beta, retired
  version VARCHAR,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE nxt_products IS 'Catalog of available NEXATIXS products (CreditFlow, NAH, etc)';
CREATE INDEX idx_nxt_products_slug ON nxt_products(slug);

-- ============================================================================
-- 4. Licenses (Client + Product Association)
-- ============================================================================

CREATE TABLE IF NOT EXISTS nxt_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nxt_client_id UUID NOT NULL REFERENCES nxt_master_clients(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES nxt_products(id),
  plan VARCHAR NOT NULL,               -- free, basic, professional, enterprise
  estado VARCHAR DEFAULT 'activa',     -- activa, suspendida, expirada, cancelada

  -- License Limits
  usuarios_permitidos INTEGER DEFAULT 1,
  usuarios_actuales INTEGER DEFAULT 0,

  -- Tenant Isolation
  tenant_id VARCHAR UNIQUE,            -- NXT-2026-00042 (for multi-tenant products like CreditFlow)

  -- Dates
  fecha_inicio DATE,
  fecha_vencimiento DATE,
  fecha_suspension DATE,

  -- Tracking
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE nxt_licenses IS 'Product licenses per client (defines access to products like CreditFlow)';
CREATE INDEX idx_licenses_client_id ON nxt_licenses(nxt_client_id);
CREATE INDEX idx_licenses_product_id ON nxt_licenses(product_id);
CREATE INDEX idx_licenses_tenant_id ON nxt_licenses(tenant_id);
CREATE INDEX idx_licenses_estado ON nxt_licenses(estado);

-- ============================================================================
-- 5. Product Users (End Users per License)
-- ============================================================================

CREATE TABLE IF NOT EXISTS nxt_product_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES nxt_licenses(id) ON DELETE CASCADE,
  nxt_client_id UUID NOT NULL REFERENCES nxt_master_clients(id),
  product_id UUID NOT NULL REFERENCES nxt_products(id),

  -- User Info
  nombre VARCHAR NOT NULL,
  apellido VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,

  -- Product Access
  rol VARCHAR DEFAULT 'user',          -- admin, manager, user, viewer
  estado VARCHAR DEFAULT 'pendiente',  -- pendiente, activo, suspendido, desactivado

  -- Temporary Password for First Login
  password_temporal VARCHAR,
  password_temporal_expira TIMESTAMP,

  -- 2FA & Security
  2fa_habilitado BOOLEAN DEFAULT FALSE,
  2fa_metodo VARCHAR,                  -- totp, sms, email

  -- Login Tracking
  primer_login TIMESTAMP,
  ultimo_login TIMESTAMP,
  contador_intentos_fallidos INTEGER DEFAULT 0,
  cuenta_bloqueada BOOLEAN DEFAULT FALSE,
  fecha_bloqueo TIMESTAMP,

  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE nxt_product_users IS 'End users with access to specific products via licenses';
CREATE INDEX idx_product_users_license_id ON nxt_product_users(license_id);
CREATE INDEX idx_product_users_nxt_client_id ON nxt_product_users(nxt_client_id);
CREATE INDEX idx_product_users_email ON nxt_product_users(email);
CREATE INDEX idx_product_users_estado ON nxt_product_users(estado);

-- ============================================================================
-- 6. Centralized Audit Logging
-- ============================================================================

CREATE TABLE IF NOT EXISTS nxt_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nxt_client_id UUID REFERENCES nxt_master_clients(id),
  usuario_id UUID REFERENCES auth.users(id),

  -- Action Details
  accion VARCHAR NOT NULL,             -- create_license, update_user, activate_user, etc
  entidad VARCHAR,                      -- license, product_user, tenant
  entidad_id UUID,

  -- Result Tracking
  resultado VARCHAR DEFAULT 'success', -- success, error, warning
  mensaje_error TEXT,

  -- Request Context
  ip_address INET,
  user_agent TEXT,
  detalles JSONB,                      -- Additional structured data

  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE nxt_audit_logs IS 'Centralized audit trail for all NEXATIXS CORE actions';
CREATE INDEX idx_audit_client_id ON nxt_audit_logs(nxt_client_id);
CREATE INDEX idx_audit_accion ON nxt_audit_logs(accion);
CREATE INDEX idx_audit_created_at ON nxt_audit_logs(created_at);

-- ============================================================================
-- 7. Provisioning Status Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS nxt_provisioning_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES nxt_licenses(id),
  producto_slug VARCHAR NOT NULL,

  estado VARCHAR DEFAULT 'pending',    -- pending, in_progress, completed, failed
  progreso INTEGER DEFAULT 0,          -- 0-100

  -- Actions
  acciones_pendientes JSONB,           -- Array of tasks to complete
  resultado_json JSONB,                -- Response from product API

  intentos INTEGER DEFAULT 0,
  proximo_intento TIMESTAMP,

  error_message TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE nxt_provisioning_jobs IS 'Async provisioning tasks for new product instances';
CREATE INDEX idx_provisioning_license_id ON nxt_provisioning_jobs(license_id);
CREATE INDEX idx_provisioning_estado ON nxt_provisioning_jobs(estado);

-- ============================================================================
-- 8. RLS (Row Level Security) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE nxt_master_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE nxt_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE nxt_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nxt_product_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nxt_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nxt_provisioning_jobs ENABLE ROW LEVEL SECURITY;

-- NEXATIXS SuperAdmin: Can see all data
CREATE POLICY nxt_superadmin_all ON nxt_master_clients
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'superadmin'
  );

CREATE POLICY nxt_superadmin_products ON nxt_products
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'superadmin'
  );

CREATE POLICY nxt_superadmin_licenses ON nxt_licenses
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'superadmin'
  );

CREATE POLICY nxt_superadmin_product_users ON nxt_product_users
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'superadmin'
  );

-- Client Portal: Can only see their own data
CREATE POLICY nxt_client_own_data ON nxt_master_clients
  FOR SELECT USING (
    cliente_id = auth.uid()
  );

CREATE POLICY nxt_client_own_licenses ON nxt_licenses
  FOR SELECT USING (
    nxt_client_id IN (
      SELECT id FROM nxt_master_clients
      WHERE cliente_id = auth.uid()
    )
  );

-- Admin users: Can see their licenses
CREATE POLICY nxt_admin_own_licenses ON nxt_product_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM nxt_licenses
      WHERE id = license_id
        AND nxt_client_id IN (
          SELECT id FROM nxt_master_clients
          WHERE cliente_id = auth.uid()
        )
    )
  );

-- ============================================================================
-- 9. Functions for NEXATIXS CORE Operations
-- ============================================================================

-- Generate NXT-ID
CREATE OR REPLACE FUNCTION generate_nxt_id()
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_year INTEGER;
  next_sequence INTEGER;
  new_nxt_id VARCHAR;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;

  INSERT INTO nxt_id_sequences (year, sequence)
  VALUES (current_year, 1)
  ON CONFLICT (year)
  DO UPDATE SET sequence = nxt_id_sequences.sequence + 1,
                updated_at = NOW()
  WHERE nxt_id_sequences.year = current_year
  RETURNING nxt_id_sequences.sequence INTO next_sequence;

  new_nxt_id := 'NXT-' || current_year || '-' || LPAD(next_sequence::TEXT, 5, '0');

  RETURN new_nxt_id;
END;
$$;

-- Trigger to auto-generate NXT-ID on client creation
CREATE OR REPLACE FUNCTION set_nxt_id_on_client_create()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.nxt_id IS NULL THEN
    NEW.nxt_id := generate_nxt_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trig_auto_nxt_id
BEFORE INSERT ON nxt_master_clients
FOR EACH ROW
EXECUTE FUNCTION set_nxt_id_on_client_create();

-- Log all changes to audit trail
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO nxt_audit_logs (
      nxt_client_id,
      usuario_id,
      accion,
      entidad,
      entidad_id,
      detalles,
      ip_address
    ) VALUES (
      CASE WHEN TG_TABLE_NAME = 'nxt_master_clients' THEN NEW.id ELSE NEW.nxt_client_id END,
      auth.uid(),
      'create_' || LOWER(TG_TABLE_NAME),
      TG_TABLE_NAME,
      NEW.id,
      row_to_json(NEW),
      (SELECT client_addr FROM pg_stat_activity WHERE pid = pg_backend_pid())::INET
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Attach audit trigger to critical tables
CREATE TRIGGER audit_licenses AFTER INSERT ON nxt_licenses
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_product_users AFTER INSERT ON nxt_product_users
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- ============================================================================
-- 10. Seed Initial Data
-- ============================================================================

-- Insert CreditFlow as first product
INSERT INTO nxt_products (nombre, slug, descripcion, icono, estado)
VALUES (
  'CreditFlow',
  'creditflow',
  'Professional private loan management platform',
  '💰',
  'active'
)
ON CONFLICT DO NOTHING;

-- Insert other products if needed
INSERT INTO nxt_products (nombre, slug, descripcion, icono, estado)
VALUES (
  'NAH',
  'nah',
  'Property management and real estate solutions',
  '🏠',
  'beta'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 11. Grant Permissions
-- ============================================================================

-- Grant superadmin full access
GRANT ALL PRIVILEGES ON nxt_master_clients TO postgres;
GRANT ALL PRIVILEGES ON nxt_products TO postgres;
GRANT ALL PRIVILEGES ON nxt_licenses TO postgres;
GRANT ALL PRIVILEGES ON nxt_product_users TO postgres;
GRANT ALL PRIVILEGES ON nxt_audit_logs TO postgres;
GRANT ALL PRIVILEGES ON nxt_provisioning_jobs TO postgres;

-- Grant sequence access
GRANT USAGE, SELECT ON SEQUENCE nxt_id_sequences_id_seq TO postgres;

-- Grant function execution
GRANT EXECUTE ON FUNCTION generate_nxt_id() TO postgres;
GRANT EXECUTE ON FUNCTION set_nxt_id_on_client_create() TO postgres;
GRANT EXECUTE ON FUNCTION audit_log_changes() TO postgres;
