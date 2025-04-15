/**
 * frota.js - Gerenciamento de frota de veículos
 */

// Variáveis globais
let veiculos = [];
let veiculosFiltrados = [];
let veiculoAtual = null;
let editando = false;
// Remover a variável api local, usaremos window.api global

// Elementos DOM
const tabelaVeiculos = document.getElementById('tabela-veiculos');
const buscaVeiculo = document.getElementById('busca-veiculo');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroStatus = document.getElementById('filtro-status');
const filtroManutencao = document.getElementById('filtro-manutencao');

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
        
        // ... existing code ...
    }
    // ... existing code ...
}

// Função para editar um veículo
async function editarVeiculo(id) {
    mostrarLoading();
    editando = true;
    
    try {
        // Buscar dados do veículo
        const veiculo = await window.api.getVeiculoById(id);
        
        if (!veiculo) {
            throw new Error(`Veículo com ID ${id} não encontrado.`);
        }
        
        veiculoAtual = veiculo;
        
        // ... existing code ...
    }
    // ... existing code ...
}

// Função para salvar veículo
async function salvarVeiculo() {
    // ... existing code ...
                
    try {
        // ... existing code ...
                
        // Atualizar ou criar veículo
        if (editando && id) {
            await window.api.atualizarVeiculo(id, veiculo);
            mostrarMensagem("Veículo atualizado com sucesso!", "success");
        } else {
            await window.api.criarVeiculo(veiculo);
            mostrarMensagem("Veículo cadastrado com sucesso!", "success");
        }
                
        // ... existing code ...
    }
    // ... existing code ...
}

// Função para confirmar exclusão
function confirmarExclusao(id) {
    // ... existing code ...
}

// Função para excluir veículo
async function excluirVeiculo() {
    // ... existing code ...
    
    try {
        await window.api.excluirVeiculo(veiculoAtual.id);
        fecharModalConfirmacao();
        mostrarMensagem("Veículo excluído com sucesso!", "success");
        
        // ... existing code ...
    }
    // ... existing code ...
} 