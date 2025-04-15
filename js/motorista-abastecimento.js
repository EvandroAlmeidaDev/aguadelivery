/**
 * Script para controle da página de registro de abastecimentos para motoristas
 */

// Inicializar a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação de motorista
    verificarAutenticacaoMotorista();
    
    // Inicializar componentes
    inicializarFormularios();
    configurarEventos();
    obterGeolocalizacao();
    carregarDadosMotorista();
});

/**
 * Verifica se o usuário está autenticado como motorista
 */
function verificarAutenticacaoMotorista() {
    const sessaoStr = localStorage.getItem('sessaoUsuario');
    
    if (!sessaoStr) {
        // Se não estiver autenticado, redireciona para login
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        const sessao = JSON.parse(sessaoStr);
        if (!sessao.autenticado) {
            window.location.href = 'login.html';
            return false;
        }
        
        // Verificar se a sessão expirou (8 horas)
        const dataLogin = new Date(sessao.dataLogin);
        const agora = new Date();
        const horasDecorridas = (agora - dataLogin) / (1000 * 60 * 60);
        
        if (horasDecorridas >= 8) {
            localStorage.removeItem('sessaoUsuario');
            window.location.href = 'login.html';
            return false;
        }
        
        // Verificar se é motorista
        if (sessao.usuario.tipo !== 'motorista') {
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    } catch (erro) {
        console.error('Erro ao verificar autenticação:', erro);
        window.location.href = 'login.html';
        return false;
    }
}

/**
 * Inicializa os formulários com valores padrão
 */
function inicializarFormularios() {
    // Definir data atual nos campos de data
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('agua-data').value = hoje;
    document.getElementById('combustivel-data').value = hoje;
    
    // Configurar alteração de abas
    document.querySelectorAll('.form-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remover classe ativa de todas as abas
            document.querySelectorAll('.form-tab').forEach(el => el.classList.remove('active'));
            
            // Adicionar classe ativa à aba clicada
            this.classList.add('active');
            
            // Remover classe ativa de todos os painéis
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            
            // Mostrar painel correspondente
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`form-${tabId}`).classList.add('active');
        });
    });
    
    // Configurar cálculo automático de valor total para combustível
    document.getElementById('combustivel-litros').addEventListener('input', calcularTotalCombustivel);
    document.getElementById('combustivel-valor-litro').addEventListener('input', calcularTotalCombustivel);
}

/**
 * Configura os eventos dos botões da página
 */
function configurarEventos() {
    // Configurar envio dos formulários
    document.getElementById('agua-form').addEventListener('submit', function(e) {
        e.preventDefault();
        salvarAbastecimento('agua');
    });
    
    document.getElementById('combustivel-form').addEventListener('submit', function(e) {
        e.preventDefault();
        salvarAbastecimento('combustivel');
    });
    
    // Botões de câmera para água
    document.getElementById('agua-ativar-camera').addEventListener('click', function() {
        ativarCamera('agua');
    });
    
    document.getElementById('agua-cancelar-foto').addEventListener('click', function() {
        cancelarCaptura('agua');
    });
    
    document.getElementById('agua-capturar-foto').addEventListener('click', function() {
        capturarFoto('agua');
    });
    
    // Botões de câmera para combustível
    document.getElementById('combustivel-ativar-camera').addEventListener('click', function() {
        ativarCamera('combustivel');
    });
    
    document.getElementById('combustivel-cancelar-foto').addEventListener('click', function() {
        cancelarCaptura('combustivel');
    });
    
    document.getElementById('combustivel-capturar-foto').addEventListener('click', function() {
        capturarFoto('combustivel');
    });
}

/**
 * Calcula o valor total do abastecimento de combustível
 */
function calcularTotalCombustivel() {
    const quantidade = parseFloat(document.getElementById('combustivel-litros').value) || 0;
    const valorLitro = parseFloat(document.getElementById('combustivel-valor-litro').value) || 0;
    
    const valorTotal = quantidade * valorLitro;
    document.getElementById('combustivel-valor-total').value = valorTotal.toFixed(2);
}

/**
 * Carrega os dados do motorista logado
 */
function carregarDadosMotorista() {
    try {
        const sessao = JSON.parse(localStorage.getItem('sessaoUsuario') || '{}');
        if (sessao && sessao.usuario && sessao.usuario.nome) {
            document.getElementById('usuario-nome').textContent = sessao.usuario.nome;
        }
    } catch (error) {
        console.error('Erro ao carregar dados do motorista:', error);
    }
}

/**
 * Ativa a câmera para capturar foto de comprovante
 * @param {string} tipo - Tipo de abastecimento (agua/combustivel)
 */
