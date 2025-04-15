/**
 * mock-api.js - Simula uma API para fins de desenvolvimento
 * Este arquivo é usado apenas para desenvolvimento e deve ser substituído
 * por chamadas reais à API em produção.
 */

class MockAPI {
    constructor() {
        // Inicializar o localStorage se ainda não existir
        if (!localStorage.getItem('aguadelivery_entregas')) {
            const dadosIniciais = [
                {
                    id: 1,
                    data: '2023-10-15',
                    motorista: 'João Silva',
                    origem: 'Depósito Central',
                    destino: 'Condomínio Flores',
                    capacidade: 200,
                    valor: 550.00,
                    status: 'Concluído'
                },
                {
                    id: 2,
                    data: '2023-10-16',
                    motorista: 'Maria Oliveira',
                    origem: 'Depósito Sul',
                    destino: 'Residencial Parque',
                    capacidade: 300,
                    valor: 780.00,
                    status: 'Em Andamento'
                },
                {
                    id: 3,
                    data: '2023-10-17',
                    motorista: 'Carlos Santos',
                    origem: 'Depósito Norte',
                    destino: 'Empresarial Tower',
                    capacidade: 500,
                    valor: 1200.00,
                    status: 'Pendente'
                },
                {
                    id: 4,
                    data: '2023-10-14',
                    motorista: 'João Silva',
                    origem: 'Depósito Central',
                    destino: 'Residencial Solar',
                    capacidade: 150,
                    valor: 420.00,
                    status: 'Cancelado'
                }
            ];
            localStorage.setItem('aguadelivery_entregas', JSON.stringify(dadosIniciais));
        }

        if (!localStorage.getItem('aguadelivery_motoristas')) {
            const dadosIniciais = [
                { 
                    id: 1, 
                    nome: 'João Silva', 
                    documento: '216.374.330-96',
                    telefone: '(11) 98765-4321', 
                    email: 'joao.silva@exemplo.com',
                    cnh: '12345678901', 
                    categoria: 'A',
                    dataValidade: '2025-11-26',
                    disponivel: true,
                    usuario: '',  // Usará CPF como login
                    senha: 'motorista123',  // Senha atualizada para facilitar login
                    ativo: true
                },
                { 
                    id: 2, 
                    nome: 'Maria Oliveira', 
                    documento: '812.453.267-00',
                    telefone: '(11) 91234-5678', 
                    email: 'maria.oliveira@exemplo.com',
                    cnh: '10987654321', 
                    categoria: 'B',
                    dataValidade: '2024-05-15',
                    disponivel: true,
                    usuario: 'maria.oliveira',
                    senha: 'senha123',
                    ativo: true
                },
                { 
                    id: 3, 
                    nome: 'Carlos Santos', 
                    documento: '523.987.156-22',
                    telefone: '(11) 99876-5432', 
                    email: 'carlos.santos@exemplo.com',
                    cnh: '12345098765', 
                    categoria: 'D',
                    dataValidade: '2026-08-10',
                    disponivel: true,
                    usuario: '',
                    senha: 'senha123',
                    ativo: true
                },
                { 
                    id: 4, 
                    nome: 'Ana Pereira', 
                    documento: '197.634.852-11',
                    telefone: '(11) 95678-1234', 
                    email: 'ana.pereira@exemplo.com',
                    cnh: '56789012345', 
                    categoria: 'C',
                    dataValidade: '2023-12-01',
                    disponivel: false,
                    usuario: 'ana.p',
                    senha: 'senha123',
                    ativo: false
                }
            ];
            localStorage.setItem('aguadelivery_motoristas', JSON.stringify(dadosIniciais));
        }

        if (!localStorage.getItem('aguadelivery_clientes')) {
            const dadosIniciais = [
                { id: 1, nome: 'Condomínio Flores', endereco: 'Rua das Flores, 123', telefone: '(11) 3456-7890', responsavel: 'Roberto Almeida' },
                { id: 2, nome: 'Residencial Parque', endereco: 'Av. Paulista, 1000', telefone: '(11) 2345-6789', responsavel: 'Carla Mendes' },
                { id: 3, nome: 'Empresarial Tower', endereco: 'Rua Augusta, 500', telefone: '(11) 3567-8901', responsavel: 'Fernando Costa' },
                { id: 4, nome: 'Residencial Solar', endereco: 'Rua dos Pinheiros, 50', telefone: '(11) 4567-8912', responsavel: 'Luciana Santos' }
            ];
            localStorage.setItem('aguadelivery_clientes', JSON.stringify(dadosIniciais));
        }

        if (!localStorage.getItem('aguadelivery_frota')) {
            const dadosIniciais = [
                {
                    id: 1,
                    placa: 'ABC-1234',
                    tipo: 'caminhao',
                    modelo: 'Mercedes-Benz Atego 2430',
                    fabricante: 'Mercedes-Benz',
                    ano: 2021,
                    capacidade: 15000,
                    quilometragem: 45000,
                    chassi: '9BM958074BB123456',
                    status: 'operacional',
                    ultimaManutencao: '2023-10-15',
                    proximaManutencao: '2024-01-15',
                    tipoManutencao: 'preventiva',
                    responsavelManutencao: 'Oficina Central',
                    observacoes: 'Veículo em excelentes condições',
                    historico: 'Troca de óleo e filtros em 15/10/2023\nRevisão de freios em 15/08/2023\nTroca de pneus em 15/06/2023'
                },
                {
                    id: 2,
                    placa: 'DEF-5678',
                    tipo: 'caminhao',
                    modelo: 'Volkswagen Constellation 24.280',
                    fabricante: 'Volkswagen',
                    ano: 2020,
                    capacidade: 12000,
                    quilometragem: 78500,
                    chassi: '9BW778845YT987654',
                    status: 'manutencao',
                    ultimaManutencao: '2023-11-05',
                    proximaManutencao: '2024-02-05',
                    tipoManutencao: 'corretiva',
                    responsavelManutencao: 'Mecânica Express',
                    observacoes: 'Problema no sistema de freios',
                    historico: 'Manutenção corretiva em 05/11/2023\nTroca de óleo em 05/09/2023\nRevisão geral em 05/07/2023'
                },
                {
                    id: 3,
                    placa: 'GHI-9012',
                    tipo: 'van',
                    modelo: 'Renault Master',
                    fabricante: 'Renault',
                    ano: 2022,
                    capacidade: 5000,
                    quilometragem: 32000,
                    chassi: '93Y4SRE85PJ456789',
                    status: 'operacional',
                    ultimaManutencao: '2023-09-20',
                    proximaManutencao: '2023-12-20',
                    tipoManutencao: 'revisao',
                    responsavelManutencao: 'Concessionária Renault',
                    observacoes: 'Utilizado para entregas urbanas',
                    historico: 'Revisão completa em 20/09/2023\nTroca de fluidos em 20/07/2023'
                },
                {
                    id: 4,
                    placa: 'JKL-3456',
                    tipo: 'utilitario',
                    modelo: 'Fiat Fiorino',
                    fabricante: 'Fiat',
                    ano: 2023,
                    capacidade: 1500,
                    quilometragem: 15000,
                    chassi: '9BD25504PGR159753',
                    status: 'inativo',
                    ultimaManutencao: '2023-10-01',
                    proximaManutencao: '2024-01-01',
                    tipoManutencao: 'preventiva',
                    responsavelManutencao: 'Oficina Rápida',
                    observacoes: 'Veículo reserva',
                    historico: 'Manutenção preventiva em 01/10/2023\nRevisão de garantia em 01/08/2023\nInstalação de rastreador em 01/06/2023'
                }
            ];
            localStorage.setItem('aguadelivery_frota', JSON.stringify(dadosIniciais));
        }

        // Inicializar dados de despesas se não existirem
        if (!localStorage.getItem('aguadelivery_despesas')) {
            const dadosIniciais = [
                {
                    id: 1,
                    data: '2023-10-10',
                    descricao: 'Abastecimento de combustível',
                    categoria: 'combustivel',
                    veiculo: 'ABC-1234',
                    motorista: 'João Silva',
                    valor: 550.00,
                    comprovante: null,
                    observacoes: 'Posto Ipiranga - Av. Paulista'
                },
                {
                    id: 2,
                    data: '2023-10-12',
                    descricao: 'Troca de óleo e filtros',
                    categoria: 'manutencao',
                    veiculo: 'DEF-5678',
                    motorista: '',
                    valor: 780.00,
                    comprovante: null,
                    observacoes: 'Oficina Mecânica Express'
                },
                {
                    id: 3,
                    data: '2023-10-15',
                    descricao: 'Abastecimento de água - Bica Municipal',
                    categoria: 'abastecimento',
                    veiculo: 'ABC-1234',
                    motorista: 'Carlos Santos',
                    valor: 350.00,
                    comprovante: null,
                    observacoes: '15.000 litros'
                },
                {
                    id: 4,
                    data: '2023-10-18',
                    descricao: 'Material de escritório',
                    categoria: 'administrativo',
                    veiculo: '',
                    motorista: '',
                    valor: 230.00,
                    comprovante: null,
                    observacoes: 'Papelaria Central'
                }
            ];
            localStorage.setItem('aguadelivery_despesas', JSON.stringify(dadosIniciais));
        }

        // Inicializar dados de abastecimento de água e combustível se não existirem
        if (!localStorage.getItem('aguadelivery_abastecimentos')) {
            const dadosIniciais = [
                {
                    id: 1,
                    tipo: 'agua',
                    data: '2023-10-15',
                    veiculo: 'ABC-1234',
                    fornecedor: 'Bica Municipal',
                    quantidade: 15000,
                    valorTotal: 350.00,
                    formaPagamento: 'dinheiro',
                    observacoes: 'Abastecimento para entregas do dia seguinte',
                    comprovante: null,
                    localizacao: {
                        latitude: -23.5505,
                        longitude: -46.6333
                    },
                    motorista: 'Carlos Santos',
                    timestamp: '2023-10-15T08:30:00'
                },
                {
                    id: 2,
                    tipo: 'combustivel',
                    data: '2023-10-10',
                    veiculo: 'ABC-1234',
                    fornecedor: 'Posto Ipiranga',
                    tipoCombustivel: 'diesel',
                    quantidade: 200,
                    valorLitro: 2.75,
                    valorTotal: 550.00,
                    quilometragem: 45000,
                    comprovante: null,
                    localizacao: {
                        latitude: -23.5607,
                        longitude: -46.6443
                    },
                    motorista: 'João Silva',
                    timestamp: '2023-10-10T17:15:00'
                },
                {
                    id: 3,
                    tipo: 'agua',
                    data: '2023-10-20',
                    veiculo: 'DEF-5678',
                    fornecedor: 'Bica Regional',
                    quantidade: 12000,
                    valorTotal: 300.00,
                    formaPagamento: 'pix',
                    observacoes: 'Abastecimento parcial',
                    comprovante: null,
                    localizacao: {
                        latitude: -23.5305,
                        longitude: -46.6233
                    },
                    motorista: 'Maria Oliveira',
                    timestamp: '2023-10-20T09:45:00'
                },
                {
                    id: 4,
                    tipo: 'combustivel',
                    data: '2023-10-22',
                    veiculo: 'GHI-9012',
                    fornecedor: 'Posto Shell',
                    tipoCombustivel: 'gasolina',
                    quantidade: 50,
                    valorLitro: 5.19,
                    valorTotal: 259.50,
                    quilometragem: 32500,
                    comprovante: null,
                    localizacao: {
                        latitude: -23.5705,
                        longitude: -46.6533
                    },
                    motorista: 'Ana Pereira',
                    timestamp: '2023-10-22T14:20:00'
                }
            ];
            localStorage.setItem('aguadelivery_abastecimentos', JSON.stringify(dadosIniciais));
        }

        // Sobrescrever os métodos do fetch para interceptar chamadas à API
        this.setupFetchMock();
    }

