-- SCRIPT CORRIGIDO: Resolver problema da tabela leads com foreign key
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual da tabela leads
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- 2. Verificar as foreign keys da tabela leads
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'leads';

-- 3. Verificar se existe tabela de planos
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'planos'
) as tabela_planos_existe;

-- 4. Se existir tabela de planos, verificar sua estrutura
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'planos' 
ORDER BY ordinal_position;

-- 5. OPÇÃO 1: Remover a foreign key e alterar o tipo (RECOMENDADO)
-- Primeiro, remover a foreign key constraint
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Encontrar o nome da constraint
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc 
    WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'leads'
    AND tc.constraint_name LIKE '%plano_id%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE leads DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE '✅ Foreign key constraint % removida', constraint_name;
    ELSE
        RAISE NOTICE 'ℹ️ Nenhuma foreign key constraint encontrada para plano_id';
    END IF;
END $$;

-- 6. Agora alterar o tipo do campo plano_id
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

-- 7. Verificar se a alteração foi feita
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND column_name = 'plano_id';

-- 8. Testar inserção de um lead
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