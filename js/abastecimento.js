/**
 * abastecimento.js
 * Script para gerenciar a página de registro de abastecimentos
 */

// Inicializar a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    verificarAutenticacao();
    
    // Configurar alternância da barra lateral
    document.querySelector('.toggle-sidebar').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('collapsed');
        document.querySelector('.main-content').classList.toggle('expanded');
    });
    
    // Atualizar nome de usuário
    const sessao = JSON.parse(sessionStorage.getItem('sessao') || '{}');
    if (sessao && sessao.usuario) {
        document.getElementById('username').textContent = sessao.usuario.nome;
    }
    
    // Inicializar tabs
    inicializarTabs();
    
    // Configurar eventos dos formulários
    configurarEventosFormulario();
    
    // Carregar veículos disponíveis
    carregarVeiculos();
    
    // Inicializar eventos de cálculo
    inicializarEventosCalculos();
    
    // Obter localização atual
    obterLocalizacaoAtual();
});

/**
 * Verifica se o usuário está autenticado
 */
function verificarAutenticacao() {
    const sessao = JSON.parse(sessionStorage.getItem('sessao') || '{}');
    if (!sessao.autenticado) {
        window.location.href = 'login.html';
        return;
    }
    
    // Verificar se a sessão expirou (8 horas)
    const agora = new Date().getTime();
    if (sessao.timestamp && (agora - sessao.timestamp > 8 * 60 * 60 * 1000)) {
        sessionStorage.removeItem('sessao');
        alert('Sua sessão expirou. Por favor, faça login novamente.');
        window.location.href = 'login.html';
        return;
    }
}

/**
 * Inicializa as tabs e configura os campos de data
 */
function inicializarTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remover classe 'active' de todas as tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Adicionar classe 'active' à tab clicada
            this.classList.add('active');
            
            // Esconder todos os conteúdos de tab
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Mostrar o conteúdo correspondente à tab clicada
            const targetId = this.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    // Definir data atual nos campos de data
    const dataAtual = new Date().toISOString().split('T')[0];
    document.getElementById('agua-data').value = dataAtual;
    document.getElementById('combustivel-data').value = dataAtual;
}

/**
 * Configura os eventos dos formulários
 */
function configurarEventosFormulario() {
    // Configurar formulário de água
    document.getElementById('agua-form').addEventListener('submit', function(event) {
        event.preventDefault();
        salvarAbastecimento('agua');
    });
    
    // Configurar formulário de combustível
    document.getElementById('combustivel-form').addEventListener('submit', function(event) {
        event.preventDefault();
        salvarAbastecimento('combustivel');
    });
    
    // Configurar botões de captura de foto
    document.getElementById('agua-foto-btn').addEventListener('click', function() {
        capturarFoto('agua');
    });
    
    document.getElementById('combustivel-foto-btn').addEventListener('click', function() {
        capturarFoto('combustivel');
    });
}

/**
 * Carrega a lista de veículos disponíveis
 */
function carregarVeiculos() {
    // Obter veículos da API mock
    const veiculos = mockAPI.obterVeiculosParaAbastecimento();
    
    // Selects para água e combustível
    const selectAgua = document.getElementById('agua-veiculo');
    const selectCombustivel = document.getElementById('combustivel-veiculo');
    
    // Limpar opções existentes
    selectAgua.innerHTML = '<option value="">Selecione um veículo</option>';
    selectCombustivel.innerHTML = '<option value="">Selecione um veículo</option>';
    
    // Adicionar veículos às listas
    veiculos.forEach(veiculo => {
        // Opções para abastecimento de água (todos os veículos)
        const optionAgua = document.createElement('option');
        optionAgua.value = veiculo.id;
        optionAgua.textContent = `${veiculo.placa} - ${veiculo.modelo}`;
        selectAgua.appendChild(optionAgua);
        
        // Opções para abastecimento de combustível (apenas caminhões e utilitários)
        if (veiculo.tipo === 'caminhao' || veiculo.tipo === 'utilitario' || veiculo.tipo === 'van') {
            const optionCombustivel = document.createElement('option');
            optionCombustivel.value = veiculo.id;
            optionCombustivel.textContent = `${veiculo.placa} - ${veiculo.modelo}`;
            selectCombustivel.appendChild(optionCombustivel);
        }
    });
    
    // Evento para carregar quilometragem atual quando selecionar veículo no formulário de combustível
    selectCombustivel.addEventListener('change', function() {
        const veiculoId = this.value;
        if (veiculoId) {
            const veiculo = mockAPI.obterVeiculoPorId(parseInt(veiculoId));
            if (veiculo && veiculo.quilometragem) {
                document.getElementById('ultima-quilometragem').textContent = 
                    `Última quilometragem registrada: ${veiculo.quilometragem} km`;
            } else {
                document.getElementById('ultima-quilometragem').textContent = 
                    'Nenhuma quilometragem registrada';
            }
        } else {
            document.getElementById('ultima-quilometragem').textContent = '';
        }
    });
}

