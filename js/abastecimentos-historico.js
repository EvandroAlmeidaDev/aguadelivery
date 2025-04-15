/**
 * Módulo de gerenciamento do histórico de abastecimentos
 * Inclui funções para carregar, filtrar e exportar dados de abastecimentos
 */

// Armazena dados de abastecimentos
let abastecimentosData = [];

// Inicializa a página quando o documento estiver pronto
$(document).ready(function() {
    // Inicializa as datas com o mês atual
    inicializarDatas();
    
    // Carrega os dados para os filtros de seleção
    carregarVeiculos();
    carregarMotoristas();
    
    // Verifica se existem filtros salvos na sessão
    carregarFiltrosSalvos();
    
    // Configura os eventos de clique
    $('#btnFiltrar').click(buscarAbastecimentos);
    $('#btnExportar').click(exportarCSV);
    
    // Configura o evento para exibir a foto no modal
    $(document).on('click', '.foto-abastecimento', function() {
        const fotoSrc = $(this).attr('src');
        const tipoAbastecimento = $(this).data('tipo');
        
        $('#fotoModal').attr('src', fotoSrc);
        $('#modalFotoLabel').text(`Foto do Abastecimento de ${tipoAbastecimento === 'agua' ? 'Água' : 'Combustível'}`);
        $('#modalFoto').modal('show');
    });
    
    // Busca os abastecimentos ao carregar a página
    buscarAbastecimentos();
});

/**
 * Inicializa os campos de data com o primeiro e último dia do mês atual
 */
function inicializarDatas() {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    $('#dataInicio').val(formatarDataParaInput(primeiroDiaMes));
    $('#dataFim').val(formatarDataParaInput(ultimoDiaMes));
}

/**
 * Formata uma data para o formato aceito pelo input type="date"
 * @param {Date} data - Objeto de data a ser formatado
 * @returns {string} Data formatada como YYYY-MM-DD
 */
