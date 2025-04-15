/**
 * Script para controle da página de listagem de abastecimentos
 */

// Variáveis globais
let todosAbastecimentos = [];

// Inicializar a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    verificarAutenticacao();
    
    // Toggle menu
    document.getElementById('menu-toggle').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('wrapper').classList.toggle('toggled');
    });
    
    // Configurar logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('sessao');
        window.location.href = 'login.html';
    });
    
    // Atualizar nome do usuário
    const sessao = JSON.parse(localStorage.getItem('sessao'));
    if (sessao && sessao.nome) {
        document.getElementById('nome-usuario').textContent = sessao.nome;
    }
    
    // Inicializar componentes
    inicializarFiltros();
    configurarEventos();
    carregarVeiculos();
    carregarAbastecimentos();
});

/**
 * Inicializa os campos de filtro com valores padrão
 */
function inicializarFiltros() {
    // Definir data inicial como 30 dias atrás
    const dataInicial = new Date();
    dataInicial.setDate(dataInicial.getDate() - 30);
    document.getElementById('data-inicial').value = dataInicial.toISOString().split('T')[0];
    
    // Definir data final como hoje
    const dataFinal = new Date();
    document.getElementById('data-final').value = dataFinal.toISOString().split('T')[0];
}

/**
 * Configura os eventos dos botões da página
 */
function configurarEventos() {
    // Botão de filtrar
    document.getElementById('btn-filtrar').addEventListener('click', function() {
        carregarAbastecimentos();
    });
    
    // Botão de limpar filtros
    document.getElementById('btn-limpar').addEventListener('click', function() {
        document.getElementById('tipo-abastecimento').value = 'todos';
        document.getElementById('veiculo').value = '';
        inicializarFiltros();
        carregarAbastecimentos();
    });
    
    // Botão de exportar para CSV
    document.getElementById('btn-exportar').addEventListener('click', function() {
        exportarCSV();
    });
}

/**
 * Carrega a lista de veículos para o select de filtro
 */
