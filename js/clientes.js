/**
 * clientes.js - Gerenciamento de clientes
 */

// Variáveis globais
let clientes = [];
let clienteAtual = null;
let editando = false;
let api;

// Elementos DOM
const modal = document.getElementById('modal-cliente');
const modalConfirmacao = document.getElementById('modal-confirmacao');
const overlay = document.querySelector('.modal-overlay');
const formCliente = document.getElementById('form-cliente');
const loadingSpinner = document.getElementById('loading-spinner');
const emptyState = document.getElementById('empty-state');

// Inicializar API e dados
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Inicializar a API
        const { SupabaseAPI } = await import('./supabase-api.js');
        api = new SupabaseAPI();
        
        // Carregar dados
        await carregarClientes();
        
        // Configurar eventos
        configurarEventos();
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        exibirNotificacao('Erro ao conectar ao servidor. Tente novamente mais tarde.', 'error');
    }
});

// Carregar dados de clientes do Supabase
async function carregarClientes() {
    mostrarLoading();
    
    try {
        // Buscar clientes
        const dados = await api.getClientes();
        clientes = dados || [];
        
        // Renderizar tabela
        renderizarTabela();
        
        // Popular filtro de cidades
        popularFiltroCidades();
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        exibirNotificacao('Erro ao carregar clientes', 'error');
        
        // Inicializar array vazio
        clientes = [];
        renderizarTabela();
    } finally {
        esconderLoading();
    }
}

// Configurar eventos da página
function configurarEventos() {
    // Botão Novo Cliente
    document.getElementById('btn-novo-cliente').addEventListener('click', () => abrirModal());
    
    // Botões do modal
    document.getElementById('btn-fechar-modal').addEventListener('click', fecharModal);
    document.getElementById('btn-cancelar').addEventListener('click', fecharModal);
    document.getElementById('btn-salvar').addEventListener('click', salvarCliente);
    
    // Eventos do modal de confirmação
    document.getElementById('btn-fechar-confirmacao').addEventListener('click', fecharModalConfirmacao);
    document.getElementById('btn-cancelar-exclusao').addEventListener('click', fecharModalConfirmacao);
    document.getElementById('btn-confirmar-exclusao').addEventListener('click', excluirCliente);
    
    // Eventos para alternar entre PF e PJ
    const radioTipoCliente = document.querySelectorAll('input[name="tipo-cliente"]');
    radioTipoCliente.forEach(radio => {
        radio.addEventListener('change', (e) => ajustarLabelsTipoCliente(e.target.value));
    });
    
    // Eventos dos filtros
    document.getElementById('busca-cliente').addEventListener('input', aplicarFiltros);
    document.getElementById('filtro-tipo').addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-cidade').addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-status').addEventListener('change', aplicarFiltros);
    document.getElementById('btn-limpar-filtros').addEventListener('click', limparFiltros);
    
    // Eventos da tabela
    document.getElementById('tabela-clientes').addEventListener('click', (e) => {
        const btnEdit = e.target.closest('.btn-action.edit');
        const btnDelete = e.target.closest('.btn-action.delete');
        
        if (btnEdit) {
            const id = btnEdit.getAttribute('data-id');
            abrirModal('editar', id);
        } else if (btnDelete) {
            const id = btnDelete.getAttribute('data-id');
            abrirModalConfirmacao(id);
        }
    });
    
    // Fechar modal ao clicar no overlay
    overlay.addEventListener('click', () => {
        fecharModal();
        fecharModalConfirmacao();
    });
}

// Atualiza os contadores nos cards
function atualizarCards() {
    const totalClientes = document.getElementById('total-clientes');
    const totalEmpresas = document.getElementById('total-empresas');
    const totalPessoas = document.getElementById('total-pessoas');

    // Calcula totais
    const totais = clientes.reduce((acc, cliente) => {
        acc.total++;
        if (cliente.tipo === 'pj') acc.empresas++;
        if (cliente.tipo === 'pf') acc.pessoas++;
        return acc;
    }, { total: 0, empresas: 0, pessoas: 0 });

    // Atualiza os cards
    totalClientes.textContent = totais.total;
    totalEmpresas.textContent = totais.empresas;
    totalPessoas.textContent = totais.pessoas;
}

