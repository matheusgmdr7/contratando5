import { supabase } from "@/lib/supabase-auth"
import { supabase as supabaseClient } from "@/lib/supabase"

export interface UsuarioAdminCompleto {
  id: string
  email: string
  nome: string
  perfil: string
  permissoes: Record<string, any>
  ativo: boolean
  ultimo_login?: string
  created_at: string
  updated_at: string
  auth_user_id?: string
}

export interface Permissao {
  visualizar: boolean
  criar: boolean
  editar: boolean
  excluir: boolean
}

/**
 * Serviço para integrar Supabase Auth com sistema de permissões
 */
export class AdminAuthIntegration {
  /**
   * Obter usuário atual com permissões
   */
  static async getCurrentUserWithPermissions(): Promise<UsuarioAdminCompleto | null> {
    try {
      // 1. Obter sessão do Supabase Auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.log("❌ Nenhuma sessão ativa")
        return null
      }

      const userEmail = session.user.email
      if (!userEmail) {
        console.log("❌ Email não encontrado na sessão")
        return null
      }

      // 2. Buscar dados do usuário na tabela usuarios_admin
      const { data: usuarioAdmin, error: userError } = await supabaseClient
        .from("usuarios_admin")
        .select("*")
        .eq("email", userEmail.toLowerCase())
        .eq("ativo", true)
        .single()

      if (userError || !usuarioAdmin) {
        console.log("❌ Usuário não encontrado na tabela admin ou inativo")
        return null
      }

      // 3. Retornar usuário com permissões
      return {
        id: usuarioAdmin.id,
        email: usuarioAdmin.email,
        nome: usuarioAdmin.nome,
        perfil: usuarioAdmin.perfil || "assistente",
        permissoes: usuarioAdmin.permissoes || {},
        ativo: usuarioAdmin.ativo,
        ultimo_login: usuarioAdmin.ultimo_login,
        created_at: usuarioAdmin.created_at,
        updated_at: usuarioAdmin.updated_at,
        auth_user_id: usuarioAdmin.auth_user_id,
      }
    } catch (error) {
      console.error("❌ Erro ao obter usuário com permissões:", error)
      return null
    }
  }

  /**
   * Verificar se usuário tem permissão específica
   */
  static async hasPermission(modulo: string, acao: string): Promise<boolean> {
    try {
      const usuario = await this.getCurrentUserWithPermissions()
      
      if (!usuario) return false

      // Master sempre tem acesso total
      if (usuario.perfil === "master") return true

      // Verificar permissões específicas
      const permissoesModulo = usuario.permissoes[modulo]
      if (!permissoesModulo) return false

      return permissoesModulo[acao] === true
    } catch (error) {
      console.error("❌ Erro ao verificar permissão:", error)
      return false
    }
  }

  /**
   * Obter permissões do usuário atual
   */
  static async getCurrentUserPermissions(): Promise<Record<string, Permissao> | null> {
    try {
      const usuario = await this.getCurrentUserWithPermissions()
      return usuario?.permissoes || null
    } catch (error) {
      console.error("❌ Erro ao obter permissões:", error)
      return null
    }
  }

  /**
   * Atualizar último login do usuário
   */
  static async updateLastLogin(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email) return

      await supabaseClient
        .from("usuarios_admin")
        .update({
          ultimo_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("email", session.user.email.toLowerCase())
    } catch (error) {
      console.error("❌ Erro ao atualizar último login:", error)
    }
  }

  /**
   * Criar usuário admin no Supabase Auth e na tabela de permissões
   */
  static async createAdminUser(dados: {
    email: string
    password: string
    nome: string
    perfil?: string
    permissoes?: Record<string, any>
  }): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: dados.email,
        password: dados.password,
        email_confirm: true,
        user_metadata: {
          role: "admin",
          nome: dados.nome,
          perfil: dados.perfil || "assistente",
        }
      })

      if (authError) {
        return {
          success: false,
          message: `Erro ao criar usuário no Auth: ${authError.message}`
        }
      }

      // 2. Criar registro na tabela usuarios_admin (sem senha_hash)
      const { error: dbError } = await supabaseClient
        .from("usuarios_admin")
        .insert({
          id: authUser.user.id, // Usar o mesmo ID do Auth
          nome: dados.nome,
          email: dados.email.toLowerCase(),
          perfil: dados.perfil || "assistente",
          permissoes: dados.permissoes || {},
          ativo: true,
          auth_user_id: authUser.user.id,
        })

      if (dbError) {
        // Se falhar na tabela, remover do Auth
        await supabase.auth.admin.deleteUser(authUser.user.id)
        return {
          success: false,
          message: `Erro ao criar usuário na tabela: ${dbError.message}`
        }
      }

      return {
        success: true,
        message: "Usuário admin criado com sucesso"
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erro inesperado: ${error.message}`
      }
    }
  }

  /**
   * Atualizar permissões do usuário
   */
  static async updateUserPermissions(
    userId: string, 
    permissoes: Record<string, any>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabaseClient
        .from("usuarios_admin")
        .update({
          permissoes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        return {
          success: false,
          message: `Erro ao atualizar permissões: ${error.message}`
        }
      }

      return {
        success: true,
        message: "Permissões atualizadas com sucesso"
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erro inesperado: ${error.message}`
      }
    }
  }

  /**
   * Vincular usuário existente do Supabase Auth com a tabela de permissões
   */
  static async linkExistingUser(
    email: string,
    dados: {
      nome: string
      perfil?: string
      permissoes?: Record<string, any>
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Buscar usuário no Supabase Auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        return {
          success: false,
          message: `Erro ao buscar usuários: ${authError.message}`
        }
      }

      const authUser = authUsers.users.find(u => u.email === email)
      if (!authUser) {
        return {
          success: false,
          message: "Usuário não encontrado no Supabase Auth"
        }
      }

      // 2. Criar/atualizar registro na tabela usuarios_admin
      const { error: dbError } = await supabaseClient
        .from("usuarios_admin")
        .upsert({
          id: authUser.id,
          nome: dados.nome,
          email: email.toLowerCase(),
          perfil: dados.perfil || "assistente",
          permissoes: dados.permissoes || {},
          ativo: true,
          auth_user_id: authUser.id,
        })

      if (dbError) {
        return {
          success: false,
          message: `Erro ao vincular usuário: ${dbError.message}`
        }
      }

      return {
        success: true,
        message: "Usuário vinculado com sucesso"
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erro inesperado: ${error.message}`
      }
    }
  }
} 