function carregarVeiculos() {
    try {
        const veiculos = mockAPI.listarVeiculos();
        const selectEl = document.getElementById('veiculo');
        
        // Limpar opções existentes
        selectEl.innerHTML = '<option value="">Todos os veículos</option>';
        
        // Adicionar veículos ao select
        veiculos.forEach(veiculo => {
            const option = document.createElement('option');
            option.value = veiculo.id;
            option.textContent = `${veiculo.placa} - ${veiculo.modelo}`;
            selectEl.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar veículos:', error);
        mostrarErro('Erro ao carregar veículos. Tente novamente mais tarde.');
    }
}

/**
 * Carrega os abastecimentos do localStorage e filtra conforme os critérios
 */
function carregarAbastecimentos() {
    try {
        // Recuperar todos os abastecimentos
        todosAbastecimentos = JSON.parse(localStorage.getItem('abastecimentos') || '[]');
        
        // Obter valores dos filtros
        const tipoFiltro = document.getElementById('tipo-abastecimento').value;
        const veiculoId = document.getElementById('veiculo').value;
        const dataInicial = new Date(document.getElementById('data-inicial').value);
        const dataFinal = new Date(document.getElementById('data-final').value);
        dataFinal.setHours(23, 59, 59, 999); // Definir para o final do dia
        
        // Filtrar abastecimentos
        const abastecimentosFiltrados = todosAbastecimentos.filter(a => {
            const dataAbastecimento = new Date(a.data);
            
            // Filtrar por tipo
            const tipoMatch = tipoFiltro === 'todos' || a.tipo === tipoFiltro;
            
            // Filtrar por veículo
            const veiculoMatch = !veiculoId || a.veiculoId === veiculoId;
            
            // Filtrar por data
            const dataMatch = dataAbastecimento >= dataInicial && dataAbastecimento <= dataFinal;
            
            return tipoMatch && veiculoMatch && dataMatch;
        });
        
        // Ordenar por data (mais recente primeiro)
        abastecimentosFiltrados.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        // Renderizar lista
        renderizarLista(abastecimentosFiltrados);
        
        // Atualizar contador
        document.getElementById('contador-registros').textContent = abastecimentosFiltrados.length;
        
    } catch (error) {
        console.error('Erro ao carregar abastecimentos:', error);
        mostrarErro('Erro ao carregar os registros de abastecimento.');
    }
}

/**
 * Renderiza a lista de abastecimentos na interface
 * @param {Array} abastecimentos - Lista de abastecimentos filtrados
 */
function renderizarLista(abastecimentos) {
    const listaEl = document.getElementById('lista-abastecimentos');
    
    // Limpar lista
    listaEl.innerHTML = '';
    
    // Verificar se há abastecimentos
    if (abastecimentos.length === 0) {
        listaEl.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle mr-2"></i> Nenhum registro de abastecimento encontrado para os filtros selecionados.
            </div>
        `;
        return;
    }
    
    // Renderizar cada abastecimento
    abastecimentos.forEach(abastecimento => {
        // Obter informações do veículo
        let infoVeiculo = 'Veículo não encontrado';
        try {
            const veiculo = mockAPI.obterVeiculoPorId(abastecimento.veiculoId);
            if (veiculo) {
                infoVeiculo = `${veiculo.placa} - ${veiculo.modelo}`;
            }
        } catch (error) {
            console.warn('Veículo não encontrado:', abastecimento.veiculoId);
        }
        
        // Formatar data
        const data = new Date(abastecimento.data).toLocaleDateString('pt-BR');
        
        // Formatar valores
        const quantidade = parseFloat(abastecimento.quantidade).toFixed(2);
        const valorLitro = parseFloat(abastecimento.valorLitro).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        const valorTotal = parseFloat(abastecimento.valorTotal).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        
        // Criar elemento de card
        const cardEl = document.createElement('div');
        cardEl.className = 'card mb-3';
        
        // Definir classe de cor com base no tipo de abastecimento
        const headerClass = abastecimento.tipo === 'agua' ? 'bg-info' : 'bg-warning';
        const tipoTexto = abastecimento.tipo === 'agua' ? 'Água' : 'Combustível';
        const icone = abastecimento.tipo === 'agua' ? 'fa-tint' : 'fa-gas-pump';
        
        // Criar HTML do card
        cardEl.innerHTML = `
            <div class="card-header ${headerClass} text-white">
                <div class="d-flex justify-content-between align-items-center">
                    <span>
                        <i class="fas ${icone} mr-2"></i>
                        <strong>${tipoTexto}</strong> - ${data}
                    </span>
                    <span>${infoVeiculo}</span>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Motorista:</strong> ${abastecimento.nomeMotorista || 'Não informado'}</p>
                        <p><strong>Fornecedor:</strong> ${abastecimento.fornecedor || 'Não informado'}</p>
                        <p><strong>Quantidade:</strong> ${quantidade} ${abastecimento.tipo === 'agua' ? 'litros' : 'litros'}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Valor por litro:</strong> ${valorLitro}</p>
                        <p><strong>Valor total:</strong> ${valorTotal}</p>
                        <p><strong>Forma de pagamento:</strong> ${abastecimento.formaPagamento || 'Não informado'}</p>
                    </div>
                </div>
                ${abastecimento.observacoes ? `
                <div class="row mt-2">
                    <div class="col-12">
                        <p><strong>Observações:</strong> ${abastecimento.observacoes}</p>
                    </div>
                </div>` : ''}
                ${abastecimento.foto ? `
                <div class="row mt-2">
                    <div class="col-12">
                        <p><strong>Comprovante:</strong></p>
                        <img src="${abastecimento.foto}" alt="Comprovante" class="img-thumbnail" style="max-height: 200px;">
                    </div>
                </div>` : ''}
            </div>
        `;
        
        // Adicionar card à lista
        listaEl.appendChild(cardEl);
    });
}

/**
 * Exporta os registros filtrados para um arquivo CSV
 */
function exportarCSV() {
    try {
        // Obter valores dos filtros
        const tipoFiltro = document.getElementById('tipo-abastecimento').value;
        const veiculoId = document.getElementById('veiculo').value;
        const dataInicial = new Date(document.getElementById('data-inicial').value);
        const dataFinal = new Date(document.getElementById('data-final').value);
        dataFinal.setHours(23, 59, 59, 999); // Definir para o final do dia
        
        // Filtrar abastecimentos
        const abastecimentosFiltrados = todosAbastecimentos.filter(a => {
            const dataAbastecimento = new Date(a.data);
            
            // Filtrar por tipo
            const tipoMatch = tipoFiltro === 'todos' || a.tipo === tipoFiltro;
            
            // Filtrar por veículo
            const veiculoMatch = !veiculoId || a.veiculoId === veiculoId;
            
            // Filtrar por data
            const dataMatch = dataAbastecimento >= dataInicial && dataAbastecimento <= dataFinal;
            
            return tipoMatch && veiculoMatch && dataMatch;
        });
        
        // Verificar se há registros
        if (abastecimentosFiltrados.length === 0) {
            mostrarErro('Não há registros para exportar.');
            return;
        }
        
        // Cabeçalhos do CSV
        const headers = [
            'ID',
            'Tipo',
            'Data',
            'Veículo',
            'Motorista',
            'Fornecedor',
            'Quantidade',
            'Valor por Litro',
            'Valor Total',
            'Forma de Pagamento',
            'Observações'
        ];
        
        // Linhas do CSV
        const rows = abastecimentosFiltrados.map(a => {
            // Tentar obter informações do veículo
            let infoVeiculo = 'Veículo não encontrado';
            try {
                const veiculo = mockAPI.obterVeiculoPorId(a.veiculoId);
                if (veiculo) {
                    infoVeiculo = `${veiculo.placa} - ${veiculo.modelo}`;
                }
            } catch (error) {
                console.warn('Veículo não encontrado:', a.veiculoId);
            }
            
            return [
                a.id,
                a.tipo === 'agua' ? 'Água' : 'Combustível',
                new Date(a.data).toLocaleDateString('pt-BR'),
                infoVeiculo,
                a.nomeMotorista || 'Não informado',
                a.fornecedor || 'Não informado',
                parseFloat(a.quantidade).toFixed(2),
                parseFloat(a.valorLitro).toFixed(2),
                parseFloat(a.valorTotal).toFixed(2),
                a.formaPagamento || 'Não informado',
                a.observacoes || ''
            ];
        });
        
        // Criar conteúdo do CSV
        let csvContent = 'data:text/csv;charset=utf-8,';
        
        // Adicionar cabeçalhos
        csvContent += headers.join(',') + '\r\n';
        
        // Adicionar linhas
        rows.forEach(row => {
            // Escapar valores que contenham vírgulas
            const formattedRow = row.map(cell => {
                if (cell && typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
                    return `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
            });
            
            csvContent += formattedRow.join(',') + '\r\n';
        });
        
        // Criar link de download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `abastecimentos_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        
        // Iniciar download
        link.click();
        
        // Remover link
        document.body.removeChild(link);
        
        // Mostrar mensagem de sucesso
        mostrarSucesso('Exportação concluída com sucesso!');
        
    } catch (error) {
        console.error('Erro ao exportar para CSV:', error);
        mostrarErro('Erro ao exportar os registros de abastecimento.');
    }
}

