// relatorios-core.js - Funções principais e inicialização

// Armazenamento local das configurações de empresas
const STORAGE_KEY = 'agua_delivery_datas_limite';

// Funções utilitárias
function formatarDataBR(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Funções de dados
function obterConfiguracoesEmpresas() {
    const configuracoesSalvas = localStorage.getItem(STORAGE_KEY);
    return configuracoesSalvas ? JSON.parse(configuracoesSalvas) : {};
}

function salvarConfiguracoesEmpresas(configuracoes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configuracoes));
}

function buscarAbastecimentos(empresaId, dataInicio, dataFim) {
    console.log(`Buscando abastecimentos para empresa ${empresaId} no período de ${dataInicio} a ${dataFim}`);
    
    try {
        // Simulação de busca de abastecimentos no período
        const cliente = obterClientes().find(c => c.id === empresaId);
        
        if (!cliente) {
            console.error(`Cliente com ID ${empresaId} não encontrado`);
            return [];
        }
        
        // Converter strings para objetos Date
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        
        // Ajustar fim para incluir o último dia inteiro
        fim.setHours(23, 59, 59, 999);
        
        console.log(`Período de busca: ${inicio.toISOString()} a ${fim.toISOString()}`);
        
        // Filtrar abastecimentos no período (simulado)
        // Em um ambiente real, isso seria uma chamada de API
        const abastecimentos = gerarAbastecimentosSimulados(cliente, inicio, fim);
        
        console.log(`Encontrados ${abastecimentos.length} abastecimentos no período`);
        return abastecimentos;
    } catch (error) {
        console.error('Erro ao buscar abastecimentos:', error);
        return [];
    }
}

function gerarAbastecimentosSimulados(cliente, dataInicio, dataFim) {
    const abastecimentos = [];
    const diasNoPeriodo = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24));
    const frequenciaAbastecimento = Math.max(1, Math.floor(diasNoPeriodo / 10)); // Aproximadamente 10 abastecimentos no período
    
    let dataAtual = new Date(dataInicio);
    while (dataAtual <= dataFim) {
        // Cada X dias, adicionar um abastecimento
        if (dataAtual.getDate() % frequenciaAbastecimento === 0) {
            const notaFiscal = Math.floor(Math.random() * 90000) + 10000;
            const volume = Math.floor(Math.random() * 5) + 1; // 1 a 5 galões
            const valorUnitario = 8.5 + (Math.random() * 2 - 1); // 7.5 a 9.5 reais
            
            abastecimentos.push({
                data: dataAtual.toISOString().split('T')[0],
                notaFiscal: `NF-${notaFiscal}`,
                volume: volume,
                valorUnitario: valorUnitario,
                valorTotal: volume * valorUnitario,
                entregador: ['João', 'Pedro', 'Maria', 'Ana'][Math.floor(Math.random() * 4)]
            });
        }
        dataAtual.setDate(dataAtual.getDate() + 1);
    }
    
    return abastecimentos;
}

// Função para obter clientes (simulação)
function obterClientes() {
    // Simulação de dados de clientes
    return [
        { 
            id: '1', 
            nome: 'Empresa ABC', 
            email: 'contato@empresaabc.com',
            endereco: 'Av. Principal, 123',
            telefone: '(11) 9999-8888',
            responsavel: 'João Silva'
        },
        { 
            id: '2', 
            nome: 'Indústria XYZ', 
            email: 'financeiro@industriaxyz.com.br',
            endereco: 'Rua das Indústrias, 456',
            telefone: '(11) 7777-6666',
            responsavel: 'Maria Oliveira'
        },
        { 
            id: '3', 
            nome: 'Comércio & Cia', 
            email: 'pedidos@comercioecia.com.br',
            endereco: 'Rua do Comércio, 789',
            telefone: '(11) 5555-4444',
            responsavel: 'José Santos'
        },
        { 
            id: '4', 
            nome: 'Tech Solutions', 
            email: 'adm@techsolutions.com',
            endereco: 'Av. da Tecnologia, 1010',
            telefone: '(11) 3333-2222',
            responsavel: 'Ana Ferreira'
        },
        { 
            id: '5', 
            nome: 'Hospital Santa Saúde', 
            email: 'compras@santasaude.org',
            endereco: 'Av. da Saúde, 2020',
            telefone: '(11) 1111-0000',
            responsavel: 'Carlos Mendes'
        }
    ];
}

