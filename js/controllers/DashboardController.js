/**
 * Controlador para gerenciar o Dashboard
 */
export class DashboardController {
    constructor(storageService, loadingService) {
        this.storageService = storageService;
        this.loadingService = loadingService;
        
        // Charts
        this.faturamentoChart = null;
        this.entregasChart = null;
    }
    
    /**
     * Inicializa os gráficos do dashboard
     */
    async initCharts() {
        await this.loadingService.execute(async () => {
            await this.initFaturamentoChart();
            await this.initEntregasChart();
            this.atualizarCards();
        });
    }
    
    /**
     * Inicializa o gráfico de faturamento
     */
    async initFaturamentoChart() {
        const ctx = document.getElementById('faturamentoChart');
        if (!ctx) return;
        
        // Obtém os dados de faturamento
        const dadosFaturamento = this.calcularFaturamentoMensal();
        
        // Configuração do gráfico
        this.faturamentoChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dadosFaturamento.labels,
                datasets: [{
                    label: 'Faturamento Mensal (R$)',
                    data: dadosFaturamento.valores,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Inicializa o gráfico de entregas por motorista
     */
    async initEntregasChart() {
        const ctx = document.getElementById('entregasChart');
        if (!ctx) return;
        
        // Obtém os dados de entregas por motorista
        const dadosEntregas = this.calcularEntregasPorMotorista();
        
        // Configuração do gráfico
        this.entregasChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: dadosEntregas.labels,
                datasets: [{
                    data: dadosEntregas.valores,
                    backgroundColor: [
                        'rgba(0, 123, 255, 0.7)',
                        'rgba(40, 167, 69, 0.7)',
                        'rgba(255, 193, 7, 0.7)',
                        'rgba(220, 53, 69, 0.7)',
                        'rgba(23, 162, 184, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const percentage = Math.round((value / dadosEntregas.total) * 100);
                                return `${label}: ${value} entregas (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Calcula o faturamento mensal com base nas entregas
     * @returns {Object} - Objeto com labels e valores do faturamento
     */
    calcularFaturamentoMensal() {
        // Obtém todas as entregas
        const entregas = this.storageService.get('entregas') || [];
        
        // Define os meses para exibição
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        // Inicializa o array de faturamento por mês
        const faturamentoPorMes = Array(12).fill(0);
        
        // Calcula o faturamento por mês
        entregas.forEach(entrega => {
            // Extrai o mês da data
            const data = new Date(entrega.data);
            const mes = data.getMonth(); // 0-11
            
            // Converte o valor para número
            const valor = parseFloat(entrega.valor.replace(/[^\d,.]/g, '').replace(',', '.'));
            
            // Adiciona ao faturamento do mês
            if (!isNaN(valor)) {
                faturamentoPorMes[mes] += valor;
            }
        });
        
        return {
            labels: meses,
            valores: faturamentoPorMes
        };
    }
    
    /**
     * Calcula o número de entregas por motorista
     * @returns {Object} - Objeto com labels, valores e total de entregas
     */
    calcularEntregasPorMotorista() {
        // Obtém todas as entregas
        const entregas = this.storageService.get('entregas') || [];
        
        // Conta o número de entregas por motorista
        const entregasPorMotorista = {};
        
        entregas.forEach(entrega => {
            const motorista = entrega.motorista;
            
            if (!entregasPorMotorista[motorista]) {
                entregasPorMotorista[motorista] = 0;
            }
            
            entregasPorMotorista[motorista]++;
        });
        
        // Converte para arrays de labels e valores
        const labels = Object.keys(entregasPorMotorista);
        const valores = Object.values(entregasPorMotorista);
        const total = valores.reduce((acc, val) => acc + val, 0);
        
        return {
            labels,
            valores,
            total
        };
    }
    
    /**
     * Atualiza os dados do dashboard
     */
    async atualizarDashboard() {
        await this.loadingService.execute(async () => {
            // Atualiza os gráficos
            if (this.faturamentoChart) {
                const dadosFaturamento = this.calcularFaturamentoMensal();
                this.faturamentoChart.data.datasets[0].data = dadosFaturamento.valores;
                this.faturamentoChart.update();
            }
            
            if (this.entregasChart) {
                const dadosEntregas = this.calcularEntregasPorMotorista();
                this.entregasChart.data.labels = dadosEntregas.labels;
                this.entregasChart.data.datasets[0].data = dadosEntregas.valores;
                this.entregasChart.update();
            }
            
            // Atualiza os cards
            this.atualizarCards();
        });
    }
    
    /**
     * Atualiza os cards do dashboard
     */
    atualizarCards() {
        // Obtém todos os dados necessários
        const entregas = this.storageService.get('entregas') || [];
        const veiculos = this.storageService.get('veiculos') || [];
        
        // Calcula os valores totais
        const totalEntregas = entregas.length;
        const totalPendentes = entregas.filter(e => !e.pago).length;
        
        // Calcula o valor total a receber e pago
        let valorTotal = 0;
        let valorPendente = 0;
        
        entregas.forEach(entrega => {
            const valor = parseFloat(entrega.valor);
            if (!isNaN(valor)) {
                valorTotal += valor;
                if (!entrega.pago) {
                    valorPendente += valor;
                }
            }
        });
        
        // Calcula a kilometragem total no mês
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
        const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
        
        let kmTotal = 0;
        entregas.forEach(entrega => {
            if (entrega.data >= primeiroDiaMes && entrega.data <= ultimoDiaMes) {
                const km = parseFloat(entrega.km);
                if (!isNaN(km)) {
                    kmTotal += km;
                }
            }
        });
        
        // Atualiza os valores nos cards
        this.atualizarValorCard('notasFiscaisCard', `${totalPendentes} pendentes`);
        this.atualizarValorCard('receberCard', valorPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        this.atualizarValorCard('pagarCard', 'R$ 8.500,00'); // Valor fixo para o MVP
        this.atualizarValorCard('combustivelCard', `${kmTotal.toFixed(0)}km este mês`);
    }
    
    /**
     * Atualiza o valor em um card específico
     * @param {string} cardId - ID do card a ser atualizado
     * @param {string} valor - Valor a ser exibido
     */
    atualizarValorCard(cardId, valor) {
        const card = document.getElementById(cardId);
        if (card) {
            const valorEl = card.querySelector('p');
            if (valorEl) {
                valorEl.textContent = valor;
            }
        }
    }
} 