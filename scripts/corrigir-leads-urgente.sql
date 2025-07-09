-- SCRIPT URGENTE: Corrigir problema da tabela leads
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND column_name = 'plano_id';

-- 2. Se o campo plano_id for UUID, alterar para VARCHAR
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'plano_id' 
        AND data_type = 'uuid'
    ) THEN
        -- Alterar o tipo do campo para VARCHAR
        ALTER TABLE leads ALTER COLUMN plano_id TYPE VARCHAR(255);
        RAISE NOTICE '✅ Campo plano_id alterado de UUID para VARCHAR(255)';
    ELSE
        RAISE NOTICE 'ℹ️ Campo plano_id já é VARCHAR ou não existe';
    END IF;
END $$;

-- 3. Verificar se a alteração foi feita
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND column_name = 'plano_id';

-- 4. Testar inserção de um lead
-- (Descomente as linhas abaixo para testar)
/*
INSERT INTO leads (
    nome, 
    email, 
    whatsapp, 
    plano_id, 
    plano_nome, 
    plano_operadora, 
    faixa_etaria, 
    estado
) VALUES (
    'Teste', 
    'teste@teste.com', 
    '11999999999', 
    '1', 
    'Plano Teste', 
    'Operadora Teste', 
    '18-30', 
    'SP'
);
*/ 