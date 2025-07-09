-- Script para testar o login do usuário cadastrado
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuários existentes
SELECT 
    id,
    nome,
    email,
    ativo,
    perfil,
    created_at
FROM usuarios_admin 
ORDER BY created_at DESC;

-- 2. Verificar se o usuário está ativo
SELECT 
    nome,
    email,
    ativo,
    perfil,
    CASE 
        WHEN ativo = true THEN '✅ ATIVO'
        ELSE '❌ INATIVO'
    END as status
FROM usuarios_admin 
WHERE email = 'seu@email.com' -- Substitua pelo email do usuário que você cadastrou
LIMIT 1;

-- 3. Verificar se o hash da senha existe
SELECT 
    nome,
    email,
    CASE 
        WHEN senha_hash IS NOT NULL AND LENGTH(senha_hash) > 0 THEN '✅ SENHA CONFIGURADA'
        ELSE '❌ SENHA NÃO CONFIGURADA'
    END as status_senha,
    LENGTH(senha_hash) as tamanho_hash
FROM usuarios_admin 
WHERE email = 'seu@email.com' -- Substitua pelo email do usuário que você cadastrou
LIMIT 1;

-- 4. Se o usuário não estiver ativo, ativá-lo
UPDATE usuarios_admin 
SET ativo = true 
WHERE email = 'seu@email.com' -- Substitua pelo email do usuário que você cadastrou
AND ativo = false;

-- 5. Verificar se a atualização foi feita
SELECT 
    nome,
    email,
    ativo,
    perfil,
    CASE 
        WHEN ativo = true THEN '✅ ATIVO'
        ELSE '❌ INATIVO'
    END as status
FROM usuarios_admin 
WHERE email = 'seu@email.com' -- Substitua pelo email do usuário que você cadastrou
LIMIT 1; 