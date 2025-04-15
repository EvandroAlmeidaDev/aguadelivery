/**
 * Módulo Cliente Supabase
 * Este arquivo fornece funções para inicializar o cliente Supabase
 * e utilitários para manipulação da conexão.
 */

// Definindo as constantes de conexão do Supabase
const SUPABASE_URL = 'https://dhzxsvuympovkahkhlka.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoenhzdnV5bXBvdmthaGtobGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMTQzNDEsImV4cCI6MjA1OTY5MDM0MX0.DTyKRhbIF68WZjJezXZTIiyb8OdI8z9QpupIYmruAZA';

// Referência global para o cliente Supabase
let supabaseClient = null;

/**
 * Inicializa o cliente Supabase
 * @returns {Object} Cliente Supabase inicializado
 */
function supabaseInit() {
    try {
        // Verifica se o cliente já está inicializado
        if (supabaseClient) {
            console.log('Cliente Supabase já está inicializado');
            return supabaseClient;
        }

        console.log('Inicializando cliente Supabase...');
        
        // Verifica se o objeto supabase global está disponível
        if (typeof window.supabase === 'undefined') {
            throw new Error('Biblioteca Supabase não carregada. Certifique-se de incluir o script supabase-js.');
        }
        
        // Cria o cliente Supabase
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
        // Disponibiliza globalmente
        window.supabaseClient = supabaseClient;
        
        console.log('Cliente Supabase inicializado com sucesso!');
        return supabaseClient;
    } catch (error) {
        console.error('Erro ao inicializar cliente Supabase:', error);
        throw error;
    }
}

/**
 * Testa a conexão com o Supabase
 * @returns {Object} Objeto indicando o sucesso da conexão
 */
async function testSupabaseConnection() {
    try {
        // Certifica-se que o cliente está inicializado
        if (!supabaseClient) {
            supabaseInit();
        }
        
        // Tenta fazer uma requisição básica
        const { error } = await supabaseClient
            .from('profiles')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            console.warn('Erro na conexão com Supabase:', error);
            return { 
                success: false, 
                message: 'Não foi possível conectar ao banco de dados. Verifique sua conexão.',
                error 
            };
        }
        
        return { success: true, message: 'Conexão com Supabase estabelecida com sucesso' };
    } catch (error) {
        console.error('Falha ao testar conexão com Supabase:', error);
        return { 
            success: false, 
            message: 'Erro ao testar conexão com o servidor',
            error 
        };
    }
}

/**
 * Limpa a sessão atual do cliente Supabase
 */
function clearSupabaseSession() {
    if (supabaseClient) {
        supabaseClient.auth.signOut()
            .then(() => console.log('Sessão Supabase encerrada'))
            .catch(error => console.error('Erro ao encerrar sessão Supabase:', error));
    }
}

/**
 * Verifica se o usuário está autenticado no Supabase
 * @returns {Promise<Object>} Informações da sessão ou null
 */
async function getSupabaseSession() {
    try {
        // Certifica-se que o cliente está inicializado
        if (!supabaseClient) {
            supabaseInit();
        }
        
        const { data, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            throw error;
        }
        
        return data.session;
    } catch (error) {
        console.error('Erro ao obter sessão Supabase:', error);
        return null;
    }
}

// Exporta as funções para o escopo global
window.supabaseInit = supabaseInit;
window.testSupabaseConnection = testSupabaseConnection;
window.clearSupabaseSession = clearSupabaseSession;
window.getSupabaseSession = getSupabaseSession;

// Verifica se a biblioteca Supabase está disponível
if (typeof supabase === 'undefined') {
    console.error('Erro: A biblioteca Supabase não foi carregada corretamente.');
    
    // Tenta carregar a biblioteca Supabase se não estiver disponível
    if (typeof document !== 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            console.log('Biblioteca Supabase carregada dinamicamente com sucesso');
            initSupabaseClient();
        };
        script.onerror = () => {
            console.error('Falha ao carregar a biblioteca Supabase dinamicamente');
        };
        document.head.appendChild(script);
    }
} else {
    // Inicializa o cliente se a biblioteca já estiver carregada
    initSupabaseClient();
}

