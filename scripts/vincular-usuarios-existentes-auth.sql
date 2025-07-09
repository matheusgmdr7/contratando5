-- Script para vincular usuários existentes do Supabase Auth
-- Data: $(date)
-- Descrição: Vincula usuários do Supabase Auth com a tabela usuarios_admin

-- 1. Função para vincular usuário existente
CREATE OR REPLACE FUNCTION vincular_usuario_auth(
    p_email TEXT,
    p_nome TEXT,
    p_perfil TEXT DEFAULT 'assistente'
) RETURNS TEXT AS $$
DECLARE
    v_auth_user_id UUID;
    v_result TEXT;
BEGIN
    -- Buscar o auth_user_id pelo email (isso seria feito via API do Supabase)
    -- Por enquanto, vamos assumir que o ID é conhecido ou usar um placeholder
    
    -- Verificar se o usuário já existe na tabela
    IF EXISTS (SELECT 1 FROM usuarios_admin WHERE email = p_email) THEN
        -- Atualizar usuário existente
        UPDATE usuarios_admin 
        SET 
            nome = p_nome,
            perfil = p_perfil,
            updated_at = NOW()
        WHERE email = p_email;
        
        v_result := 'Usuário atualizado: ' || p_email;
    ELSE
        -- Criar novo usuário (sem auth_user_id por enquanto)
        INSERT INTO usuarios_admin (
            id,
            nome, 
            email, 
            ativo, 
            perfil, 
            permissoes,
            created_at, 
            updated_at
        ) VALUES (
            gen_random_uuid(),
            p_nome, 
            p_email, 
            true, 
            p_perfil, 
            '{}',
            NOW(), 
            NOW()
        );
        
        v_result := 'Usuário criado: ' || p_email;
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 2. Vincular usuários conhecidos
-- (Execute estas linhas uma por vez, substituindo os valores)

-- Exemplo para o usuário contato@contratandoplanos.com.br
SELECT vincular_usuario_auth(
    'contato@contratandoplanos.com.br',
    'Contato Contratando Planos',
    'master'
);

-- Exemplo para outros usuários (ajuste conforme necessário)
-- SELECT vincular_usuario_auth('admin@sistema.com', 'Administrador Sistema', 'master');
-- SELECT vincular_usuario_auth('admin@contratandoplanos.com', 'Admin Contratando', 'admin');

-- 3. Verificar usuários vinculados
SELECT 
    id,
    nome,
    email,
    perfil,
    ativo,
    auth_user_id,
    created_at
FROM usuarios_admin 
ORDER BY created_at DESC;

-- 4. Função para atualizar auth_user_id (quando conhecido)
CREATE OR REPLACE FUNCTION atualizar_auth_user_id(
    p_email TEXT,
    p_auth_user_id UUID
) RETURNS TEXT AS $$
BEGIN
    UPDATE usuarios_admin 
    SET 
        auth_user_id = p_auth_user_id,
        updated_at = NOW()
    WHERE email = p_email;
    
    IF FOUND THEN
        RETURN 'Auth User ID atualizado para: ' || p_email;
    ELSE
        RETURN 'Usuário não encontrado: ' || p_email;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Exemplo de uso da função de atualização
-- SELECT atualizar_auth_user_id('contato@contratandoplanos.com.br', 'uuid-do-auth-user');

-- 6. Verificar status da integração
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(auth_user_id) as usuarios_vinculados,
    COUNT(*) - COUNT(auth_user_id) as usuarios_sem_vinculo
FROM usuarios_admin;

-- 7. Listar usuários sem vínculo
SELECT 
    id,
    nome,
    email,
    perfil,
    created_at
FROM usuarios_admin 
WHERE auth_user_id IS NULL
ORDER BY created_at DESC; 