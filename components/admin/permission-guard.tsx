"use client"

import { ReactNode } from "react"
import { useAdminPermissions } from "@/hooks/use-admin-permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Lock } from "lucide-react"

interface PermissionGuardProps {
  modulo: string
  acao?: "visualizar" | "criar" | "editar" | "excluir"
  children: ReactNode
  fallback?: ReactNode
  showAlert?: boolean
  redirectTo?: string
}

export function PermissionGuard({
  modulo,
  acao = "visualizar",
  children,
  fallback,
  showAlert = true,
  redirectTo,
}: PermissionGuardProps) {
  const { temPermissao, loading } = useAdminPermissions()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const temAcesso = temPermissao(modulo, acao)

  if (!temAcesso) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showAlert) {
      return (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para {acao} o módulo {modulo}.
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return <>{children}</>
}

interface ModuleGuardProps {
  modulo: string
  children: ReactNode
  fallback?: ReactNode
}

export function ModuleGuard({ modulo, children, fallback }: ModuleGuardProps) {
  const { podeVisualizar, loading } = useAdminPermissions()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!podeVisualizar(modulo)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Você não tem acesso ao módulo {modulo}.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}

interface ActionButtonProps {
  modulo: string
  acao: "criar" | "editar" | "excluir"
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function ActionButton({
  modulo,
  acao,
  children,
  onClick,
  disabled = false,
  variant = "default",
  size = "default",
  className = "",
}: ActionButtonProps) {
  const { temPermissao } = useAdminPermissions()
  const temAcesso = temPermissao(modulo, acao)

  if (!temAcesso) {
    return null
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${className}`}
    >
      {children}
    </button>
  )
} 