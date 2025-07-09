"use client"

import { ReactNode } from "react"
import { useAdminPermissions } from "@/hooks/use-admin-permissions"
import { Button, ButtonProps } from "@/components/ui/button"

interface PermissionButtonProps extends Omit<ButtonProps, 'onClick'> {
  modulo: string
  acao: "visualizar" | "criar" | "editar" | "excluir"
  children: ReactNode
  onClick?: () => void
  fallback?: ReactNode
  showDisabled?: boolean
}

export function PermissionButton({
  modulo,
  acao,
  children,
  onClick,
  fallback,
  showDisabled = false,
  disabled = false,
  ...buttonProps
}: PermissionButtonProps) {
  const { temPermissao } = useAdminPermissions()
  const temAcesso = temPermissao(modulo, acao)

  if (!temAcesso) {
    if (fallback) {
      return <>{fallback}</>
    }
    return null
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled || showDisabled}
      {...buttonProps}
    >
      {children}
    </Button>
  )
}

interface PermissionIconButtonProps {
  modulo: string
  acao: "visualizar" | "criar" | "editar" | "excluir"
  children: ReactNode
  onClick?: () => void
  className?: string
  title?: string
}

export function PermissionIconButton({
  modulo,
  acao,
  children,
  onClick,
  className = "",
  title,
}: PermissionIconButtonProps) {
  const { temPermissao } = useAdminPermissions()
  const temAcesso = temPermissao(modulo, acao)

  if (!temAcesso) {
    return null
  }

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${className}`}
      title={title}
    >
      {children}
    </button>
  )
} 