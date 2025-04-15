/**
 * main.js - Funções principais compartilhadas entre as páginas do sistema
 */

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos em uma página que requer autenticação
    // Ignorar verificação na página de login e no index (que já faz redirecionamento)
    const paginaAtual = window.location.pathname.split('/').pop();
    const paginasSemVerificacao = ['login.html', 'index.html', 'logout.html'];
    
    if (!paginasSemVerificacao.includes(paginaAtual)) {
        // Verificar se o usuário está autenticado
        verificarAutenticacaoAdminGlobal();
    }
    
    // Continuar com outras inicializações
    inicializarSidebar();
    
    // Inicializar modais - verificar se utilsModule existe antes de usá-lo
    if (typeof utilsModule !== 'undefined' && typeof utilsModule.inicializarModais === 'function') {
        utilsModule.inicializarModais();
    } else if (typeof utils !== 'undefined' && typeof utils.inicializarModais === 'function') {
        // Fallback para utils original se existir
        utils.inicializarModais();
    }
});

/**
 * Verifica se o usuário está autenticado como administrador
 * Se não estiver, redireciona para a página de login
 */
function verificarAutenticacaoAdminGlobal() {
    // Verificar se a função já existe no escopo global (auth.js)
    if (typeof obterSessao === 'function') {
        const sessao = obterSessao();
        
        if (!sessao || !sessao.autenticado) {
            window.location.href = 'login.html';
            return;
        }
        
        // Verificar se é admin
        if (sessao.usuario.tipo !== 'admin') {
            // Redirecionar motoristas para sua página
            if (sessao.usuario.tipo === 'motorista') {
                window.location.href = 'motorista-app.html';
            } else {
                window.location.href = 'login.html';
            }
            return;
        }
    } else {
        console.error('Função obterSessao não encontrada. Verifique se auth.js está carregado.');
    }
}

// Configuração da sidebar
function inicializarSidebar() {
    const menuToggle = document.getElementById('menu-toggle');
    const appContainer = document.querySelector('.app-container');
    
    // Verificar se ambos os elementos existem antes de continuar
    if (!menuToggle || !appContainer) {
        console.log('Elementos menuToggle ou appContainer não encontrados na página atual.');
        return;
    }
    
    menuToggle.addEventListener('click', function() {
        appContainer.classList.toggle('sidebar-collapsed');
    });

    // Detectar tela pequena ao carregar e adaptar o layout
    if (window.innerWidth < 768) {
        appContainer.classList.add('sidebar-collapsed');
    }

    // Adaptar layout quando a janela for redimensionada
    window.addEventListener('resize', function() {
        if (window.innerWidth < 768 && appContainer) {
            appContainer.classList.add('sidebar-collapsed');
        }
    });
}

// Controle da sidebar responsiva
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });

        // Fechar sidebar ao clicar fora em telas menores
        document.addEventListener('click', function(event) {
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            
            if (!isClickInsideSidebar && !isClickOnToggle && window.innerWidth <= 1024) {
                sidebar.classList.remove('active');
            }
        });

        // Ajustar sidebar ao redimensionar a tela
        window.addEventListener('resize', function() {
            if (window.innerWidth > 1024) {
                sidebar.classList.remove('active');
            }
        });
    }
});

