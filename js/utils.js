/**
 * utils.js - Funções utilitárias para o sistema
 */

// Objeto global com funções utilitárias
const utilsModule = {
    // Inicialização de modais
    inicializarModais: function() {
        console.log('Inicializando modais...');
        
        // Listar todos os modais disponíveis
        const modais = document.querySelectorAll('.modal');
        console.log(`Modais encontrados (${modais.length}):`, Array.from(modais).map(m => m.id || 'sem-id'));
        
        // Verificar se o overlay existe, se não, criar
        let overlay = document.querySelector('.modal-overlay');
        if (!overlay) {
            console.log('Criando modal-overlay');
            overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }
        
        // Configurar botão "Novo Veículo"
        const btnNovoVeiculo = document.getElementById('btn-novo-veiculo');
        if (btnNovoVeiculo) {
            console.log('Botão Novo Veículo encontrado!');
            btnNovoVeiculo.addEventListener('click', function(event) {
                console.log('Evento de clique no botão Novo Veículo');
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                
                const modal = document.getElementById('modal-veiculo');
                console.log('Modal de veículo encontrado?', !!modal);
                
                if (modal) {
                    console.log('Abrindo modal de veículo diretamente');
                    utilsModule.abrirModal('modal-veiculo');
                } else {
                    console.error('Modal de veículo não encontrado');
                }
            });
        } else {
            console.log('Botão Novo Veículo não encontrado');
        }
        
        // Configurar botões de fechar modais
        const botoesFechar = document.querySelectorAll('.btn-fechar, #btn-cancelar, #btn-cancelar-exclusao');
        console.log(`Botões de fechar encontrados: ${botoesFechar.length}`);
        
        botoesFechar.forEach(function(botao) {
            botao.addEventListener('click', function(event) {
                console.log('Evento de clique no botão fechar:', botao.id || 'sem-id');
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                
                utilsModule.fecharTodosModais();
            });
        });
        
        // Configurar overlay para fechar modais ao clicar fora
        overlay.addEventListener('click', function(event) {
            console.log('Evento de clique no overlay');
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            utilsModule.fecharTodosModais();
        });
    },
    
    // Função para abrir um modal específico
    abrirModal: function(modalId) {
        console.log(`abrirModal chamado com modalId: ${modalId}`);
        
        let modalElem;
        
        if (typeof modalId === 'string') {
            // Se for um ID, então obtém o elemento
            if (!modalId.startsWith('#')) {
                modalId = `#${modalId}`;
            }
            modalElem = document.querySelector(modalId);
            console.log(`Buscando modal por ID: ${modalId}, encontrado:`, !!modalElem);
        } else if (modalId instanceof HTMLElement) {
            // Se já for um elemento HTML
            modalElem = modalId;
            console.log('Modal já é um elemento HTML');
        }
        
        if (!modalElem) {
            console.error(`Modal não encontrado com ID: ${modalId}`);
            return;
        }
        
        // Garantir que o overlay exista
        let overlay = document.querySelector('.modal-overlay');
        if (!overlay) {
            console.log('Criando overlay para abrir modal');
            overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }
        
        // Mostrar o overlay e o modal
        console.log('Exibindo overlay e modal');
        overlay.style.display = 'block';
        modalElem.style.display = 'block';
        
        // Adicionar classe active para estilização
        modalElem.classList.add('active');
        overlay.classList.add('active');
        
        console.log('Modal aberto com sucesso');
    },
    
    // Função para fechar um modal específico
    fecharModal: function(modalId) {
        console.log("Utils: fecharModal chamado para", modalId);
        
        // Se não for fornecido um ID, usa o padrão
        if (!modalId) {
            modalId = 'modal';
        }
        
        // Garantir que o seletor esteja no formato correto
        const selector = modalId.startsWith('#') ? modalId : `#${modalId}`;
        const modal = document.querySelector(selector);
        
        if (modal) {
            console.log("Utils: Escondendo modal", selector);
            modal.style.display = 'none';
            modal.classList.remove('active');
            
            // Verificar se há outros modais abertos antes de ocultar o overlay
            const modaisAbertos = document.querySelectorAll('.modal[style*="display: block"], .modal.active');
            console.log("Utils: Modais ainda abertos:", modaisAbertos.length);
            
            if (modaisAbertos.length === 0) {
                const overlay = document.querySelector('.modal-overlay');
                if (overlay) {
                    console.log("Utils: Escondendo overlay");
                    overlay.style.display = 'none';
                    overlay.classList.remove('active');
                }
            }
            
            // Evento personalizado para notificar que o modal foi fechado
            modal.dispatchEvent(new CustomEvent('modalClosed'));
        } else {
            console.warn("Utils: Modal não encontrado:", selector);
        }
    },
    
    // Função para fechar todos os modais
    fecharTodosModais: function() {
        console.log("Utils: fecharTodosModais chamado");
        
        // Fechar todos os modais visíveis
        const modais = document.querySelectorAll('.modal[style*="display: block"], .modal.active');
        modais.forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('active');
            
            // Evento personalizado para notificar que o modal foi fechado
            modal.dispatchEvent(new CustomEvent('modalClosed'));
        });
        
        // Ocultar o overlay
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            overlay.classList.remove('active');
        }
    }
};

// Expor funções globalmente para uso em outros arquivos
window.abrirModal = utilsModule.abrirModal;
window.fecharModal = utilsModule.fecharModal;
window.fecharTodosModais = utilsModule.fecharTodosModais;

// Expor utilsModule globalmente
window.utilsModule = utilsModule;

// Inicializar modais quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.utilsModule.inicializarModais();
}); 