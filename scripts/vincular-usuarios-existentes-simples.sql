-- Script para vincular usuários existentes do Supabase Auth
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Vincular usuário contato@contratandoplanos.com.br (se existir)
-- Primeiro, vamos verificar se já existe
SELECT 
    id,
    nome,
    email,
    perfil,
    auth_user_id,
    created_at
FROM usuarios_admin 
WHERE email = 'contato@contratandoplanos.com.br';

-- 2. Se não existir, criar o registro (sem auth_user_id por enquanto)
INSERT INTO usuarios_admin (
    id,
    nome, 
    email, 
    ativo, 
    perfil, 
    permissoes,
    created_at, 
    updated_at
) 
SELECT 
    gen_random_uuid(),
    'Contato Contratando Planos',
    'contato@contratandoplanos.com.br',
    true,
    'master',
    '{}',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE email = 'contato@contratandoplanos.com.br'
);

-- 3. Vincular outros usuários conhecidos (ajuste conforme necessário)
-- admin@sistema.com
INSERT INTO usuarios_admin (
    id,
    nome, 
    email, 
    ativo, 
    perfil, 
    permissoes,
    created_at, 
    updated_at
) 
SELECT 
    gen_random_uuid(),
    'Administrador Sistema',
    'admin@sistema.com',
    true,
    'master',
    '{}',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE email = 'admin@sistema.com'
);

-- admin@contratandoplanos.com
INSERT INTO usuarios_admin (
    id,
    nome, 
    email, 
    ativo, 
    perfil, 
    permissoes,
    created_at, 
    updated_at
) 
SELECT 
    gen_random_uuid(),
    'Admin Contratando',
    'admin@contratandoplanos.com',
    true,
    'master',
    '{}',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE email = 'admin@contratandoplanos.com'
);

-- 4. Verificar todos os usuários
SELECT 
    id,
    nome,
    email,
    perfil,
    ativo,
    auth_user_id,
    created_at
FROM usuarios_admin 
ORDER BY created_at DESC;

-- 5. Estatísticas
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(auth_user_id) as usuarios_vinculados,
    COUNT(*) - COUNT(auth_user_id) as usuarios_sem_vinculo
FROM usuarios_admin; 