    // Métodos para manipular dados no localStorage
    getEntregas() {
        return JSON.parse(localStorage.getItem('aguadelivery_entregas') || '[]');
    }

    getEntregaById(id) {
        const entregas = this.getEntregas();
        return entregas.find(entrega => entrega.id === id);
    }

    salvarEntregas(entregas) {
        localStorage.setItem('aguadelivery_entregas', JSON.stringify(entregas));
    }

    criarEntrega(entrega) {
        const entregas = this.getEntregas();
        const novaEntrega = {
            ...entrega,
            id: this.gerarId(entregas)
        };
        entregas.push(novaEntrega);
        this.salvarEntregas(entregas);
        return novaEntrega;
    }

    atualizarEntrega(id, entregaAtualizada) {
        const entregas = this.getEntregas();
        const index = entregas.findIndex(entrega => entrega.id === id);
        
        if (index === -1) {
            throw new Error('Entrega não encontrada');
        }
        
        entregas[index] = {
            ...entregaAtualizada,
            id: id
        };
        
        this.salvarEntregas(entregas);
        return entregas[index];
    }

    excluirEntrega(id) {
        const entregas = this.getEntregas();
        const novoArray = entregas.filter(entrega => entrega.id !== id);
        
        if (novoArray.length === entregas.length) {
            throw new Error('Entrega não encontrada');
        }
        
        this.salvarEntregas(novoArray);
        return { success: true };
    }

