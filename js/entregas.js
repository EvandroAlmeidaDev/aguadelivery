/**
 * entregas.js - Gerenciamento de entregas
 */

// Variáveis globais
let currentDelivery = null;
let isEditing = false;
let api;

// Inicializar a API do Supabase
async function inicializarAPI() {
    try {
        // Usar a classe SupabaseAPI que já está disponível globalmente
        api = new window.SupabaseAPI();
        await carregarDados();
    } catch (error) {
        console.error('Erro ao inicializar API:', error);
        exibirNotificacao('Erro ao conectar com o servidor. Tente novamente mais tarde.', 'error');
    }
}

// Carregar dados do Supabase
async function carregarDados() {
    try {
        document.getElementById('loading-spinner').style.display = 'block';
        document.getElementById('empty-state').style.display = 'none';
        
        // Carregar entregas do Supabase
        const entregas = await api.getEntregas();
        currentDeliveries = entregas;
        
        // Atualizar a tabela
        atualizarTabelaEntregas();
        
        // Atualizar elementos do dashboard
        atualizarDashboard();
        
        // Exibir estado vazio se não houver entregas
        if (entregas.length === 0) {
            document.getElementById('empty-state').style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        exibirNotificacao('Erro ao carregar entregas. Tente novamente mais tarde.', 'error');
    } finally {
        document.getElementById('loading-spinner').style.display = 'none';
    }
}

// Atualizar elementos do dashboard
function atualizarDashboard() {
    const totalEntregas = document.getElementById('total-entregas');
    const totalValor = document.getElementById('total-valor');
    const totalMetros = document.getElementById('total-metros');
    const totalLitros = document.getElementById('total-litros');

    if (!totalEntregas || !totalValor || !totalMetros || !totalLitros) {
        return;
    }

    const totals = currentDeliveries.reduce((acc, delivery) => {
        acc.count += 1;
        acc.value += parseFloat(delivery.valor || 0);
        acc.capacity += parseFloat(delivery.capacidade || 0);
        return acc;
    }, { count: 0, value: 0, capacity: 0 });

    totalEntregas.textContent = totals.count;
    totalValor.textContent = formatarMoeda(totals.value);
    totalMetros.textContent = formatarMetrosCubicos(totals.capacity);
    totalLitros.textContent = formatarLitros(totals.capacity);
}

// Formatar valores
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatarMetrosCubicos(valor) {
    return `${valor.toFixed(2)} m³`;
}

function formatarLitros(valor) {
    const litros = valor * 1000;
    return `${litros.toFixed(0)} L`;
}

// Formatar status da nota fiscal
function formatarStatus(status) {
    const statusMap = {
        'a_emitir': 'A Emitir',
        'emitida': 'Emitida',
        'pendente': 'Pendente'
    };
    return statusMap[status] || status;
}

// Atualizar tabela - renomeado para evitar conflito
function atualizarTabelaEntregas() {
    const tbody = document.getElementById('tabela-entregas');
    
    if (!tbody) {
        return;
    }
    
    // Limpar a tabela
    tbody.innerHTML = '';
    
    // Adicionar linhas
    currentDeliveries.forEach(entrega => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${entrega.nota_fiscal || '-'}</td>
            <td>
                <span class="status-tag ${entrega.status_nf}">
                    ${formatarStatus(entrega.status_nf)}
                </span>
            </td>
            <td>${entrega.data_entrega}</td>
            <td>${entrega.motorista_nome}</td>
            <td>${entrega.origem}</td>
            <td>${entrega.destino}</td>
            <td>${formatarMetrosCubicos(entrega.capacidade)}</td>
            <td>${formatarMoeda(entrega.valor)}</td>
            <td>
                <button class="btn-action edit" data-id="${entrega.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action delete" data-id="${entrega.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Atualizar o dashboard
    atualizarDashboard();
}

// Modal de Entrega
const modal = document.createElement('div');
modal.className = 'modal';
modal.id = 'modal-entrega';
modal.innerHTML = `
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="modal-titulo">Nova Entrega</h2>
            <button class="btn-fechar" id="btn-fechar-modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <form id="form-entrega">
                <input type="hidden" id="entrega-id">
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="entrega-data">Data</label>
                        <input type="date" id="entrega-data" required>
                    </div>
                    <div class="form-group">
                        <label for="entrega-motorista">Motorista</label>
                        <select id="entrega-motorista" required>
                            <option value="">Selecione</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="entrega-origem">Origem</label>
                        <input type="text" id="entrega-origem" required>
                    </div>
                    <div class="form-group">
                        <label for="entrega-destino">Destino</label>
                        <input type="text" id="entrega-destino" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="entrega-capacidade">Capacidade (m³)</label>
                        <input type="number" id="entrega-capacidade" step="0.1" min="0.1" required>
                    </div>
                    <div class="form-group">
                        <label for="entrega-valor">Valor (R$)</label>
                        <input type="number" id="entrega-valor" step="0.01" min="0.01" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="entrega-nota-fiscal">Nota Fiscal</label>
                        <input type="text" id="entrega-nota-fiscal">
                    </div>
                    <div class="form-group">
                        <label for="entrega-status-nf">Status NF</label>
                        <select id="entrega-status-nf" required>
                            <option value="a_emitir">A Emitir</option>
                            <option value="emitida">Emitida</option>
                            <option value="pendente">Pendente</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="entrega-observacoes">Observações</label>
                    <textarea id="entrega-observacoes" rows="3"></textarea>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline" id="btn-cancelar">Cancelar</button>
            <button class="btn btn-primary" id="btn-salvar">Salvar</button>
        </div>
    </div>
`;

// Modal de confirmação para exclusão
const modalConfirmacao = document.createElement('div');
modalConfirmacao.className = 'modal';
modalConfirmacao.id = 'modal-confirmacao';
modalConfirmacao.innerHTML = `
    <div class="modal-content modal-sm">
        <div class="modal-header">
            <h2>Confirmar Exclusão</h2>
            <button class="btn-fechar" id="btn-fechar-confirmacao">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <p>Tem certeza que deseja excluir esta entrega? Esta ação não poderá ser desfeita.</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline" id="btn-cancelar-exclusao">Cancelar</button>
            <button class="btn btn-danger" id="btn-confirmar-exclusao">Excluir</button>
        </div>
    </div>
`;

// Overlay para os modais
const overlay = document.createElement('div');
overlay.className = 'modal-overlay';

// Adicionar modais ao DOM
document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(modal);
    document.body.appendChild(modalConfirmacao);
    document.body.appendChild(overlay);

    // Inicializar eventos
    initEventListeners();
    
    // Inicializar a API e carregar dados
    inicializarAPI();
});