function formatarDataParaInput(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

/**
 * Carrega a lista de veículos para o filtro de seleção
 */
function carregarVeiculos() {
    const veiculos = mockAPI.obterVeiculos();
    
    if (veiculos && veiculos.length > 0) {
        let options = '<option value="">Todos</option>';
        
        veiculos.forEach(veiculo => {
            options += `<option value="${veiculo.id}">${veiculo.placa} - ${veiculo.modelo}</option>`;
        });
        
        $('#filtroVeiculo').html(options);
    }
}

/**
 * Carrega a lista de motoristas para o filtro de seleção
 */
function carregarMotoristas() {
    const motoristas = mockAPI.obterMotoristas();
    
    if (motoristas && motoristas.length > 0) {
        let options = '<option value="">Todos</option>';
        
        motoristas.forEach(motorista => {
            options += `<option value="${motorista.id}">${motorista.nome}</option>`;
        });
        
        $('#filtroMotorista').html(options);
    }
}

/**
 * Carrega filtros salvos anteriormente na sessão
 */
function carregarFiltrosSalvos() {
    const filtrosSalvos = sessionStorage.getItem('filtrosAbastecimentos');
    
    if (filtrosSalvos) {
        const filtros = JSON.parse(filtrosSalvos);
        
        if (filtros.dataInicio) $('#dataInicio').val(filtros.dataInicio);
        if (filtros.dataFim) $('#dataFim').val(filtros.dataFim);
        if (filtros.veiculo) $('#filtroVeiculo').val(filtros.veiculo);
        if (filtros.motorista) $('#filtroMotorista').val(filtros.motorista);
        if (filtros.tipo) $('#filtroTipo').val(filtros.tipo);
        if (filtros.formaPagamento) $('#filtroFormaPagamento').val(filtros.formaPagamento);
    }
}

/**
 * Salva os filtros atuais na sessão
 */
function salvarFiltros() {
    const filtros = {
        dataInicio: $('#dataInicio').val(),
        dataFim: $('#dataFim').val(),
        veiculo: $('#filtroVeiculo').val(),
        motorista: $('#filtroMotorista').val(),
        tipo: $('#filtroTipo').val(),
        formaPagamento: $('#filtroFormaPagamento').val()
    };
    
    sessionStorage.setItem('filtrosAbastecimentos', JSON.stringify(filtros));
}

/**
 * Busca os abastecimentos com base nos filtros selecionados
 */
function buscarAbastecimentos() {
    // Salva os filtros na sessão
    salvarFiltros();
    
    // Obtém os valores dos filtros
    const filtros = {
        dataInicio: $('#dataInicio').val(),
        dataFim: $('#dataFim').val(),
        veiculo: $('#filtroVeiculo').val(),
        motorista: $('#filtroMotorista').val(),
        tipo: $('#filtroTipo').val(),
        formaPagamento: $('#filtroFormaPagamento').val()
    };
    
    // Busca os abastecimentos aplicando os filtros
    const abastecimentos = mockAPI.obterAbastecimentos();
    
    if (!abastecimentos || abastecimentos.length === 0) {
        exibirMensagemVazia();
        return;
    }
    
    // Filtra os abastecimentos
    abastecimentosData = abastecimentos.filter(abastecimento => {
        // Filtra por data
        if (filtros.dataInicio && new Date(abastecimento.data) < new Date(filtros.dataInicio)) return false;
        if (filtros.dataFim && new Date(abastecimento.data) > new Date(filtros.dataFim)) return false;
        
        // Filtra por veículo
        if (filtros.veiculo && abastecimento.veiculo.toString() !== filtros.veiculo) return false;
        
        // Filtra por motorista
        if (filtros.motorista && abastecimento.motorista.toString() !== filtros.motorista) return false;
        
        // Filtra por tipo
        if (filtros.tipo && abastecimento.tipo !== filtros.tipo) return false;
        
        // Filtra por forma de pagamento
        if (filtros.formaPagamento && abastecimento.formaPagamento !== filtros.formaPagamento) return false;
        
        return true;
    });
    
    // Atualiza a tabela com os resultados
    atualizarTabela(abastecimentosData);
}

/**
 * Atualiza a tabela com os abastecimentos filtrados
 * @param {Array} abastecimentos - Lista de abastecimentos a serem exibidos
 */
function atualizarTabela(abastecimentos) {
    const $tabela = $('#tabelaAbastecimentos');
    const $semRegistros = $('#semRegistros');
    const $totalRegistros = $('#totalRegistros');
    
    // Atualiza o contador de registros
    $totalRegistros.text(abastecimentos.length);
    
    // Verifica se existem registros
    if (abastecimentos.length === 0) {
        $tabela.empty();
        $semRegistros.show();
        return;
    }
    
    // Esconde a mensagem de "sem registros"
    $semRegistros.hide();
    
    // Ordena os abastecimentos por data (mais recentes primeiro)
    abastecimentos.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Limpa a tabela
    $tabela.empty();
    
    // Adiciona as linhas de abastecimentos
    abastecimentos.forEach(abastecimento => {
        // Obtém os dados do veículo e motorista
        const veiculo = mockAPI.obterVeiculoPorId(abastecimento.veiculo);
        const motorista = mockAPI.obterMotoristaPorId(abastecimento.motorista);
        
        // Formata o valor total
        const valorFormatado = parseFloat(abastecimento.valorTotal).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        
        // Cria a linha da tabela
        const linha = `
            <tr>
                <td>${formatarData(abastecimento.data)}</td>
                <td>
                    <span class="badge badge-tipo ${abastecimento.tipo === 'agua' ? 'badge-agua' : 'badge-combustivel'} text-white">
                        ${abastecimento.tipo === 'agua' ? 'Água' : 'Combustível'}
                    </span>
                </td>
                <td>${veiculo ? veiculo.placa + ' - ' + veiculo.modelo : 'N/A'}</td>
                <td>${motorista ? motorista.nome : 'N/A'}</td>
                <td>${abastecimento.quantidade} ${abastecimento.tipo === 'agua' ? 'litros' : 'litros'}</td>
                <td>${valorFormatado}</td>
                <td>${formatarFormaPagamento(abastecimento.formaPagamento)}</td>
                <td>
                    ${abastecimento.foto ? 
                      `<img src="${abastecimento.foto}" class="foto-abastecimento" data-tipo="${abastecimento.tipo}" alt="Foto">` : 
                      '<span class="badge badge-secondary">Sem foto</span>'}
                </td>
            </tr>
        `;
        
        // Adiciona a linha à tabela
        $tabela.append(linha);
    });
}

/**
 * Exibe a mensagem de tabela vazia
 */
function exibirMensagemVazia() {
    $('#tabelaAbastecimentos').empty();
    $('#semRegistros').show();
    $('#totalRegistros').text('0');
}

/**
 * Formata a data para exibição no formato DD/MM/YYYY
 * @param {string} dataString - Data em formato string
 * @returns {string} Data formatada
 */
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

/**
 * Formata a forma de pagamento para exibição
 * @param {string} forma - Código da forma de pagamento
 * @returns {string} Forma de pagamento formatada
 */
function formatarFormaPagamento(forma) {
    const formasPagamento = {
        'dinheiro': 'Dinheiro',
        'cartao': 'Cartão',
        'pix': 'PIX',
        'boleto': 'Boleto'
    };
    
    return formasPagamento[forma] || forma;
}

/**
 * Exporta os dados da tabela para um arquivo CSV
 */
function exportarCSV() {
    if (abastecimentosData.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }
    
    // Converte os dados para o formato CSV
    let csvContent = 'Data,Tipo,Veículo,Motorista,Quantidade,Valor Total,Forma de Pagamento\n';
    
    abastecimentosData.forEach(abastecimento => {
        const veiculo = mockAPI.obterVeiculoPorId(abastecimento.veiculo);
        const motorista = mockAPI.obterMotoristaPorId(abastecimento.motorista);
        const veiculoTexto = veiculo ? `${veiculo.placa} - ${veiculo.modelo}` : 'N/A';
        const motoristaTexto = motorista ? motorista.nome : 'N/A';
        const tipo = abastecimento.tipo === 'agua' ? 'Água' : 'Combustível';
        const formaPagamento = formatarFormaPagamento(abastecimento.formaPagamento);
        
        // Cria a linha CSV
        csvContent += `${formatarData(abastecimento.data)},`;
        csvContent += `${tipo},`;
        csvContent += `"${veiculoTexto}",`;
        csvContent += `"${motoristaTexto}",`;
        csvContent += `${abastecimento.quantidade} litros,`;
        csvContent += `R$ ${parseFloat(abastecimento.valorTotal).toFixed(2).replace('.', ',')},`;
        csvContent += `${formaPagamento}\n`;
    });
    
    // Cria um elemento de download
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `abastecimentos_${formatarDataArquivo(new Date())}.csv`);
    document.body.appendChild(link);
    
    // Faz o download do arquivo
    link.click();
    document.body.removeChild(link);
}

/**
 * Formata a data para uso em nome de arquivo
 * @param {Date} data - Data a ser formatada
 * @returns {string} Data formatada como YYYYMMDD_HHMMSS
 */
function formatarDataArquivo(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const min = String(data.getMinutes()).padStart(2, '0');
    const seg = String(data.getSeconds()).padStart(2, '0');
    
    return `${ano}${mes}${dia}_${hora}${min}${seg}`;
} 