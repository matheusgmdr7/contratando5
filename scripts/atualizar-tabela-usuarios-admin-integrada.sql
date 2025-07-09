-- Script para atualizar a tabela usuarios_admin para sistema integrado
-- Data: $(date)
-- Descrição: Adiciona campo auth_user_id e torna senha_hash opcional

-- 1. Adicionar coluna auth_user_id para vincular com Supabase Auth
ALTER TABLE usuarios_admin 
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 2. Tornar senha_hash opcional (não obrigatório)
ALTER TABLE usuarios_admin 
ALTER COLUMN senha_hash DROP NOT NULL;

-- 3. Adicionar índice para auth_user_id para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_auth_user_id 
ON usuarios_admin(auth_user_id);

-- 4. Adicionar índice para email (já deve existir, mas garantindo)
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_email 
ON usuarios_admin(email);

-- 5. Adicionar constraint única para auth_user_id (opcional)
-- ALTER TABLE usuarios_admin 
-- ADD CONSTRAINT unique_auth_user_id UNIQUE (auth_user_id);

-- 6. Verificar estrutura atual da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios_admin' 
ORDER BY ordinal_position;

-- 7. Mostrar dados atuais (opcional - para debug)
-- SELECT id, nome, email, ativo, perfil, auth_user_id, created_at 
-- FROM usuarios_admin 
-- ORDER BY created_at DESC;

-- 8. Comentário sobre a migração
COMMENT ON COLUMN usuarios_admin.auth_user_id IS 'ID do usuário no Supabase Auth para integração';
COMMENT ON COLUMN usuarios_admin.senha_hash IS 'Hash da senha (opcional quando usando Supabase Auth)';

-- 9. Verificar se há usuários existentes que precisam ser migrados
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(auth_user_id) as usuarios_com_auth_id,
    COUNT(senha_hash) as usuarios_com_senha_hash
FROM usuarios_admin;

-- 10. Log da migração (comentado pois system_logs não existe)
-- INSERT INTO system_logs (action, details, created_at) 
-- VALUES (
--     'migration', 
--     'Tabela usuarios_admin atualizada para sistema integrado - auth_user_id adicionado, senha_hash opcional', 
--     NOW()
-- );

-- 11. Mensagem de sucesso
SELECT 'Migração concluída com sucesso!' as status; 