"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-auth"
import Link from "next/link"
import { Settings, User, LogOut } from "lucide-react"
import { signOutAdmin } from "@/lib/supabase-auth"
import { Button } from "@/components/ui/button"

export default function AdminHeader() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function getUserInfo() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/admin/login")
        return
      }
      setUserEmail(session.user.email || null)

      // Extrair nome do email (parte antes do @)
      if (session.user.email) {
        const namePart = session.user.email.split("@")[0]
        // Capitalizar primeira letra de cada palavra
        const formattedName = namePart
          .split(".")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
        setUserName(formattedName)
      }
    }
    getUserInfo()
  }, [router])

  const handleLogout = async () => {
    try {
      await signOutAdmin()
      router.push("/admin/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

// ... existing code ...
