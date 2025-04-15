# David & Pereira - Sistema de Gestão de Entregas de Água

Este é um sistema de gestão para uma empresa de distribuição de água, incluindo o gerenciamento de entregas, veículos, motoristas e clientes.

## Configuração para Hospedagem no W3Spaces

Siga os passos abaixo para configurar o projeto para hospedagem no W3Spaces com conexão ao Supabase:

### 1. Configurar as credenciais do Supabase

Você precisa editar dois arquivos para inserir suas credenciais do Supabase:

1. Abra o arquivo `js/auth.js`
2. Edite as seguintes linhas no início do arquivo:
   ```javascript
   const SUPABASE_URL = 'https://sua-url-do-supabase.supabase.co';
   const SUPABASE_KEY = 'sua-chave-anon-publica-do-supabase';
   ```
   Substitua com os dados do seu projeto no Supabase.

3. Abra o arquivo `js/supabase-client.js`
4. Edite as mesmas linhas no início deste arquivo:
   ```javascript
   const SUPABASE_URL = 'https://sua-url-do-supabase.supabase.co';
   const SUPABASE_KEY = 'sua-chave-anon-publica-do-supabase';
   ```

### 2. Estrutura do banco de dados no Supabase

O sistema precisa das seguintes tabelas no seu projeto Supabase:

#### Tabela `profiles`
- `id` (uuid, gerado automaticamente)
- `user_id` (uuid, referência para auth.users.id)
- `nome` (text)
- `tipo` (text, 'admin' ou 'motorista')
- `created_at` (timestamp with time zone)

#### Tabela `motoristas`
- `id` (uuid, gerado automaticamente)
- `nome` (text)
- `cpf` (text, único)
- `senha` (text)
- `telefone` (text)
- `status` (text, 'ativo' ou 'inativo')
- `created_at` (timestamp with time zone)

#### Tabela `veiculos` 
- `id` (uuid, gerado automaticamente)
- `placa` (text, único)
- `modelo` (text)
- `capacidade` (integer)
- `km_atual` (integer)
- `status` (text, 'disponivel', 'em_servico', 'manutencao')
- `created_at` (timestamp with time zone)

#### Tabela `entregas`
- `id` (uuid, gerado automaticamente)
- `cliente` (text)
- `endereco` (text)
- `produtos` (jsonb)
- `valor_total` (numeric)
- `status` (text, 'pendente', 'em_andamento', 'concluida', 'cancelada')
- `motorista_id` (uuid, referência para motoristas.id)
- `veiculo_id` (uuid, referência para veiculos.id)
- `data_criacao` (timestamp with time zone)
- `data_entrega` (timestamp with time zone)

### 3. Configuração de autenticação no Supabase

1. No painel do Supabase, vá para Authentication > Settings
2. Configure o Site URL para o domínio do seu site no W3Spaces
3. Habilite o Email Auth Provider
4. Em Redirect URLs, adicione:
   - `https://seu-site-w3spaces.com/login.html`
   - `https://seu-site-w3spaces.com/redefinir-senha.html`

5. Configure as políticas de acesso RLS (Row Level Security) para suas tabelas.

### 4. Upload para W3Spaces

1. Faça login na sua conta W3Spaces
2. Crie um novo espaço ou use um existente
3. Faça upload de todos os arquivos do projeto
4. Configure o domínio, se necessário

### 5. Testando a Aplicação

1. Acesse o site pelo seu navegador
2. Você deverá ser redirecionado para a página de login
3. Use as credenciais configuradas no Supabase para acessar o sistema

## Estrutura de Arquivos

- `index.html` - Página principal que verifica autenticação e redireciona
- `login.html` - Página de login
- `js/auth.js` - Gerenciamento de autenticação
- `js/supabase-client.js` - Cliente Supabase
- `js/supabase-api.js` - API para acesso aos dados
- `js/utils.js` - Funções utilitárias
- Outras páginas HTML para as diferentes funcionalidades do sistema

## Solução de Problemas

- Se o login não funcionar, verifique as credenciais do Supabase
- Verifique os logs do console do navegador para mensagens de erro
- Certifique-se de que as tabelas no Supabase estão criadas corretamente
- Verifique se o CORS está configurado para permitir requisições do seu domínio W3Spaces

## Contato e Suporte

Para suporte técnico ou dúvidas sobre a implementação, entre em contato com a equipe de desenvolvimento. 