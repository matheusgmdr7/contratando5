import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    console.log("🔍 Buscando usuário:", email)

    // Buscar usuário no banco
    const { data: usuario, error } = await supabase
      .from("usuarios_admin")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (error) {
      console.log("❌ Erro ao buscar usuário:", error)
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 404 })
    }

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Retornar dados do usuário (sem senha)
    const { senha_hash, ...usuarioSemSenha } = usuario

    console.log("✅ Usuário encontrado:", usuarioSemSenha.email)

    return NextResponse.json({
      usuario: usuarioSemSenha,
      temSenha: !!senha_hash,
      tamanhoHash: senha_hash ? senha_hash.length : 0,
      ativo: usuario.ativo,
      perfil: usuario.perfil
    })

  } catch (error: any) {
    console.error("❌ Erro inesperado:", error)
    return NextResponse.json({ 
      error: "Erro interno do servidor",
      details: error.message 
    }, { status: 500 })
  }
} 