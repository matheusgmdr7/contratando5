"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { validarSenhaUsuarioAdmin, UsuariosAdminService } from "@/services/usuarios-admin-service"

export default function DebugLoginPage() {
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", senha: "" })
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const handleTestLogin = async () => {
    try {
      if (!loginData.email || !loginData.senha) {
        toast.error("Preencha email e senha")
        return
      }

      setLoading(true)
      setDebugInfo(null)
      
      console.log("🔍 Testando login com:", loginData.email)
      
      // Teste 1: Verificar se o usuário existe
      const { data: usuario, error } = await fetch('/api/debug-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginData.email })
      }).then(res => res.json())

      console.log("📊 Dados do usuário:", usuario)
      console.log("❌ Erro (se houver):", error)

      // Teste 2: Tentar login
      const resultadoLogin = await validarSenhaUsuarioAdmin(loginData.email, loginData.senha)
      
      console.log("🔐 Resultado do login:", resultadoLogin)

      setDebugInfo({
        usuario,
        error,
        resultadoLogin,
        timestamp: new Date().toISOString()
      })

      if (resultadoLogin) {
        toast.success(`Login realizado com sucesso! Bem-vindo, ${resultadoLogin.nome}`)
      } else {
        toast.error("Email ou senha inválidos")
      }
    } catch (error: any) {
      console.error("❌ Erro no teste:", error)
      toast.error(error.message || "Erro no teste")
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestCriarUsuario = async () => {
    try {
      setLoading(true)
      
      const resultado = await UsuariosAdminService.criarUsuario({
        nome: "Usuário Teste Debug",
        email: "debug@teste.com",
        senha: "123456",
        perfil: "assistente"
      })

      console.log("🔧 Resultado da criação:", resultado)
      toast.success(resultado.message)
      
      setDebugInfo({
        criacao: resultado,
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      console.error("❌ Erro ao criar usuário:", error)
      toast.error(error.message || "Erro ao criar usuário")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Debug do Sistema de Login</h1>
        <p className="text-gray-600">Ferramenta para debugar problemas de autenticação</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teste de Login */}
        <Card>
          <CardHeader>
            <CardTitle>1. Testar Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="teste@teste.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="123456"
                value={loginData.senha}
                onChange={(e) => setLoginData({ ...loginData, senha: e.target.value })}
              />
            </div>
            <Button onClick={handleTestLogin} disabled={loading} className="w-full">
              {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Testar Login
            </Button>
          </CardContent>
        </Card>

        {/* Criar Usuário de Teste */}
        <Card>
          <CardHeader>
            <CardTitle>2. Criar Usuário de Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Cria um usuário de teste com email: debug@teste.com e senha: 123456
            </p>
            <Button onClick={handleTestCriarUsuario} disabled={loading} className="w-full">
              {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Criar Usuário Teste
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informações de Debug */}
      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 