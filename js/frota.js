/**
 * frota.js - Gerenciamento de frota de veículos
 */

// Variáveis globais
let veiculos = [];
let veiculosFiltrados = [];
let veiculoAtual = null;
let editando = false;
let veiculoSelecionadoParaExclusao = null;

// Elementos DOM
const tabelaVeiculos = document.getElementById('tabela-veiculos');
const buscaVeiculo = document.getElementById('busca-veiculo');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroStatus = document.getElementById('filtro-status');
const filtroManutencao = document.getElementById('filtro-manutencao');
const btnNovoVeiculo = document.getElementById('btn-novo-veiculo');
const modalVeiculo = document.getElementById('modal-veiculo');
const modalTitulo = document.getElementById('modal-titulo');
const formVeiculo = document.getElementById('form-veiculo');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const btnCancelar = document.getElementById('btn-cancelar');
const btnSalvar = document.getElementById('btn-salvar');
const modalConfirmacao = document.getElementById('modal-confirmacao');
const btnFecharConfirmacao = document.getElementById('btn-fechar-confirmacao');
const btnCancelarExclusao = document.getElementById('btn-cancelar-exclusao');
const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
const modalOverlay = document.querySelector('.modal-overlay');
const loadingSpinner = document.getElementById('loading-spinner');
const emptyState = document.getElementById('empty-state');
const totalVeiculos = document.getElementById('total-veiculos');
const totalManutencao = document.getElementById('total-manutencao');
const totalManutencaoPendente = document.getElementById('total-manutencao-pendente');

// Inicializar a página quando o DOM estiver pronto e o Supabase estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o supabase já está disponível
    if (window.supabase) {
        inicializar();
    } else {
        // Esperar o evento supabaseReady
        document.addEventListener('supabaseReady', inicializar);
    }
});

// Função de inicialização
async function inicializar() {
    try {
        // Carregar veículos
        await carregarVeiculos();

        // Adicionar event listeners
        buscaVeiculo.addEventListener('input', filtrarVeiculos);
        filtroTipo.addEventListener('change', filtrarVeiculos);
        filtroStatus.addEventListener('change', filtrarVeiculos);
        filtroManutencao.addEventListener('change', filtrarVeiculos);
        
        // Configurar botões de ação
        if (btnNovoVeiculo) {
            console.log("Configurando evento para btnNovoVeiculo");
            btnNovoVeiculo.addEventListener('click', abrirModalVeiculo);
        }
        
        if (btnFecharModal) {
            btnFecharModal.addEventListener('click', fecharModal);
        }
        
        if (btnCancelar) {
            btnCancelar.addEventListener('click', fecharModal);
        }
        
        if (btnSalvar) {
            console.log("Configurando evento para btnSalvar");
            btnSalvar.addEventListener('click', salvarVeiculo);
        }
        
        if (btnFecharConfirmacao) {
            btnFecharConfirmacao.addEventListener('click', fecharModalConfirmacao);
        }
        
        if (btnCancelarExclusao) {
            btnCancelarExclusao.addEventListener('click', fecharModalConfirmacao);
        }
        
        if (btnConfirmarExclusao) {
            btnConfirmarExclusao.addEventListener('click', excluirVeiculo);
        }
        
        // Configurar botões do modal de confirmação de exclusão de veículo
        const btnFecharModalConfirmar = document.getElementById('btn-fechar-modal-confirmar');
        const btnCancelarConfirmarExclusao = document.getElementById('btn-cancelar-confirmar-exclusao');
        const btnConfirmarExclusaoVeiculo = document.getElementById('btn-confirmar-exclusao-veiculo');
        
        if (btnFecharModalConfirmar) {
            btnFecharModalConfirmar.addEventListener('click', fecharModal);
        }
        
        if (btnCancelarConfirmarExclusao) {
            btnCancelarConfirmarExclusao.addEventListener('click', fecharModal);
        }
        
        if (btnConfirmarExclusaoVeiculo) {
            btnConfirmarExclusaoVeiculo.addEventListener('click', excluirVeiculo);
        }
        
        if (formVeiculo) {
            formVeiculo.addEventListener('submit', (e) => {
                e.preventDefault();
                salvarVeiculo();
            });
        }

        // Configurar listeners dos botões de ação na tabela
        if (tabelaVeiculos) {
            tabelaVeiculos.addEventListener('click', (e) => {
                const btnEdit = e.target.closest('.btn-action.edit');
                const btnDelete = e.target.closest('.btn-action.delete');
                
                if (btnEdit) {
                    const id = btnEdit.getAttribute('data-id');
                    editarVeiculo(id);
                } else if (btnDelete) {
                    const id = btnDelete.getAttribute('data-id');
                    confirmarExclusao(id);
                }
            });
        }
    } catch (error) {
        console.error("Erro ao inicializar a página:", error);
        mostrarMensagem("Erro ao carregar dados. Por favor, tente novamente mais tarde.", "error");
    }
}

