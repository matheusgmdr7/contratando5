-- Script para debugar o problema de login
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todos os usuários na tabela
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

-- 2. Verificar se há usuários inativos
SELECT 
    nome,
    email,
    ativo,
    perfil
FROM usuarios_admin 
WHERE ativo = false;

-- 3. Verificar se há usuários sem senha
SELECT 
    nome,
    email,
    ativo,
    perfil
FROM usuarios_admin 
WHERE senha_hash IS NULL OR senha_hash = '';

-- 4. Verificar se há usuários com email duplicado
SELECT 
    email,
    COUNT(*) as quantidade
FROM usuarios_admin 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 5. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios_admin' 
ORDER BY ordinal_position;

-- 6. Testar inserção de um usuário de teste (com senha hash válida)
-- Descomente as linhas abaixo para criar um usuário de teste
/*
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
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq', -- senha: 123456
    true,
    'assistente',
    '{}'
) ON CONFLICT (email) DO NOTHING;
*/

-- 7. Verificar se o usuário de teste foi criado
SELECT 
    nome,
    email,
    ativo,
    perfil,
    LENGTH(senha_hash) as tamanho_hash
FROM usuarios_admin 
WHERE email = 'teste@teste.com'; 