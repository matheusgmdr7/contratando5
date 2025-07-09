-- Script para corrigir a tabela usuarios_admin para integração com Supabase Auth
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios_admin' 
ORDER BY ordinal_position;

-- 2. Tornar senha_hash opcional (já que usamos Supabase Auth)
ALTER TABLE usuarios_admin 
ALTER COLUMN senha_hash DROP NOT NULL;

-- 3. Adicionar coluna para ID do Supabase Auth (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios_admin' 
        AND column_name = 'auth_user_id'
    ) THEN
        ALTER TABLE usuarios_admin 
        ADD COLUMN auth_user_id UUID;
    END IF;
END $$;

-- 4. Adicionar índice para auth_user_id
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_auth_user_id 
ON usuarios_admin(auth_user_id);

-- 5. Verificar estrutura após alterações
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios_admin' 
ORDER BY ordinal_position;

-- 6. Inserir usuário contato sem senha_hash
INSERT INTO usuarios_admin (
    nome,
    email,
    perfil,
    permissoes,
    ativo
) VALUES (
    'Administrador Contato',
    'contato@contratandoplanos.com.br',
    'master',
    '{
        "dashboard": {"visualizar": true, "criar": true, "editar": true, "excluir": true},
        "leads": {"visualizar": true, "criar": true, "editar": true, "excluir": true},
        "propostas": {"visualizar": true, "criar": true, "editar": true, "excluir": true},
        "corretores": {"visualizar": true, "criar": true, "editar": true, "excluir": true},
        "produtos": {"visualizar": true, "criar": true, "editar": true, "excluir": true},
        "tabelas": {"visualizar": true, "criar": true, "editar": true, "excluir": true},
        "comissoes": {"visualizar": true, "criar": true, "editar": true, "excluir": true},
        "usuarios": {"visualizar": true, "criar": true, "editar": true, "excluir": true},
        "contratos": {"visualizar": true, "criar": true, "editar": true, "excluir": true},
        "vendas": {"visualizar": true, "criar": true, "editar": true, "excluir": true}
    }',
    true
) ON CONFLICT (email) DO UPDATE SET
    perfil = 'master',
    permissoes = EXCLUDED.permissoes,
    ativo = true,
    updated_at = NOW();

-- 7. Verificar se o usuário foi criado
SELECT 
    id,
    nome,
    email,
    perfil,
    ativo,
    created_at
FROM usuarios_admin 
WHERE email = 'contato@contratandoplanos.com.br'; 