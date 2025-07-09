-- Script para verificar dados da tabela leads
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela leads existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'leads'
) as tabela_existe;

-- 2. Contar total de leads
SELECT COUNT(*) as total_leads FROM leads;

-- 3. Verificar tipos de dados no campo plano_id
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
ORDER BY quantidade DESC;

-- 4. Verificar leads com plano_id numérico (que podem estar causando problemas)
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
LIMIT 10;

-- 5. Verificar estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- 6. Verificar se há leads com plano_id NULL ou vazio
SELECT 
    COUNT(*) as leads_sem_plano_id
FROM leads 
WHERE plano_id IS NULL OR plano_id = '';

-- 7. Verificar distribuição por status
SELECT 
    status,
    COUNT(*) as quantidade
FROM leads 
GROUP BY status 
ORDER BY quantidade DESC;

-- 8. Verificar distribuição por operadora
SELECT 
    plano_operadora,
    COUNT(*) as quantidade
FROM leads 
GROUP BY plano_operadora 
ORDER BY quantidade DESC;

-- 9. Verificar leads dos últimos 7 dias
SELECT 
    DATE(data_registro) as data,
    COUNT(*) as leads_criados
FROM leads 
WHERE data_registro >= NOW() - INTERVAL '7 days'
GROUP BY DATE(data_registro)
ORDER BY data DESC; 