    // Métodos para frota
    getFrota() {
        return JSON.parse(localStorage.getItem('aguadelivery_frota') || '[]');
    }

    getVeiculoById(id) {
        const frota = this.getFrota();
        return frota.find(veiculo => veiculo.id === id);
    }

    salvarFrota(frota) {
        localStorage.setItem('aguadelivery_frota', JSON.stringify(frota));
    }

    criarVeiculo(veiculo) {
        const frota = this.getFrota();
        const novoVeiculo = {
            ...veiculo,
            id: this.gerarId(frota)
        };
        frota.push(novoVeiculo);
        this.salvarFrota(frota);
        return novoVeiculo;
    }

    atualizarVeiculo(id, veiculoAtualizado) {
        const frota = this.getFrota();
        const index = frota.findIndex(veiculo => veiculo.id === id);
        
        if (index === -1) {
            throw new Error('Veículo não encontrado');
        }
        
        frota[index] = {
            ...veiculoAtualizado,
            id: id
        };
        
        this.salvarFrota(frota);
        return frota[index];
    }

    excluirVeiculo(id) {
        const frota = this.getFrota();
        const novoArray = frota.filter(veiculo => veiculo.id !== id);
        
        if (novoArray.length === frota.length) {
            throw new Error('Veículo não encontrado');
        }
        
        this.salvarFrota(novoArray);
        return { success: true };
    }

    // Métodos para motoristas e clientes
    getMotoristas() {
        return JSON.parse(localStorage.getItem('aguadelivery_motoristas') || '[]');
    }

    getMotoristaById(id) {
        const motoristas = this.getMotoristas();
        return motoristas.find(m => m.id == id) || null;
    }

    autenticarMotorista(usuario, senha) {
        const motoristas = this.getMotoristas();
        const motorista = motoristas.find(m => {
            // Verificar se o login é por usuário ou CPF (removendo pontuação)
            // Primeiro verifica se o documento existe
            const cpfLimpo = m.documento ? m.documento.replace(/[^\d]/g, '') : '';
            const matchUsuario = (m.usuario && m.usuario === usuario) || 
                                 (cpfLimpo && cpfLimpo === usuario.replace(/[^\d]/g, ''));
            
            return matchUsuario && m.senha === senha && m.ativo === true;
        });
        
        if (motorista) {
            // Em um cenário real, atualizaria o último login
            const resposta = {
                autenticado: true,
                token: 'token_' + Math.random().toString(36).substr(2, 9),
                dados: {
                    id: motorista.id,
                    nome: motorista.nome,
                    tipo: 'motorista',
                    permissoes: ['app_motorista']
                }
            };
            
            return resposta;
        }
        
        return { autenticado: false };
    }

    getClientes() {
        return JSON.parse(localStorage.getItem('aguadelivery_clientes') || '[]');
    }

    // Métodos para despesas
    getDespesas() {
        return JSON.parse(localStorage.getItem('aguadelivery_despesas') || '[]');
    }

    getDespesaById(id) {
        const despesas = this.getDespesas();
        return despesas.find(despesa => despesa.id === id);
    }

    salvarDespesas(despesas) {
        localStorage.setItem('aguadelivery_despesas', JSON.stringify(despesas));
    }

    criarDespesa(despesa) {
        const despesas = this.getDespesas();
        
        // Para simulação, não salvamos de fato o arquivo de comprovante,
        // apenas o nome dele se houver
        let comprovante = null;
        if (despesa.comprovante && despesa.comprovante.nome) {
            comprovante = {
                nome: despesa.comprovante.nome,
                tipo: despesa.comprovante.tipo,
                dataUpload: new Date().toISOString()
            };
        }
        
        const novaDespesa = {
            ...despesa,
            id: this.gerarId(despesas),
            comprovante: comprovante
        };
        
        despesas.push(novaDespesa);
        this.salvarDespesas(despesas);
        return novaDespesa;
    }

    atualizarDespesa(id, despesaAtualizada) {
        const despesas = this.getDespesas();
        const index = despesas.findIndex(despesa => despesa.id === id);
        
        if (index === -1) {
            throw new Error('Despesa não encontrada');
        }
        
        // Manter o comprovante existente se não for fornecido um novo
        let comprovante = despesas[index].comprovante;
        if (despesaAtualizada.comprovante && despesaAtualizada.comprovante.nome) {
            comprovante = {
                nome: despesaAtualizada.comprovante.nome,
                tipo: despesaAtualizada.comprovante.tipo,
                dataUpload: new Date().toISOString()
            };
        }
        
        despesas[index] = {
            ...despesaAtualizada,
            id: id,
            comprovante: comprovante
        };
        
        this.salvarDespesas(despesas);
        return despesas[index];
    }

