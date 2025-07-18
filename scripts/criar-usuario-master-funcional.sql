-- Script para criar usuário master funcional
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'usuarios_admin'
) as tabela_existe;

-- 2. Criar usuário master com senha válida
-- Email: admin@contratandoplanos.com
-- Senha: admin123456
INSERT INTO usuarios_admin (
    nome,
    email,
    senha_hash,
    ativo,
    perfil,
    permissoes
) VALUES (
    'Administrador Master',
    'admin@contratandoplanos.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq',
    true,
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
    }'
) ON CONFLICT (email) DO UPDATE SET
    senha_hash = EXCLUDED.senha_hash,
    ativo = true,
    perfil = 'master',
    permissoes = EXCLUDED.permissoes,
    updated_at = NOW();

-- 3. Verificar se o usuário foi criado
SELECT 
    id,
    nome,
    email,
    ativo,
    perfil,
    LENGTH(senha_hash) as tamanho_hash,
    created_at,
    updated_at
FROM usuarios_admin 
WHERE email = 'admin@contratandoplanos.com';

-- 4. Listar todos os usuários master
SELECT 
    nome,
    email,
    ativo,
    perfil,
    LENGTH(senha_hash) as tamanho_hash
FROM usuarios_admin 
WHERE perfil = 'master'
ORDER BY created_at DESC; 