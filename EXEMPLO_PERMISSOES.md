# Sistema de Controle de Permissões - Exemplos de Implementação

## 📋 Visão Geral

O sistema de permissões permite controlar o acesso dos usuários admin a diferentes módulos e ações do sistema.

### Perfis Disponíveis:
- **Master**: Acesso total a todos os módulos
- **Secretaria**: Acesso operacional completo (sem gerenciar usuários)
- **Assistente**: Acesso limitado para consultas

## 🔧 Como Implementar

### 1. Hook de Permissões

```tsx
import { usePermissions } from "@/hooks/use-permissions"

function MinhaPagina() {
  const { 
    podeVisualizar, 
    podeCriar, 
    podeEditar, 
    podeExcluir,
    isMaster 
  } = usePermissions()

  return (
    <div>
      {podeVisualizar("leads") && (
        <div>Conteúdo dos leads</div>
      )}
      
      {podeCriar("propostas") && (
        <button>Criar Proposta</button>
      )}
    </div>
  )
}
```

### 2. Proteção de Páginas/Módulos

```tsx
import { ModuleGuard } from "@/components/admin/permission-guard"

function PaginaLeads() {
  return (
    <ModuleGuard modulo="leads">
      <div>
        {/* Conteúdo da página */}
        <h1>Gerenciamento de Leads</h1>
        {/* ... */}
      </div>
    </ModuleGuard>
  )
}
```

### 3. Proteção de Ações Específicas

```tsx
import { PermissionGuard } from "@/components/admin/permission-guard"

function MinhaPagina() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <PermissionGuard modulo="propostas" acao="criar">
        <button>Criar Nova Proposta</button>
      </PermissionGuard>
      
      <PermissionGuard modulo="usuarios" acao="editar">
        <button>Editar Usuários</button>
      </PermissionGuard>
    </div>
  )
}
```

### 4. Botões com Permissões

```tsx
import { PermissionButton } from "@/components/admin/permission-button"

function TabelaUsuarios() {
  return (
    <div>
      <table>
        {/* ... dados da tabela ... */}
        <tr>
          <td>João Silva</td>
          <td>
            <PermissionButton 
              modulo="usuarios" 
              acao="editar"
              onClick={() => editarUsuario(id)}
            >
              Editar
            </PermissionButton>
            
            <PermissionButton 
              modulo="usuarios" 
              acao="excluir"
              variant="destructive"
              onClick={() => excluirUsuario(id)}
            >
              Excluir
            </PermissionButton>
          </td>
        </tr>
      </table>
    </div>
  )
}
```

### 5. Sidebar com Permissões

```tsx
import { usePermissions } from "@/hooks/use-permissions"

function AdminSidebar() {
  const { podeVisualizar } = usePermissions()
  
  return (
    <nav>
      <Link href="/admin">Dashboard</Link>
      
      {podeVisualizar("leads") && (
        <Link href="/admin/leads">Leads</Link>
      )}
      
      {podeVisualizar("propostas") && (
        <Link href="/admin/propostas">Propostas</Link>
      )}
      
      {podeVisualizar("usuarios") && (
        <Link href="/admin/usuarios">Usuários</Link>
      )}
    </nav>
  )
}
```

## 🗂️ Módulos Disponíveis

| Módulo | Descrição | Ações |
|--------|-----------|-------|
| `dashboard` | Painel principal | visualizar |
| `leads` | Gerenciamento de leads | visualizar, criar, editar, excluir |
| `propostas` | Propostas e contratos | visualizar, criar, editar, excluir |
| `corretores` | Gestão de corretores | visualizar, criar, editar, excluir |
| `produtos` | Produtos e tabelas | visualizar, criar, editar, excluir |
| `tabelas` | Tabelas de preços | visualizar, criar, editar, excluir |
| `comissoes` | Controle de comissões | visualizar, criar, editar, excluir |
| `usuarios` | Usuários administrativos | visualizar, criar, editar, excluir |
| `contratos` | Contratos firmados | visualizar, criar, editar, excluir |
| `vendas` | Relatórios de vendas | visualizar, criar, editar, excluir |

## 🔐 Permissões por Perfil

### Master
- ✅ Acesso total a todos os módulos
- ✅ Todas as ações permitidas

### Secretaria
- ✅ Dashboard, Leads, Propostas, Corretores, Produtos, Tabelas, Comissões, Contratos, Vendas
- ❌ Usuários (sem acesso)
- ✅ Pode criar/editar, mas não excluir

### Assistente
- ✅ Dashboard, Leads, Propostas, Corretores, Produtos, Tabelas, Comissões, Contratos, Vendas
- ❌ Usuários (sem acesso)
- ✅ Apenas visualização

## 🚀 Implementação Rápida

### Para uma nova página:

1. **Importe os componentes:**
```tsx
import { ModuleGuard } from "@/components/admin/permission-guard"
import { PermissionButton } from "@/components/admin/permission-button"
import { usePermissions } from "@/hooks/use-permissions"
```

2. **Proteja a página:**
```tsx
export default function MinhaPagina() {
  return (
    <ModuleGuard modulo="meu_modulo">
      {/* Conteúdo da página */}
    </ModuleGuard>
  )
}
```

3. **Proteja as ações:**
```tsx
<PermissionButton modulo="meu_modulo" acao="criar">
  Criar Novo
</PermissionButton>
```

## 📝 Logs e Auditoria

O sistema registra automaticamente:
- ✅ Acessos aos módulos
- ✅ Ações realizadas
- ✅ Tentativas de acesso negado
- ✅ Logs de login/logout

## 🔄 Atualização de Permissões

As permissões são carregadas automaticamente do localStorage quando o usuário faz login. Para atualizar permissões em tempo real:

```tsx
// Recarregar permissões
window.location.reload()
```

## ⚠️ Importante

- **Master sempre tem acesso total** - não é possível restringir
- **Permissões são verificadas no frontend e backend**
- **Sempre implemente validação no backend também**
- **Use logs para auditoria de ações** 