-- Schema para David & Pereira - Sistema de Gestão
-- Execute este script no SQL Editor do Supabase

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('admin', 'motorista')),
    telefone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Verificar e adicionar colunas faltantes na tabela profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'telefone') THEN
        ALTER TABLE public.profiles ADD COLUMN telefone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END
$$;

-- Comentário na tabela
COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema, relacionados com auth.users';

-- Índice para consultas por user_id
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);

-- Tabela de motoristas
CREATE TABLE IF NOT EXISTS public.motoristas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    telefone TEXT,
    endereco TEXT,
    data_nascimento DATE,
    cnh TEXT,
    categoria_cnh TEXT,
    data_validade_cnh DATE,
    status TEXT NOT NULL CHECK (status IN ('ativo', 'inativo', 'afastado', 'ferias')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Verificar e adicionar colunas faltantes na tabela motoristas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'motoristas' AND column_name = 'endereco') THEN
        ALTER TABLE public.motoristas ADD COLUMN endereco TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'motoristas' AND column_name = 'data_nascimento') THEN
        ALTER TABLE public.motoristas ADD COLUMN data_nascimento DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'motoristas' AND column_name = 'cnh') THEN
        ALTER TABLE public.motoristas ADD COLUMN cnh TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'motoristas' AND column_name = 'categoria_cnh') THEN
        ALTER TABLE public.motoristas ADD COLUMN categoria_cnh TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'motoristas' AND column_name = 'data_validade_cnh') THEN
        ALTER TABLE public.motoristas ADD COLUMN data_validade_cnh DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'motoristas' AND column_name = 'observacoes') THEN
        ALTER TABLE public.motoristas ADD COLUMN observacoes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'motoristas' AND column_name = 'updated_at') THEN
        ALTER TABLE public.motoristas ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END
$$;

-- Comentário na tabela
COMMENT ON TABLE public.motoristas IS 'Cadastro de motoristas do sistema';

-- Índice para consultas por CPF
CREATE INDEX IF NOT EXISTS motoristas_cpf_idx ON public.motoristas(cpf);

-- Tabela de veículos
CREATE TABLE IF NOT EXISTS public.veiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placa TEXT UNIQUE NOT NULL,
    modelo TEXT NOT NULL,
    marca TEXT NOT NULL,
    ano INTEGER,
    capacidade INTEGER NOT NULL,
    km_atual INTEGER DEFAULT 0,
    data_ultima_manutencao DATE,
    status TEXT NOT NULL CHECK (status IN ('disponivel', 'em_servico', 'manutencao', 'inativo')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Verificar e adicionar colunas faltantes na tabela veiculos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'veiculos' AND column_name = 'marca') THEN
        ALTER TABLE public.veiculos ADD COLUMN marca TEXT NOT NULL DEFAULT 'Não informada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'veiculos' AND column_name = 'ano') THEN
        ALTER TABLE public.veiculos ADD COLUMN ano INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'veiculos' AND column_name = 'data_ultima_manutencao') THEN
        ALTER TABLE public.veiculos ADD COLUMN data_ultima_manutencao DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'veiculos' AND column_name = 'observacoes') THEN
        ALTER TABLE public.veiculos ADD COLUMN observacoes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'veiculos' AND column_name = 'updated_at') THEN
        ALTER TABLE public.veiculos ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END
$$;

-- Comentário na tabela
COMMENT ON TABLE public.veiculos IS 'Cadastro de veículos da frota';

-- Índice para consultas por placa
CREATE INDEX IF NOT EXISTS veiculos_placa_idx ON public.veiculos(placa);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('pessoa_fisica', 'pessoa_juridica')),
    cpf_cnpj TEXT UNIQUE,
    telefone TEXT,
    email TEXT,
    endereco TEXT NOT NULL,
    bairro TEXT,
    cidade TEXT,
    uf TEXT,
    cep TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Verificar e adicionar colunas faltantes na tabela clientes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clientes' AND column_name = 'tipo') THEN
        ALTER TABLE public.clientes ADD COLUMN tipo TEXT NOT NULL DEFAULT 'pessoa_fisica' CHECK (tipo IN ('pessoa_fisica', 'pessoa_juridica'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clientes' AND column_name = 'email') THEN
        ALTER TABLE public.clientes ADD COLUMN email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clientes' AND column_name = 'bairro') THEN
        ALTER TABLE public.clientes ADD COLUMN bairro TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clientes' AND column_name = 'cidade') THEN
        ALTER TABLE public.clientes ADD COLUMN cidade TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clientes' AND column_name = 'uf') THEN
        ALTER TABLE public.clientes ADD COLUMN uf TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clientes' AND column_name = 'cep') THEN
        ALTER TABLE public.clientes ADD COLUMN cep TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clientes' AND column_name = 'observacoes') THEN
        ALTER TABLE public.clientes ADD COLUMN observacoes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clientes' AND column_name = 'updated_at') THEN
        ALTER TABLE public.clientes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END
$$;

-- Comentário na tabela
COMMENT ON TABLE public.clientes IS 'Cadastro de clientes';

-- Índice para consultas por CPF/CNPJ
CREATE INDEX IF NOT EXISTS clientes_cpf_cnpj_idx ON public.clientes(cpf_cnpj);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    unidade TEXT NOT NULL,
    estoque INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Verificar e adicionar colunas faltantes na tabela produtos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'produtos' AND column_name = 'descricao') THEN
        ALTER TABLE public.produtos ADD COLUMN descricao TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'produtos' AND column_name = 'unidade') THEN
        ALTER TABLE public.produtos ADD COLUMN unidade TEXT NOT NULL DEFAULT 'un';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'produtos' AND column_name = 'estoque') THEN
        ALTER TABLE public.produtos ADD COLUMN estoque INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'produtos' AND column_name = 'status') THEN
        ALTER TABLE public.produtos ADD COLUMN status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'produtos' AND column_name = 'updated_at') THEN
        ALTER TABLE public.produtos ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END
