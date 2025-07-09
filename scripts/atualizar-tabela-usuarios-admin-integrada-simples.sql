-- Script simplificado para atualizar a tabela usuarios_admin
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Adicionar coluna auth_user_id
ALTER TABLE usuarios_admin 
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 2. Tornar senha_hash opcional
ALTER TABLE usuarios_admin 
ALTER COLUMN senha_hash DROP NOT NULL;

-- 3. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_auth_user_id 
ON usuarios_admin(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_admin_email 
ON usuarios_admin(email);

-- 4. Adicionar comentários
COMMENT ON COLUMN usuarios_admin.auth_user_id IS 'ID do usuário no Supabase Auth para integração';
COMMENT ON COLUMN usuarios_admin.senha_hash IS 'Hash da senha (opcional quando usando Supabase Auth)';

-- 5. Verificar resultado
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(auth_user_id) as usuarios_com_auth_id,
    COUNT(senha_hash) as usuarios_com_senha_hash
FROM usuarios_admin; 