    excluirDespesa(id) {
        const despesas = this.getDespesas();
        const novoArray = despesas.filter(despesa => despesa.id !== id);
        
        if (novoArray.length === despesas.length) {
            throw new Error('Despesa não encontrada');
        }
        
        this.salvarDespesas(novoArray);
        return { success: true };
    }

    gerarId(items) {
        if (items.length === 0) {
            return 1;
        }
        const maxId = Math.max(...items.map(item => item.id));
        return maxId + 1;
    }
    
    setupFetchMock() {
        // Armazenar referência à função fetch original
        this.originalFetch = window.fetch;
        
        // Sobrescrever a função fetch global para interceptar chamadas à API
        window.fetch = (url, options = {}) => {
            // Verificar se é uma chamada à nossa API
            if (url.startsWith('/api/') || url.startsWith('api/')) {
                return new Promise((resolve) => {
                    // Simular latência de rede
                    setTimeout(() => {
                        const response = this.processarRequest(url, options);
                        resolve(response);
                    }, 300);
                });
            }
            
            // Se não for uma chamada à nossa API, usar fetch original
            return this.originalFetch(url, options);
        };
    }
    
    processarRequest(url, options) {
        const method = options.method || 'GET';
        const data = options.body ? JSON.parse(options.body) : null;
        
        // Rotas de entregas
        if (url.match(/\/api\/entregas\/?$/)) {
            if (method === 'GET') {
                return this.criarResponse(this.getEntregas());
            } else if (method === 'POST') {
                return this.criarResponse(this.criarEntrega(data), 201);
            }
        }
        
        // Rota específica de uma entrega
        const entregaMatch = url.match(/\/api\/entregas\/(\d+)/);
        if (entregaMatch) {
            const id = parseInt(entregaMatch[1]);
            
            if (method === 'GET') {
                const entrega = this.getEntregaById(id);
                return entrega 
                    ? this.criarResponse(entrega) 
                    : this.criarResponse({ error: 'Entrega não encontrada' }, 404);
            } else if (method === 'PUT') {
                try {
                    return this.criarResponse(this.atualizarEntrega(id, data));
                } catch (error) {
                    return this.criarResponse({ error: error.message }, 404);
                }
            } else if (method === 'DELETE') {
                try {
                    return this.criarResponse(this.excluirEntrega(id));
                } catch (error) {
                    return this.criarResponse({ error: error.message }, 404);
                }
            }
        }
        
        // Rotas de frota
        if (url.match(/\/api\/frota\/?$/)) {
            if (method === 'GET') {
                return this.criarResponse(this.getFrota());
            } else if (method === 'POST') {
                return this.criarResponse(this.criarVeiculo(data), 201);
            }
        }
        
        // Rota específica de um veículo
        const veiculoMatch = url.match(/\/api\/frota\/(\d+)/);
        if (veiculoMatch) {
            const id = parseInt(veiculoMatch[1]);
            
            if (method === 'GET') {
                const veiculo = this.getVeiculoById(id);
                return veiculo 
                    ? this.criarResponse(veiculo) 
                    : this.criarResponse({ error: 'Veículo não encontrado' }, 404);
            } else if (method === 'PUT') {
                try {
                    return this.criarResponse(this.atualizarVeiculo(id, data));
                } catch (error) {
                    return this.criarResponse({ error: error.message }, 404);
                }
            } else if (method === 'DELETE') {
                try {
                    return this.criarResponse(this.excluirVeiculo(id));
                } catch (error) {
                    return this.criarResponse({ error: error.message }, 404);
                }
            }
        }
        
        // Rotas de motoristas
        if (url.match(/\/api\/motoristas\/?$/)) {
            if (method === 'GET') {
                return this.criarResponse(this.getMotoristas());
            }
        }
        
        // Rotas de clientes
        if (url.match(/\/api\/clientes\/?$/)) {
            if (method === 'GET') {
                return this.criarResponse(this.getClientes());
            }
        }
        
        // Rotas de despesas
        if (url.match(/\/api\/despesas\/?$/)) {
            if (method === 'GET') {
                return this.criarResponse(this.getDespesas());
            } else if (method === 'POST') {
                return this.criarResponse(this.criarDespesa(data), 201);
            }
        }
        
        // Rota específica de uma despesa
        const despesaMatch = url.match(/\/api\/despesas\/(\d+)/);
        if (despesaMatch) {
            const id = parseInt(despesaMatch[1]);
            
            if (method === 'GET') {
                const despesa = this.getDespesaById(id);
                return despesa 
                    ? this.criarResponse(despesa) 
                    : this.criarResponse({ error: 'Despesa não encontrada' }, 404);
            } else if (method === 'PUT') {
                try {
                    return this.criarResponse(this.atualizarDespesa(id, data));
                } catch (error) {
                    return this.criarResponse({ error: error.message }, 404);
                }
            } else if (method === 'DELETE') {
                try {
                    return this.criarResponse(this.excluirDespesa(id));
                } catch (error) {
                    return this.criarResponse({ error: error.message }, 404);
                }
            }
        }
        
        // Resposta padrão para rotas não mapeadas
        return this.criarResponse({ error: 'Rota não encontrada' }, 404);
    }
    
    criarResponse(data, status = 200) {
        const json = () => Promise.resolve(data);
        const text = () => Promise.resolve(JSON.stringify(data));
        const blob = () => Promise.resolve(new Blob([JSON.stringify(data)]));
        
        return {
            json,
            text,
            blob,
            ok: status >= 200 && status < 300,
            status,
            headers: new Headers({
                'Content-Type': 'application/json',
                'X-Mock-Api': 'true'
            })
        };
    }

    // Métodos para gerenciar abastecimentos
    getAbastecimentos() {
        return this.getDados('abastecimentos');
    }

    // Métodos genéricos para manipular dados no localStorage
    getDados(tipo) {
        return JSON.parse(localStorage.getItem(`aguadelivery_${tipo}`) || '[]');
    }
    
    salvarDados(tipo, dados) {
        localStorage.setItem(`aguadelivery_${tipo}`, JSON.stringify(dados));
    }

