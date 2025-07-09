"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { useAdminPermissions } from "@/hooks/use-admin-permissions"
import { AdminAuthIntegration } from "@/services/admin-auth-integration"

const MODULOS_TESTE = [
  { key: "dashboard", label: "Dashboard" },
  { key: "leads", label: "Leads" },
  { key: "propostas", label: "Propostas" },
  { key: "corretores", label: "Corretores" },
  { key: "produtos", label: "Produtos" },
  { key: "tabelas", label: "Tabelas" },
  { key: "comissoes", label: "Comissões" },
  { key: "usuarios", label: "Usuários" },
  { key: "contratos", label: "Contratos" },
  { key: "vendas", label: "Vendas" },
]

const ACOES_TESTE = [
  { key: "visualizar", label: "Visualizar" },
  { key: "criar", label: "Criar" },
  { key: "editar", label: "Editar" },
  { key: "excluir", label: "Excluir" },
]

export default function TestarPermissoesPage() {
  const [loading, setLoading] = useState(true)
  const [testando, setTestando] = useState(false)
  const [resultadoTeste, setResultadoTeste] = useState<any>(null)
  
  const {
    usuario,
    permissoes,
    loading: loadingPermissoes,
    temPermissao,
    podeVisualizar,
    podeCriar,
    podeEditar,
    podeExcluir,
    isMaster,
    isSecretaria,
    isAssistente,
    recarregarUsuario,
  } = useAdminPermissions()

  useEffect(() => {
    const inicializar = async () => {
      setLoading(true)
      try {
        await recarregarUsuario()
      } catch (error) {
        console.error("Erro ao inicializar:", error)
        toast.error("Erro ao carregar dados do usuário")
      } finally {
        setLoading(false)
      }
    }

    inicializar()
  }, [recarregarUsuario])

  const testarPermissao = async (modulo: string, acao: string) => {
    setTestando(true)
    try {
      const resultado = await AdminAuthIntegration.hasPermission(modulo, acao)
      setResultadoTeste({
        modulo,
        acao,
        resultado,
        timestamp: new Date().toISOString(),
      })
      toast.success(`Teste: ${modulo} - ${acao} = ${resultado ? "✅ Permitido" : "❌ Negado"}`)
    } catch (error) {
      console.error("Erro no teste:", error)
      toast.error("Erro ao testar permissão")
    } finally {
      setTestando(false)
    }
  }

  if (loading || loadingPermissoes) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teste do Sistema de Permissões</h1>
        <p className="text-gray-600">Verificar se as permissões estão funcionando corretamente</p>
      </div>

      {/* Informações do Usuário */}
      {usuario && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Usuário Logado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teste de Funções */}
      <Card>
        <CardHeader>
          <CardTitle>Teste de Funções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded">
              <p className="text-sm text-gray-600">Master</p>
              <Badge variant={isMaster() ? "default" : "secondary"}>
                {isMaster() ? "✅ Sim" : "❌ Não"}
              </Badge>
            </div>
            <div className="text-center p-4 border rounded">
              <p className="text-sm text-gray-600">Secretaria</p>
              <Badge variant={isSecretaria() ? "default" : "secondary"}>
                {isSecretaria() ? "✅ Sim" : "❌ Não"}
              </Badge>
            </div>
            <div className="text-center p-4 border rounded">
              <p className="text-sm text-gray-600">Assistente</p>
              <Badge variant={isAssistente() ? "default" : "secondary"}>
                {isAssistente() ? "✅ Sim" : "❌ Não"}
              </Badge>
            </div>
            <div className="text-center p-4 border rounded">
              <p className="text-sm text-gray-600">Permissões</p>
              <Badge variant={permissoes ? "default" : "destructive"}>
                {permissoes ? "✅ Carregadas" : "❌ Não carregadas"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teste de Permissões por Módulo */}
      <Card>
        <CardHeader>
          <CardTitle>Teste de Permissões por Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MODULOS_TESTE.map((modulo) => (
              <div key={modulo.key} className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">{modulo.label}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ACOES_TESTE.map((acao) => {
                    const temAcesso = temPermissao(modulo.key, acao.key)
                    return (
                      <div key={acao.key} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{acao.label}</span>
                        <Badge variant={temAcesso ? "default" : "secondary"}>
                          {temAcesso ? "✅" : "❌"}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teste Individual */}
      <Card>
        <CardHeader>
          <CardTitle>Teste Individual de Permissão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="p-2 border rounded"
              onChange={(e) => setResultadoTeste(prev => ({ ...prev, modulo: e.target.value }))}
            >
              <option value="">Selecione o módulo</option>
              {MODULOS_TESTE.map((modulo) => (
                <option key={modulo.key} value={modulo.key}>
                  {modulo.label}
                </option>
              ))}
            </select>
            <select
              className="p-2 border rounded"
              onChange={(e) => setResultadoTeste(prev => ({ ...prev, acao: e.target.value }))}
            >
              <option value="">Selecione a ação</option>
              {ACOES_TESTE.map((acao) => (
                <option key={acao.key} value={acao.key}>
                  {acao.label}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                if (resultadoTeste?.modulo && resultadoTeste?.acao) {
                  testarPermissao(resultadoTeste.modulo, resultadoTeste.acao)
                }
              }}
              disabled={!resultadoTeste?.modulo || !resultadoTeste?.acao || testando}
            >
              {testando ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Testar Permissão
            </Button>
          </div>

          {resultadoTeste && (
            <div className="p-4 bg-gray-100 rounded">
              <h4 className="font-medium mb-2">Resultado do Teste:</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(resultadoTeste, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de Recarregar */}
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={recarregarUsuario} disabled={loading}>
            {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Recarregar Dados do Usuário
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 