-- Script para verificar a estrutura atual da tabela leads
-- Execute este script no Supabase SQL Editor para diagnosticar o problema

-- 1. Verificar se a tabela leads existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'leads'
) as tabela_existe;

-- 2. Verificar estrutura atual da tabela leads
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_leads FROM leads;

-- 4. Verificar tipos de dados no campo plano_id (se existir)
SELECT 
    plano_id,
    CASE 
        WHEN plano_id ~ '^[0-9]+$' THEN 'NUMERICO'
        WHEN plano_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'UUID_VALIDO'
        ELSE 'OUTRO_FORMATO'
    END as tipo_plano_id,
    COUNT(*) as quantidade
FROM leads 
GROUP BY plano_id, tipo_plano_id
ORDER BY quantidade DESC
LIMIT 10;

-- 5. Verificar se há leads com plano_id numérico (que podem estar causando problemas)
SELECT 
    id,
    nome,
    email,
    plano_id,
    plano_nome,
    data_registro
FROM leads 
WHERE plano_id ~ '^[0-9]+$'
ORDER BY data_registro DESC
LIMIT 5;

-- 6. Verificar se há leads com plano_id NULL ou vazio
SELECT 
    COUNT(*) as leads_sem_plano_id
FROM leads 
WHERE plano_id IS NULL OR plano_id = '';

-- 7. Verificar se há leads com plano_id que não é UUID válido
SELECT 
    COUNT(*) as leads_plano_id_invalido
FROM leads 
WHERE plano_id IS NOT NULL 
AND plano_id != ''
AND NOT (plano_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
AND NOT (plano_id ~ '^[0-9]+$');

-- 8. Verificar se há leads com plano_id que é UUID válido
SELECT 
    COUNT(*) as leads_plano_id_uuid_valido
FROM leads 
WHERE plano_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 9. Verificar se há leads com plano_id que é numérico
SELECT 
    COUNT(*) as leads_plano_id_numerico
FROM leads 
WHERE plano_id ~ '^[0-9]+$';

-- 10. Mostrar exemplo de leads com diferentes tipos de plano_id
SELECT 
    id,
    nome,
    email,
    plano_id,
    CASE 
        WHEN plano_id ~ '^[0-9]+$' THEN 'NUMERICO'
        WHEN plano_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'UUID_VALIDO'
        ELSE 'OUTRO_FORMATO'
    END as tipo_plano_id,
    data_registro
FROM leads 
ORDER BY data_registro DESC
LIMIT 10; 