// Gerenciador de Check-in de Motorista
const CheckinManager = {
    // Estado do aplicativo
    state: {
        veiculoId: null,
        veiculoSelecionado: null,
        kmAtual: null,
        checklist: {},
        fotoBase64: null,
        latitude: null,
        longitude: null,
        timestamp: null,
        stream: null
    },
    
    // Inicialização
    init: function() {
        this.checkAuthentication();
        this.loadVehicles();
        this.setupEventListeners();
        this.getLocation();
    },
    
    // Verificar autenticação
    checkAuthentication: function() {
        const sessaoStr = localStorage.getItem('sessaoUsuario');
        
        if (!sessaoStr) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            const sessao = JSON.parse(sessaoStr);
            if (!sessao.autenticado || sessao.usuario.tipo !== 'motorista') {
                window.location.href = 'login.html';
                return;
            }
            
            // Verificar se a sessão expirou (8 horas)
            const dataLogin = new Date(sessao.dataLogin);
            const agora = new Date();
            const horasDecorridas = (agora - dataLogin) / (1000 * 60 * 60);
            
            if (horasDecorridas >= 8) {
                localStorage.removeItem('sessaoUsuario');
                window.location.href = 'login.html';
                return;
            }
            
            // Preencher nome do usuário se necessário
            if (document.getElementById('usuario-nome')) {
                document.getElementById('usuario-nome').textContent = sessao.usuario.nome;
            }
        } catch (erro) {
            console.error('Erro ao verificar autenticação:', erro);
            window.location.href = 'login.html';
        }
    },
    
    // Carregar veículos disponíveis
    loadVehicles: function() {
        const veiculos = mockApi.getVeiculos().filter(v => v.status === 'disponivel');
        const select = document.getElementById('vehicle-select');
        
        // Limpar opções existentes
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Adicionar veículos ao select
        veiculos.forEach(veiculo => {
            const option = document.createElement('option');
            option.value = veiculo.id;
            option.textContent = `${veiculo.placa} - ${veiculo.modelo}`;
            select.appendChild(option);
        });
    },
    
    // Configurar listeners de eventos
    setupEventListeners: function() {
        // Seleção de veículo
        document.getElementById('vehicle-select').addEventListener('change', (e) => {
            const veiculoId = e.target.value;
            if (!veiculoId) {
                document.getElementById('vehicle-details').style.display = 'none';
                this.state.veiculoSelecionado = null;
                this.state.veiculoId = null;
                return;
            }
            
            this.state.veiculoId = veiculoId;
            this.state.veiculoSelecionado = mockApi.getVeiculoById(veiculoId);
            this.displayVehicleDetails(this.state.veiculoSelecionado);
        });
        
        // Captura de foto
        document.getElementById('capture-photo').addEventListener('click', () => {
            if (this.state.stream) {
                this.stopCamera();
            } else {
                this.startCamera();
            }
        });
        
        // Checklist items
        const checklistItems = document.querySelectorAll('.checklist-check');
        checklistItems.forEach(item => {
            item.addEventListener('change', (e) => {
                this.state.checklist[e.target.id] = e.target.checked;
            });
        });
        
        // KM atual
        document.getElementById('km-reading').addEventListener('input', (e) => {
            this.state.kmAtual = e.target.value;
        });
        
        // Botão de cancelar
        document.getElementById('btn-cancel').addEventListener('click', () => {
            if (confirm('Deseja realmente cancelar o check-in?')) {
                window.location.href = 'motorista-app.html';
            }
        });
        
        // Botão de enviar
        document.getElementById('btn-submit').addEventListener('click', () => {
            this.submitCheckin();
        });
    },
    
    // Exibir detalhes do veículo
    displayVehicleDetails: function(veiculo) {
        const detailsDiv = document.getElementById('vehicle-details');
        
        document.getElementById('vehicle-plate').textContent = veiculo.placa;
        document.getElementById('vehicle-model').textContent = veiculo.modelo;
        document.getElementById('vehicle-last-maintenance').textContent = veiculo.ultimaManutencao || 'Não informada';
        document.getElementById('vehicle-km').textContent = `${veiculo.kmAtual} km`;
        
        // Pré-preencher o campo de KM atual
        document.getElementById('km-reading').value = veiculo.kmAtual;
        this.state.kmAtual = veiculo.kmAtual;
        
        detailsDiv.style.display = 'block';
    },
    
    // Iniciar câmera
    startCamera: function() {
        const cameraPreview = document.getElementById('camera-preview');
        const captureButton = document.getElementById('capture-photo');
        
        // Remover conteúdo atual
        cameraPreview.innerHTML = '';
        
        // Criar elemento de vídeo
        const videoElement = document.createElement('video');
        videoElement.autoplay = true;
        cameraPreview.appendChild(videoElement);
        
        // Solicitar acesso à câmera
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
            .then(stream => {
                this.state.stream = stream;
                videoElement.srcObject = stream;
                
                // Atualizar botão
                captureButton.innerHTML = '<i class="fas fa-camera btn-icon"></i> Tirar Foto';
                captureButton.classList.remove('btn-primary');
                captureButton.classList.add('btn-success');
            })
            .catch(error => {
                console.error('Erro ao acessar câmera:', error);
                alert('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
                
                // Restaurar placeholder
                cameraPreview.innerHTML = `
                    <div class="camera-placeholder">
                        <i class="fas fa-camera camera-icon"></i>
                        <p>Não foi possível acessar a câmera</p>
                    </div>
                `;
            });
    },
    
    // Capturar foto
    capturePhoto: function() {
        const cameraPreview = document.getElementById('camera-preview');
        const videoElement = cameraPreview.querySelector('video');
        
        if (!videoElement || !this.state.stream) {
            alert('Câmera não está ativa.');
            return;
        }
        
        // Criar canvas para capturar a imagem
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        // Desenhar o frame atual do vídeo no canvas
        const context = canvas.getContext('2d');
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Converter para base64
        this.state.fotoBase64 = canvas.toDataURL('image/jpeg');
        
        // Parar a câmera
        this.stopCamera();
        
        // Mostrar a imagem capturada
        const imgElement = document.createElement('img');
        imgElement.src = this.state.fotoBase64;
        cameraPreview.innerHTML = '';
        cameraPreview.appendChild(imgElement);
        
        // Atualizar botão
        const captureButton = document.getElementById('capture-photo');
        captureButton.innerHTML = '<i class="fas fa-redo btn-icon"></i> Capturar Novamente';
        captureButton.classList.remove('btn-success');
        captureButton.classList.add('btn-primary');
    },
    
    // Parar câmera
    stopCamera: function() {
        if (this.state.stream) {
            const tracks = this.state.stream.getTracks();
            tracks.forEach(track => track.stop());
            this.state.stream = null;
            
            // Se não temos foto capturada, capturar antes de parar
            if (!this.state.fotoBase64) {
                this.capturePhoto();
            }
        }
    },
    
    // Obter localização
    getLocation: function() {
        const locationInfo = document.getElementById('location-info');
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.state.latitude = position.coords.latitude;
                    this.state.longitude = position.coords.longitude;
                    this.state.timestamp = position.timestamp;
                    
                    // Atualizar interface
                    locationInfo.innerHTML = `
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Localização: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}</span>
                    `;
                },
                (error) => {
                    console.error('Erro ao obter localização:', error);
                    locationInfo.innerHTML = `
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Não foi possível obter a localização. ${error.message}</span>
                    `;
                }
            );
        } else {
            locationInfo.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>Geolocalização não é suportada por este navegador.</span>
            `;
        }
    },
    
    // Validar formulário
    validateForm: function() {
        // Verificar se veículo foi selecionado
        if (!this.state.veiculoId) {
            alert('Por favor, selecione um veículo.');
            return false;
        }
        
        // Verificar se KM foi informado
        if (!this.state.kmAtual) {
            alert('Por favor, informe a quilometragem atual do veículo.');
            return false;
        }
        
        // KM atual não pode ser menor que o registrado
        if (Number(this.state.kmAtual) < Number(this.state.veiculoSelecionado.kmAtual)) {
            alert('A quilometragem informada não pode ser menor que a última registrada.');
            return false;
        }
        
        // Verificar se pelo menos um item do checklist foi marcado
        const checklistItems = document.querySelectorAll('.checklist-check');
        let algumItemChecado = false;
        
        checklistItems.forEach(item => {
            if (item.checked) {
                algumItemChecado = true;
            }
        });
        
        if (!algumItemChecado) {
            alert('Por favor, preencha o checklist do veículo.');
            return false;
        }
        
        // Verificar se foto foi capturada
        if (!this.state.fotoBase64) {
            alert('Por favor, capture uma foto do veículo.');
            return false;
        }
        
        return true;
    },
    
    // Enviar check-in
    submitCheckin: function() {
        if (!this.validateForm()) {
            return;
        }
        
        // Preparar dados
        const sessaoStr = localStorage.getItem('sessaoUsuario');
        const sessao = JSON.parse(sessaoStr);
        const motoristaId = sessao.usuario.id;
        
        const checkinData = {
            id: Date.now().toString(),
            motoristaId: motoristaId,
            veiculoId: this.state.veiculoId,
            data: new Date().toISOString(),
            kmRegistrado: this.state.kmAtual,
            checklist: this.state.checklist,
            foto: this.state.fotoBase64,
            localizacao: {
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                timestamp: this.state.timestamp
            }
        };
        
        // Enviar para API (mock)
        try {
            mockApi.registrarCheckin(checkinData);
            
            // Atualizar KM do veículo
            mockApi.atualizarKmVeiculo(this.state.veiculoId, this.state.kmAtual);
            
            // Vincular motorista ao veículo
            mockApi.vincularMotoristaVeiculo(motoristaId, this.state.veiculoId);
            
            alert('Check-in realizado com sucesso!');
            window.location.href = 'motorista-app.html';
        } catch (error) {
            console.error('Erro ao registrar check-in:', error);
            alert('Erro ao registrar check-in. Por favor, tente novamente.');
        }
    }
};

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    CheckinManager.init();
}); 