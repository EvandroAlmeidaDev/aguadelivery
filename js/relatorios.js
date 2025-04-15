// relatorios.js - Arquivo principal de inicialização

// Esperamos o DOM estar pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando página de relatórios...');
    
    // Garantir que os módulos sejam inicializados na ordem correta
    function inicializarModulos() {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('Verificando disponibilidade dos módulos...');
                
                // Esperar que os módulos sejam carregados
                let tentativas = 0;
                const maxTentativas = 10;
                
                while (tentativas < maxTentativas) {
                    if (window.relatoriosCore && 
                        window.relatoriosPDF && 
                        window.relatoriosEnvios && 
                        window.relatoriosUI) {
                        
                        // Todos os módulos estão carregados
                        break;
                    }
                    
                    console.log(`Aguardando módulos... (${tentativas + 1}/${maxTentativas})`);
                    tentativas++;
                    
                    // Esperar 200ms antes de verificar novamente
                    await new Promise(r => setTimeout(r, 200));
                }
                
                // Verificar novamente se os módulos estão disponíveis
                if (!window.relatoriosCore || 
                    !window.relatoriosPDF || 
                    !window.relatoriosEnvios || 
                    !window.relatoriosUI) {
                    
                    console.error('Erro: Nem todos os módulos foram carregados corretamente');
                    console.log('relatoriosCore:', !!window.relatoriosCore);
                    console.log('relatoriosPDF:', !!window.relatoriosPDF);
                    console.log('relatoriosEnvios:', !!window.relatoriosEnvios);
                    console.log('relatoriosUI:', !!window.relatoriosUI);
                    
                    reject(new Error('Falha no carregamento dos módulos'));
                    return;
                }
                
                // Carregar sidebar manualmente para garantir que esteja disponível
                if (typeof carregarSidebar === 'function') {
                    carregarSidebar();
                } else {
                    console.warn('função carregarSidebar não disponível');
                }
                
                // Inicializar interfaces na ordem correta
                await relatoriosUI.loadComponents();
                console.log('Componentes carregados');
                
                // Forçar a visibilidade da primeira aba
                const primeiraAba = document.querySelector('.tab-pane');
                if (primeiraAba) {
                    primeiraAba.style.display = 'block';
                } else {
                    console.warn('Aba não encontrada para ativar');
                }
                
                // Inicializar abas primeiro
                relatoriosUI.inicializarAbas();
                
                // Configurar eventos após as abas estarem inicializadas
                if (typeof relatoriosUI.configurarEventos === 'function') {
                    relatoriosUI.configurarEventos();
                } else {
                    console.warn('Método configurarEventos não encontrado');
                }
                
                // Carregar dados somente depois que a UI estiver pronta
                if (typeof relatoriosUI.carregarEmpresas === 'function') {
                    await relatoriosUI.carregarEmpresas();
                } else {
                    console.warn('Método carregarEmpresas não encontrado');
                }
                
                if (typeof relatoriosEnvios.carregarTabelaControleEnvios === 'function') {
                    await relatoriosEnvios.carregarTabelaControleEnvios();
                } else {
                    console.warn('Método carregarTabelaControleEnvios não encontrado');
                }
                
                // Verificar se há elementos visíveis
                const content = document.getElementById('content');
                if (content) {
                    content.style.display = 'block';
                    content.style.visibility = 'visible';
                }
                
                console.log('Página de relatórios inicializada com sucesso!');
                resolve();
            } catch (error) {
                console.error('Erro fatal na inicialização:', error);
                reject(error);
            }
        });
    }
    
    // Inicializar a página
    inicializarModulos()
        .catch(error => {
            console.error('Erro ao carregar componentes:', error);
            alert('Ocorreu um erro ao inicializar a página. Por favor, recarregue.');
        });
}); 