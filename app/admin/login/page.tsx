"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { signInAdmin } from "@/lib/supabase-auth"

export default function AdminLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      console.log("Tentando fazer login com:", formData.email)
      
      await signInAdmin(formData.email, formData.password)
      
      console.log("Login bem-sucedido")
      toast.success("Login realizado com sucesso!")
      router.push("/admin")
    } catch (error: any) {
      console.error("Erro de login:", error)
      setErrorMessage(error.message || "Erro ao fazer login")
      toast.error(error.message || "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

// ... existing code ...