function ativarCamera(tipo) {
    const previewEl = document.getElementById(`${tipo}-preview`);
    const btnAtivar = document.getElementById(`${tipo}-ativar-camera`);
    const controls = document.getElementById(`${tipo}-camera-controls`);
    
    // Criar elemento de vídeo se não existir
    let videoEl = previewEl.querySelector('video');
    if (!videoEl) {
        videoEl = document.createElement('video');
        videoEl.setAttribute('autoplay', 'true');
        videoEl.setAttribute('playsinline', 'true');
        previewEl.innerHTML = '';
        previewEl.appendChild(videoEl);
    }
    
    // Mostrar controles da câmera e esconder botão de ativar
    controls.style.display = 'block';
    btnAtivar.style.display = 'none';
    
    // Verificar permissão da câmera
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
        } 
    })
    .then(function(stream) {
        window.localStream = stream;
        videoEl.srcObject = stream;
        videoEl.play();
    })
    .catch(function(err) {
        console.error("Erro ao acessar câmera: ", err);
        mostrarErro('Não foi possível acessar a câmera. Verifique as permissões.');
        cancelarCaptura(tipo);
    });
}

/**
 * Cancela a captura da foto
 * @param {string} tipo - Tipo de abastecimento (agua/combustivel)
 */
function cancelarCaptura(tipo) {
    const previewEl = document.getElementById(`${tipo}-preview`);
    const btnAtivar = document.getElementById(`${tipo}-ativar-camera`);
    const controls = document.getElementById(`${tipo}-camera-controls`);
    
    // Parar streams de vídeo
    if (window.localStream) {
        window.localStream.getTracks().forEach(track => {
            track.stop();
        });
    }
    
    // Restaurar ícone de câmera
    previewEl.innerHTML = '<i class="fas fa-camera fa-3x"></i>';
    
    // Mostrar botão de ativar e esconder controles
    controls.style.display = 'none';
    btnAtivar.style.display = 'block';
}

/**
 * Captura a foto do comprovante
 * @param {string} tipo - Tipo de abastecimento (agua/combustivel)
 */
function capturarFoto(tipo) {
    const previewEl = document.getElementById(`${tipo}-preview`);
    const btnAtivar = document.getElementById(`${tipo}-ativar-camera`);
    const controls = document.getElementById(`${tipo}-camera-controls`);
    
    // Obter elemento de vídeo
    const videoEl = previewEl.querySelector('video');
    if (!videoEl) {
        mostrarErro('Câmera não inicializada.');
        return;
    }
    
    // Criar canvas para capturar a imagem
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    
    // Obter URL da imagem
    const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Parar streams de vídeo
    if (window.localStream) {
        window.localStream.getTracks().forEach(track => {
            track.stop();
        });
    }
    
    // Mostrar imagem capturada
    const imgEl = document.createElement('img');
    imgEl.src = imageUrl;
    imgEl.alt = "Comprovante capturado";
    imgEl.dataset.foto = imageUrl;
    previewEl.innerHTML = '';
    previewEl.appendChild(imgEl);
    
    // Esconder controles da câmera
    controls.style.display = 'none';
    
    // Mostrar botão para nova captura
    btnAtivar.style.display = 'block';
    btnAtivar.innerHTML = '<i class="fas fa-redo"></i> Nova Foto';
}

/**
 * Obtém a localização atual do usuário
 */
function obterGeolocalizacao() {
    const aguaLocationEl = document.getElementById('agua-location');
    const combustivelLocationEl = document.getElementById('combustivel-location');
    
    // Verificar se a API de geolocalização está disponível
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            // Sucesso
            function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                
                // Obter nome aproximado da localização usando API de geocodificação reversa
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    .then(response => response.json())
                    .then(data => {
                        const local = data.address?.city || data.address?.town || data.address?.village || 'Localização atual';
                        aguaLocationEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${local} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
                        combustivelLocationEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${local} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
                    })
                    .catch(() => {
                        // Fallback se a API não responder
                        aguaLocationEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> Localização: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                        combustivelLocationEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> Localização: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    });
            },
            // Erro
            function(error) {
                console.warn('Erro ao obter localização:', error);
                aguaLocationEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Não foi possível obter sua localização';
                combustivelLocationEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Não foi possível obter sua localização';
            }
        );
    } else {
        // Navegador não suporta geolocalização
        aguaLocationEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Seu navegador não suporta geolocalização';
        combustivelLocationEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Seu navegador não suporta geolocalização';
    }
}

/**
 * Salva o abastecimento no localStorage
 * @param {string} tipo - Tipo de abastecimento (agua/combustivel)
 */