    /**
     * Obtém todos os registros de abastecimento
     * @param {string} tipo - Tipo de abastecimento ('agua', 'combustivel' ou undefined para todos)
     * @returns {Array} Lista de abastecimentos
     */
    obterAbastecimentos(tipo) {
        const abastecimentos = JSON.parse(localStorage.getItem('aguadelivery_abastecimentos') || '[]');
        
        if (tipo) {
            return abastecimentos.filter(item => item.tipo === tipo);
        }
        
        return abastecimentos;
    }

    /**
     * Obtém um registro de abastecimento pelo ID
     * @param {number} id - ID do abastecimento
     * @returns {Object|null} Abastecimento encontrado ou null
     */
    obterAbastecimentoPorId(id) {
        const abastecimentos = this.obterAbastecimentos();
        return abastecimentos.find(item => item.id === id) || null;
    }

    /**
     * Adiciona um novo registro de abastecimento
     * @param {Object} abastecimento - Dados do abastecimento
     * @returns {Object} Abastecimento adicionado com ID
     */
    adicionarAbastecimento(abastecimento) {
        const abastecimentos = this.obterAbastecimentos();
        
        // Gerar novo ID
        const novoId = abastecimentos.length > 0 
            ? Math.max(...abastecimentos.map(item => item.id)) + 1 
            : 1;
        
        // Adicionar timestamp e ID
        const novoAbastecimento = {
            ...abastecimento,
            id: novoId,
            timestamp: new Date().toISOString()
        };
        
        // Salvar no localStorage
        abastecimentos.push(novoAbastecimento);
        localStorage.setItem('aguadelivery_abastecimentos', JSON.stringify(abastecimentos));
        
        // Adicionar também como despesa
        this.adicionarDespesaDeAbastecimento(novoAbastecimento);
        
        return novoAbastecimento;
    }

    /**
     * Adiciona uma despesa correspondente ao abastecimento
     * @param {Object} abastecimento - Dados do abastecimento
     * @private
     */
    adicionarDespesaDeAbastecimento(abastecimento) {
        const despesas = JSON.parse(localStorage.getItem('aguadelivery_despesas') || '[]');
        
        // Gerar novo ID para a despesa
        const novoId = despesas.length > 0 
            ? Math.max(...despesas.map(item => item.id)) + 1 
            : 1;
            
        let descricao = '';
        let categoria = '';
        
        if (abastecimento.tipo === 'agua') {
            descricao = `Abastecimento de água - ${abastecimento.fornecedor}`;
            categoria = 'abastecimento';
        } else {
            descricao = `Abastecimento de ${abastecimento.tipoCombustivel} - ${abastecimento.fornecedor}`;
            categoria = 'combustivel';
        }
        
        // Criar despesa correspondente
        const novaDespesa = {
            id: novoId,
            data: abastecimento.data,
            descricao: descricao,
            categoria: categoria,
            veiculo: abastecimento.veiculo,
            motorista: abastecimento.motorista,
            valor: abastecimento.valorTotal,
            comprovante: abastecimento.comprovante,
            observacoes: abastecimento.observacoes || `${abastecimento.quantidade} ${abastecimento.tipo === 'agua' ? 'litros' : 'litros'}`
        };
        
        // Salvar no localStorage
        despesas.push(novaDespesa);
        localStorage.setItem('aguadelivery_despesas', JSON.stringify(despesas));
    }

    /**
     * Obtém os veículos disponíveis para abastecimento
     * @returns {Array} Lista de veículos
     */
    obterVeiculosParaAbastecimento() {
        const frota = JSON.parse(localStorage.getItem('aguadelivery_frota') || '[]');
        return frota
            .filter(veiculo => veiculo.status === 'operacional')
            .map(veiculo => ({
                id: veiculo.id,
                placa: veiculo.placa,
                modelo: veiculo.modelo,
                tipo: veiculo.tipo,
                capacidade: veiculo.capacidade
            }));
    }

    /**
     * Obtém relatório de abastecimentos por período
     * @param {string} dataInicio - Data de início (YYYY-MM-DD)
     * @param {string} dataFim - Data de fim (YYYY-MM-DD)
     * @param {string} tipo - Tipo de abastecimento (opcional)
     * @returns {Object} Relatório com totais e lista de abastecimentos
     */
    obterRelatorioAbastecimentos(dataInicio, dataFim, tipo) {
        const abastecimentos = this.obterAbastecimentos(tipo).filter(item => {
            return item.data >= dataInicio && item.data <= dataFim;
        });
        
        // Cálculo de totais
        const totalAgua = abastecimentos
            .filter(item => item.tipo === 'agua')
            .reduce((sum, item) => sum + item.quantidade, 0);
            
        const totalCombustivel = abastecimentos
            .filter(item => item.tipo === 'combustivel')
            .reduce((sum, item) => sum + item.quantidade, 0);
            
        const valorTotal = abastecimentos
            .reduce((sum, item) => sum + item.valorTotal, 0);
            
        return {
            periodo: { inicio: dataInicio, fim: dataFim },
            totalRegistros: abastecimentos.length,
            totalAgua: totalAgua,
            totalCombustivel: totalCombustivel,
            valorTotal: valorTotal,
            abastecimentos: abastecimentos
        };
    }

    // Abastecimentos
    abastecimentos = {
        agua: [],
        combustivel: []
    };
    
    /**
     * Salva um novo abastecimento de água
     * @param {Object} dados - Dados do abastecimento de água
     * @returns {Object} Resultado da operação
     */
    salvarAbastecimentoAgua(dados) {
        try {
            // Validação básica
            if (!dados.data || !dados.fornecedor || !dados.quantidade || !dados.valorTotal) {
                return { sucesso: false, mensagem: 'Preencha todos os campos obrigatórios' };
            }
            
            // Obter abastecimentos existentes
            const abastecimentos = JSON.parse(localStorage.getItem('aguadelivery_abastecimentos') || '[]');
            
            // Criar novo abastecimento
            const novoAbastecimento = {
                id: this.gerarId(abastecimentos),
                tipo: 'agua',
                ...dados,
                dataRegistro: new Date().toISOString()
            };
            
            // Adicionar ao array e salvar no localStorage
            abastecimentos.push(novoAbastecimento);
            localStorage.setItem('aguadelivery_abastecimentos', JSON.stringify(abastecimentos));
            
            // Adicionar também como despesa
            this.adicionarDespesaDeAbastecimento(novoAbastecimento);
            
            return { sucesso: true, id: novoAbastecimento.id };
        } catch (error) {
            console.error('Erro ao salvar abastecimento de água:', error);
            return { sucesso: false, mensagem: 'Erro ao salvar abastecimento de água' };
        }
    }
    