// Função para inicializar o cliente Supabase
function initSupabaseClient() {
    try {
        // Inicializa o cliente Supabase e o disponibiliza globalmente
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Cliente Supabase inicializado com sucesso');
        
        // Verifica se há uma sessão ativa
        checkActiveSession();
    } catch (error) {
        console.error('Erro ao inicializar o cliente Supabase:', error);
    }
}

// Função para verificar se há uma sessão ativa
async function checkActiveSession() {
    try {
        const { data, error } = await window.supabaseClient.auth.getSession();
        
        if (error) {
            console.error('Erro ao verificar sessão:', error.message);
            return;
        }
        
        if (data && data.session) {
            console.log('Sessão ativa encontrada');
            
            // Verifica permissões do usuário atual
            const user = data.session.user;
            if (user) {
                console.log('Usuário autenticado:', user.email);
                
                // Redireciona para a página apropriada se estiver na página de login
                if (window.location.pathname.includes('login.html')) {
                    // Verifica o tipo de usuário para redirecionar adequadamente
                    const { data: profileData, error: profileError } = await window.supabaseClient
                        .from('profiles')
                        .select('user_type')
                        .eq('id', user.id)
                        .single();
                    
                    if (!profileError && profileData) {
                        if (profileData.user_type === 'admin') {
                            window.location.href = 'admin-dashboard.html';
                        } else if (profileData.user_type === 'driver') {
                            window.location.href = 'driver-dashboard.html';
                        }
                    }
                }
            }
        } else {
            console.log('Nenhuma sessão ativa encontrada');
        }
    } catch (err) {
        console.error('Erro ao verificar sessão:', err);
    }
}

// Criar cliente mock para fallback ou modo de desenvolvimento
function criarClienteMock() {
  console.warn('Criando cliente mock do Supabase. Algumas funcionalidades podem não estar disponíveis.');
  
  // Salvar cliente original se existir
  const clienteOriginal = window.supabase;
  
  // Criar cliente mock
  window.supabase = {
    from: function(tabela) {
      console.log(`[Mock] Acessando tabela ${tabela}`);
      return {
        select: function() {
          console.log('[Mock] Select executado');
          return Promise.resolve({ data: mockDadosPorTabela(tabela), error: null });
        },
        insert: function(dados) {
          console.log('[Mock] Insert executado', dados);
          return Promise.resolve({ data: { ...dados, id: Date.now() }, error: null });
        },
        update: function(dados) {
          console.log('[Mock] Update executado', dados);
          return Promise.resolve({ data: dados, error: null });
        },
        delete: function() {
          console.log('[Mock] Delete executado');
          return Promise.resolve({ data: null, error: null });
        },
        eq: function() {
          return this;
        },
        order: function() {
          return this;
        },
        limit: function() {
          return this;
        },
        single: function() {
          return Promise.resolve({ data: mockDadosPorTabela(tabela)[0] || null, error: null });
        }
      };
    },
    auth: {
      getSession: function() {
        console.log('[Mock] getSession executado');
        return Promise.resolve({
          data: {
            session: getSessaoMockAtual()
          },
          error: null
        });
      },
      signInWithPassword: function(credenciais) {
        console.log('[Mock] signInWithPassword executado', credenciais);
        
        // Simulação de login
        if (credenciais.email === 'admin@teste.com' && credenciais.password === 'admin123') {
          const sessao = {
            user: {
              id: '1',
              email: credenciais.email,
              role: 'admin'
            }
          };
          
          return Promise.resolve({
            data: { session: sessao, user: sessao.user },
            error: null
          });
        }
        
        return Promise.resolve({
          data: { session: null, user: null },
          error: { message: 'Credenciais inválidas' }
        });
      },
      signOut: function() {
        console.log('[Mock] signOut executado');
        return Promise.resolve({ error: null });
      },
      resetPasswordForEmail: function(email) {
        console.log('[Mock] resetPasswordForEmail executado para', email);
        return Promise.resolve({ error: null });
      }
    }
  };
  
  // Armazenar cliente original para possível uso posterior
  window.supabaseOriginal = clienteOriginal;
  
  return window.supabase;
}