// Renderiza a tabela de clientes
function renderizarTabela() {
    const tbody = document.getElementById('tabela-clientes');
    
    // Limpa a tabela
    tbody.innerHTML = '';
    
    // Verifica se há clientes
    if (clientes.length === 0) {
        emptyState.style.display = 'block';
        atualizarCards(); // Mesmo sem clientes, atualizar os cards (todos zerados)
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Adiciona cada cliente na tabela
    clientes.forEach(cliente => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td class="col-id">${cliente.id}</td>
            <td class="col-doc">${cliente.documento}</td>
            <td class="col-nome">
                ${cliente.nome}
                <span class="tipo-tag ${cliente.tipo}">${cliente.tipo === 'pj' ? 'PJ' : 'PF'}</span>
            </td>
            <td class="col-endereco">${cliente.endereco}</td>
            <td class="col-cidade">${cliente.cidade}/${cliente.estado}</td>
            <td class="col-contato">${cliente.contato}</td>
            <td class="col-email">${cliente.email}</td>
            <td class="col-status"><span class="status-tag ${cliente.status}">${cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
            <td class="col-acoes">
                <div class="action-buttons">
                    <button class="btn-action edit" data-id="${cliente.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete" data-id="${cliente.id}" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Atualiza os contadores
    atualizarCards();
}

// Popular filtro de cidades baseado nos clientes existentes
function popularFiltroCidades() {
    const filtroCidade = document.getElementById('filtro-cidade');
    
    // Limpa opções existentes exceto a primeira
    while (filtroCidade.options.length > 1) {
        filtroCidade.remove(1);
    }
    
    // Coleta cidades únicas
    const cidades = [...new Set(clientes.map(cliente => cliente.cidade))].filter(Boolean);
    
    // Adiciona as cidades ao select
    cidades.sort().forEach(cidade => {
        const option = document.createElement('option');
        option.value = cidade;
        option.textContent = cidade;
        filtroCidade.appendChild(option);
    });
}

// Aplicar filtros
async function aplicarFiltros() {
    mostrarLoading();
    
    try {
        const busca = document.getElementById('busca-cliente').value.toLowerCase();
        const filtroTipo = document.getElementById('filtro-tipo').value;
        const filtroCidade = document.getElementById('filtro-cidade').value;
        const filtroStatus = document.getElementById('filtro-status').value;
        
        // Construir filtros para API
        const filtros = {};
        if (filtroTipo) filtros.tipo = filtroTipo;
        if (filtroCidade) filtros.cidade = filtroCidade;
        if (filtroStatus) filtros.status = filtroStatus;
        
        // Buscar clientes com filtros
        const dados = await api.getClientes(filtros);
        
        // Aplicar busca de texto no cliente
        clientes = (dados || []).filter(cliente => {
            if (!busca) return true;
            
            return (
                cliente.nome?.toLowerCase().includes(busca) || 
                cliente.documento?.toLowerCase().includes(busca) ||
                cliente.email?.toLowerCase().includes(busca) ||
                cliente.contato?.toLowerCase().includes(busca)
            );
        });
        
        renderizarTabela();
    } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
        exibirNotificacao('Erro ao filtrar clientes', 'error');
    } finally {
        esconderLoading();
    }
}

// Limpar filtros
async function limparFiltros() {
    document.getElementById('busca-cliente').value = '';
    document.getElementById('filtro-tipo').value = '';
    document.getElementById('filtro-cidade').value = '';
    document.getElementById('filtro-status').value = '';
    
    await carregarClientes();
}

// Abrir modal
async function abrirModal(modo = 'novo', id = null) {
    editando = modo === 'editar';
    const titulo = document.getElementById('modal-titulo');
    
    // Resetar formulário
    formCliente.reset();
    
    if (editando && id) {
        mostrarLoading();
        
        try {
            // Buscar cliente para edição
            clienteAtual = await api.getClienteById(id);
            
            if (clienteAtual) {
                // Preencher formulário com dados do cliente
                document.getElementById('cliente-id').value = clienteAtual.id;
                document.querySelector(`input[name="tipo-cliente"][value="${clienteAtual.tipo}"]`).checked = true;
                document.getElementById('cliente-documento').value = clienteAtual.documento;
                document.getElementById('cliente-nome').value = clienteAtual.nome;
                document.getElementById('cliente-endereco').value = clienteAtual.endereco;
                document.getElementById('cliente-cidade').value = clienteAtual.cidade;
                document.getElementById('cliente-estado').value = clienteAtual.estado;
                document.getElementById('cliente-cep').value = clienteAtual.cep;
                document.getElementById('cliente-contato').value = clienteAtual.contato;
                document.getElementById('cliente-telefone').value = clienteAtual.telefone;
                document.getElementById('cliente-email').value = clienteAtual.email;
                document.getElementById('cliente-observacoes').value = clienteAtual.observacoes;
                document.querySelector(`input[name="cliente-status"][value="${clienteAtual.status}"]`).checked = true;
                
                // Ajustar labels de acordo com tipo
                ajustarLabelsTipoCliente(clienteAtual.tipo);
                
                titulo.textContent = 'Editar Cliente';
            } else {
                exibirNotificacao('Cliente não encontrado', 'error');
                return;
            }
        } catch (error) {
            console.error('Erro ao carregar cliente:', error);
            exibirNotificacao('Erro ao carregar dados do cliente', 'error');
            return;
        } finally {
            esconderLoading();
        }
    } else {
        // Novo cliente
        clienteAtual = null;
        titulo.textContent = 'Novo Cliente';
        document.getElementById('cliente-id').value = '';
        
        // PJ como padrão
        document.querySelector('input[name="tipo-cliente"][value="pj"]').checked = true;
        ajustarLabelsTipoCliente('pj');
    }
    
    // Exibir modal
    modal.style.display = 'block';
    overlay.style.display = 'block';
}

// Fechar modal
function fecharModal() {
    modal.style.display = 'none';
    overlay.style.display = 'none';
}

// Abrir modal de confirmação
async function abrirModalConfirmacao(id) {
    if (!id) return;
    
    mostrarLoading();
    
    try {
        clienteAtual = await api.getClienteById(id);
        
        if (clienteAtual) {
            const mensagem = document.querySelector('#modal-confirmacao .modal-body p');
            mensagem.textContent = `Tem certeza que deseja excluir o cliente ${clienteAtual.nome}? Esta ação não poderá ser desfeita.`;
            
            modalConfirmacao.style.display = 'block';
            overlay.style.display = 'block';
        } else {
            exibirNotificacao('Cliente não encontrado', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar cliente para exclusão:', error);
        exibirNotificacao('Erro ao carregar dados do cliente', 'error');
    } finally {
        esconderLoading();
    }
}

// Fechar modal de confirmação
function fecharModalConfirmacao() {
    modalConfirmacao.style.display = 'none';
    overlay.style.display = 'none';
}

// Ajustar labels de acordo com o tipo de cliente
function ajustarLabelsTipoCliente(tipo) {
    const labelDocumento = document.getElementById('label-documento');
    const labelNome = document.getElementById('label-nome');
    
    if (tipo === 'pf') {
        labelDocumento.textContent = 'CPF';
        labelNome.textContent = 'Nome Completo';
    } else {
        labelDocumento.textContent = 'CNPJ';
        labelNome.textContent = 'Razão Social';
    }
}

// Salvar cliente
async function salvarCliente() {
    // Validar formulário
    if (!validarFormulario()) {
        return;
    }
    
    mostrarLoading();
    
    try {
        // Obter dados do formulário
        const id = document.getElementById('cliente-id').value;
        const tipo = document.querySelector('input[name="tipo-cliente"]:checked').value;
        const documento = document.getElementById('cliente-documento').value;
        const nome = document.getElementById('cliente-nome').value;
        const endereco = document.getElementById('cliente-endereco').value;
        const cidade = document.getElementById('cliente-cidade').value;
        const estado = document.getElementById('cliente-estado').value;
        const cep = document.getElementById('cliente-cep').value;
        const contato = document.getElementById('cliente-contato').value;
        const telefone = document.getElementById('cliente-telefone').value;
        const email = document.getElementById('cliente-email').value;
        const observacoes = document.getElementById('cliente-observacoes').value;
        const status = document.querySelector('input[name="cliente-status"]:checked').value;
        
        // Criar objeto do cliente
        const cliente = {
            tipo,
            documento,
            nome,
            endereco,
            cidade,
            estado,
            cep,
            contato,
            telefone,
            email,
            observacoes,
            status
        };
        
        // Atualizar ou criar cliente
        if (editando && id) {
            await api.atualizarCliente(id, cliente);
            exibirNotificacao('Cliente atualizado com sucesso', 'success');
        } else {
            await api.criarCliente(cliente);
            exibirNotificacao('Cliente criado com sucesso', 'success');
        }
        
        // Fechar modal e recarregar dados
        fecharModal();
        await carregarClientes();
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        exibirNotificacao('Erro ao salvar cliente', 'error');
    } finally {
        esconderLoading();
    }
}

// Excluir cliente
async function excluirCliente() {
    if (!clienteAtual || !clienteAtual.id) {
        exibirNotificacao('Cliente não selecionado', 'error');
        return;
    }
    
    mostrarLoading();
    
    try {
        await api.excluirCliente(clienteAtual.id);
        
        // Fechar modal e recarregar dados
        fecharModalConfirmacao();
        exibirNotificacao('Cliente excluído com sucesso', 'success');
        await carregarClientes();
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        exibirNotificacao('Erro ao excluir cliente', 'error');
    } finally {
        esconderLoading();
    }
}

// Validar formulário
function validarFormulario() {
    const campos = [
        { id: 'cliente-documento', nome: 'Documento', required: true },
        { id: 'cliente-nome', nome: 'Nome/Razão Social', required: true },
        { id: 'cliente-endereco', nome: 'Endereço', required: true },
        { id: 'cliente-cidade', nome: 'Cidade', required: true },
        { id: 'cliente-estado', nome: 'Estado', required: true },
        { id: 'cliente-contato', nome: 'Contato', required: true },
        { id: 'cliente-telefone', nome: 'Telefone', required: true },
        { id: 'cliente-email', nome: 'Email', required: true }
    ];
    
    let formValido = true;
    
    campos.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        const valor = elemento.value.trim();
        
        if (campo.required && !valor) {
            elemento.classList.add('invalido');
            formValido = false;
            
            // Adicionar mensagem de erro
            let span = elemento.nextElementSibling;
            if (!span || !span.classList.contains('erro-mensagem')) {
                span = document.createElement('span');
                span.className = 'erro-mensagem';
                elemento.parentNode.insertBefore(span, elemento.nextSibling);
            }
            span.textContent = `${campo.nome} é obrigatório`;
        } else {
            elemento.classList.remove('invalido');
            
            // Remover mensagem de erro
            const span = elemento.nextElementSibling;
            if (span && span.classList.contains('erro-mensagem')) {
                span.remove();
            }
        }
    });
    
    // Validar formato de e-mail
    const emailInput = document.getElementById('cliente-email');
    const email = emailInput.value.trim();
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailInput.classList.add('invalido');
        formValido = false;
        
        let span = emailInput.nextElementSibling;
        if (!span || !span.classList.contains('erro-mensagem')) {
            span = document.createElement('span');
            span.className = 'erro-mensagem';
            emailInput.parentNode.insertBefore(span, emailInput.nextSibling);
        }
        span.textContent = 'Formato de e-mail inválido';
    }
    
    // Validar documento de acordo com o tipo
    const tipoCliente = document.querySelector('input[name="tipo-cliente"]:checked').value;
    const documentoInput = document.getElementById('cliente-documento');
    const documento = documentoInput.value.replace(/[^\d]/g, '');
    
    if (documento) {
        let documentoInvalido = false;
        
        if (tipoCliente === 'pf' && documento.length !== 11) {
            documentoInvalido = true;
        } else if (tipoCliente === 'pj' && documento.length !== 14) {
            documentoInvalido = true;
        }
        
        if (documentoInvalido) {
            documentoInput.classList.add('invalido');
            formValido = false;
            
            let span = documentoInput.nextElementSibling;
            if (!span || !span.classList.contains('erro-mensagem')) {
                span = document.createElement('span');
                span.className = 'erro-mensagem';
                documentoInput.parentNode.insertBefore(span, documentoInput.nextSibling);
            }
            span.textContent = tipoCliente === 'pf' ? 'CPF inválido' : 'CNPJ inválido';
        }
    }
    
    return formValido;
}

// Mostrar indicador de carregamento
function mostrarLoading() {
    loadingSpinner.style.display = 'flex';
}

// Esconder indicador de carregamento
function esconderLoading() {
    loadingSpinner.style.display = 'none';
}

// Exibir notificação
function exibirNotificacao(mensagem, tipoNotificacao) {
    // Criar elemento
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipoNotificacao}`;
    
    // Definir ícone
    let icone = '';
    switch (tipoNotificacao) {
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