// Carregar motoristas no select
async function carregarMotoristas() {
    try {
        const select = document.getElementById('entrega-motorista');
        const motoristas = await api.getMotoristas();
        
        // Limpar opções existentes, mantendo apenas a primeira (placeholder)
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Adicionar motoristas ao select
        motoristas.forEach(motorista => {
            const option = document.createElement('option');
            option.value = motorista.id;
            option.textContent = motorista.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar motoristas:', error);
    }
}

// Configurar listeners de eventos
const initEventListeners = () => {
    // Botão "Nova Entrega"
    const btnNovaEntrega = document.getElementById('btn-nova-entrega');
    if (btnNovaEntrega) {
        btnNovaEntrega.addEventListener('click', () => abrirModalEntrega());
    }
    
    // Botões de fechar modais
    document.getElementById('btn-fechar-modal').addEventListener('click', fecharModalEntrega);
    document.getElementById('btn-cancelar').addEventListener('click', fecharModalEntrega);
    document.getElementById('btn-fechar-confirmacao').addEventListener('click', fecharModalConfirmacao);
    document.getElementById('btn-cancelar-exclusao').addEventListener('click', fecharModalConfirmacao);
    
    // Botões de salvar
    document.getElementById('btn-salvar').addEventListener('click', salvarEntrega);
    document.getElementById('btn-confirmar-exclusao').addEventListener('click', excluirEntrega);
    
    // Interação com a tabela
    const tabela = document.getElementById('tabela-entregas');
    if (tabela) {
        tabela.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-action');
            if (!btn) return;
            
            const id = btn.dataset.id;
            
            if (btn.classList.contains('edit')) {
                abrirModalEntrega('editar', id);
            } else if (btn.classList.contains('delete')) {
                abrirModalConfirmacao(id);
            }
        });
    }
    
    // Filtros
    const filtroData = document.getElementById('filtro-data');
    const filtroMotorista = document.getElementById('filtro-motorista');
    const filtroStatus = document.getElementById('filtro-status');
    const buscaInput = document.getElementById('busca');
    
    if (filtroData) filtroData.addEventListener('change', aplicarFiltros);
    if (filtroMotorista) filtroMotorista.addEventListener('change', aplicarFiltros);
    if (filtroStatus) filtroStatus.addEventListener('change', aplicarFiltros);
    if (buscaInput) buscaInput.addEventListener('input', aplicarFiltros);
    
    // Fechar modal ao clicar no overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            fecharModalEntrega();
            fecharModalConfirmacao();
        }
    });
};

