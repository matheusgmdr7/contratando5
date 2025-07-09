"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { UsuariosAdminService } from "@/services/usuarios-admin-service"
import { Eye, EyeOff, UserPlus, Users, CheckCircle, XCircle } from "lucide-react"

export default function TestarCadastroUsuarioPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "assistente",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const { toast } = useToast()

  const handleTestarCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResultado(null)

    try {
      console.log("🧪 Testando cadastro de usuário:", formData.email)
      
      const resultado = await UsuariosAdminService.criarUsuario(formData)
      
      setResultado({
        success: resultado.success,
        message: resultado.message,
        usuario: resultado.usuario,
        timestamp: new Date().toISOString(),
      })

      if (resultado.success) {
        toast({
          title: "✅ Sucesso",
          description: "Usuário criado com sucesso na tabela local",
        })
      } else {
        toast({
          title: "❌ Erro",
          description: resultado.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setResultado({
        success: false,
        message: "Erro inesperado: " + error.message,
        timestamp: new Date().toISOString(),
      })
      
      toast({
        title: "❌ Erro",
        description: "Erro inesperado ao testar cadastro",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestarLogin = async () => {
    if (!formData.email || !formData.senha) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e senha para testar login",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResultado(null)

    try {
      console.log("🧪 Testando login:", formData.email)
      
      const resultado = await UsuariosAdminService.login({
        email: formData.email,
        senha: formData.senha,
      })
      
      setResultado({
        success: resultado.success,
        message: resultado.message,
        usuario: resultado.usuario,
        timestamp: new Date().toISOString(),
        tipo: "login",
      })

      if (resultado.success) {
        toast({
          title: "✅ Login bem-sucedido",
          description: "Usuário autenticado com sucesso",
        })
      } else {
        toast({
          title: "❌ Login falhou",
          description: resultado.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setResultado({
        success: false,
        message: "Erro inesperado no login: " + error.message,
        timestamp: new Date().toISOString(),
        tipo: "login",
      })
      
      toast({
        title: "❌ Erro",
        description: "Erro inesperado ao testar login",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleListarUsuarios = async () => {
    setLoading(true)
    setResultado(null)

    try {
      console.log("🧪 Listando usuários...")
      
      const resultado = await UsuariosAdminService.listarUsuarios()
      
      setResultado({
        success: resultado.success,
        message: resultado.message,
        usuarios: resultado.usuarios,
        total: resultado.usuarios?.length || 0,
        timestamp: new Date().toISOString(),
        tipo: "listagem",
      })

      if (resultado.success) {
        toast({
          title: "✅ Listagem bem-sucedida",
          description: `${resultado.usuarios?.length || 0} usuários encontrados`,
        })
      } else {
        toast({
          title: "❌ Erro na listagem",
          description: resultado.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setResultado({
        success: false,
        message: "Erro inesperado na listagem: " + error.message,
        timestamp: new Date().toISOString(),
        tipo: "listagem",
      })
      
      toast({
        title: "❌ Erro",
        description: "Erro inesperado ao listar usuários",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Testar Cadastro de Usuários</h1>
        <p className="text-muted-foreground">
          Teste o sistema de cadastro de usuários (versão simplificada - tabela local)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Formulário de Teste
            </CardTitle>
            <CardDescription>
              Preencha os dados para testar o cadastro de usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTestarCadastro} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@exemplo.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    placeholder="Digite a senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="perfil">Perfil</Label>
                <Select
                  value={formData.perfil}
                  onValueChange={(value) => setFormData({ ...formData, perfil: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assistente">Assistente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Testando..." : "Testar Cadastro"}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleTestarLogin}
                  disabled={loading || !formData.email || !formData.senha}
                >
                  Testar Login
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleListarUsuarios}
                  disabled={loading}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Listar Usuários
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Resultado do Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {resultado ? (
                resultado.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )
              ) : (
                <div className="h-5 w-5" />
              )}
              Resultado do Teste
            </CardTitle>
            <CardDescription>
              Resultado da operação de teste
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!resultado ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Execute um teste para ver o resultado</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    resultado.success 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {resultado.success ? "Sucesso" : "Erro"}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Mensagem:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {resultado.message}
                  </p>
                </div>
                
                {resultado.timestamp && (
                  <div>
                    <span className="font-medium">Timestamp:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(resultado.timestamp).toLocaleString("pt-BR")}
                    </p>
                  </div>
                )}
                
                {resultado.usuario && (
                  <div>
                    <span className="font-medium">Usuário Criado:</span>
                    <div className="bg-muted p-3 rounded mt-2 text-sm">
                      <p><strong>ID:</strong> {resultado.usuario.id}</p>
                      <p><strong>Nome:</strong> {resultado.usuario.nome}</p>
                      <p><strong>Email:</strong> {resultado.usuario.email}</p>
                      <p><strong>Perfil:</strong> {resultado.usuario.perfil}</p>
                      <p><strong>Ativo:</strong> {resultado.usuario.ativo ? "Sim" : "Não"}</p>
                    </div>
                  </div>
                )}
                
                {resultado.usuarios && (
                  <div>
                    <span className="font-medium">Usuários ({resultado.total}):</span>
                    <div className="bg-muted p-3 rounded mt-2 text-sm max-h-60 overflow-y-auto">
                      {resultado.usuarios.map((usuario: any, index: number) => (
                        <div key={usuario.id} className="border-b border-border pb-2 mb-2 last:border-b-0">
                          <p><strong>{index + 1}.</strong> {usuario.nome}</p>
                          <p className="text-muted-foreground">{usuario.email}</p>
                          <p className="text-xs">
                            Perfil: {usuario.perfil} | 
                            Status: {usuario.ativo ? "Ativo" : "Inativo"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema Simplificado (Tabela Local)</CardTitle>
          <CardDescription>
            Como funciona o sistema atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">🔄 Fluxo de Cadastro:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Verifica se o email já existe na tabela</li>
                <li>Faz hash da senha com bcrypt</li>
                <li>Cria o registro na tabela usuarios_admin</li>
                <li>Retorna sucesso</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🔐 Fluxo de Login:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Busca usuário pelo email na tabela</li>
                <li>Verifica se está ativo</li>
                <li>Compara senha com hash bcrypt</li>
                <li>Atualiza último login</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">📋 Vantagens do Sistema Atual:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Funciona sem permissões especiais</li>
                <li>Senhas criptografadas com bcrypt</li>
                <li>Controle total na tabela local</li>
                <li>Simples e direto</li>
                <li>Compatível com sistema existente</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Nota:</h4>
              <p className="text-sm text-yellow-700">
                Este é o sistema simplificado que funciona apenas com a tabela local. 
                Para integração completa com Supabase Auth, será necessário configurar 
                permissões de administrador no projeto Supabase.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 