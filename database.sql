-- Tabela de Motoristas
CREATE TABLE motoristas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome TEXT NOT NULL,
  documento TEXT UNIQUE NOT NULL,
  telefone TEXT,
  email TEXT UNIQUE,
  cnh TEXT,
  categoria TEXT,
  data_validade DATE,
  disponivel BOOLEAN DEFAULT TRUE,
  usuario TEXT,
  senha TEXT,  -- Em produção, usar autenticação do Supabase
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Veículos (Frota)
CREATE TABLE veiculos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  placa TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL,
  modelo TEXT NOT NULL,
  fabricante TEXT,
  ano INTEGER,
  capacidade INTEGER,
  km_atual INTEGER DEFAULT 0,
  chassi TEXT,
  status TEXT DEFAULT 'disponivel',  -- disponivel, em_uso, manutencao, inativo
  ultima_manutencao DATE,
  proxima_manutencao DATE,
  tipo_manutencao TEXT,
  responsavel_manutencao TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Clientes
CREATE TABLE clientes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome TEXT NOT NULL,
  endereco TEXT,
  telefone TEXT,
  responsavel TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Entregas
CREATE TABLE entregas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  data DATE NOT NULL,
  motorista_id BIGINT REFERENCES motoristas(id),
  veiculo_id BIGINT REFERENCES veiculos(id),
  origem TEXT,
  destino TEXT,
  capacidade INTEGER,
  valor DECIMAL,
  status TEXT DEFAULT 'pendente',  -- pendente, em_andamento, concluido, cancelado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Vinculação Motorista-Veículo
CREATE TABLE motorista_veiculo (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  motorista_id BIGINT REFERENCES motoristas(id) NOT NULL,
  veiculo_id BIGINT REFERENCES veiculos(id) NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_fim TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Check-ins
CREATE TABLE checkins (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  motorista_id BIGINT REFERENCES motoristas(id) NOT NULL,
  veiculo_id BIGINT REFERENCES veiculos(id) NOT NULL,
  data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  km_registrado INTEGER NOT NULL,
  checklist JSONB,
  foto TEXT,  -- URL do Storage do Supabase
  latitude DECIMAL,
  longitude DECIMAL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Histórico de KM
CREATE TABLE historico_km (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  veiculo_id BIGINT REFERENCES veiculos(id) NOT NULL,
  data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  km INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Abastecimentos
CREATE TABLE abastecimentos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tipo TEXT NOT NULL CHECK (tipo IN ('agua', 'combustivel')),
  data DATE NOT NULL,
  veiculo_id BIGINT REFERENCES veiculos(id) NOT NULL,
  motorista_id BIGINT REFERENCES motoristas(id) NOT NULL,
  fornecedor TEXT,
  quantidade DECIMAL NOT NULL,
  valor_total DECIMAL NOT NULL,
  forma_pagamento TEXT,
  observacoes TEXT,
  comprovante TEXT,  -- URL do Storage do Supabase
  latitude DECIMAL,
  longitude DECIMAL,
  tipo_combustivel TEXT,  -- Apenas para abastecimentos de combustível
  valor_litro DECIMAL,    -- Apenas para abastecimentos de combustível
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Manutenções
CREATE TABLE manutencoes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  veiculo_id BIGINT REFERENCES veiculos(id) NOT NULL,
  data DATE NOT NULL,
  tipo TEXT NOT NULL,
  km_registrado INTEGER NOT NULL,
  responsavel TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Problemas de Veículos
CREATE TABLE problemas_veiculos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  veiculo_id BIGINT REFERENCES veiculos(id) NOT NULL,
  motorista_id BIGINT REFERENCES motoristas(id) NOT NULL,
  descricao TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pendente',  -- pendente, em_analise, resolvido, cancelado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Despesas
CREATE TABLE despesas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  data DATE NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  veiculo_id BIGINT REFERENCES veiculos(id),
  motorista_id BIGINT REFERENCES motoristas(id),
  valor DECIMAL NOT NULL,
  comprovante TEXT,  -- URL do Storage do Supabase
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);