// Filtrar entregas
async function aplicarFiltros() {
    const filtroData = document.getElementById('filtro-data')?.value || '';
    const filtroMotorista = document.getElementById('filtro-motorista')?.value || '';
    const filtroStatus = document.getElementById('filtro-status')?.value || '';
    const busca = document.getElementById('busca')?.value?.toLowerCase() || '';
    
    try {
        document.getElementById('loading-spinner').style.display = 'block';
        
        // Construir objeto de filtros para o Supabase
        const filtros = {};
        if (filtroData) filtros.data_entrega = filtroData;
        if (filtroMotorista) filtros.motorista_id = filtroMotorista;
        if (filtroStatus) filtros.status_nf = filtroStatus;
        
        // Buscar entregas filtradas
        let entregas = await api.getEntregas(filtros);
        
        // Aplicar filtro de busca no cliente (pois pode ser mais complexo)
        if (busca) {
            entregas = entregas.filter(entrega => 
                entrega.origem?.toLowerCase().includes(busca) ||
                entrega.destino?.toLowerCase().includes(busca) ||
                entrega.nota_fiscal?.toLowerCase().includes(busca) ||
                entrega.motorista_nome?.toLowerCase().includes(busca)
            );
        }
        
        currentDeliveries = entregas;
        atualizarTabelaEntregas();
        
        // Mostrar estado vazio se não houver resultados
        if (entregas.length === 0) {
            document.getElementById('empty-state').style.display = 'block';
        } else {
            document.getElementById('empty-state').style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
        exibirNotificacao('Erro ao filtrar entregas', 'error');
    } finally {
        document.getElementById('loading-spinner').style.display = 'none';
    }
}

// Abrir modal de entrega
const abrirModalEntrega = async (modo = 'novo', id = null) => {
    isEditing = modo === 'editar';
    const titulo = document.getElementById('modal-titulo');
    const form = document.getElementById('form-entrega');
    
    // Limpar formulário
    if (form) form.reset();
    
    // Carregar motoristas
    await carregarMotoristas();
    
    if (isEditing && id) {
        try {
            // Buscar entrega para edição
            const entrega = await api.getEntregaById(id);
            
            if (entrega) {
                currentDelivery = entrega;
                
                // Preencher formulário
                document.getElementById('entrega-id').value = entrega.id;
                document.getElementById('entrega-data').value = entrega.data_entrega;
                document.getElementById('entrega-motorista').value = entrega.motorista_id;
                document.getElementById('entrega-origem').value = entrega.origem;
                document.getElementById('entrega-destino').value = entrega.destino;
                document.getElementById('entrega-capacidade').value = entrega.capacidade;
                document.getElementById('entrega-valor').value = entrega.valor;
                document.getElementById('entrega-nota-fiscal').value = entrega.nota_fiscal || '';
                document.getElementById('entrega-status-nf').value = entrega.status_nf;
                document.getElementById('entrega-observacoes').value = entrega.observacoes || '';
                
                titulo.textContent = 'Editar Entrega';
            }
        } catch (error) {
            console.error('Erro ao carregar entrega para edição:', error);
            exibirNotificacao('Erro ao carregar dados da entrega', 'error');
            fecharModalEntrega();
            return;
        }
    } else {
        // Nova entrega
        currentDelivery = null;
        document.getElementById('entrega-id').value = '';
        document.getElementById('entrega-data').value = new Date().toISOString().split('T')[0];
        
        titulo.textContent = 'Nova Entrega';
    }
    
    // Exibir modal
    modal.classList.add('active');
    overlay.classList.add('active');
};

// Fechar modal de entrega
const fecharModalEntrega = () => {
    modal.classList.remove('active');
    overlay.classList.remove('active');
};

// Abrir modal de confirmação
const abrirModalConfirmacao = async (id) => {
    try {
        currentDelivery = await api.getEntregaById(id);
        if (currentDelivery) {
            modalConfirmacao.classList.add('active');
            overlay.classList.add('active');
        }
    } catch (error) {
        console.error('Erro ao carregar entrega para exclusão:', error);
        exibirNotificacao('Erro ao carregar dados da entrega', 'error');
    }
};

// Fechar modal de confirmação
const fecharModalConfirmacao = () => {
    modalConfirmacao.classList.remove('active');
    overlay.classList.remove('active');
};

// Salvar entrega
const salvarEntrega = async () => {
    // Validar formulário
    const form = document.getElementById('form-entrega');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Obter dados do formulário
    const entregaId = document.getElementById('entrega-id').value;
    const data = document.getElementById('entrega-data').value;
    const motoristaId = document.getElementById('entrega-motorista').value;
    const origem = document.getElementById('entrega-origem').value;
    const destino = document.getElementById('entrega-destino').value;
    const capacidade = parseFloat(document.getElementById('entrega-capacidade').value);
    const valor = parseFloat(document.getElementById('entrega-valor').value);
    const notaFiscal = document.getElementById('entrega-nota-fiscal').value;
    const statusNF = document.getElementById('entrega-status-nf').value;
    const observacoes = document.getElementById('entrega-observacoes').value;
    
    // Validar campos
    if (!data || !motoristaId || !origem || !destino || isNaN(capacidade) || isNaN(valor) || !statusNF) {
        exibirNotificacao('Por favor, preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    // Criar objeto de entrega
    const entrega = {
        data_entrega: data,
        motorista_id: motoristaId,
        origem: origem,
        destino: destino,
        capacidade: capacidade,
        valor: valor,
        nota_fiscal: notaFiscal,
        status_nf: statusNF,
        observacoes: observacoes
    };
    
    try {
        if (isEditing) {
            // Editar entrega existente
            await api.atualizarEntrega(entregaId, entrega);
            exibirNotificacao('Entrega atualizada com sucesso', 'success');
        } else {
            // Adicionar nova entrega
            await api.criarEntrega(entrega);
            exibirNotificacao('Entrega criada com sucesso', 'success');
        }
        
        // Recarregar dados
        await carregarDados();
        
        // Fechar modal
        fecharModalEntrega();
    } catch (error) {
        console.error('Erro ao salvar entrega:', error);
        exibirNotificacao(`Erro ao ${isEditing ? 'atualizar' : 'criar'} entrega`, 'error');
    }
};

// Excluir entrega
const excluirEntrega = async () => {
    if (currentDelivery) {
        try {
            await api.excluirEntrega(currentDelivery.id);
            
            fecharModalConfirmacao();
            await carregarDados();
            
            exibirNotificacao('Entrega excluída com sucesso', 'success');
        } catch (error) {
            console.error('Erro ao excluir entrega:', error);
            exibirNotificacao('Erro ao excluir entrega', 'error');
        }
    }
};

// Exibir notificação
const exibirNotificacao = (mensagem, tipo) => {
    // Criar elemento
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;
    
    // Definir ícone
    let icone = '';
    switch (tipo) {
        case 'success':
            icone = 'check-circle';
            break;
        case 'error':
            icone = 'exclamation-circle';
            break;
        case 'warning':
            icone = 'exclamation-triangle';
            break;
        default:
            icone = 'info-circle';
    }
    
    // Definir conteúdo
    notificacao.innerHTML = `
        <i class="fas fa-${icone}"></i>
        <span>${mensagem}</span>
        <button class="fechar-notificacao">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(notificacao);
    
    // Adicionar evento para fechar
    notificacao.querySelector('.fechar-notificacao').addEventListener('click', () => {
        notificacao.remove();
    });
    
    // Auto-fechar após 5 segundos
    setTimeout(() => {
        if (document.body.contains(notificacao)) {
            notificacao.remove();
        }
    }, 5000);
}; 