// Gerenciador de Veículos do Motorista
const VeiculosManager = {
    // Estado da aplicação
    state: {
        veiculoAtual: null,
        veiculosHistorico: [],
        motoristaId: null
    },
    
    // Inicializar
    init: function() {
        this.checkAuthentication();
        this.loadVehicles();
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
            
            this.state.motoristaId = sessao.usuario.id;
        } catch (erro) {
            console.error('Erro ao verificar autenticação:', erro);
            window.location.href = 'login.html';
        }
    },
    
    // Carregar veículos
    loadVehicles: function() {
        try {
            // Obter veículo atual (vinculado)
            const veiculoAtual = mockApi.getVeiculoByMotorista(this.state.motoristaId);
            this.state.veiculoAtual = veiculoAtual;
            
            // Obter histórico de veículos
            const historico = mockApi.getHistoricoVeiculosMotorista(this.state.motoristaId);
            this.state.veiculosHistorico = historico;
            
            // Renderizar interface
            this.renderCurrentVehicle();
            this.renderHistoryVehicles();
        } catch (error) {
            console.error('Erro ao carregar veículos:', error);
        }
    },
    
    // Renderizar veículo atual
    renderCurrentVehicle: function() {
        const container = document.getElementById('current-vehicle-container');
        
        if (!this.state.veiculoAtual) {
            // Mostrar estado vazio
            const emptyTemplate = document.getElementById('empty-state-template');
            const clone = document.importNode(emptyTemplate.content, true);
            container.innerHTML = '';
            container.appendChild(clone);
            return;
        }
        
        const veiculo = this.state.veiculoAtual;
        const template = document.getElementById('current-vehicle-template');
        const clone = document.importNode(template.content, true);
        
        // Substituir placeholders no template
        const html = clone.firstElementChild.outerHTML
            .replace(/{{placa}}/g, veiculo.placa)
            .replace(/{{modelo}}/g, veiculo.modelo)
            .replace(/{{ano}}/g, veiculo.ano)
            .replace(/{{capacidade}}/g, veiculo.capacidade)
            .replace(/{{kmAtual}}/g, veiculo.kmAtual.toLocaleString('pt-BR'))
            .replace(/{{status}}/g, this.getStatusText(veiculo.status))
            .replace(/{{imagem}}/g, veiculo.imagem || 'img/vehicle-placeholder.jpg')
            .replace(/{{mostrarAlertaManutencao}}/g, this.shouldShowMaintenanceAlert(veiculo) ? 'display: block' : 'display: none');
        
        container.innerHTML = html;
        
        // Adicionar histórico de quilometragem
        this.renderKmHistory(veiculo);
    },
    
    // Renderizar histórico de veículos
    renderHistoryVehicles: function() {
        const container = document.getElementById('history-vehicles-container');
        
        if (!this.state.veiculosHistorico || this.state.veiculosHistorico.length === 0) {
            container.innerHTML = '<p class="empty-text">Nenhum histórico de veículos disponível.</p>';
            return;
        }
        
        let html = '';
        const template = document.getElementById('history-vehicle-template');
        
        this.state.veiculosHistorico.forEach(historico => {
            const veiculo = mockApi.getVeiculoById(historico.veiculoId);
            if (!veiculo) return;
            
            // Formatar data
            const data = new Date(historico.dataUso);
            const dataFormatada = data.toLocaleDateString('pt-BR');
            
            const clone = document.importNode(template.content, true);
            const itemHtml = clone.firstElementChild.outerHTML
                .replace(/{{placa}}/g, veiculo.placa)
                .replace(/{{modelo}}/g, veiculo.modelo)
                .replace(/{{ultimaUtilizacao}}/g, dataFormatada)
                .replace(/{{kmRegistrado}}/g, historico.kmRegistrado.toLocaleString('pt-BR'));
            
            html += itemHtml;
        });
        
        container.innerHTML = html;
    },
    
    // Renderizar histórico de quilometragem
    renderKmHistory: function(veiculo) {
        const container = document.getElementById('km-history');
        
        // Obter histórico de KM (aqui seria uma chamada à API)
        const kmHistory = mockApi.getHistoricoKmVeiculo(veiculo.id);
        
        if (!kmHistory || kmHistory.length === 0) {
            container.innerHTML = '<p>Nenhum histórico de quilometragem disponível.</p>';
            return;
        }
        
        let html = '';
        
        // Ordenar por data, mais recente primeiro
        kmHistory.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        // Mostrar os últimos 5 registros
        const recentHistory = kmHistory.slice(0, 5);
        
        recentHistory.forEach(registro => {
            const data = new Date(registro.data);
            const dataFormatada = data.toLocaleDateString('pt-BR');
            
            html += `
                <div class="history-item">
                    <div class="history-date">${dataFormatada}</div>
                    <div class="history-km">${registro.km.toLocaleString('pt-BR')} km</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    // Obter texto de status
    getStatusText: function(status) {
        const statusMap = {
            'disponivel': 'Disponível',
            'em_uso': 'Em Uso',
            'manutencao': 'Em Manutenção',
            'inativo': 'Inativo'
        };
        
        return statusMap[status] || status;
    },
    
    // Verificar se deve mostrar alerta de manutenção
    shouldShowMaintenanceAlert: function(veiculo) {
        // Verificar se a quilometragem está próxima do limite para manutenção
        // Esta lógica seria implementada de acordo com as regras de negócio
        
        // Exemplo: alerta quando KM > 5000 desde a última manutenção
        const ultimaManutencao = mockApi.getUltimaManutencaoVeiculo(veiculo.id);
        if (!ultimaManutencao) return true; // Se não houver registro, mostrar alerta
        
        const kmDesdeUltimaManutencao = veiculo.kmAtual - ultimaManutencao.kmRegistrado;
        return kmDesdeUltimaManutencao > 5000;
    },
    
    // Relatório de problema
    reportIssue: function() {
        if (!this.state.veiculoAtual) {
            alert('Nenhum veículo selecionado.');
            return;
        }
        
        const problema = prompt('Descreva o problema com o veículo:');
        if (!problema) return;
        
        try {
            // Registrar problema
            mockApi.registrarProblemaVeiculo(this.state.veiculoAtual.id, this.state.motoristaId, problema);
            
            alert('Problema reportado com sucesso! A equipe de manutenção será notificada.');
        } catch (error) {
            console.error('Erro ao reportar problema:', error);
            alert('Erro ao reportar problema. Por favor, tente novamente.');
        }
    },
    
    // Mostrar informações de manutenção
    showMaintenanceInfo: function() {
        if (!this.state.veiculoAtual) {
            alert('Nenhum veículo selecionado.');
            return;
        }
        
        // Obter histórico de manutenção
        const historicoManutencao = mockApi.getHistoricoManutencaoVeiculo(this.state.veiculoAtual.id);
        
        if (!historicoManutencao || historicoManutencao.length === 0) {
            alert('Nenhum histórico de manutenção disponível para este veículo.');
            return;
        }
        
        // Formatar histórico para exibição
        let mensagem = 'Histórico de Manutenção:\n\n';
        
        historicoManutencao.forEach((manutencao, index) => {
            const data = new Date(manutencao.data).toLocaleDateString('pt-BR');
            mensagem += `${index + 1}. Data: ${data}\n`;
            mensagem += `   Tipo: ${manutencao.tipo}\n`;
            mensagem += `   KM: ${manutencao.kmRegistrado.toLocaleString('pt-BR')}\n`;
            mensagem += `   Observações: ${manutencao.observacoes}\n\n`;
        });
        
        // Próxima manutenção
        const ultimaManutencao = historicoManutencao[0];
        const kmDesdeUltimaManutencao = this.state.veiculoAtual.kmAtual - ultimaManutencao.kmRegistrado;
        const kmAteProximaManutencao = 10000 - kmDesdeUltimaManutencao;
        
        mensagem += `Próxima manutenção preventiva: em ${kmAteProximaManutencao.toLocaleString('pt-BR')} km`;
        
        alert(mensagem);
    }
};

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    VeiculosManager.init();
}); 