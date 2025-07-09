"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase-auth"
import { supabase as supabaseClient } from "@/lib/supabase"

export default function DebugPermissoesPage() {
  const [loading, setLoading] = useState(true)
  const [usuario, setUsuario] = useState<any>(null)
  const [permissoes, setPermissoes] = useState<any>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const debugPermissoes = async () => {
      try {
        setLoading(true)
        setErro(null)
        
        console.log("🔍 Iniciando debug de permissões...")

        // 1. Verificar sessão do Supabase Auth
        console.log("📋 1. Verificando sessão do Supabase Auth...")
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw new Error(`Erro na sessão: ${sessionError.message}`)
        }

        if (!session) {
          throw new Error("Nenhuma sessão ativa")
        }

        console.log("✅ Sessão encontrada:", {
          email: session.user.email,
          id: session.user.id
        })

        // 2. Buscar usuário na tabela usuarios_admin
        console.log("📋 2. Buscando usuário na tabela usuarios_admin...")
        const { data: usuarioAdmin, error: userError } = await supabaseClient
          .from("usuarios_admin")
          .select("*")
          .eq("email", session.user.email?.toLowerCase())
          .eq("ativo", true)
          .single()

        if (userError) {
          throw new Error(`Erro ao buscar usuário: ${userError.message}`)
        }

        if (!usuarioAdmin) {
          throw new Error("Usuário não encontrado na tabela admin ou inativo")
        }

        console.log("✅ Usuário encontrado:", {
          id: usuarioAdmin.id,
          nome: usuarioAdmin.nome,
          email: usuarioAdmin.email,
          perfil: usuarioAdmin.perfil,
          ativo: usuarioAdmin.ativo
        })

        setUsuario(usuarioAdmin)
        setPermissoes(usuarioAdmin.permissoes)

        // 3. Atualizar último login
        console.log("📋 3. Atualizando último login...")
        await supabaseClient
          .from("usuarios_admin")
          .update({
            ultimo_login: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("email", session.user.email?.toLowerCase())

        console.log("✅ Debug concluído com sucesso!")

      } catch (error: any) {
        console.error("❌ Erro no debug:", error)
        setErro(error.message)
        toast.error(`Erro: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    debugPermissoes()
  }, [])

  const testarPermissao = (modulo: string, acao: string) => {
    if (!usuario) return false

    // Master sempre tem acesso total
    if (usuario.perfil === "master") return true

    // Verificar permissões específicas
    const permissoesModulo = usuario.permissoes[modulo]
    if (!permissoesModulo) return false

    return permissoesModulo[acao] === true
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <Spinner className="h-8 w-8" />
          <span className="ml-2">Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Debug do Sistema de Permissões</h1>
        <p className="text-gray-600">Identificar problemas no sistema de permissões</p>
      </div>

      {/* Erro */}
      {erro && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Erro Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{erro}</p>
          </CardContent>
        </Card>
      )}

      {/* Informações do Usuário */}
      {usuario && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Usuário Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="font-mono text-sm">{usuario.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium">{usuario.nome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{usuario.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Perfil</p>
                <Badge variant="outline" className="mt-1">
                  {usuario.perfil}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={usuario.ativo ? "default" : "destructive"} className="mt-1">
                  {usuario.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Último Login</p>
                <p className="text-sm">{usuario.ultimo_login || "Nunca"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permissões */}
      {permissoes && (
        <Card>
          <CardHeader>
            <CardTitle>Permissões do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(permissoes).map(([modulo, permissaoModulo]) => (
                <div key={modulo} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 capitalize">{modulo}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(permissaoModulo as any).map(([acao, permitido]) => (
                      <div key={acao} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm capitalize">{acao}</span>
                        <Badge variant={permitido ? "default" : "secondary"}>
                          {permitido ? "✅" : "❌"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teste Rápido */}
      {usuario && (
        <Card>
          <CardHeader>
            <CardTitle>Teste Rápido de Permissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded">
                <p className="text-sm text-gray-600">Dashboard - Visualizar</p>
                <Badge variant={testarPermissao("dashboard", "visualizar") ? "default" : "secondary"}>
                  {testarPermissao("dashboard", "visualizar") ? "✅" : "❌"}
                </Badge>
              </div>
              <div className="text-center p-4 border rounded">
                <p className="text-sm text-gray-600">Usuários - Criar</p>
                <Badge variant={testarPermissao("usuarios", "criar") ? "default" : "secondary"}>
                  {testarPermissao("usuarios", "criar") ? "✅" : "❌"}
                </Badge>
              </div>
              <div className="text-center p-4 border rounded">
                <p className="text-sm text-gray-600">Leads - Editar</p>
                <Badge variant={testarPermissao("leads", "editar") ? "default" : "secondary"}>
                  {testarPermissao("leads", "editar") ? "✅" : "❌"}
                </Badge>
              </div>
              <div className="text-center p-4 border rounded">
                <p className="text-sm text-gray-600">Propostas - Excluir</p>
                <Badge variant={testarPermissao("propostas", "excluir") ? "default" : "secondary"}>
                  {testarPermissao("propostas", "excluir") ? "✅" : "❌"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs do Console */}
      <Card>
        <CardHeader>
          <CardTitle>Logs do Console</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-2">
            Abra o console do navegador (F12) para ver os logs detalhados do debug.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Recarregar Página
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 