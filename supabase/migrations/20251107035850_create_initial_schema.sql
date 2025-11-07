/*
  # Create Initial Database Schema for Trayectorias Académicas

  ## Overview
  This migration creates the foundational database structure for the early warning system (Alerta Temprana)
  with role-based access control (RBAC). The system supports 5 user roles with different privilege levels.

  ## 1. New Tables

  ### roles
  - Stores the 5 user roles with their descriptions and permission levels
  - Roles: admin, subdirector, jefedivision, coordinador, docente

  ### users
  - Main user table with authentication and profile information
  - Links to the roles table via role_id
  - Stores user metadata and status

  ### modules
  - Available system modules/features that can be accessed
  - Each module can have role-based access restrictions

  ### role_module_permissions
  - Junction table defining which roles have access to which modules
  - Enables fine-grained permission management per role

  ## 2. Security
  - Enable RLS on all tables
  - Create policies for authenticated users to read roles and module permissions
  - Users can only view/edit their own profile
  - Admin users have elevated privileges

  ## 3. Default Data
  - Insert 5 roles: admin, subdirector, jefedivision, coordinador, docente
  - Insert example modules: alerta-temprana, indicadores-academicos, proyeccion-academica

  ## 4. Important Notes
  - All timestamps use CURRENT_TIMESTAMP for consistency
  - is_active flag allows soft-delete functionality
  - role_id is NOT NULL to ensure all users have a role
  - Roles cannot be deleted (data integrity)
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  level integer NOT NULL UNIQUE,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role_id uuid NOT NULL REFERENCES roles(id),
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  color text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create role_module_permissions junction table
CREATE TABLE IF NOT EXISTS role_module_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  can_view boolean DEFAULT false,
  can_create boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, module_id)
);

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_module_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for roles table (readable by all authenticated users)
CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- Policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policies for modules table (readable by all authenticated users)
CREATE POLICY "Authenticated users can view active modules"
  ON modules FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies for role_module_permissions table
CREATE POLICY "Authenticated users can view module permissions"
  ON role_module_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Insert roles
INSERT INTO roles (name, description, level) VALUES
  ('admin', 'Administrador del sistema con acceso total', 1),
  ('subdirector', 'Subdirector con acceso a reportes y gestión general', 2),
  ('jefedivision', 'Jefe de División con acceso a su división', 3),
  ('coordinador', 'Coordinador con acceso limitado a gestión', 4),
  ('docente', 'Docente con acceso a información de su clase', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert modules
INSERT INTO modules (name, title, description, icon, color, is_active) VALUES
  ('alerta-temprana', 'Alerta Temprana', 'Sistema de alerta temprana para seguimiento de estudiantes', '🔔', '#6b8fa3', true),
  ('indicadores-academicos', 'Indicadores Académicos', 'Análisis de indicadores académicos y desempeño', '📊', '#7a9fb5', true),
  ('proyeccion-academica', 'Proyección Académica', 'Proyecciones y tendencias académicas', '📈', '#8aafc7', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions for each role
-- Get role and module IDs dynamically
DO $$
DECLARE
  admin_role_id uuid;
  subdirector_role_id uuid;
  jefe_role_id uuid;
  coordinador_role_id uuid;
  docente_role_id uuid;
  alerta_module_id uuid;
  indicadores_module_id uuid;
  proyeccion_module_id uuid;
BEGIN
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  SELECT id INTO subdirector_role_id FROM roles WHERE name = 'subdirector';
  SELECT id INTO jefe_role_id FROM roles WHERE name = 'jefedivision';
  SELECT id INTO coordinador_role_id FROM roles WHERE name = 'coordinador';
  SELECT id INTO docente_role_id FROM roles WHERE name = 'docente';
  
  SELECT id INTO alerta_module_id FROM modules WHERE name = 'alerta-temprana';
  SELECT id INTO indicadores_module_id FROM modules WHERE name = 'indicadores-academicos';
  SELECT id INTO proyeccion_module_id FROM modules WHERE name = 'proyeccion-academica';

  -- Admin: full access to all modules
  INSERT INTO role_module_permissions (role_id, module_id, can_view, can_create, can_edit, can_delete)
  VALUES
    (admin_role_id, alerta_module_id, true, true, true, true),
    (admin_role_id, indicadores_module_id, true, true, true, true),
    (admin_role_id, proyeccion_module_id, true, true, true, true)
  ON CONFLICT (role_id, module_id) DO NOTHING;

  -- Subdirector: view and edit on most modules
  INSERT INTO role_module_permissions (role_id, module_id, can_view, can_create, can_edit, can_delete)
  VALUES
    (subdirector_role_id, alerta_module_id, true, true, true, false),
    (subdirector_role_id, indicadores_module_id, true, true, true, false),
    (subdirector_role_id, proyeccion_module_id, true, true, false, false)
  ON CONFLICT (role_id, module_id) DO NOTHING;

  -- Jefe División: view and limited edit
  INSERT INTO role_module_permissions (role_id, module_id, can_view, can_create, can_edit, can_delete)
  VALUES
    (jefe_role_id, alerta_module_id, true, true, true, false),
    (jefe_role_id, indicadores_module_id, true, true, false, false),
    (jefe_role_id, proyeccion_module_id, true, false, false, false)
  ON CONFLICT (role_id, module_id) DO NOTHING;

  -- Coordinador: view and create
  INSERT INTO role_module_permissions (role_id, module_id, can_view, can_create, can_edit, can_delete)
  VALUES
    (coordinador_role_id, alerta_module_id, true, true, false, false),
    (coordinador_role_id, indicadores_module_id, true, true, false, false),
    (coordinador_role_id, proyeccion_module_id, true, false, false, false)
  ON CONFLICT (role_id, module_id) DO NOTHING;

  -- Docente: view only
  INSERT INTO role_module_permissions (role_id, module_id, can_view, can_create, can_edit, can_delete)
  VALUES
    (docente_role_id, alerta_module_id, true, false, false, false),
    (docente_role_id, indicadores_module_id, true, false, false, false),
    (docente_role_id, proyeccion_module_id, false, false, false, false)
  ON CONFLICT (role_id, module_id) DO NOTHING;
END $$;