    /**
     * Salva um novo abastecimento de combustível
     * @param {Object} dados - Dados do abastecimento de combustível
     * @returns {Object} Resultado da operação
     */
    salvarAbastecimentoCombustivel(dados) {
        try {
            // Validação básica
            if (!dados.data || !dados.fornecedor || !dados.quantidade || !dados.valorTotal || !dados.quilometragem) {
                return { sucesso: false, mensagem: 'Preencha todos os campos obrigatórios' };
            }
            
            // Obter abastecimentos existentes
            const abastecimentos = JSON.parse(localStorage.getItem('aguadelivery_abastecimentos') || '[]');
            
            // Criar novo abastecimento
            const novoAbastecimento = {
                id: this.gerarId(abastecimentos),
                tipo: 'combustivel',
                ...dados,
                dataRegistro: new Date().toISOString()
            };
            
            // Adicionar ao array e salvar no localStorage
            abastecimentos.push(novoAbastecimento);
            localStorage.setItem('aguadelivery_abastecimentos', JSON.stringify(abastecimentos));
            
            // Adicionar também como despesa
            this.adicionarDespesaDeAbastecimento(novoAbastecimento);
            
            // Atualizar quilometragem do veículo
            if (dados.veiculoId) {
                this.atualizarQuilometragemVeiculo(dados.veiculoId, dados.quilometragem);
            }
            
            return { sucesso: true, id: novoAbastecimento.id };
        } catch (error) {
            console.error('Erro ao salvar abastecimento de combustível:', error);
            return { sucesso: false, mensagem: 'Erro ao salvar abastecimento de combustível' };
        }
    }
    