// Função para carregar veículos
async function carregarVeiculos() {
    mostrarLoading();

    try {
        // Obter veículos do Supabase usando a API global
        const dados = await window.api.getFrota();
        veiculos = dados || [];
        veiculosFiltrados = [...veiculos];
        
        console.log("Veículos carregados do Supabase:", veiculos);
        
        atualizarDashboard();
        atualizarTabela();
        
        // Mostrar estado vazio se não houver veículos
        if (veiculos.length === 0) {
            mostrarEstadoVazio();
        } else {
            esconderEstadoVazio();
        }
    } catch (error) {
        console.error("Erro ao carregar veículos:", error);
        mostrarMensagem("Erro ao carregar veículos do banco de dados. Por favor, tente novamente.", "error");
        
        // Inicializar arrays vazios em caso de erro
        veiculos = [];
        veiculosFiltrados = [];
        mostrarEstadoVazio();
    } finally {
        esconderLoading();
    }
}

// Função para atualizar o dashboard
function atualizarDashboard() {
    const hoje = new Date();
    
    // Total de veículos
    totalVeiculos.textContent = veiculos.length;
    
    // Total em manutenção
    const emManutencao = veiculos.filter(v => v.status === 'manutencao').length;
    totalManutencao.textContent = emManutencao;
    
    // Total com manutenção pendente (próxima manutenção é anterior a hoje ou nos próximos 15 dias)
    const pendentes = veiculos.filter(v => {
        const dataProximaManutencao = new Date(v.proxima_manutencao);
        const diasAteManutencao = Math.floor((dataProximaManutencao - hoje) / (1000 * 60 * 60 * 24));
        return diasAteManutencao <= 15;
    }).length;
    
    totalManutencaoPendente.textContent = pendentes;
}