$$;

-- Comentário na tabela
COMMENT ON TABLE public.produtos IS 'Cadastro de produtos';

-- Tabela de entregas
CREATE TABLE IF NOT EXISTS public.entregas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id),
    cliente TEXT,
    endereco TEXT NOT NULL,
    produtos JSONB,
    valor_total DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
    motorista_id UUID REFERENCES public.motoristas(id),
    veiculo_id UUID REFERENCES public.veiculos(id),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
    data_entrega TIMESTAMP WITH TIME ZONE,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    forma_pagamento TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Verificar e adicionar colunas faltantes na tabela entregas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entregas' AND column_name = 'cliente_id') THEN
        ALTER TABLE public.entregas ADD COLUMN cliente_id UUID REFERENCES public.clientes(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entregas' AND column_name = 'produtos') THEN
        ALTER TABLE public.entregas ADD COLUMN produtos JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entregas' AND column_name = 'data_conclusao') THEN
        ALTER TABLE public.entregas ADD COLUMN data_conclusao TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entregas' AND column_name = 'forma_pagamento') THEN
        ALTER TABLE public.entregas ADD COLUMN forma_pagamento TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entregas' AND column_name = 'observacoes') THEN
        ALTER TABLE public.entregas ADD COLUMN observacoes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entregas' AND column_name = 'updated_at') THEN
        ALTER TABLE public.entregas ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END
$$;

-- Comentário na tabela
COMMENT ON TABLE public.entregas IS 'Registro de entregas';

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS entregas_cliente_id_idx ON public.entregas(cliente_id);
CREATE INDEX IF NOT EXISTS entregas_motorista_id_idx ON public.entregas(motorista_id);
CREATE INDEX IF NOT EXISTS entregas_veiculo_id_idx ON public.entregas(veiculo_id);
CREATE INDEX IF NOT EXISTS entregas_status_idx ON public.entregas(status);
CREATE INDEX IF NOT EXISTS entregas_data_criacao_idx ON public.entregas(data_criacao);

-- Tabela de despesas
CREATE TABLE IF NOT EXISTS public.despesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_despesa DATE NOT NULL,
    motorista_id UUID REFERENCES public.motoristas(id),
    veiculo_id UUID REFERENCES public.veiculos(id),
    comprovante_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Verificar e adicionar colunas faltantes na tabela despesas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'despesas' AND column_name = 'tipo') THEN
        ALTER TABLE public.despesas ADD COLUMN tipo TEXT NOT NULL DEFAULT 'geral';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'despesas' AND column_name = 'motorista_id') THEN
        ALTER TABLE public.despesas ADD COLUMN motorista_id UUID REFERENCES public.motoristas(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'despesas' AND column_name = 'veiculo_id') THEN
        ALTER TABLE public.despesas ADD COLUMN veiculo_id UUID REFERENCES public.veiculos(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'despesas' AND column_name = 'comprovante_url') THEN
        ALTER TABLE public.despesas ADD COLUMN comprovante_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'despesas' AND column_name = 'status') THEN
        ALTER TABLE public.despesas ADD COLUMN status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'despesas' AND column_name = 'updated_at') THEN
        ALTER TABLE public.despesas ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END
$$;

-- Comentário na tabela
COMMENT ON TABLE public.despesas IS 'Registro de despesas';

-- Tabela de abastecimentos
CREATE TABLE IF NOT EXISTS public.abastecimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    veiculo_id UUID REFERENCES public.veiculos(id) NOT NULL,
    motorista_id UUID REFERENCES public.motoristas(id) NOT NULL,
    data_abastecimento TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo_combustivel TEXT NOT NULL,
    litros DECIMAL(10, 2) NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    km_atual INTEGER NOT NULL,
    posto TEXT,
    comprovante_url TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Verificar e adicionar colunas faltantes na tabela abastecimentos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'abastecimentos' AND column_name = 'tipo_combustivel') THEN
        ALTER TABLE public.abastecimentos ADD COLUMN tipo_combustivel TEXT NOT NULL DEFAULT 'Diesel';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'abastecimentos' AND column_name = 'posto') THEN
        ALTER TABLE public.abastecimentos ADD COLUMN posto TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'abastecimentos' AND column_name = 'comprovante_url') THEN
        ALTER TABLE public.abastecimentos ADD COLUMN comprovante_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'abastecimentos' AND column_name = 'observacoes') THEN
        ALTER TABLE public.abastecimentos ADD COLUMN observacoes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'abastecimentos' AND column_name = 'updated_at') THEN
        ALTER TABLE public.abastecimentos ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END
