-- Script para verificar e corrigir a estrutura da tabela leads
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela leads existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'leads'
);

-- 2. Se não existir, criar a tabela leads
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    plano_id VARCHAR(255) NOT NULL, -- Mudando para VARCHAR para aceitar tanto UUID quanto string
    plano_nome VARCHAR(255) NOT NULL,
    plano_operadora VARCHAR(255) NOT NULL,
    faixa_etaria VARCHAR(20) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'Novo',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Verificar estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- 4. Se o campo plano_id for UUID, alterar para VARCHAR
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'plano_id' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE leads ALTER COLUMN plano_id TYPE VARCHAR(255);
        RAISE NOTICE '✅ Campo plano_id alterado de UUID para VARCHAR(255)';
    ELSE
        RAISE NOTICE 'ℹ️ Campo plano_id já é VARCHAR ou não existe';
    END IF;
END $$;

-- 5. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_data_registro ON leads(data_registro);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado);

-- 6. Adicionar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_leads_updated_at ON leads;
CREATE TRIGGER set_leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION update_leads_updated_at();

-- 7. Verificar estrutura final
SELECT 
    'leads' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'leads'
ORDER BY ordinal_position;

RAISE NOTICE '🎉 Estrutura da tabela leads verificada e corrigida!'; 