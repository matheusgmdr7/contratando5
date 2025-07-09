import { useEffect, useState } from "react"
import { AdminAuthIntegration, UsuarioAdminCompleto, Permissao } from "@/services/admin-auth-integration"

export function useAdminPermissions() {
  const [usuario, setUsuario] = useState<UsuarioAdminCompleto | null>(null)
  const [loading, setLoading] = useState(true)
  const [permissoes, setPermissoes] = useState<Record<string, Permissao> | null>(null)

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        setLoading(true)
        const usuarioCompleto = await AdminAuthIntegration.getCurrentUserWithPermissions()
        
        if (usuarioCompleto) {
          setUsuario(usuarioCompleto)
          setPermissoes(usuarioCompleto.permissoes)
          
          // Atualizar último login
          await AdminAuthIntegration.updateLastLogin()
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarUsuario()
  }, [])

  const temPermissao = (modulo: string, acao: string): boolean => {
    if (!usuario) return false

    // Master sempre tem acesso total
    if (usuario.perfil === "master") return true

    // Verificar permissões específicas do módulo
    const permissoesModulo = usuario.permissoes[modulo]
    if (!permissoesModulo) return false

    return permissoesModulo[acao] === true
  }

  const podeVisualizar = (modulo: string): boolean => {
    return temPermissao(modulo, "visualizar")
  }

  const podeCriar = (modulo: string): boolean => {
    return temPermissao(modulo, "criar")
  }

  const podeEditar = (modulo: string): boolean => {
    return temPermissao(modulo, "editar")
  }

  const podeExcluir = (modulo: string): boolean => {
    return temPermissao(modulo, "excluir")
  }

  const getPermissoesModulo = (modulo: string): Permissao | null => {
    if (!usuario) return null
    return usuario.permissoes[modulo] || null
  }

  const isMaster = (): boolean => {
    return usuario?.perfil === "master"
  }

  const isSecretaria = (): boolean => {
    return usuario?.perfil === "secretaria"
  }

  const isAssistente = (): boolean => {
    return usuario?.perfil === "assistente"
  }

  const recarregarUsuario = async () => {
    try {
      setLoading(true)
      const usuarioCompleto = await AdminAuthIntegration.getCurrentUserWithPermissions()
      
      if (usuarioCompleto) {
        setUsuario(usuarioCompleto)
        setPermissoes(usuarioCompleto.permissoes)
      }
    } catch (error) {
      console.error("Erro ao recarregar usuário:", error)
    } finally {
      setLoading(false)
    }
  }

  return {
    usuario,
    permissoes,
    loading,
    temPermissao,
    podeVisualizar,
    podeCriar,
    podeEditar,
    podeExcluir,
    getPermissoesModulo,
    isMaster,
    isSecretaria,
    isAssistente,
    recarregarUsuario,
  }
} 