/**
 * Inicializa os eventos para cálculos automáticos
 */
function inicializarEventosCalculos() {
    // Água: calcular valor total baseado na quantidade
    document.getElementById('agua-quantidade').addEventListener('input', function() {
        const quantidade = parseFloat(this.value) || 0;
        // Valor fixo por litro de água (exemplo)
        const valorUnitario = 0.10;
        const valorTotal = quantidade * valorUnitario;
        document.getElementById('agua-valor-total').value = valorTotal.toFixed(2);
    });
    
    // Combustível: calcular valor total baseado na quantidade e valor por litro
    document.getElementById('combustivel-quantidade').addEventListener('input', calcularValorTotalCombustivel);
    document.getElementById('combustivel-valor-litro').addEventListener('input', calcularValorTotalCombustivel);
}

/**
 * Calcula o valor total do combustível baseado na quantidade e valor por litro
 */
function calcularValorTotalCombustivel() {
    const quantidade = parseFloat(document.getElementById('combustivel-quantidade').value) || 0;
    const valorLitro = parseFloat(document.getElementById('combustivel-valor-litro').value) || 0;
    const valorTotal = quantidade * valorLitro;
    document.getElementById('combustivel-valor-total').value = valorTotal.toFixed(2);
}

/**
 * Captura uma foto usando a câmera do dispositivo
 * @param {string} tipo - 'agua' ou 'combustivel'
 */
function capturarFoto(tipo) {
    const cameraPreview = document.getElementById(`${tipo}-camera-preview`);
    const fotoContainer = document.getElementById(`${tipo}-foto-container`);
    const fotoInput = document.getElementById(`${tipo}-foto-input`);
    
    // Resetar o input de arquivo para permitir selecionar o mesmo arquivo novamente
    fotoInput.value = '';
    
    // Mostrar o container da câmera
    fotoContainer.style.display = 'block';
    
    // Usar o input de arquivo para capturar uma foto (simulação de câmera)
    fotoInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Exibir a imagem capturada
                cameraPreview.src = e.target.result;
                cameraPreview.style.display = 'block';
                document.getElementById(`${tipo}-foto-btn`).textContent = 'Alterar Foto';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Disparar o clique no input de arquivo
    fotoInput.click();
}

/**
 * Obtém a localização atual do usuário
 */
function obterLocalizacaoAtual() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            // Armazenar coordenadas em campos ocultos
            document.getElementById('agua-latitude').value = latitude;
            document.getElementById('agua-longitude').value = longitude;
            document.getElementById('combustivel-latitude').value = latitude;
            document.getElementById('combustivel-longitude').value = longitude;
            
            // Exibir as coordenadas na interface
            document.getElementById('agua-localizacao').textContent = 
                `Localização atual: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            document.getElementById('combustivel-localizacao').textContent = 
                `Localização atual: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            // Atualizar a cada minuto se o usuário permanecer na página
            setTimeout(obterLocalizacaoAtual, 60000);
        }, function(error) {
            console.error('Erro ao obter localização:', error);
            document.getElementById('agua-localizacao').textContent = 
                'Não foi possível obter sua localização.';
            document.getElementById('combustivel-localizacao').textContent = 
                'Não foi possível obter sua localização.';
        });
    } else {
        document.getElementById('agua-localizacao').textContent = 
            'Geolocalização não é suportada por este navegador.';
        document.getElementById('combustivel-localizacao').textContent = 
            'Geolocalização não é suportada por este navegador.';
    }
}

/**
 * Salva os dados de abastecimento
 * @param {string} tipo - 'agua' ou 'combustivel'
 */