function salvarAbastecimento(tipo) {
    try {
        // Obter sessão do usuário para informações do motorista
        const sessao = JSON.parse(localStorage.getItem('sessaoUsuario') || '{}');
        if (!sessao.usuario || !sessao.usuario.id) {
            mostrarErro('Sessão de usuário inválida. Faça login novamente.');
            return;
        }
        
        // Obter dados do formulário
        const data = document.getElementById(`${tipo}-data`).value;
        
        let fornecedor, quantidade, valorLitro, valorTotal;
        
        if (tipo === 'agua') {
            fornecedor = document.getElementById('agua-bica').value;
            quantidade = document.getElementById('agua-quantidade').value;
            valorTotal = document.getElementById('agua-valor-total').value;
            valorLitro = valorTotal / quantidade;
        } else {
            fornecedor = document.getElementById('combustivel-posto').value;
            quantidade = document.getElementById('combustivel-litros').value;
            valorLitro = document.getElementById('combustivel-valor-litro').value;
            valorTotal = document.getElementById('combustivel-valor-total').value;
        }
        
        const formaPagamento = document.getElementById(`${tipo}-pagamento`).value;
        const observacoes = document.getElementById(`${tipo}-obs`).value;
        
        // Validar campos obrigatórios
        if (!data || !fornecedor || !quantidade || !valorTotal || !formaPagamento) {
            mostrarErro('Preencha todos os campos obrigatórios.');
            return;
        }
        
        // Obter foto (se existir)
        const previewEl = document.getElementById(`${tipo}-preview`);
        const imgEl = previewEl.querySelector('img');
        const foto = imgEl ? imgEl.dataset.foto : null;
        
        // Obter quilometragem para combustível
        let quilometragem = null;
        if (tipo === 'combustivel') {
            quilometragem = document.getElementById('combustivel-km').value;
            if (!quilometragem) {
                mostrarErro('Informe a quilometragem atual do veículo.');
                return;
            }
        }
        
        // Obter geolocalização
        let latitude = null;
        let longitude = null;
        
        // Tratar abastecimento com base no tipo
        let abastecimento = {
            id: Date.now().toString(),
            tipo: tipo,
            data: data,
            motorista: {
                id: sessao.usuario.id,
                nome: sessao.usuario.nome
            },
            fornecedor: fornecedor,
            quantidade: parseFloat(quantidade),
            valorLitro: parseFloat(valorLitro),
            valorTotal: parseFloat(valorTotal),
            formaPagamento: formaPagamento,
            observacoes: observacoes,
            foto: foto,
            dataRegistro: new Date().toISOString(),
            latitude: latitude,
            longitude: longitude
        };
        
        // Adicionar campos específicos do combustível
        if (tipo === 'combustivel') {
            abastecimento.tipoCombustivel = document.getElementById('combustivel-tipo').value;
            abastecimento.quilometragem = parseInt(quilometragem);
        }
        
        // Recuperar veículo associado ao motorista
        const motorista = mockAPI.getMotoristaById(sessao.usuario.id);
        if (motorista && motorista.veiculoId) {
            abastecimento.veiculoId = motorista.veiculoId;
        } else {
            mostrarErro('Não foi possível identificar o veículo associado a este motorista.');
            return;
        }
        
        // Salvar abastecimento
        salvarNoMockAPI(abastecimento, tipo);
    } catch (error) {
        console.error('Erro ao salvar abastecimento:', error);
        mostrarErro('Ocorreu um erro ao salvar o abastecimento. Tente novamente.');
    }
}

/**
 * Salva o abastecimento no MockAPI
 * @param {Object} abastecimento - Objeto com os dados do abastecimento
 * @param {string} tipo - Tipo de abastecimento (agua/combustivel)
 */
function salvarNoMockAPI(abastecimento, tipo) {
    try {
        // Adicionar ao MockAPI
        if (tipo === 'agua') {
            mockAPI.salvarAbastecimentoAgua(abastecimento);
        } else {
            mockAPI.salvarAbastecimentoCombustivel(abastecimento);
        }
        
        // Mostrar mensagem de sucesso
        mostrarSucesso('Abastecimento registrado com sucesso!');
        
        // Resetar formulário
        document.getElementById(`${tipo}-form`).reset();
        
        // Restaurar preview
        document.getElementById(`${tipo}-preview`).innerHTML = '<i class="fas fa-camera fa-3x"></i>';
        
        // Restaurar data para hoje
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById(`${tipo}-data`).value = hoje;
    } catch (error) {
        console.error('Erro ao salvar no MockAPI:', error);
        mostrarErro('Ocorreu um erro ao salvar o abastecimento. Tente novamente.');
    }
}

/**
 * Exibe uma mensagem de sucesso na tela
 * @param {string} mensagem - Texto da mensagem de sucesso
 */
function mostrarSucesso(mensagem) {
    // Criar elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-success';
    alerta.innerHTML = `<i class="fas fa-check-circle"></i> ${mensagem}`;
    
    // Adicionar ao DOM
    document.querySelector('.page-content').insertBefore(alerta, document.querySelector('.form-container'));
    
    // Remover automaticamente após 3 segundos
    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

/**
 * Exibe uma mensagem de erro na tela
 * @param {string} mensagem - Texto da mensagem de erro
 */
function mostrarErro(mensagem) {
    // Criar elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-danger';
    alerta.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensagem}`;
    
    // Adicionar ao DOM
    document.querySelector('.page-content').insertBefore(alerta, document.querySelector('.form-container'));
    
    // Remover automaticamente após 3 segundos
    setTimeout(() => {
        alerta.remove();
    }, 3000);
} 