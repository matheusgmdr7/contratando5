-- Script para verificar e corrigir a tabela usuarios_admin
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela usuarios_admin existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios_admin'
) as tabela_existe;

-- 2. Se não existir, criar a tabela usuarios_admin
CREATE TABLE IF NOT EXISTS usuarios_admin (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    perfil VARCHAR(50) NOT NULL DEFAULT 'assistente',
    permissoes JSONB DEFAULT '{}',
    ultimo_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Verificar estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios_admin' 
ORDER BY ordinal_position;

-- 4. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_email ON usuarios_admin(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_ativo ON usuarios_admin(ativo);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_perfil ON usuarios_admin(perfil);

-- 5. Verificar se há usuários na tabela
SELECT COUNT(*) as total_usuarios FROM usuarios_admin;

-- 6. Mostrar usuários existentes (sem senha)
SELECT 
    id,
    nome,
    email,
    ativo,
    perfil,
    ultimo_login,
    created_at
FROM usuarios_admin 
ORDER BY created_at DESC;

-- 7. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_usuarios_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_usuarios_admin_updated_at ON usuarios_admin;
CREATE TRIGGER set_usuarios_admin_updated_at
BEFORE UPDATE ON usuarios_admin
FOR EACH ROW
EXECUTE FUNCTION update_usuarios_admin_updated_at(); 