// Inicialização da página
function initPage() {
    console.log('Inicializando página de relatórios...');
    
    if (typeof window.relatoriosUI !== 'undefined' && typeof window.relatoriosUI.loadComponents === 'function') {
        // Carregar componentes usando o método do módulo UI
        window.relatoriosUI.loadComponents().then(() => {
            console.log('Componentes carregados');
            
            // Verificar se as funções existem antes de chamar
            if (typeof window.relatoriosUI.inicializarAbas === 'function') {
                window.relatoriosUI.inicializarAbas();
            }
            
            if (typeof window.relatoriosUI.configurarEventos === 'function') {
                window.relatoriosUI.configurarEventos();
            }
            
            if (typeof window.relatoriosUI.carregarEmpresas === 'function') {
                window.relatoriosUI.carregarEmpresas();
            }
            
            if (typeof window.relatoriosEnvios !== 'undefined' && 
                typeof window.relatoriosEnvios.carregarTabelaControleEnvios === 'function') {
                window.relatoriosEnvios.carregarTabelaControleEnvios();
            }
            
            console.log('Página de relatórios inicializada com sucesso!');
        }).catch(error => {
            console.error('Erro ao carregar componentes:', error);
        });
    } else {
        console.error('Erro: relatoriosUI ou loadComponents não estão disponíveis');
    }
}

// Inicializar após o DOM estar completamente carregado
document.addEventListener('DOMContentLoaded', initPage);

// Exportar funções para uso em outros módulos
window.relatoriosCore = {
    formatarDataBR,
    formatarMoeda,
    obterConfiguracoesEmpresas,
    salvarConfiguracoesEmpresas,
    buscarAbastecimentos,
    obterClientes,
    STORAGE_KEY
};