$$;

-- Comentário na tabela
COMMENT ON TABLE public.abastecimentos IS 'Registro de abastecimentos de veículos';

-- Tabela de checkins de veículos
CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    veiculo_id UUID REFERENCES public.veiculos(id) NOT NULL,
    motorista_id UUID REFERENCES public.motoristas(id) NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('saida', 'retorno')),
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    km_atual INTEGER NOT NULL,
    status_veiculo TEXT NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Verificar e adicionar colunas faltantes na tabela checkins
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'checkins' AND column_name = 'tipo') THEN
        ALTER TABLE public.checkins ADD COLUMN tipo TEXT NOT NULL DEFAULT 'saida' CHECK (tipo IN ('saida', 'retorno'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'checkins' AND column_name = 'status_veiculo') THEN
        ALTER TABLE public.checkins ADD COLUMN status_veiculo TEXT NOT NULL DEFAULT 'normal';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'checkins' AND column_name = 'observacoes') THEN
        ALTER TABLE public.checkins ADD COLUMN observacoes TEXT;
    END IF;
END
$$;

-- Comentário na tabela
COMMENT ON TABLE public.checkins IS 'Registro de checkins e checkouts de veículos';

-- Tabela de problemas/manutenções de veículos
CREATE TABLE IF NOT EXISTS public.manutencoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    veiculo_id UUID REFERENCES public.veiculos(id) NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('preventiva', 'corretiva', 'emergencial')),
    descricao TEXT NOT NULL,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE,
    km_atual INTEGER NOT NULL,
    valor DECIMAL(10, 2),
    status TEXT NOT NULL CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
    oficina TEXT,
    nota_fiscal TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Verificar e adicionar colunas faltantes na tabela manutencoes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'manutencoes' AND column_name = 'tipo') THEN
        ALTER TABLE public.manutencoes ADD COLUMN tipo TEXT NOT NULL DEFAULT 'corretiva' CHECK (tipo IN ('preventiva', 'corretiva', 'emergencial'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'manutencoes' AND column_name = 'data_fim') THEN
        ALTER TABLE public.manutencoes ADD COLUMN data_fim TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'manutencoes' AND column_name = 'valor') THEN
        ALTER TABLE public.manutencoes ADD COLUMN valor DECIMAL(10, 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'manutencoes' AND column_name = 'status') THEN
        ALTER TABLE public.manutencoes ADD COLUMN status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'manutencoes' AND column_name = 'oficina') THEN
        ALTER TABLE public.manutencoes ADD COLUMN oficina TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'manutencoes' AND column_name = 'nota_fiscal') THEN
        ALTER TABLE public.manutencoes ADD COLUMN nota_fiscal TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'manutencoes' AND column_name = 'observacoes') THEN
        ALTER TABLE public.manutencoes ADD COLUMN observacoes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'manutencoes' AND column_name = 'updated_at') THEN
        ALTER TABLE public.manutencoes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END
$$;

-- Comentário na tabela
COMMENT ON TABLE public.manutencoes IS 'Registro de manutenções de veículos';

-- Função para criar um usuário admin inicial se não existir nenhum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, nome, tipo)
    VALUES (new.id, new.email, 'admin');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger apenas se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END
$$;

-- Função para criar um usuário admin inicial se não existir nenhum
CREATE OR REPLACE FUNCTION public.create_initial_admin()
RETURNS VOID AS $$
DECLARE
    admin_exists BOOLEAN;
BEGIN
    -- Verificar se já existe algum admin
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE tipo = 'admin') INTO admin_exists;
    
    IF NOT admin_exists THEN
        RAISE NOTICE '---------------------------------------------------------------------';
        RAISE NOTICE 'IMPORTANTE: Nenhum administrador encontrado no sistema!';
        RAISE NOTICE 'Para criar um administrador, siga estas etapas:';
        RAISE NOTICE '1. Acesse o painel do Supabase e vá para Authentication > Users';
        RAISE NOTICE '2. Clique em "Invite user" (ou "Add user")';
        RAISE NOTICE '3. Use o email: admin@davidpereira.com';
        RAISE NOTICE '4. Use a senha: admin123 (mude para uma senha forte em produção)';
        RAISE NOTICE '5. Após criar o usuário, o trigger criará automaticamente o perfil de admin';
        RAISE NOTICE '---------------------------------------------------------------------';
    ELSE
        RAISE NOTICE 'Já existe um administrador no sistema';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute a função para criar o admin inicial
SELECT public.create_initial_admin(); 