# Instruções para Configuração do Login com Supabase

Este documento contém instruções detalhadas para configurar corretamente o login do sistema David & Pereira com o Supabase.

## Problema com "Usuário ou senha incorreta"

Se você está recebendo o erro "Usuário ou senha incorreta" mesmo tendo criado o usuário no Supabase, siga estas etapas:

### 1. Verificar a Conexão com o Supabase

Verifique no console do navegador (F12 > Console) se há logs de erro relacionados à conexão com o Supabase. Procure por mensagens como:
- "Erro ao inicializar cliente Supabase"
- "Erro no login Supabase"

### 2. Criar um Usuário Através do Painel do Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **Authentication > Users**
4. Clique em **+ Add User** ou **Invite**
5. Preencha com:
   - Email: `admin@davidpereira.com`
   - Senha: `admin123` (altere posteriormente para uma senha forte)
6. Marque a opção "Auto-confirm user" se disponível
7. Clique em "Add User" para criar o usuário

### 3. Verificar a Tabela de Perfis

Verifique se a tabela `profiles` foi criada corretamente e contém o perfil do usuário:

1. No painel do Supabase, vá para **Table Editor**
2. Selecione a tabela `profiles`
3. Verifique se existe uma entrada com:
   - `user_id` correspondente ao ID do usuário criado
   - `tipo` definido como "admin"

Se não existir, você pode inserir manualmente:
1. Clique em **+ Insert** (ou "New Row")
2. Preencha:
   - `id`: Deixe em branco para gerar automaticamente
   - `user_id`: Copie o ID do usuário da tabela auth.users
   - `nome`: "Administrador"
   - `tipo`: "admin"
   - Deixe os outros campos em branco ou preencha conforme desejado
3. Clique em **Save**

### 4. Forçar Criação de Sessão de Teste (Temporário)

Se ainda estiver com problemas, você pode criar uma sessão de teste temporária:

1. Abra o console do navegador (F12 > Console) 
2. Digite e execute: `criarSessaoTeste('admin')`
3. Isso criará uma sessão de administrador temporária para você poder acessar o sistema

### 5. Verificar as Políticas de Acesso (RLS) no Supabase

Como você optou por não criar políticas RLS inicialmente, certifique-se de que:

1. Vá para **Authentication > Policies** no painel do Supabase
2. Para a tabela `profiles`, verifique se:
   - Ou não há políticas RLS ativas (mais simples para desenvolvimento)
   - Ou há uma política que permita acesso para leitura

### 6. Verificar as Configurações de Autenticação

1. Vá para **Authentication > Settings** no painel do Supabase
2. Verifique se "Email Auth" está habilitado
3. Em "Site URL", certifique-se de que o URL atual do seu site está correto
4. Em "Redirect URLs", adicione os redirecionamentos para seu domínio (opcional para teste)

## Solução Rápida para Testes

Se você precisar apenas acessar o sistema rapidamente para testes, execute este comando no console do navegador:

```javascript
localStorage.setItem('sessaoUsuario', JSON.stringify({
  autenticado: true,
  dataLogin: new Date().toISOString(),
  usuario: {
    id: '1',
    email: 'admin@davidpereira.com',
    nome: 'Administrador',
    tipo: 'admin'
  }
}));
```

Depois, recarregue a página e você deverá ser redirecionado para a página principal do sistema.

## Credenciais para Login

Após configurar corretamente:

### Administrador
- **Email**: admin@davidpereira.com
- **Senha**: admin123

### Motorista
- **CPF**: [CPF do motorista cadastrado]
- **Senha**: [Senha configurada para o motorista]

---

Se você continuar enfrentando problemas após seguir todas essas etapas, verifique os logs no console para obter informações mais detalhadas sobre o erro específico. 