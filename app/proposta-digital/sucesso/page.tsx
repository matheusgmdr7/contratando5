"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, ArrowLeft, FileText, User, Calendar, DollarSign, Users } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface PropostaData {
  id: string
  nome: string
  email: string
  telefone: string
  produto_nome?: string
  valor_mensal: number
  valor?: number // Adicionado para cálculo correto
  status: string
  created_at: string
  pdf_url?: string
  dependentes_dados?: any[] // Adicionado para suportar o novo cálculo
  dependentes?: any[] // Adicionado para suportar o novo cálculo
}

export default function SucessoPage() {
  const searchParams = useSearchParams()
  const propostaId = searchParams.get("id")
  const [proposta, setProposta] = useState<PropostaData | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [valorTotalMensal, setValorTotalMensal] = useState<number>(0)
  const [detalhesValores, setDetalhesValores] = useState<any[]>([])
  const [dependentes, setDependentes] = useState<any[]>([])

  useEffect(() => {
    if (propostaId) {
      carregarProposta()
    } else {
      setCarregando(false)
    }
  }, [propostaId])

  useEffect(() => {
    if (proposta) {
      // Sempre tentar carregar dependentes, mesmo se tem_dependentes for false
      let dependentesArr: any[] = []
      if (proposta.dependentes_dados && Array.isArray(proposta.dependentes_dados) && proposta.dependentes_dados.length > 0) {
        dependentesArr = proposta.dependentes_dados
      } else if (typeof proposta.dependentes === "string" && proposta.dependentes && (proposta.dependentes as string).length > 0) {
        try {
          dependentesArr = JSON.parse(proposta.dependentes as string)
        } catch {}
      } else if (Array.isArray(proposta.dependentes) && proposta.dependentes && (proposta.dependentes as any[]).length > 0) {
        dependentesArr = proposta.dependentes
      }
      setDependentes(dependentesArr)

      // Calcular valor total
      let total = 0
      const detalhes: any[] = []
      // Valor do titular
      let valorTitular = proposta.valor_mensal || proposta.valor || 0
      if (typeof valorTitular !== "number") {
        const valorStr = String(valorTitular).replace(/[^\d,\.]/g, "").replace(",", ".")
        valorTitular = Number.parseFloat(valorStr)
      }
      if (!isNaN(valorTitular) && valorTitular > 0) {
        total += valorTitular
        detalhes.push({ nome: proposta.nome, valor: valorTitular, tipo: "titular" })
      }
      // Valores dos dependentes
      if (dependentesArr && dependentesArr.length > 0) {
        dependentesArr.forEach((dep, idx) => {
          let valorDep = dep.valor_individual || dep.valor || dep.valor_plano || 0
          if (typeof valorDep !== "number") {
            valorDep = String(valorDep).replace(/[^\d,\.]/g, "").replace(",", ".")
            valorDep = Number.parseFloat(valorDep)
          }
          if (!isNaN(valorDep) && valorDep > 0) {
            total += valorDep
            detalhes.push({ nome: dep.nome || `Dependente ${idx + 1}`, valor: valorDep, tipo: "dependente", parentesco: dep.parentesco })
          }
        })
      }
      setValorTotalMensal(total)
      setDetalhesValores(detalhes)
    }
  }, [proposta])

  const carregarProposta = async () => {
    try {
      console.log("🔍 Carregando proposta:", propostaId)

      const { data, error } = await supabase.from("propostas").select("*").eq("id", propostaId).single()

      if (error) {
        console.error("❌ Erro ao carregar proposta:", error)
        toast.error("Erro ao carregar dados da proposta")
        return
      }

      if (data) {
        console.log("✅ Proposta carregada:", data)
        setProposta(data)
      }
    } catch (error) {
      console.error("❌ Erro geral:", error)
      toast.error("Erro ao carregar proposta")
    } finally {
      setCarregando(false)
    }
  }

  const handleDownloadPDF = () => {
    if (proposta?.pdf_url) {
      window.open(proposta.pdf_url, "_blank")
    } else {
      toast.error("PDF não disponível")
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados da proposta...</p>
        </div>
      </div>
    )
  }

  if (!propostaId || !proposta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-6">
            <div className="text-red-500 mb-4">
              <FileText className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Proposta não encontrada</h1>
            <p className="text-gray-600 mb-4">
              Não foi possível encontrar os dados da proposta. Verifique o link ou entre em contato conosco.
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header de Sucesso */}
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="text-center p-8">
              <div className="text-green-600 mb-4">
                <CheckCircle className="h-20 w-20 mx-auto" />
              </div>
              <h1 className="text-3xl font-bold text-green-800 mb-2">Proposta Finalizada!</h1>
              <p className="text-green-700 text-lg">Sua proposta foi enviada com sucesso e está sendo analisada.</p>
            </CardContent>
          </Card>

          {/* Informações da Proposta */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalhes da Proposta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="font-semibold">{proposta.nome}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Data</p>
                    <p className="font-semibold">{new Date(proposta.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Valor Mensal</p>
                    <p className="font-semibold text-green-600">
                      R$ {valorTotalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold text-blue-600 capitalize">{proposta.status}</p>
                  </div>
                </div>
              </div>

              {proposta.produto_nome && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Produto Selecionado</p>
                  <p className="font-semibold">{proposta.produto_nome}</p>
                </div>
              )}

              {/* Exibir detalhamento dos valores se houver dependentes */}
              {detalhesValores.length > 1 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 font-semibold mb-2 flex items-center"><Users className="h-4 w-4 mr-1" /> Detalhamento dos valores</p>
                  <ul className="text-sm text-green-800 space-y-1">
                    {detalhesValores.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>
                          {item.tipo === "titular" ? "Titular" : item.nome}
                          {item.tipo === "dependente" && item.parentesco ? (
                            <span className="text-xs text-gray-500 ml-1">({item.parentesco})</span>
                          ) : null}
                        </span>
                        <span>R$ {Number(item.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">O que acontece agora?</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Sua proposta será analisada pela nossa equipe</li>
                  <li>• Você receberá atualizações por email</li>
                  <li>• O processo de análise pode levar até 2 dias úteis</li>
                  <li>• Em caso de aprovação, você receberá o contrato para assinatura</li>
                </ul>
              </div>

              {proposta.pdf_url && (
                <div className="flex gap-3">
                  <Button onClick={handleDownloadPDF} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Download className="mr-2 h-4 w-4" />
                    Visualizar PDF da Proposta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Precisa de Ajuda?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <p className="text-gray-600">Se você tiver dúvidas sobre sua proposta, entre em contato conosco:</p>
                <div className="flex justify-center">
                  <Button variant="outline" asChild>
                    <a href="mailto:contato@contratandoplanos.com.br">Email: contato@contratandoplanos.com.br</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão Voltar */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button variant="outline" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