// Controle unificado da Sidebar
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleButtons = document.querySelectorAll('.toggle-sidebar');
    
    // Verificar se os elementos existem antes de continuar
    if (!sidebar || !mainContent) {
        console.log('Elementos sidebar ou mainContent não encontrados na página atual.');
        return; // Interromper execução se os elementos principais não existirem
    }
    
    // Remover handlers antigos
    const oldMenuToggle = document.getElementById('menu-toggle');
    if (oldMenuToggle) {
        const newClone = oldMenuToggle.cloneNode(true);
        oldMenuToggle.parentNode.replaceChild(newClone, oldMenuToggle);
    }
    
    // Função para alternar o estado da sidebar
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        
        // Salvar o estado da sidebar no localStorage
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
    
    // Adicionar evento de clique aos botões de toggle
    toggleButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevenir propagação do evento
                
                if (window.innerWidth <= 768) {
                    // Em dispositivos móveis, mostrar/esconder a sidebar
                    sidebar.classList.toggle('mobile-visible');
                } else {
                    // Em desktops, expandir/colapsar a sidebar
                    toggleSidebar();
                }
            });
        }
    });
    
    // Restaurar o estado da sidebar do localStorage
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarCollapsed && window.innerWidth > 768) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
    
    // Ajustar para modo móvel em telas pequenas
    function handleMobileView() {
        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove('collapsed');
            sidebar.classList.remove('mobile-visible');
            if (mainContent) {
                mainContent.classList.remove('expanded');
            }
        }
    }
    
    // Verificar tamanho da tela ao carregar e redimensionar
    window.addEventListener('resize', handleMobileView);
    handleMobileView();
    
    // Fechar sidebar ao clicar fora em dispositivos móveis
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 && sidebar) {
            // Verificar se o clique foi dentro da sidebar ou em um botão de toggle
            const isClickInside = sidebar.contains(event.target);
            const isClickOnToggle = Array.from(toggleButtons).some(btn => btn && btn.contains(event.target));
            
            if (!isClickInside && !isClickOnToggle && sidebar.classList.contains('mobile-visible')) {
                sidebar.classList.remove('mobile-visible');
            }
        }
    });
});

// Funções utilitárias compartilhadas
const utils = {
    // Formatadores
    formatarData: (data) => {
        if (!data) return '';
        return new Date(data).toLocaleDateString('pt-BR');
    },
    
    formatarMoeda: (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    },
    
    // Inicializar modais
    inicializarModais: () => {
        const modais = document.querySelectorAll('.modal');
        const overlay = document.querySelector('.modal-overlay');
        const btnFechar = document.querySelectorAll('.btn-fechar, .btn-cancelar');
        
        if (!modais.length || !overlay) {
            console.log('Não foram encontrados modais para inicializar');
            return;
        }
        
        // Função para abrir modal
        window.abrirModal = (modalId) => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
                overlay.style.display = 'block';
            }
        };
        
        // Função para fechar todos os modais
        window.fecharModais = () => {
            modais.forEach(modal => {
                modal.style.display = 'none';
            });
            overlay.style.display = 'none';
        };
        
        // Adicionar eventos para fechar modais
        btnFechar.forEach(btn => {
            btn.addEventListener('click', fecharModais);
        });
        
        // Fechar ao clicar fora do modal
        overlay.addEventListener('click', fecharModais);
        
        console.log('Modais inicializados com sucesso');
    },
    
    // Sistema de notificações
    mostrarNotificacao: (mensagem, tipo = 'info') => {
        // Criar elemento de notificação
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao ${tipo}`;
        
        // Definir ícone baseado no tipo
        let icone = 'info-circle';
        if (tipo === 'sucesso') icone = 'check-circle';
        if (tipo === 'erro') icone = 'exclamation-circle';
        if (tipo === 'alerta') icone = 'exclamation-triangle';
        
        notificacao.innerHTML = `
            <i class="fas fa-${icone}"></i>
            <p>${mensagem}</p>
            <button class="fechar">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Adicionar à área de notificações
        const areaNotificacoes = document.querySelector('.area-notificacoes');
        if (!areaNotificacoes) {
            const novaArea = document.createElement('div');
            novaArea.className = 'area-notificacoes';
            document.body.appendChild(novaArea);
            novaArea.appendChild(notificacao);
        } else {
            areaNotificacoes.appendChild(notificacao);
        }
        
        // Adicionar event listener para fechar notificação
        notificacao.querySelector('.fechar').addEventListener('click', () => {
            notificacao.classList.add('fechando');
            setTimeout(() => notificacao.remove(), 300);
        });
        
        // Auto remover após 5 segundos
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.classList.add('fechando');
                setTimeout(() => notificacao.remove(), 300);
            }
        }, 5000);
    },
    
    // Funções de API
    api: {
        // Método genérico de chamada à API com tratamento de erro
        async chamarAPI(url, opcoes = {}) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...opcoes.headers
                    },
                    ...opcoes
                });
                
                if (!response.ok) {
                    throw new Error(`Erro ${response.status}: ${response.statusText}`);
                }
                
                return await response.json();
            } catch (erro) {
                console.error('Erro na chamada à API:', erro);
                utils.mostrarNotificacao(`Erro na operação: ${erro.message}`, 'erro');
                throw erro;
            }
        },
        
        // Métodos específicos
        async get(url) {
            return this.chamarAPI(url);
        },
        
        async post(url, dados) {
            return this.chamarAPI(url, {
                method: 'POST',
                body: JSON.stringify(dados)
            });
        },
        
        async put(url, dados) {
            return this.chamarAPI(url, {
                method: 'PUT',
                body: JSON.stringify(dados)
            });
        },
        
        async delete(url) {
            return this.chamarAPI(url, {
                method: 'DELETE'
            });
        }
    },
    
    // Validação de formulários
    validarFormulario: (form) => {
        let valido = true;
        const campos = form.querySelectorAll('[required]');
        
        campos.forEach(campo => {
            if (!campo.value) {
                campo.classList.add('invalido');
                
                // Adicionar mensagem de erro se não existir
                if (!campo.nextElementSibling || !campo.nextElementSibling.classList.contains('erro-mensagem')) {
                    const mensagem = document.createElement('p');
                    mensagem.className = 'erro-mensagem';
                    mensagem.textContent = 'Este campo é obrigatório';
                    campo.parentNode.insertBefore(mensagem, campo.nextSibling);
                }
                
                valido = false;
            } else {
                campo.classList.remove('invalido');
                
                // Remover mensagem de erro se existir
                if (campo.nextElementSibling && campo.nextElementSibling.classList.contains('erro-mensagem')) {
                    campo.nextElementSibling.remove();
                }
            }
        });
        
        return valido;
    }
};

