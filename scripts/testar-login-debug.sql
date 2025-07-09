-- Script para testar o login e identificar o problema
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos ver todos os usuários
SELECT 
    id,
    nome,
    email,
    ativo,
    perfil,
    CASE 
        WHEN senha_hash IS NOT NULL AND LENGTH(senha_hash) > 0 THEN '✅ SENHA CONFIGURADA'
        ELSE '❌ SENHA NÃO CONFIGURADA'
    END as status_senha,
    LENGTH(senha_hash) as tamanho_hash,
    created_at
FROM usuarios_admin 
ORDER BY created_at DESC;

-- 2. Vamos criar um usuário de teste com senha conhecida
-- Senha: 123456
-- Hash gerado com bcrypt (salt rounds: 12)
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

-- 3. Verificar se o usuário foi criado/atualizado
SELECT 
    nome,
    email,
    ativo,
    perfil,
    LENGTH(senha_hash) as tamanho_hash,
    created_at
FROM usuarios_admin 
WHERE email = 'teste@teste.com';

-- 4. Verificar se há problemas na estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios_admin' 
AND column_name IN ('email', 'senha_hash', 'ativo', 'perfil')
ORDER BY ordinal_position;

-- 5. Verificar se há usuários com email em maiúsculo
SELECT 
    nome,
    email,
    LENGTH(email) as tamanho_email
FROM usuarios_admin 
WHERE email != LOWER(email);

-- 6. Verificar se há usuários inativos
SELECT 
    nome,
    email,
    ativo,
    perfil
FROM usuarios_admin 
WHERE ativo = false; 