/**
 * Exibe uma mensagem de sucesso na tela
 * @param {string} mensagem - Texto da mensagem de sucesso
 */
function mostrarSucesso(mensagem) {
    // Criar elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-success alert-dismissible fade show';
    alerta.setAttribute('role', 'alert');
    alerta.innerHTML = `
        <i class="fas fa-check-circle mr-2"></i> ${mensagem}
        <button type="button" class="close" data-dismiss="alert" aria-label="Fechar">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    
    // Adicionar ao DOM
    document.querySelector('.container-fluid').insertBefore(alerta, document.querySelector('#filtros'));
    
    // Remover automaticamente após 3 segundos
    setTimeout(() => {
        $(alerta).alert('close');
    }, 3000);
}

/**
 * Exibe uma mensagem de erro na tela
 * @param {string} mensagem - Texto da mensagem de erro
 */
function mostrarErro(mensagem) {
    // Criar elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-danger alert-dismissible fade show';
    alerta.setAttribute('role', 'alert');
    alerta.innerHTML = `
        <i class="fas fa-exclamation-circle mr-2"></i> ${mensagem}
        <button type="button" class="close" data-dismiss="alert" aria-label="Fechar">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    
    // Adicionar ao DOM
    document.querySelector('.container-fluid').insertBefore(alerta, document.querySelector('#filtros'));
    
    // Remover automaticamente após 3 segundos
    setTimeout(() => {
        $(alerta).alert('close');
    }, 3000);
} 