// Função para atualizar a tabela
function atualizarTabela() {
    tabelaVeiculos.innerHTML = '';

    if (veiculosFiltrados.length === 0) {
        mostrarEstadoVazio();
        return;
    }

    esconderEstadoVazio();

    veiculosFiltrados.forEach(veiculo => {
        const tr = document.createElement('tr');
        
        // Verificar se a manutenção está próxima ou atrasada
        const hoje = new Date();
        const dataProximaManutencao = new Date(veiculo.proxima_manutencao);
        const diasAteManutencao = Math.floor((dataProximaManutencao - hoje) / (1000 * 60 * 60 * 24));
        
        let statusManutencao = '';
        let alertaManutencao = '';
        
        if (diasAteManutencao < 0) {
            statusManutencao = '<span class="manutencao-badge atrasada">Atrasada</span>';
            alertaManutencao = '<span class="alerta-manutencao"><i class="fas fa-exclamation-circle"></i></span>';
        } else if (diasAteManutencao <= 15) {
            statusManutencao = '<span class="manutencao-badge proxima">Próxima</span>';
            alertaManutencao = '<span class="alerta-manutencao"><i class="fas fa-exclamation-triangle"></i></span>';
        }

        tr.innerHTML = `
            <td>${veiculo.id}</td>
            <td>${veiculo.placa}</td>
            <td>${veiculo.modelo} <span class="tipo-tag ${veiculo.tipo}">${formatarTipoVeiculo(veiculo.tipo)}</span></td>
            <td>${veiculo.fabricante}</td>
            <td>${veiculo.ano}</td>
            <td>${parseInt(veiculo.capacidade).toLocaleString()} L</td>
            <td>${formatarData(veiculo.ultima_manutencao)}</td>
            <td>${formatarData(veiculo.proxima_manutencao)} ${alertaManutencao}</td>
            <td><span class="status-tag ${veiculo.status}">${formatarStatus(veiculo.status)}</span></td>
            <td>
                <button class="btn-action edit" title="Editar" data-id="${veiculo.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action delete" title="Excluir" data-id="${veiculo.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tabelaVeiculos.appendChild(tr);
    });
}

// Função para formatar o tipo de veículo
function formatarTipoVeiculo(tipo) {
    const tipos = {
        'caminhao': 'Caminhão',
        'van': 'Van',
        'utilitario': 'Utilitário'
    };
    return tipos[tipo] || tipo;
}

// Função para formatar o status
function formatarStatus(status) {
    const statusMap = {
        'operacional': 'Operacional',
        'manutencao': 'Em Manutenção',
        'inativo': 'Inativo'
    };
    return statusMap[status] || status;
}

// Função para formatar data
function formatarData(dataString) {
    if (!dataString) return '-';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Função para filtrar veículos
async function filtrarVeiculos() {
    mostrarLoading();
    
    try {
        const textoBusca = buscaVeiculo.value.toLowerCase();
        const tipoSelecionado = filtroTipo.value;
        const statusSelecionado = filtroStatus.value;
        const manutencaoSelecionada = filtroManutencao.value;
        
        // Criar filtros para API
        const filtros = {};
        if (tipoSelecionado) filtros.tipo = tipoSelecionado;
        if (statusSelecionado) filtros.status = statusSelecionado;
        
        // Buscar veículos com filtros
        const dados = await window.api.getFrota(filtros);
        veiculos = dados || [];
        
        // Aplicar filtros adicionais no cliente
        veiculosFiltrados = veiculos.filter(veiculo => {
            // Filtro de texto
            const matchTexto = textoBusca === '' || 
                veiculo.placa.toLowerCase().includes(textoBusca) ||
                veiculo.modelo.toLowerCase().includes(textoBusca) ||
                veiculo.fabricante.toLowerCase().includes(textoBusca);
            
            // Filtro de manutenção
            let matchManutencao = true;
            if (manutencaoSelecionada) {
                const hoje = new Date();
                const dataProximaManutencao = new Date(veiculo.proxima_manutencao);
                const diasAteManutencao = Math.floor((dataProximaManutencao - hoje) / (1000 * 60 * 60 * 24));
                
                if (manutencaoSelecionada === 'pendente') {
                    matchManutencao = diasAteManutencao <= 15;
                } else if (manutencaoSelecionada === 'em-dia') {
                    matchManutencao = diasAteManutencao > 15;
                }
            }
            
            return matchTexto && matchManutencao;
        });
        
        atualizarTabela();
        
        // Atualizar estado vazio se não houver resultados
        if (veiculosFiltrados.length === 0) {
            mostrarEstadoVazio();
        } else {
            esconderEstadoVazio();
        }
    } catch (error) {
        console.error("Erro ao filtrar veículos:", error);
        mostrarMensagem("Erro ao aplicar filtros. Por favor, tente novamente.", "error");
    } finally {
        esconderLoading();
    }
}

// Função para abrir o modal de veículos 
function abrirModalVeiculo() {
    // Resetar o formulário antes de abrir o modal
    resetarFormularioVeiculo();
    
    // Abrir o modal utilizando a função do utilsModule
    window.abrirModal('modal-veiculo');
    
    // Definir o título do modal para "Novo Veículo"
    const tituloModal = document.getElementById('titulo-modal-veiculo');
    if (tituloModal) {
        tituloModal.textContent = 'Novo Veículo';
    }
    
    // Mostrar o botão de cadastrar e esconder o botão de atualizar
    const btnCadastrar = document.getElementById('btn-cadastrar-veiculo');
    const btnAtualizar = document.getElementById('btn-atualizar-veiculo');
    
    if (btnCadastrar) {
        btnCadastrar.style.display = 'block';
    }
    
    if (btnAtualizar) {
        btnAtualizar.style.display = 'none';
    }
}

// Função para salvar veículo (novo ou atualização)
async function salvarVeiculo(e) {
    if (e) e.preventDefault();
    console.log("Função salvarVeiculo chamada");
    mostrarLoading();
    
    try {
        // Obter os dados do formulário
        const form = document.getElementById('form-veiculo');
        if (!form) {
            throw new Error("Formulário não encontrado");
        }

        // Mapear os dados do formulário para a estrutura da tabela
        const formData = {
            id: document.getElementById('veiculo-id')?.value,
            placa: document.getElementById('veiculo-placa')?.value,
            tipo: document.getElementById('veiculo-tipo')?.value,
            modelo: document.getElementById('veiculo-modelo')?.value,
            fabricante: document.getElementById('veiculo-fabricante')?.value,
            ano: document.getElementById('veiculo-ano')?.value,
            capacidade: document.getElementById('veiculo-capacidade')?.value,
            km_atual: document.getElementById('veiculo-quilometragem')?.value,
            chassi: document.getElementById('veiculo-chassi')?.value,
            ultima_manutencao: document.getElementById('veiculo-ultima-manutencao')?.value,
            proxima_manutencao: document.getElementById('veiculo-proxima-manutencao')?.value,
            tipo_manutencao: document.getElementById('veiculo-tipo-manutencao')?.value,
            responsavel_manutencao: document.getElementById('veiculo-responsavel-manutencao')?.value,
            observacoes: document.getElementById('veiculo-observacoes')?.value
        };

        // Verificar campos obrigatórios conforme a estrutura da tabela
        const camposObrigatorios = ['placa', 'tipo', 'modelo'];
        const camposFaltantes = camposObrigatorios.filter(campo => !formData[campo]);
        
        if (camposFaltantes.length > 0) {
            throw new Error(`Campos obrigatórios não preenchidos: ${camposFaltantes.join(', ')}`);
        }

        // Obter o status selecionado (default é 'disponivel' conforme a tabela)
        const radioStatus = document.querySelector('input[name="veiculo-status"]:checked');
        formData.status = radioStatus ? radioStatus.value : 'disponivel';

        // Converter valores numéricos conforme a estrutura da tabela
        if (formData.ano) formData.ano = parseInt(formData.ano);
        if (formData.capacidade) formData.capacidade = parseInt(formData.capacidade);
        if (formData.km_atual) formData.km_atual = parseInt(formData.km_atual);

        console.log("Dados do veículo a salvar:", formData);

        // Verificar se é uma atualização ou novo cadastro
        if (formData.id) {
            // Atualização
            await window.api.atualizarVeiculo(formData);
            mostrarMensagem("Veículo atualizado com sucesso!", "success");
        } else {
            // Novo cadastro
            delete formData.id; // Remover ID vazio para novo cadastro
            await window.api.cadastrarVeiculo(formData);
            mostrarMensagem("Veículo cadastrado com sucesso!", "success");
        }

        // Fechar o modal e recarregar os dados
        fecharModal();
        await carregarVeiculos();
    } catch (error) {
        console.error("Erro ao salvar veículo:", error);
        mostrarMensagem(error.message || "Erro ao salvar veículo. Por favor, tente novamente.", "error");
    } finally {
        esconderLoading();
    }
}

// Função para abrir o modal de edição de veículo
function abrirModalEditarVeiculo(veiculo) {
    // Resetar o formulário antes de abrir o modal
    resetarFormularioVeiculo();
    
    // Preencher os campos do formulário com os dados do veículo selecionado
    const inputId = document.getElementById('veiculo-id');
    const inputPlaca = document.getElementById('veiculo-placa');
    const inputModelo = document.getElementById('veiculo-modelo');
    const selectTipo = document.getElementById('veiculo-tipo');
    const inputAno = document.getElementById('veiculo-ano');
    const selectStatus = document.getElementById('veiculo-status');
    
    if (inputId) inputId.value = veiculo.id;
    if (inputPlaca) inputPlaca.value = veiculo.placa;
    if (inputModelo) inputModelo.value = veiculo.modelo;
    if (selectTipo) selectTipo.value = veiculo.tipo;
    if (inputAno) inputAno.value = veiculo.ano;
    if (selectStatus) selectStatus.value = veiculo.status;
    
    // Verificar se existem campos adicionais
    const inputFabricante = document.getElementById('veiculo-fabricante');
    const inputCapacidade = document.getElementById('veiculo-capacidade');
    const inputUltimaManutencao = document.getElementById('veiculo-ultima-manutencao');
    const inputProximaManutencao = document.getElementById('veiculo-proxima-manutencao');
    
    if (inputFabricante && veiculo.fabricante) inputFabricante.value = veiculo.fabricante;
    if (inputCapacidade && veiculo.capacidade) inputCapacidade.value = veiculo.capacidade;
    if (inputUltimaManutencao && veiculo.ultima_manutencao) inputUltimaManutencao.value = veiculo.ultima_manutencao;
    if (inputProximaManutencao && veiculo.proxima_manutencao) inputProximaManutencao.value = veiculo.proxima_manutencao;
    
    // Verificar se existem radio buttons para status
    if (veiculo.status) {
        const radioStatus = document.querySelector(`input[name="veiculo-status"][value="${veiculo.status}"]`);
        if (radioStatus) radioStatus.checked = true;
    }
    
    // Abrir o modal utilizando a função do utilsModule
    window.abrirModal('modal-veiculo');
    
    // Definir o título do modal para "Editar Veículo"
    const tituloModal = document.getElementById('titulo-modal-veiculo');
    if (tituloModal) {
        tituloModal.textContent = 'Editar Veículo';
    }
    
    // Mostrar o botão de atualizar e esconder o botão de cadastrar
    const btnCadastrar = document.getElementById('btn-cadastrar-veiculo');
    const btnAtualizar = document.getElementById('btn-atualizar-veiculo');
    
    if (btnCadastrar) {
        btnCadastrar.style.display = 'none';
    }
    
    if (btnAtualizar) {
        btnAtualizar.style.display = 'block';
    }
}

// Função para abrir o modal de confirmação de exclusão de veículo
function abrirModalConfirmarExclusao(veiculo) {
    // Armazenar o ID do veículo a ser excluído
    veiculoSelecionadoParaExclusao = veiculo.id;
    
    // Preencher o texto de confirmação com a placa do veículo
    const mensagemConfirmacao = document.getElementById('texto-confirmacao-exclusao');
    if (mensagemConfirmacao) {
        mensagemConfirmacao.textContent = `Tem certeza que deseja excluir o veículo ${veiculo.placa}?`;
    }
    
    // Abrir o modal utilizando a função do utilsModule
    window.abrirModal('modal-confirmar-exclusao');
}

// Função para fechar o modal ativo
function fecharModal() {
    // Fechar o modal ativo utilizando a função do utilsModule
    window.fecharTodosModais();
}

// Função para fechar o modal de confirmação
function fecharModalConfirmacao() {
    const modal = document.querySelector("#modal-confirmacao");
    if (modal) {
        modal.style.display = "none";
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) {
            overlay.style.display = "none";
        }
    }
}

// Função para mostrar mensagem
function mostrarMensagem(mensagem, tipo = 'info') {
    // Criar elemento de notificação
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
}

// Função para excluir veículo
async function excluirVeiculo() {
    if (!veiculoSelecionadoParaExclusao) {
        mostrarMensagem("Erro: Veículo não selecionado", "error");
        return;
    }
    
    mostrarLoading();
    
    try {
        await window.api.excluirVeiculo(veiculoSelecionadoParaExclusao);
        fecharModal();
        mostrarMensagem("Veículo excluído com sucesso!", "success");
        
        // Recarregar dados
        await carregarVeiculos();
    } catch (error) {
        console.error("Erro ao excluir veículo:", error);
        mostrarMensagem("Erro ao excluir veículo. Por favor, tente novamente.", "error");
    } finally {
        esconderLoading();
        veiculoSelecionadoParaExclusao = null;
    }
}

// Função para mostrar loading
function mostrarLoading() {
    loadingSpinner.style.display = 'flex';
}

// Função para esconder loading
function esconderLoading() {
    loadingSpinner.style.display = 'none';
}

// Função para mostrar estado vazio
function mostrarEstadoVazio() {
    emptyState.style.display = 'flex';
}

// Função para esconder estado vazio
function esconderEstadoVazio() {
    emptyState.style.display = 'none';
}

// Função para resetar o formulário de veículo
function resetarFormularioVeiculo() {
    if (!formVeiculo) {
        console.error("Formulário de veículo não encontrado");
        return;
    }
    
    formVeiculo.reset();
    const hoje = new Date();
    
    const inputUltimaManutencao = document.getElementById('veiculo-ultima-manutencao');
    const inputProximaManutencao = document.getElementById('veiculo-proxima-manutencao');
    const inputAno = document.getElementById('veiculo-ano');
    
    if (inputUltimaManutencao) {
        inputUltimaManutencao.value = hoje.toISOString().split('T')[0];
    }
    
    if (inputProximaManutencao) {
        inputProximaManutencao.value = hoje.toISOString().split('T')[0];
    }
    
    if (inputAno) {
        inputAno.value = hoje.getFullYear();
    }
    
    const radioOperacional = document.querySelector('input[name="veiculo-status"][value="operacional"]');
    if (radioOperacional) {
        radioOperacional.checked = true;
    }
}

// Função para confirmar exclusão de veículo
function confirmarExclusao(id) {
    const veiculo = veiculos.find(v => v.id == id);
    if (veiculo) {
        abrirModalConfirmarExclusao(veiculo);
    } else {
        mostrarMensagem("Veículo não encontrado", "error");
    }
} 