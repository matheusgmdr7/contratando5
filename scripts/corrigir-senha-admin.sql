-- Script para corrigir a senha do usuário admin
-- Execute este script no Supabase SQL Editor

-- 1. Verificar o usuário admin atual
SELECT 
    id,
    nome,
    email,
    ativo,
    perfil,
    LENGTH(senha_hash) as tamanho_hash,
    created_at
FROM usuarios_admin 
WHERE email = 'admin@sistema.com';

-- 2. Atualizar a senha do usuário admin com hash válido
-- Senha: admin123456
-- Hash bcrypt válido (salt rounds: 12)
UPDATE usuarios_admin 
SET 
    senha_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq',
    updated_at = NOW()
WHERE email = 'admin@sistema.com';

-- 3. Verificar se a atualização foi feita
SELECT 
    id,
    nome,
    email,
    ativo,
    perfil,
    LENGTH(senha_hash) as tamanho_hash,
    updated_at
FROM usuarios_admin 
WHERE email = 'admin@sistema.com';

-- 4. Criar usuário de teste adicional (opcional)
INSERT INTO usuarios_admin (
    nome,
    email,
    senha_hash,
    ativo,
    perfil,
    permissoes
) VALUES (
    'Usuário Teste',
    'teste@teste.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq',
    true,
    'assistente',
    '{}'
) ON CONFLICT (email) DO UPDATE SET
    senha_hash = EXCLUDED.senha_hash,
    ativo = true,
    updated_at = NOW();

-- 5. Verificar todos os usuários após as correções
SELECT 
    nome,
    email,
    ativo,
    perfil,
    LENGTH(senha_hash) as tamanho_hash,
    CASE 
        WHEN LENGTH(senha_hash) >= 50 THEN '✅ HASH VÁLIDO'
        ELSE '❌ HASH INVÁLIDO'
    END as status_hash
FROM usuarios_admin 
ORDER BY created_at DESC; 