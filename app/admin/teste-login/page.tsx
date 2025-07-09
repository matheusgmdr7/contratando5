"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { validarSenhaUsuarioAdmin } from "@/services/usuarios-admin-service"

export default function TesteLoginPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [resultado, setResultado] = useState<any>(null)

  const handleTeste = async () => {
    try {
      setLoading(true)
      setResultado(null)
      
      console.log("🧪 Testando login com:", email)
      
      const usuario = await validarSenhaUsuarioAdmin(email, senha)
      
      console.log("🔍 Resultado:", usuario)
      
      setResultado({
        sucesso: !!usuario,
        usuario: usuario ? {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
          ativo: usuario.ativo
        } : null,
        timestamp: new Date().toISOString()
      })

      if (usuario) {
        toast.success(`Login realizado com sucesso! Bem-vindo, ${usuario.nome}`)
      } else {
        toast.error("Email ou senha incorretos")
      }
    } catch (error: any) {
      console.error("❌ Erro no teste:", error)
      toast.error(error.message || "Erro no teste")
      setResultado({
        sucesso: false,
        erro: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Teste de Login - Sistema Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sistema.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="admin123456"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <Button onClick={handleTeste} disabled={loading} className="w-full">
              {loading ? "Testando..." : "Testar Login"}
            </Button>

            {resultado && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="font-bold mb-2">Resultado do Teste:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(resultado, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 