// Exportar para uso global
window.utils = utils;

// Funções Auxiliares
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

const formatMetrosCubicos = (value) => {
    return `${value.toFixed(2)} m³`;
};

const formatLitros = (value) => {
    const litros = value * 1000;
    return `${litros.toFixed(0)} L`;
};

// Constantes e Variáveis
const MOCK_DELIVERIES = [
    {
        id: 1,
        date: '2024-03-20',
        driver: 'HERBERT',
        origin: 'Depósito Central',
        destination: 'Rua A, 123',
        capacity: 1.5, // Capacidade em m³
        value: 150.00,
        notaFiscal: '12345',
        statusNF: 'emitida'
    },
    {
        id: 2,
        date: '2024-03-20',
        driver: 'DENYS',
        origin: 'Depósito Central',
        destination: 'Av. B, 456',
        capacity: 2.0, // Capacidade em m³
        value: 300.00,
        notaFiscal: '',
        statusNF: 'a_emitir'
    },
    {
        id: 3,
        date: '2024-03-21',
        driver: 'HERBERT',
        origin: 'Depósito Central',
        destination: 'Rua C, 789',
        capacity: 3.0, // Capacidade em m³
        value: 450.00,
        notaFiscal: '12346',
        statusNF: 'pendente'
    }
];

let currentDeliveries = [...MOCK_DELIVERIES];

// Atualização dos Cards do Dashboard
const updateDashboardCards = () => {
    const totalEntregas = document.getElementById('total-entregas');
    const totalValor = document.getElementById('total-valor');
    const totalMetros = document.getElementById('total-metros');
    const totalLitros = document.getElementById('total-litros');

    // Verificar se os elementos existem (podem não existir em páginas diferentes)
    if (!totalEntregas || !totalValor || !totalMetros || !totalLitros) {
        console.log('Elementos do dashboard não encontrados na página atual.');
        return; // Não continuar se os elementos não existirem
    }

    const totals = currentDeliveries.reduce((acc, delivery) => {
        acc.count += 1;
        acc.value += delivery.value;
        acc.capacity += delivery.capacity;
        return acc;
    }, { count: 0, value: 0, capacity: 0 });

    totalEntregas.textContent = totals.count;
    totalValor.textContent = formatCurrency(totals.value);
    totalMetros.textContent = formatMetrosCubicos(totals.capacity);
    totalLitros.textContent = formatLitros(totals.capacity);
};

// Formatação da nota fiscal (extrair apenas o número)
const formatNotaFiscal = (nf) => {
    if (!nf) return '-';
    // Remover prefixo NF-e e qualquer outro texto, deixando apenas o número
    return nf.replace(/[^\d-]/g, '');
};