// Obter sessão mock atual
function getSessaoMockAtual() {
  try {
    const sessaoStr = localStorage.getItem('sessaoUsuario');
    if (!sessaoStr) return null;
    
    const sessao = JSON.parse(sessaoStr);
    
    // Adaptar formato para compatibilidade com API Supabase
    return {
      user: {
        id: sessao.usuario.id || '1',
        email: sessao.usuario.email || 'teste@teste.com',
        role: sessao.usuario.tipo || 'admin'
      }
    };
  } catch (erro) {
    console.error('Erro ao obter sessão mock:', erro);
    return null;
  }
}

// Dados mock por tabela para testes
function mockDadosPorTabela(tabela) {
  const dadosMock = {
    'profiles': [
      { id: '1', user_id: '1', nome: 'Administrador', tipo: 'admin' }
    ],
    'motoristas': [
      { id: '1', nome: 'João Motorista', cpf: '12345678900', senha: 'senha123', status: 'ativo' },
      { id: '2', nome: 'Maria Motorista', cpf: '98765432100', senha: 'senha456', status: 'ativo' }
    ],
    'veiculos': [
      { id: '1', placa: 'ABC1234', modelo: 'Caminhão A', capacidade: 1000, status: 'disponivel' },
      { id: '2', placa: 'XYZ9876', modelo: 'Caminhão B', capacidade: 2000, status: 'em_servico' }
    ],
    'entregas': [
      { 
        id: '1', 
        cliente: 'Cliente A', 
        endereco: 'Rua A, 123', 
        status: 'pendente', 
        data_criacao: new Date().toISOString() 
      },
      { 
        id: '2', 
        cliente: 'Cliente B', 
        endereco: 'Rua B, 456', 
        status: 'em_andamento', 
        motorista_id: '1', 
        veiculo_id: '1', 
        data_criacao: new Date().toISOString() 
      }
    ],
    // Adicione outras tabelas conforme necessário
  };
  
  return dadosMock[tabela] || [];
}

// Função para criar sessão de teste no localStorage
function criarSessaoTeste(tipo = 'admin') {
  console.log(`[Mock] Criando sessão de teste (${tipo})`);
  const sessao = {
    autenticado: true,
    dataLogin: new Date().toISOString(),
    usuario: {
      id: '1',
      email: tipo === 'admin' ? 'admin@teste.com' : 'motorista@teste.com',
      nome: tipo === 'admin' ? 'Administrador Teste' : 'Motorista Teste',
      tipo: tipo
    }
  };
  
  localStorage.setItem('sessaoUsuario', JSON.stringify(sessao));
  console.log('[Mock] Sessão criada com sucesso', sessao);
  
  return sessao;
}

// Inicializar quando o script for carregado
document.addEventListener('DOMContentLoaded', function() {
  // Em produção, inicializar o cliente real
  if (window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1') {
    inicializarSupabase();
  } else {
    // Em desenvolvimento, verificar se devemos usar mock
    const usarMock = new URLSearchParams(window.location.search).get('mock') === 'true';
    if (usarMock) {
      criarClienteMock();
    } else {
      inicializarSupabase();
    }
  }
});

// Exportar globalmente
window.inicializarSupabase = inicializarSupabase;
window.verificarConexaoSupabase = verificarConexaoSupabase;
window.criarClienteMock = criarClienteMock;
window.criarSessaoTeste = criarSessaoTeste; 