import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export interface UsuarioAdmin {
  id: string
  nome: string
  email: string
  senha_hash?: string
  ativo: boolean
  perfil: string
  permissoes: any
  ultimo_login?: string
  created_at: string
  updated_at: string
  auth_user_id?: string
}

export interface CriarUsuarioData {
  nome: string
  email: string
  senha: string
  perfil?: string
  permissoes?: any
}

export interface LoginData {
  email: string
  senha: string
}

/**
 * Serviço simplificado para gerenciar usuários administrativos
 * Funciona apenas com a tabela local, sem Supabase Auth
 */
export class UsuariosAdminServiceSimples {
  /**
   * Criar um novo usuário admin (Apenas tabela local)
   */
  static async criarUsuario(
    dados: CriarUsuarioData,
  ): Promise<{ success: boolean; message: string; usuario?: UsuarioAdmin }> {
    try {
      console.log("🔐 Criando novo usuário admin (tabela local):", dados.email)

      // 1. Verificar se o email já existe
      const { data: usuarioExistente, error: errorVerificacao } = await supabase
        .from("usuarios_admin")
        .select("email")
        .eq("email", dados.email.toLowerCase())
        .single()

      if (usuarioExistente) {
        return {
          success: false,
          message: "Email já está em uso",
        }
      }

      // 2. Hash da senha
      const saltRounds = 12
      const senhaHash = await bcrypt.hash(dados.senha, saltRounds)

      // 3. Criar usuário na tabela
      console.log("📋 Criando usuário na tabela...")
      const { data: novoUsuario, error } = await supabase
        .from("usuarios_admin")
        .insert([
          {
            id: crypto.randomUUID(),
            nome: dados.nome,
            email: dados.email.toLowerCase(),
            senha_hash: senhaHash,
            ativo: true,
            perfil: dados.perfil || "assistente",
            permissoes: dados.permissoes || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("❌ Erro ao criar usuário:", error)
        return {
          success: false,
          message: "Erro ao criar usuário: " + error.message,
        }
      }

      console.log("✅ Usuário criado com sucesso:", novoUsuario.email)
      return {
        success: true,
        message: "Usuário criado com sucesso na tabela local",
        usuario: {
          ...novoUsuario,
          senha_hash: undefined, // Não retornar o hash
        },
      }
    } catch (error: any) {
      console.error("❌ Erro inesperado ao criar usuário:", error)
      return {
        success: false,
        message: "Erro inesperado: " + error.message,
      }
    }
  }

  /**
   * Fazer login de usuário admin (Apenas tabela local)
   */
  static async login(dados: LoginData): Promise<{ success: boolean; message: string; usuario?: UsuarioAdmin }> {
    try {
      console.log("🔐 Tentativa de login (tabela local):", dados.email)

      // 1. Buscar usuário pelo email
      const { data: usuario, error } = await supabase
        .from("usuarios_admin")
        .select("*")
        .eq("email", dados.email.toLowerCase())
        .eq("ativo", true)
        .single()

      if (error || !usuario) {
        console.log("❌ Usuário não encontrado ou inativo")
        return {
          success: false,
          message: "Email ou senha incorretos",
        }
      }

      // 2. Verificar senha
      const senhaValida = await bcrypt.compare(dados.senha, usuario.senha_hash || "")
      
      if (!senhaValida) {
        console.log("❌ Senha incorreta")
        return {
          success: false,
          message: "Email ou senha incorretos",
        }
      }

      // 3. Atualizar último login
      await supabase
        .from("usuarios_admin")
        .update({
          ultimo_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", usuario.id)

      console.log("✅ Login realizado com sucesso:", usuario.email)
      return {
        success: true,
        message: "Login realizado com sucesso",
        usuario: {
          ...usuario,
          senha_hash: undefined, // Não retornar o hash
        },
      }
    } catch (error: any) {
      console.error("❌ Erro inesperado no login:", error)
      return {
        success: false,
        message: "Erro inesperado: " + error.message,
      }
    }
  }

  /**
   * Listar todos os usuários admin
   */
  static async listarUsuarios(): Promise<{ success: boolean; usuarios: UsuarioAdmin[]; message?: string }> {
    try {
      console.log("📋 Listando usuários admin...")

      const { data: usuarios, error } = await supabase
        .from("usuarios_admin")
        .select("id, nome, email, ativo, ultimo_login, created_at, updated_at, perfil, permissoes, auth_user_id")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Erro ao listar usuários:", error)
        return {
          success: false,
          usuarios: [],
          message: "Erro ao listar usuários: " + error.message,
        }
      }

      console.log(`✅ ${usuarios?.length || 0} usuários encontrados`)
      return {
        success: true,
        usuarios: (usuarios || []).map(u => ({
          ...u,
          perfil: u.perfil || "assistente",
          permissoes: u.permissoes || {},
        })),
      }
    } catch (error: any) {
      console.error("❌ Erro inesperado ao listar usuários:", error)
      return {
        success: false,
        usuarios: [],
        message: "Erro inesperado: " + error.message,
      }
    }
  }

  /**
   * Alterar status do usuário
   */
  static async alterarStatusUsuario(id: string, ativo: boolean): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔄 Alterando status do usuário ${id} para: ${ativo ? "ativo" : "inativo"}`)

      const { error } = await supabase
        .from("usuarios_admin")
        .update({
          ativo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        console.error("❌ Erro ao alterar status:", error)
        return {
          success: false,
          message: "Erro ao alterar status: " + error.message,
        }
      }

      console.log("✅ Status alterado com sucesso")
      return {
        success: true,
        message: `Usuário ${ativo ? "ativado" : "desativado"} com sucesso`,
      }
    } catch (error: any) {
      console.error("❌ Erro inesperado ao alterar status:", error)
      return {
        success: false,
        message: "Erro inesperado: " + error.message,
      }
    }
  }

  /**
   * Alterar senha do usuário
   */
  static async alterarSenha(id: string, novaSenha: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔐 Alterando senha do usuário ${id}`)

      // Hash da nova senha
      const saltRounds = 12
      const senhaHash = await bcrypt.hash(novaSenha, saltRounds)

      const { error } = await supabase
        .from("usuarios_admin")
        .update({
          senha_hash: senhaHash,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        console.error("❌ Erro ao alterar senha:", error)
        return {
          success: false,
          message: "Erro ao alterar senha: " + error.message,
        }
      }

      console.log("✅ Senha alterada com sucesso")
      return {
        success: true,
        message: "Senha alterada com sucesso",
      }
    } catch (error: any) {
      console.error("❌ Erro inesperado ao alterar senha:", error)
      return {
        success: false,
        message: "Erro inesperado: " + error.message,
      }
    }
  }

  /**
   * Excluir usuário
   */
  static async excluirUsuario(id: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🗑️ Excluindo usuário ${id}`)

      const { error } = await supabase
        .from("usuarios_admin")
        .delete()
        .eq("id", id)

      if (error) {
        return {
          success: false,
          message: "Erro ao excluir usuário: " + error.message,
        }
      }

      console.log("✅ Usuário excluído com sucesso")
      return {
        success: true,
        message: "Usuário excluído com sucesso",
      }
    } catch (error: any) {
      console.error("❌ Erro inesperado ao excluir usuário:", error)
      return {
        success: false,
        message: "Erro inesperado: " + error.message,
      }
    }
  }
} 