// Importa os controladores
import { UIController } from './controllers/UIController.js';
import { EntregasController } from './controllers/EntregasController.js';
import { DashboardController } from './controllers/DashboardController.js';

// Importa os serviços
import { StorageService } from './services/StorageService.js';
import { NotificationService } from './services/NotificationService.js';
import { ValidationService } from './services/ValidationService.js';
import { LoadingService } from './services/LoadingService.js';

// Módulos de navegação
const navigation = {
    init() {
        this.setupPageNavigation();
        this.handleInitialPage();
    },

    setupPageNavigation() {
        const menuLinks = document.querySelectorAll('.menu a');
        
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.getAttribute('data-page');
                this.navigateToPage(pageId);
            });
        });
    },

    handleInitialPage() {
        // Verifica se há um hash na URL
        if (window.location.hash) {
            const pageId = window.location.hash.substring(1);
            this.navigateToPage(pageId);
        } else {
            // Se não houver hash, mostra a página de entregas por padrão
            this.navigateToPage('entregas');
        }

        // Adiciona listener para mudanças no hash da URL
        window.addEventListener('hashchange', () => {
            const pageId = window.location.hash.substring(1);
            this.navigateToPage(pageId);
        });
    },

    navigateToPage(pageId) {
        // Remove a classe active de todas as páginas e links
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.querySelectorAll('.menu a').forEach(link => link.classList.remove('active'));

        // Adiciona a classe active à página e link correspondentes
        const targetPage = document.getElementById(pageId);
        const targetLink = document.querySelector(`.menu a[data-page="${pageId}"]`);

        if (targetPage && targetLink) {
            targetPage.classList.add('active');
            targetLink.classList.add('active');
            window.location.hash = pageId;

            // Dispara um evento customizado para notificar que a página mudou
            const event = new CustomEvent('pageChanged', { detail: { pageId } });
            document.dispatchEvent(event);
        }
    }
};

// Classe principal da aplicação
class App {
    constructor() {
        // Inicializa os serviços
        this.storageService = new StorageService();
        this.notificationService = new NotificationService();
        this.validationService = new ValidationService();
        this.loadingService = new LoadingService();
        
        // Inicializa os controladores
        this.uiController = new UIController(this.notificationService);
        this.entregasController = new EntregasController(
            this.storageService, 
            this.notificationService,
            this.validationService,
            this.loadingService
        );
        this.dashboardController = new DashboardController(
            this.storageService,
            this.loadingService
        );
        
        // Expõe os serviços globalmente para debugging (apenas em desenvolvimento)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.app = {
                services: {
                    storage: this.storageService,
                    notification: this.notificationService,
                    validation: this.validationService,
                    loading: this.loadingService
                },
                controllers: {
                    ui: this.uiController,
                    entregas: this.entregasController,
                    dashboard: this.dashboardController
                }
            };
        }
        
        // Inicializa a aplicação
        this.init();
    }
    
    async init() {
        try {
            // Mostrar loading inicial
            this.loadingService.show(true);
            
            // Inicializa a interface do usuário
            this.uiController.initNavigation();
            
            // Inicializa os dados iniciais se necessário
            await this.initDadosIniciais();
            
            // Inicializa o dashboard
            this.dashboardController.initCharts();
            
            // Inicializa o módulo de entregas
            this.entregasController.init();
            
            // Oculta o loading inicial
            this.loadingService.hide(true);
            
            // Exibe notificação de boas-vindas
            setTimeout(() => {
                this.notificationService.success('Sistema inicializado com sucesso!');
            }, 500);
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            this.loadingService.hide(true);
            this.notificationService.error('Erro ao inicializar o sistema. Por favor, recarregue a página.');
        }
    }
    
    async initDadosIniciais() {
        return await this.loadingService.execute(async () => {
            // Verifica se já existem dados salvos
            if (!this.storageService.get('entregas')) {
                // Dados iniciais para demonstração
                const dadosIniciais = [
                    {
                        id: 1,
                        data: '2025-03-27',
                        motorista: 'HERBERT',
                        placa: 'KPW 6G44',
                        km: '120',
                        origem: 'GALPÃO',
                        destino: 'SLB ONE SUBSEA',
                        capacidade: '25.000',
                        valor: '25000',
                        pago: true
                    },
                    {
                        id: 2,
                        data: '2025-03-27',
                        motorista: 'HERBERT',
                        placa: 'KPW 6G45',
                        km: '85',
                        origem: 'CRISTIANO',
                        destino: 'TECH OCEAN',
                        capacidade: '25.000',
                        valor: '25000',
                        pago: true
                    },
                    {
                        id: 3,
                        data: '2025-03-28',
                        motorista: 'DENYS',
                        placa: 'KPW 6G44',
                        km: '150',
                        origem: 'GALPÃO',
                        destino: 'SLB ONE SUBSEA',
                        capacidade: '25.000',
                        valor: '25000',
                        pago: false
                    }
                ];
                
                // Salva os dados iniciais
                this.storageService.save('entregas', dadosIniciais);
            }
            
            // Dados iniciais de veículos
            if (!this.storageService.get('veiculos')) {
                const veiculosIniciais = [
                    { id: 1, placa: 'KPW 6G44', modelo: 'Mercedes-Benz Atego', capacidade: '25.000', kmAtual: 45800 },
                    { id: 2, placa: 'KPW 6G45', modelo: 'Mercedes-Benz Atego', capacidade: '25.000', kmAtual: 62300 },
                    { id: 3, placa: 'KPW 6G46', modelo: 'Mercedes-Benz Atego', capacidade: '25.000', kmAtual: 38500 }
                ];
                
                this.storageService.save('veiculos', veiculosIniciais);
            }
            
            // Dados iniciais de funcionários
            if (!this.storageService.get('funcionarios')) {
                const funcionariosIniciais = [
                    { id: 1, nome: 'HERBERT', cargo: 'Motorista', contato: '(21) 99999-8888', dataAdmissao: '2020-01-15' },
                    { id: 2, nome: 'DENYS', cargo: 'Motorista', contato: '(21) 99999-7777', dataAdmissao: '2019-05-10' }
                ];
                
                this.storageService.save('funcionarios', funcionariosIniciais);
            }
        });
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    navigation.init();
}); 