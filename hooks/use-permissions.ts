import { useEffect, useState } from "react"

export interface Permissao {
  visualizar: boolean
  criar: boolean
  editar: boolean
  excluir: boolean
}

export interface UsuarioPermissoes {
  id: string
  email: string
  perfil: string
  permissoes: Record<string, Permissao>
}

export function usePermissions() {
  const [usuario, setUsuario] = useState<UsuarioPermissoes | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarUsuario = () => {
      try {
        const usuarioData = localStorage.getItem("adminUser")
        if (usuarioData) {
          const usuarioObj = JSON.parse(usuarioData)
          setUsuario({
            id: usuarioObj.id,
            email: usuarioObj.email,
            perfil: usuarioObj.perfil || "assistente",
            permissoes: usuarioObj.permissoes || {},
          })
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

  return {
    usuario,
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
  }
} 