// Módulo central para gerenciamento de dados de relatórios
window.relatoriosCore = (() => {
    // Cache de dados
    const cache = {
        empresas: {
            data: null,
            timestamp: null,
            expiraEm: 5 * 60 * 1000 // 5 minutos
        },
        abastecimentos: {
            data: {},
            timestamp: {},
            expiraEm: 5 * 60 * 1000 // 5 minutos
        }
    };

    // Mock API para simulação de dados
    const mockAPI = {
        // Dados simulados de empresas
        empresasData: [
            {
                id: 1,
                nome: "Empresa ABC Ltda",
                cnpj: "12.345.678/0001-90",
                email: "contato@empresaabc.com.br",
                telefone: "(11) 3456-7890",
                endereco: "Av. Paulista, 1000, São Paulo - SP"
            },
            {
                id: 2,
                nome: "Indústria XYZ S.A.",
                cnpj: "98.765.432/0001-10",
                email: "contato@industriaxyz.com.br",
                telefone: "(11) 2345-6789",
                endereco: "Rua Industrial, 500, Guarulhos - SP"
            },
            {
                id: 3,
                nome: "Comércio Rápido Ltda",
                cnpj: "45.678.901/0001-23",
                email: "contato@comerciorapido.com.br",
                telefone: "(11) 9876-5432",
                endereco: "Rua do Comércio, 200, Santo André - SP"
            }
        ],

        // Dados simulados de abastecimentos
        abastecimentosData: {
            1: [
                {
                    id: 101,
                    empresaId: 1,
                    data: "2023-11-05",
                    local: "Escritório Central",
                    litros: 20,
                    valor: 60.00
                },
                {
                    id: 102,
                    empresaId: 1,
                    data: "2023-11-12",
                    local: "Escritório Central",
                    litros: 20,
                    valor: 60.00
                },
                {
                    id: 103,
                    empresaId: 1,
                    data: "2023-11-19",
                    local: "Escritório Central",
                    litros: 20,
                    valor: 60.00
                },
                {
                    id: 104,
                    empresaId: 1,
                    data: "2023-11-26",
                    local: "Escritório Central",
                    litros: 20,
                    valor: 60.00
                },
                {
                    id: 105,
                    empresaId: 1,
                    data: "2023-12-03",
                    local: "Escritório Central",
                    litros: 20,
                    valor: 60.00
                },
                {
                    id: 106,
                    empresaId: 1,
                    data: "2023-12-10",
                    local: "Escritório Central",
                    litros: 20,
                    valor: 60.00
                }
            ],
            2: [
                {
                    id: 201,
                    empresaId: 2,
                    data: "2023-11-03",
                    local: "Setor Produção",
                    litros: 50,
                    valor: 125.00
                },
                {
                    id: 202,
                    empresaId: 2,
                    data: "2023-11-10",
                    local: "Setor Administrativo",
                    litros: 20,
                    valor: 60.00
                },
                {
                    id: 203,
                    empresaId: 2,
                    data: "2023-11-17",
                    local: "Setor Produção",
                    litros: 50,
                    valor: 125.00
                },
                {
                    id: 204,
                    empresaId: 2,
                    data: "2023-11-24",
                    local: "Setor Administrativo",
                    litros: 20,
                    valor: 60.00
                },
                {
                    id: 205,
                    empresaId: 2,
                    data: "2023-12-01",
                    local: "Setor Produção",
                    litros: 50,
                    valor: 125.00
                }
            ],
            3: [
                {
                    id: 301,
                    empresaId: 3,
                    data: "2023-11-06",
                    local: "Loja Principal",
                    litros: 10,
                    valor: 35.00
                },
                {
                    id: 302,
                    empresaId: 3,
                    data: "2023-11-13",
                    local: "Loja Principal",
                    litros: 10,
                    valor: 35.00
                },
                {
                    id: 303,
                    empresaId: 3,
                    data: "2023-11-20",
                    local: "Loja Principal",
                    litros: 10,
                    valor: 35.00
                },
                {
                    id: 304,
                    empresaId: 3,
                    data: "2023-11-27",
                    local: "Loja Principal",
                    litros: 10,
                    valor: 35.00
                },
                {
                    id: 305,
                    empresaId: 3,
                    data: "2023-12-04",
                    local: "Depósito",
                    litros: 30,
                    valor: 90.00
                }
            ]
        },

        // Método para obter empresas
        getEmpresas: function() {
            return new Promise(resolve => {
                // Simular delay de rede
                setTimeout(() => {
                    resolve([...this.empresasData]);
                }, 300);
            });
        },

        // Método para obter abastecimentos por empresa
        getAbastecimentosPorEmpresa: function(empresaId) {
            return new Promise(resolve => {
                // Simular delay de rede
                setTimeout(() => {
                    const abastecimentos = this.abastecimentosData[empresaId] || [];
                    resolve([...abastecimentos]);
                }, 300);
            });
        }
    };

    // Verificar se o cache expirou
    function cacheExpirou(tipo, empresaId = null) {
        const agora = new Date().getTime();
        
        if (tipo === 'empresas') {
            return !cache.empresas.timestamp || 
                   (agora - cache.empresas.timestamp) > cache.empresas.expiraEm;
        } else if (tipo === 'abastecimentos' && empresaId !== null) {
            return !cache.abastecimentos.timestamp[empresaId] || 
                   (agora - cache.abastecimentos.timestamp[empresaId]) > cache.abastecimentos.expiraEm;
        }
        
        return true;
    }

    // Carregar dados de empresas
    async function carregarEmpresas() {
        try {
            if (cacheExpirou('empresas')) {
                console.log('Carregando empresas da API...');
                
                // Em produção, isso seria uma chamada de API real
                const empresas = await mockAPI.getEmpresas();
                
                // Atualizar cache
                cache.empresas.data = empresas;
                cache.empresas.timestamp = new Date().getTime();
                
                console.log(`${empresas.length} empresas carregadas com sucesso`);
            } else {
                console.log('Usando empresas do cache');
            }
            
            return cache.empresas.data;
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
            throw error;
        }
    }

    // Carregar dados de abastecimentos por empresa
    async function carregarAbastecimentos(empresaId) {
        try {
            if (cacheExpirou('abastecimentos', empresaId)) {
                console.log(`Carregando abastecimentos da empresa ${empresaId} da API...`);
                
                // Em produção, isso seria uma chamada de API real
                const abastecimentos = await mockAPI.getAbastecimentosPorEmpresa(empresaId);
                
                // Atualizar cache
                cache.abastecimentos.data[empresaId] = abastecimentos;
                cache.abastecimentos.timestamp[empresaId] = new Date().getTime();
                
                console.log(`${abastecimentos.length} abastecimentos carregados com sucesso`);
            } else {
                console.log(`Usando abastecimentos da empresa ${empresaId} do cache`);
            }
            
            return cache.abastecimentos.data[empresaId];
        } catch (error) {
            console.error(`Erro ao carregar abastecimentos da empresa ${empresaId}:`, error);
            throw error;
        }
    }

    // Obter empresa por ID
    async function getEmpresaById(empresaId) {
        try {
            // Garantir que temos os dados de empresas no cache
            const empresas = await carregarEmpresas();
            
            // Converter para número, se necessário
            const id = Number(empresaId);
            
            // Encontrar a empresa pelo ID
            const empresa = empresas.find(emp => emp.id === id);
            
            if (!empresa) {
                console.warn(`Empresa com ID ${empresaId} não encontrada`);
                return null;
            }
            
            return empresa;
        } catch (error) {
            console.error(`Erro ao obter empresa ${empresaId}:`, error);
            throw error;
        }
    }

    // Obter abastecimentos por empresa e período
    async function getAbastecimentosPorEmpresa(empresaId, dataInicio, dataFim) {
        try {
            // Garantir que temos os dados de abastecimentos no cache
            const abastecimentos = await carregarAbastecimentos(empresaId);
            
            // Converter para número, se necessário
            const id = Number(empresaId);
            
            // Converter datas para formato comparável
            const inicio = new Date(dataInicio);
            const fim = new Date(dataFim);
            
            // Filtrar abastecimentos pelo período
            const filtrados = abastecimentos.filter(item => {
                const data = new Date(item.data);
                return data >= inicio && data <= fim;
            });
            
            // Ordenar por data
            filtrados.sort((a, b) => new Date(a.data) - new Date(b.data));
            
            return filtrados;
        } catch (error) {
            console.error(`Erro ao obter abastecimentos da empresa ${empresaId}:`, error);
            throw error;
        }
    }

    // Limpar cache
    function limparCache(tipo = 'tudo', empresaId = null) {
        if (tipo === 'tudo' || tipo === 'empresas') {
            cache.empresas.data = null;
            cache.empresas.timestamp = null;
            console.log('Cache de empresas limpo');
        }
        
        if (tipo === 'tudo' || tipo === 'abastecimentos') {
            if (empresaId !== null) {
                delete cache.abastecimentos.data[empresaId];
                delete cache.abastecimentos.timestamp[empresaId];
                console.log(`Cache de abastecimentos da empresa ${empresaId} limpo`);
            } else {
                cache.abastecimentos.data = {};
                cache.abastecimentos.timestamp = {};
                console.log('Cache de todos os abastecimentos limpo');
            }
        }
    }

    // Inicializar o módulo
    async function inicializar() {
        try {
            console.log('Inicializando módulo relatoriosCore...');
            
            // Pré-carregar dados de empresas
            await carregarEmpresas();
            
            console.log('Módulo relatoriosCore inicializado com sucesso');
            return true;
        } catch (error) {
            console.error('Falha ao inicializar módulo relatoriosCore:', error);
            return false;
        }
    }

    // API pública do módulo
    return {
        inicializar,
        carregarEmpresas,
        carregarAbastecimentos,
        getEmpresaById,
        getAbastecimentosPorEmpresa,
        limparCache,
        getEmpresas: carregarEmpresas,
        obterConfiguracoesEmpresas: function() {
            // Retorna as configurações de empresas armazenadas no localStorage
            const configuracoesSalvas = localStorage.getItem(STORAGE_KEY);
            return configuracoesSalvas ? JSON.parse(configuracoesSalvas) : {};
        },
        salvarConfiguracoesEmpresas: function(configuracoes) {
            // Salva as configurações de empresas no localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(configuracoes));
        },
        formatarDataBR: function(dataISO) {
            if (!dataISO) return '';
            const [ano, mes, dia] = dataISO.split('-');
            return `${dia}/${mes}/${ano}`;
        }
    };
})();

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    relatoriosCore.inicializar()
        .then(sucesso => {
            if (sucesso) {
                console.log('relatoriosCore está pronto para uso');
            } else {
                console.error('Falha ao inicializar relatoriosCore');
            }
        });
}); 