/*
  # Remove Username Field and Create Admin User

  ## Overview
  This migration removes the username field from the users table and creates an initial admin user.

  ## 1. Changes to Tables
    - Remove `username` column from `users` table
    - Users will now authenticate using email only

  ## 2. Data Changes
    - Create initial admin user with email: admin@admin.com
    - Admin user has full access to all system modules
    - Admin is assigned the 'admin' role

  ## 3. Security
    - No RLS policy changes needed
    - Existing policies continue to work with email-based authentication

  ## 4. Important Notes
    - This is a breaking change for existing users who rely on username
    - After this migration, all authentication will be email-based
    - Default admin credentials: admin@admin.com (password should be set via proper authentication)
*/

-- Drop username column from users table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE users DROP COLUMN username;
  END IF;
END $$;

-- Create initial admin user
DO $$
DECLARE
  admin_role_id uuid;
  existing_admin_count integer;
BEGIN
  -- Get admin role ID
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  -- Check if admin user already exists
  SELECT COUNT(*) INTO existing_admin_count 
  FROM users 
  WHERE email = 'admin@admin.com';
  
  -- Only create if admin doesn't exist
  IF existing_admin_count = 0 THEN
    INSERT INTO users (email, full_name, role_id, is_active)
    VALUES ('admin@admin.com', 'Administrador del Sistema', admin_role_id, true);
  END IF;
END $$;