function salvarAbastecimento(tipo) {
    // Obter dados da sessão
    const sessao = JSON.parse(sessionStorage.getItem('sessao') || '{}');
    if (!sessao.autenticado) {
        alert('Sua sessão expirou. Por favor, faça login novamente.');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Dados comuns para ambos os tipos
        const form = document.getElementById(`${tipo}-form`);
        const data = document.getElementById(`${tipo}-data`).value;
        const veiculoId = document.getElementById(`${tipo}-veiculo`).value;
        const fornecedor = document.getElementById(`${tipo}-fornecedor`).value;
        const quantidade = parseFloat(document.getElementById(`${tipo}-quantidade`).value);
        const valorTotal = parseFloat(document.getElementById(`${tipo}-valor-total`).value);
        const formaPagamento = document.getElementById(`${tipo}-forma-pagamento`).value;
        const observacoes = document.getElementById(`${tipo}-observacoes`).value;
        
        // Validações básicas
        if (!data || !veiculoId || !fornecedor || !quantidade || !valorTotal || !formaPagamento) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Localização
        const latitude = document.getElementById(`${tipo}-latitude`).value;
        const longitude = document.getElementById(`${tipo}-longitude`).value;
        
        // Dados do motorista (usuário logado)
        const motorista = sessao.usuario ? sessao.usuario.nome : '';
        const motoristaId = sessao.usuario ? sessao.usuario.id : '';
        
        // Obter veículo selecionado
        const veiculo = mockAPI.obterVeiculoPorId(parseInt(veiculoId));
        const veiculoPlaca = veiculo ? veiculo.placa : '';
        
        // Preparar objeto de abastecimento
        const abastecimento = {
            tipo: tipo,
            data: data,
            veiculoId: parseInt(veiculoId),
            veiculo: veiculoPlaca,
            fornecedor: fornecedor,
            quantidade: quantidade,
            valorTotal: valorTotal,
            formaPagamento: formaPagamento,
            observacoes: observacoes,
            localizacao: {
                latitude: latitude,
                longitude: longitude
            },
            motorista: motorista,
            motoristaId: motoristaId,
            foto: document.getElementById(`${tipo}-camera-preview`).src || null
        };
        
        // Adicionar campos específicos para combustível
        if (tipo === 'combustivel') {
            const tipoCombustivel = document.getElementById('combustivel-tipo').value;
            const valorLitro = parseFloat(document.getElementById('combustivel-valor-litro').value);
            const quilometragem = parseFloat(document.getElementById('combustivel-quilometragem').value);
            
            // Validações específicas para combustível
            if (!tipoCombustivel || !valorLitro || !quilometragem) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            // Verificar se a quilometragem é maior que a última registrada
            if (veiculo && veiculo.quilometragem && quilometragem <= veiculo.quilometragem) {
                alert(`A quilometragem informada (${quilometragem}) deve ser maior que a última registrada (${veiculo.quilometragem}).`);
                return;
            }
            
            // Adicionar campos de combustível
            abastecimento.tipoCombustivel = tipoCombustivel;
            abastecimento.valorLitro = valorLitro;
            abastecimento.quilometragem = quilometragem;
        }
        
        // Salvar abastecimento
        const resultado = mockAPI.adicionarAbastecimento(abastecimento);
        
        if (resultado) {
            alert(`Abastecimento de ${tipo === 'agua' ? 'água' : 'combustível'} registrado com sucesso!`);
            
            // Limpar formulário
            form.reset();
            
            // Redefinir data atual
            document.getElementById(`${tipo}-data`).value = new Date().toISOString().split('T')[0];
            
            // Limpar foto
            document.getElementById(`${tipo}-camera-preview`).src = '';
            document.getElementById(`${tipo}-camera-preview`).style.display = 'none';
            document.getElementById(`${tipo}-foto-container`).style.display = 'none';
            document.getElementById(`${tipo}-foto-btn`).textContent = 'Capturar Foto';
            
            // Obter localização atual novamente
            obterLocalizacaoAtual();
        } else {
            alert('Erro ao registrar abastecimento. Tente novamente.');
        }
    } catch (error) {
        console.error(`Erro ao salvar abastecimento de ${tipo}:`, error);
        alert(`Erro ao registrar abastecimento de ${tipo === 'agua' ? 'água' : 'combustível'}. Tente novamente.`);
    }
}