// Gerenciamento da Tabela
const updateTable = () => {
    const tbody = document.querySelector('table tbody');
    
    // Verificar se a tabela existe na página atual
    if (!tbody) {
        console.log('Tabela não encontrada na página atual.');
        return; // Não continuar se a tabela não existir
    }
    
    // Limpa a tabela
    tbody.innerHTML = '';

    // Adiciona as linhas
    currentDeliveries.forEach(delivery => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatNotaFiscal(delivery.notaFiscal)}</td>
            <td>
                <span class="status-tag ${delivery.statusNF}">
                    ${formatStatus(delivery.statusNF)}
                </span>
            </td>
            <td>${delivery.date}</td>
            <td>${delivery.driver}</td>
            <td>${delivery.origin}</td>
            <td>${delivery.destination}</td>
            <td>${formatMetrosCubicos(delivery.capacity)}</td>
            <td>${formatCurrency(delivery.value)}</td>
            <td>
                <button class="btn-action edit" data-id="${delivery.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action delete" data-id="${delivery.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Atualiza os cards do dashboard
    updateDashboardCards();
};

// Formatar status para exibição
const formatStatus = (status) => {
    const statusMap = {
        'a_emitir': 'A Emitir',
        'emitida': 'Emitida',
        'pendente': 'Pendente'
    };
    return statusMap[status] || status;
};

// Filtros
const applyFilters = () => {
    const dateFilter = document.querySelector('#filter-date').value;
    const driverFilter = document.querySelector('#filter-driver').value;
    const statusFilter = document.querySelector('#filter-status').value;
    const searchTerm = document.querySelector('#search-deliveries').value.toLowerCase();

    currentDeliveries = MOCK_DELIVERIES.filter(delivery => {
        const matchDate = !dateFilter || delivery.date === dateFilter;
        const matchDriver = !driverFilter || delivery.driver === driverFilter;
        const matchStatus = !statusFilter || delivery.statusNF === statusFilter;
        const matchSearch = !searchTerm || 
            delivery.destination.toLowerCase().includes(searchTerm) ||
            delivery.origin.toLowerCase().includes(searchTerm);

        return matchDate && matchDriver && matchStatus && matchSearch;
    });

    updateTable();
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página de entregas com os elementos corretos
    const isEntregasPage = Boolean(
        document.querySelector('table tbody') && 
        document.getElementById('total-entregas')
    );
    
    if (!isEntregasPage) {
        console.log('Página atual não é de entregas ou não possui os elementos necessários.');
        return;
    }
    
    // Inicializa a tabela e os cards
    updateTable();

    // Obter referências aos elementos de filtro
    const filterDate = document.querySelector('#filter-date');
    const filterDriver = document.querySelector('#filter-driver');
    const filterStatus = document.querySelector('#filter-status');
    const searchDeliveries = document.querySelector('#search-deliveries');
    const clearFilters = document.querySelector('#clear-filters');
    const newDelivery = document.querySelector('#new-delivery');
    
    // Adicionar listeners apenas se os elementos existirem
    if (filterDate) {
        filterDate.addEventListener('change', applyFilters);
    }
    
    if (filterDriver) {
        filterDriver.addEventListener('change', applyFilters);
    }
    
    if (filterStatus) {
        filterStatus.addEventListener('change', applyFilters);
    }
    
    if (searchDeliveries) {
        searchDeliveries.addEventListener('input', applyFilters);
    }

    // Listener para limpar filtros
    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            if (filterDate) filterDate.value = '';
            if (filterDriver) filterDriver.value = '';
            if (filterStatus) filterStatus.value = '';
            if (searchDeliveries) searchDeliveries.value = '';
            
            currentDeliveries = [...MOCK_DELIVERIES];
            updateTable();
        });
    }

    // Listener para nova entrega
    if (newDelivery) {
        newDelivery.addEventListener('click', () => {
            // TODO: Implementar modal de nova entrega
            console.log('Nova entrega');
        });
    }

    // Listeners para ações da tabela
    const table = document.querySelector('table');
    if (table) {
        table.addEventListener('click', (e) => {
            const actionButton = e.target.closest('.btn-action');
            if (!actionButton) return;

            const deliveryId = Number(actionButton.dataset.id);
            const isEdit = actionButton.classList.contains('edit');
            const isDelete = actionButton.classList.contains('delete');

            if (isEdit) {
                // TODO: Implementar edição
                console.log('Editar entrega', deliveryId);
            } else if (isDelete) {
                // TODO: Implementar exclusão
                console.log('Excluir entrega', deliveryId);
            }
        });
    }
}); 