    /**
     * Atualiza a quilometragem de um veículo
     * @param {number} veiculoId - ID do veículo
     * @param {number} quilometragem - Nova quilometragem
     * @private
     */
    atualizarQuilometragemVeiculo(veiculoId, quilometragem) {
        try {
            const frota = this.getFrota();
            const veiculo = frota.find(v => v.id == veiculoId);
            
            if (veiculo) {
                // Só atualiza se a nova quilometragem for maior que a atual
                if (parseInt(quilometragem) > parseInt(veiculo.quilometragem)) {
                    veiculo.quilometragem = parseInt(quilometragem);
                    this.salvarFrota(frota);
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar quilometragem do veículo:', error);
        }
    }
    
    /**
     * Obtém abastecimentos por motorista
     * @param {number} motoristaId - ID do motorista
     * @returns {Array} Abastecimentos do motorista
     */
    getAbastecimentosPorMotorista(motoristaId) {
        try {
            const abastecimentos = JSON.parse(localStorage.getItem('aguadelivery_abastecimentos') || '[]');
            return abastecimentos.filter(a => a.motorista && a.motorista.id == motoristaId);
        } catch (error) {
            console.error('Erro ao obter abastecimentos por motorista:', error);
            return [];
        }
    }

    /**
     * Obtém a lista de veículos 
     * @returns {Array} Lista de veículos
     */
    obterVeiculos() {
        try {
            return this.getFrota();
        } catch (error) {
            console.error('Erro ao obter veículos:', error);
            return [];
        }
    }

    /**
     * Obtém um veículo pelo ID
     * @param {number} id - ID do veículo
     * @returns {Object|null} Veículo encontrado ou null
     */
    obterVeiculoPorId(id) {
        try {
            const veiculos = this.getFrota();
            return veiculos.find(v => v.id == id) || null;
        } catch (error) {
            console.error('Erro ao obter veículo por ID:', error);
            return null;
        }
    }

    /**
     * Obtém a lista de motoristas
     * @returns {Array} Lista de motoristas
     */
    obterMotoristas() {
        try {
            return this.getMotoristas();
        } catch (error) {
            console.error('Erro ao obter motoristas:', error);
            return [];
        }
    }

    /**
     * Obtém um motorista pelo ID
     * @param {number} id - ID do motorista
     * @returns {Object|null} Motorista encontrado ou null
     */
    obterMotoristaPorId(id) {
        try {
            const motoristas = this.getMotoristas();
            return motoristas.find(m => m.id == id) || null;
        } catch (error) {
            console.error('Erro ao obter motorista por ID:', error);
            return null;
        }
    }

    // Métodos para o Portal do Motorista
    
    // Buscar motorista por email
    getMotoristaByEmail(email) {
        const motoristas = this.getMotoristas();
        return motoristas.find(m => m.email === email);
    }
    
    // Buscar admin por email
    getAdminByEmail(email) {
        const admins = JSON.parse(localStorage.getItem('aguadelivery_admins') || '[]');
        return admins.find(a => a.email === email);
    }
    
    // Alterar senha de motorista
    alterarSenhaMotorista(motoristaId, novaSenha) {
        const motoristas = this.getMotoristas();
        const index = motoristas.findIndex(m => m.id == motoristaId);
        
        if (index === -1) {
            throw new Error('Motorista não encontrado');
        }
        
        motoristas[index].senha = novaSenha;
        localStorage.setItem('aguadelivery_motoristas', JSON.stringify(motoristas));
        return true;
    }
    
    // Alterar senha de admin
    alterarSenhaAdmin(adminId, novaSenha) {
        const admins = JSON.parse(localStorage.getItem('aguadelivery_admins') || '[]');
        const index = admins.findIndex(a => a.id == adminId);
        
        if (index === -1) {
            throw new Error('Administrador não encontrado');
        }
        
        admins[index].senha = novaSenha;
        localStorage.setItem('aguadelivery_admins', JSON.stringify(admins));
        return true;
    }
    
    // Obter veículos para o gerenciador de motorista
    getVeiculos() {
        return JSON.parse(localStorage.getItem('aguadelivery_frota') || '[]');
    }
    
    // Obter veículo por motorista
    getVeiculoByMotorista(motoristaId) {
        // Verificar vinculações atuais
        const vinculacoes = JSON.parse(localStorage.getItem('aguadelivery_motorista_veiculo') || '[]');
        const vinculacao = vinculacoes.find(v => v.motoristaId == motoristaId && v.ativo);
        
        if (!vinculacao) return null;
        
        return this.getVeiculoById(vinculacao.veiculoId);
    }
    
    // Registrar check-in de motorista
    registrarCheckin(checkinData) {
        const checkins = JSON.parse(localStorage.getItem('aguadelivery_checkins') || '[]');
        checkins.push(checkinData);
        localStorage.setItem('aguadelivery_checkins', JSON.stringify(checkins));
        return checkinData;
    }
    
    // Atualizar KM de veículo
    atualizarKmVeiculo(veiculoId, kmAtual) {
        const veiculos = this.getVeiculos();
        const index = veiculos.findIndex(v => v.id == veiculoId);
        
        if (index === -1) {
            throw new Error('Veículo não encontrado');
        }
        
        // Registrar histórico de quilometragem
        const historicoKm = JSON.parse(localStorage.getItem('aguadelivery_historico_km') || '[]');
        historicoKm.push({
            id: Date.now().toString(),
            veiculoId: veiculoId,
            data: new Date().toISOString(),
            km: Number(kmAtual)
        });
        localStorage.setItem('aguadelivery_historico_km', JSON.stringify(historicoKm));
        
        // Atualizar KM atual do veículo
        veiculos[index].kmAtual = Number(kmAtual);
        localStorage.setItem('aguadelivery_frota', JSON.stringify(veiculos));
        
        return true;
    }
    
    // Vincular motorista a veículo
    vincularMotoristaVeiculo(motoristaId, veiculoId) {
        const vinculacoes = JSON.parse(localStorage.getItem('aguadelivery_motorista_veiculo') || '[]');
        
        // Desativar vinculações anteriores do motorista
        vinculacoes.forEach(v => {
            if (v.motoristaId == motoristaId && v.ativo) {
                v.ativo = false;
                v.dataFim = new Date().toISOString();
            }
        });
        
        // Criar nova vinculação
        vinculacoes.push({
            id: Date.now().toString(),
            motoristaId: motoristaId,
            veiculoId: veiculoId,
            dataInicio: new Date().toISOString(),
            dataFim: null,
            ativo: true
        });
        
        localStorage.setItem('aguadelivery_motorista_veiculo', JSON.stringify(vinculacoes));
        return true;
    }
    
    // Obter histórico de veículos do motorista
    getHistoricoVeiculosMotorista(motoristaId) {
        const vinculacoes = JSON.parse(localStorage.getItem('aguadelivery_motorista_veiculo') || '[]');
        
        // Filtrar vinculações inativas do motorista
        return vinculacoes
            .filter(v => v.motoristaId == motoristaId && !v.ativo)
            .map(v => ({
                veiculoId: v.veiculoId,
                dataUso: v.dataInicio,
                dataFim: v.dataFim,
                // Preencher com dados do check-in mais recente
                kmRegistrado: this.getUltimoKmRegistrado(v.veiculoId, v.dataFim)
            }))
            .sort((a, b) => new Date(b.dataUso) - new Date(a.dataUso));
    }
    
    // Obter último KM registrado para um veículo até determinada data
    getUltimoKmRegistrado(veiculoId, dataLimite) {
        const historicoKm = JSON.parse(localStorage.getItem('aguadelivery_historico_km') || '[]');
        
        // Filtrar por veículo e data
        const registrosDoVeiculo = historicoKm
            .filter(r => r.veiculoId == veiculoId && new Date(r.data) <= new Date(dataLimite))
            .sort((a, b) => new Date(b.data) - new Date(a.data));
        
        return registrosDoVeiculo.length > 0 ? registrosDoVeiculo[0].km : 0;
    }
    
    // Obter histórico de KM de um veículo
    getHistoricoKmVeiculo(veiculoId) {
        const historicoKm = JSON.parse(localStorage.getItem('aguadelivery_historico_km') || '[]');
        return historicoKm.filter(r => r.veiculoId == veiculoId);
    }
    
    // Registrar problema em veículo
    registrarProblemaVeiculo(veiculoId, motoristaId, descricao) {
        const problemas = JSON.parse(localStorage.getItem('aguadelivery_problemas_veiculos') || '[]');
        
        const novoProblemoa = {
            id: Date.now().toString(),
            veiculoId: veiculoId,
            motoristaId: motoristaId,
            descricao: descricao,
            data: new Date().toISOString(),
            status: 'pendente'
        };
        
        problemas.push(novoProblemoa);
        localStorage.setItem('aguadelivery_problemas_veiculos', JSON.stringify(problemas));
        
        return novoProblemoa;
    }
    
    // Obter última manutenção de um veículo
    getUltimaManutencaoVeiculo(veiculoId) {
        const manutencoes = JSON.parse(localStorage.getItem('aguadelivery_manutencoes_veiculos') || '[]');
        
        // Filtrar por veículo e ordenar por data decrescente
        const manutencoesDoVeiculo = manutencoes
            .filter(m => m.veiculoId == veiculoId)
            .sort((a, b) => new Date(b.data) - new Date(a.data));
        
        return manutencoesDoVeiculo.length > 0 ? manutencoesDoVeiculo[0] : null;
    }
    
    // Obter histórico de manutenções de um veículo
    getHistoricoManutencaoVeiculo(veiculoId) {
        const manutencoes = JSON.parse(localStorage.getItem('aguadelivery_manutencoes_veiculos') || '[]');
        
        // Se não há dados, criar alguns registros fictícios para teste
        if (manutencoes.length === 0) {
            const manutencoesTeste = [
                {
                    id: '1',
                    veiculoId: veiculoId,
                    data: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
                    tipo: 'Preventiva',
                    kmRegistrado: 30000,
                    responsavel: 'Oficina Central',
                    observacoes: 'Troca de óleo e filtros'
                },
                {
                    id: '2',
                    veiculoId: veiculoId,
                    data: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
                    tipo: 'Corretiva',
                    kmRegistrado: 35000,
                    responsavel: 'Mecânica Express',
                    observacoes: 'Substituição de pastilhas de freio'
                }
            ];
            localStorage.setItem('aguadelivery_manutencoes_veiculos', JSON.stringify(manutencoesTeste));
            return manutencoesTeste.filter(m => m.veiculoId == veiculoId);
        }
        
        return manutencoes.filter(m => m.veiculoId == veiculoId)
            .sort((a, b) => new Date(b.data) - new Date(a.data));
    }
}

// Inicializar a API mockada
const mockAPI = new MockAPI();

// Função para obter dados de clientes
function obterClientes() {
    return fetch('/api/clientes')
        .then(response => response.json())
        .then(clientes => {
            // Processar e retornar dados de clientes
            return clientes.map(cliente => ({
                id: cliente.id,
                nome: cliente.nome,
                endereco: cliente.endereco,
                telefone: cliente.telefone,
                responsavel: cliente.responsavel
            }));
        })
        .catch(error => {
            console.error('Erro ao obter clientes:', error);
            return [];
        });
}

// Função para buscar abastecimentos de uma empresa
function buscarAbastecimentos(empresaId, dataInicio, dataFim) {
    // Simular busca de abastecimentos
    return new Promise(resolve => {
        setTimeout(() => {
            const abastecimentos = [
                {
                    id: 1,
                    data: '2023-09-10',
                    empresa: 'Empresa A',
                    capacidade: 5000,
                    valorPorLitro: 0.15,
                    valorTotal: 750,
                    notaFiscal: 'NF-123456'
                },
                {
                    id: 2,
                    data: '2023-09-15',
                    empresa: 'Empresa A',
                    capacidade: 7000,
                    valorPorLitro: 0.15,
                    valorTotal: 1050,
                    notaFiscal: 'NF-123457'
                },
                {
                    id: 3,
                    data: '2023-09-20',
                    empresa: 'Empresa B',
                    capacidade: 10000,
                    valorPorLitro: 0.14,
                    valorTotal: 1400,
                    notaFiscal: 'NF-123458'
                },
                {
                    id: 4,
                    data: '2023-09-25',
                    empresa: 'Empresa A',
                    capacidade: 8000,
                    valorPorLitro: 0.15,
                    valorTotal: 1200,
                    notaFiscal: 'NF-123459'
                }
            ];

            // Filtrar por empresa se necessário
            let resultado = abastecimentos;
            if (empresaId) {
                resultado = resultado.filter(item => item.empresa === `Empresa ${empresaId}`);
            }

            // Filtrar por data se necessário
            if (dataInicio) {
                resultado = resultado.filter(item => new Date(item.data) >= new Date(dataInicio));
            }
            if (dataFim) {
                resultado = resultado.filter(item => new Date(item.data) <= new Date(dataFim));
            }

            resolve(resultado);
        }, 500);
    });
}

// Função para calcular o volume total abastecido
function calcularVolumeTotalAbastecido(abastecimentos) {
    return abastecimentos.reduce((total, abastecimento) => {
        return total + abastecimento.capacidade;
    }, 0);
}

// Função para formatar valor em moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    }).format(valor);
}

// Função para gerar linhas da tabela
function gerarLinhasTabela(abastecimentos) {
    return abastecimentos.map(abastecimento => `
        <tr>
            <td>${abastecimento.data}</td>
            <td>${abastecimento.empresa}</td>
            <td>${abastecimento.capacidade} L</td>
            <td>${formatarMoeda(abastecimento.valorPorLitro)}</td>
            <td>${formatarMoeda(abastecimento.valorTotal)}</td>
            <td>${abastecimento.notaFiscal}</td>
        </tr>
    `).join('');
}

// Função para gerar lista de notas fiscais
function gerarListaNotasFiscais(abastecimentos) {
    return abastecimentos.map(abastecimento => `
        <li>
            <span class="nf-number">${abastecimento.notaFiscal}</span>
            <span class="nf-details">
                Data: ${abastecimento.data} | 
                Valor: ${formatarMoeda(abastecimento.valorTotal)} | 
                Volume: ${abastecimento.capacidade} L
            </span>
        </li>
    `).join('');
}

// Função para obter resumo de despesas
function obterResumoDespesas() {
    return fetch('/api/despesas')
        .then(response => response.json())
        .then(despesas => {
            const hoje = new Date();
            const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            
            // Formatar as datas para comparação
            const primeiroDiaMesStr = primeiroDiaMes.toISOString().split('T')[0];
            const ultimoDiaMesStr = ultimoDiaMes.toISOString().split('T')[0];
            
            // Filtrar despesas do mês atual
            const despesasMesAtual = despesas.filter(despesa => 
                despesa.data >= primeiroDiaMesStr && despesa.data <= ultimoDiaMesStr
            );
            
            // Filtrar despesas de combustível
            const despesasCombustivel = despesas.filter(despesa => 
                despesa.categoria === 'combustivel'
            );
            
            // Calcular totais
            const totalDespesas = despesas.length;
            const valorTotal = despesas.reduce((total, despesa) => total + parseFloat(despesa.valor), 0);
            const valorMesAtual = despesasMesAtual.reduce((total, despesa) => total + parseFloat(despesa.valor), 0);
            const valorCombustivel = despesasCombustivel.reduce((total, despesa) => total + parseFloat(despesa.valor), 0);
            
            return {
                totalDespesas,
                valorTotal,
                valorMesAtual,
                valorCombustivel
            };
        })
        .catch(error => {
            console.error('Erro ao obter resumo de despesas:', error);
            return {
                totalDespesas: 0,
                valorTotal: 0,
                valorMesAtual: 0,
                valorCombustivel: 0
            };
        });
} 