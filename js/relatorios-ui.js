// relatorios-ui.js - Funções para manipulação da interface e eventos

// Módulo para interface do usuário na página de relatórios
window.relatoriosUI = (() => {
    // Cache de elementos DOM
    const elementos = {
        empresaSelect: document.getElementById('empresa'),
        dataInicio: document.getElementById('data-inicio'),
        dataFim: document.getElementById('data-fim'),
        assuntoInput: document.getElementById('assunto'),
        mensagemTextarea: document.getElementById('mensagem'),
        enviarEmailCheck: document.getElementById('enviar-email'),
        visualizarBtn: document.getElementById('visualizar-relatorio'),
        formRelatorio: document.getElementById('relatorio-form'),
        previewContainer: document.getElementById('preview-container'),
        relatorioPreview: document.getElementById('relatorio-preview'),
        
        // Elementos de controle de envios
        buscaEmpresa: document.getElementById('busca-empresa'),
        filtroStatus: document.getElementById('filtro-status'),
        tabelaEnvios: document.getElementById('tabela-controle-envios'),
        emptyStateEnvios: document.getElementById('empty-state-envios'),
        
        // Elementos de configuração
        btnConfigDatas: document.getElementById('btn-config-datas'),
        modalConfigDatas: document.getElementById('modal-config-datas'),
        formConfigDatas: document.getElementById('form-config-datas'),
        configEmpresa: document.getElementById('config-empresa'),
        configDiaEnvio: document.getElementById('config-dia-envio'),
        configDiasAviso: document.getElementById('config-dias-aviso'),
        configAtiva: document.getElementById('config-ativa'),
        btnSalvarConfig: document.getElementById('btn-salvar-config'),
        closeModalBtns: document.querySelectorAll('[data-dismiss="modal"]')
    };

    // Função para atualizar o relógio em tempo real
    function atualizarRelogio() {
        try {
            const datetimeElement = document.getElementById('datetime');
            
            if (!datetimeElement) {
                console.warn('Elemento datetime não encontrado no DOM');
                return;
            }
            
            const agora = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            datetimeElement.textContent = agora.toLocaleDateString('pt-BR', options);
            
            // Atualiza a cada minuto
            setTimeout(atualizarRelogio, 60000);
        } catch (error) {
            console.error('Erro ao atualizar relógio:', error);
        }
    }

    // Inicializa as abas
    function inicializarAbas() {
        try {
            console.log("Inicializando sistema de abas");
            const navLinks = document.querySelectorAll('.nav-link');
            const tabPanes = document.querySelectorAll('.tab-pane');
            
            if (navLinks.length === 0) {
                console.error("Nenhum link de navegação encontrado");
                return;
            }
            
            if (tabPanes.length === 0) {
                console.error("Nenhum painel de aba encontrado");
                return;
            }
            
            console.log(`Encontrados ${navLinks.length} links e ${tabPanes.length} painéis de abas`);
            
            // Primeiro, garantir que apenas a primeira aba esteja ativa inicialmente
            navLinks.forEach((link, index) => {
                if (index === 0) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
            
            tabPanes.forEach((pane, index) => {
                if (index === 0) {
                    pane.classList.add('active');
                    pane.style.display = 'block';
                } else {
                    pane.classList.remove('active');
                    pane.style.display = 'none';
                }
            });
            
            // Adicionar eventos de clique para cada aba
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const targetId = link.getAttribute('href').substring(1);
                    console.log(`Clique na aba ${targetId}`);
                    
                    // Remover classes ativas de todos os links e painéis
                    navLinks.forEach(l => l.classList.remove('active'));
                    tabPanes.forEach(p => {
                        p.classList.remove('active');
                        p.style.display = 'none';
                    });
                    
                    // Adicionar classe ativa ao link clicado
                    link.classList.add('active');
                    
                    // Ativar o painel correspondente
                    const targetPane = document.getElementById(targetId);
                    if (targetPane) {
                        targetPane.classList.add('active');
                        targetPane.style.display = 'block';
                        console.log(`Painel ${targetId} ativado`);
                    } else {
                        console.error(`Painel com ID ${targetId} não encontrado`);
                    }
                });
            });
            
            console.log("Sistema de abas inicializado com sucesso");
        } catch (error) {
            console.error("Erro ao inicializar abas:", error);
        }
    }

    // Carrega o conteúdo do formulário com dados
    async function carregarFormulario() {
        try {
            // Preenche o select de empresas
            const empresas = await relatoriosCore.getEmpresas();
            
            if (!empresas || !Array.isArray(empresas)) {
                console.error('Erro: getEmpresas não retornou um array válido', empresas);
                return;
            }
            
            elementos.empresaSelect.innerHTML = '<option value="" selected disabled>Selecione uma empresa</option>';
            empresas.forEach(empresa => {
                const option = document.createElement('option');
                option.value = empresa.id;
                option.textContent = empresa.nome;
                elementos.empresaSelect.appendChild(option);
            });
            
            // Define datas padrão (mês atual)
            const hoje = new Date();
            const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            
            elementos.dataInicio.valueAsDate = primeiroDiaMes;
            elementos.dataFim.valueAsDate = ultimoDiaMes;
            
            // Define assunto padrão
            const mesAno = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            elementos.assuntoInput.value = `Relatório de Abastecimento - ${mesAno}`;
        } catch (error) {
            console.error('Erro ao carregar formulário:', error);
        }
    }

    // Mostra a prévia do relatório
    function mostrarPreviewRelatorio() {
        const empresaId = elementos.empresaSelect.value;
        const dataInicio = elementos.dataInicio.value;
        const dataFim = elementos.dataFim.value;
        
        if (!empresaId || !dataInicio || !dataFim) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        try {
            const conteudoHTML = relatoriosPDF.gerarConteudoHTML(empresaId, dataInicio, dataFim);
            elementos.relatorioPreview.innerHTML = conteudoHTML;
            elementos.previewContainer.style.display = 'block';
            
            // Rola até a prévia
            elementos.previewContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Erro ao gerar prévia:', error);
            alert('Ocorreu um erro ao gerar a prévia do relatório.');
        }
    }

    // Inicializa o modal de configuração
    async function inicializarModalConfig() {
        try {
            // Preenche o select de empresas na configuração
            const empresas = await relatoriosCore.getEmpresas();
            
            if (!empresas || !Array.isArray(empresas)) {
                console.error('Erro: getEmpresas não retornou um array válido para o modal', empresas);
                return;
            }
            
            elementos.configEmpresa.innerHTML = '';
            
            empresas.forEach(empresa => {
                const option = document.createElement('option');
                option.value = empresa.id;
                option.textContent = empresa.nome;
                elementos.configEmpresa.appendChild(option);
            });
            
            // Event listener para abrir modal
            elementos.btnConfigDatas.addEventListener('click', () => {
                elementos.modalConfigDatas.style.display = 'block';
            });
            
            // Event listeners para fechar modal
            elementos.closeModalBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    elementos.modalConfigDatas.style.display = 'none';
                });
            });
            
            // Fechar modal clicando fora
            window.addEventListener('click', (e) => {
                if (e.target === elementos.modalConfigDatas) {
                    elementos.modalConfigDatas.style.display = 'none';
                }
            });
            
            // Salvar configuração
            elementos.btnSalvarConfig.addEventListener('click', () => {
                if (elementos.formConfigDatas.checkValidity()) {
                    const config = {
                        empresaId: elementos.configEmpresa.value,
                        diaEnvio: parseInt(elementos.configDiaEnvio.value),
                        diasAviso: parseInt(elementos.configDiasAviso.value),
                        ativa: elementos.configAtiva.checked
                    };
                    
                    relatoriosEnvios.salvarConfiguracao(config);
                    elementos.modalConfigDatas.style.display = 'none';
                    
                    // Recarregar tabela
                    relatoriosEnvios.carregarTabelaControleEnvios();
                } else {
                    alert('Por favor, preencha todos os campos obrigatórios.');
                }
            });
        } catch (error) {
            console.error('Erro ao inicializar modal de configuração:', error);
        }
    }

    // Configura os event listeners
    function configurarEventListeners() {
        // Visualizar relatório
        elementos.visualizarBtn.addEventListener('click', mostrarPreviewRelatorio);
        
        // Enviar relatório
        elementos.formRelatorio.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const empresaId = elementos.empresaSelect.value;
            const dataInicio = elementos.dataInicio.value;
            const dataFim = elementos.dataFim.value;
            const assunto = elementos.assuntoInput.value;
            const mensagem = elementos.mensagemTextarea.value;
            const enviarEmail = elementos.enviarEmailCheck.checked;
            
            if (!empresaId || !dataInicio || !dataFim || !assunto) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            try {
                // Gera o PDF
                const pdfBlob = await relatoriosPDF.gerarPDF(
                    empresaId, 
                    dataInicio, 
                    dataFim
                );
                
                if (enviarEmail) {
                    // Envia por e-mail
                    const enviado = await relatoriosPDF.enviarRelatorioPorEmail(
                        empresaId,
                        pdfBlob,
                        assunto,
                        mensagem
                    );
                    
                    if (enviado) {
                        alert('Relatório gerado e enviado com sucesso!');
                        
                        // Registra o envio
                        relatoriosPDF.registrarEnvio(empresaId);
                    } else {
                        alert('Não foi possível enviar o relatório. Verifique os dados e tente novamente.');
                    }
                } else {
                    // Apenas faz download
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(pdfBlob);
                    
                    link.href = url;
                    link.download = `Relatório_${dataInicio}_a_${dataFim}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    alert('Relatório gerado com sucesso!');
                }
            } catch (error) {
                console.error('Erro ao gerar ou enviar relatório:', error);
                alert('Ocorreu um erro ao gerar ou enviar o relatório.');
            }
        });
        
        // Configurar filtros e busca
        elementos.buscaEmpresa.addEventListener('input', () => {
            const termo = elementos.buscaEmpresa.value.toLowerCase();
            const status = elementos.filtroStatus.value;
            
            relatoriosEnvios.filtrarTabelaEnvios(termo, status);
        });
        
        elementos.filtroStatus.addEventListener('change', () => {
            const termo = elementos.buscaEmpresa.value.toLowerCase();
            const status = elementos.filtroStatus.value;
            
            relatoriosEnvios.filtrarTabelaEnvios(termo, status);
        });
    }

    // Carrega os componentes necessários
    async function loadComponents() {
        try {
            console.log("Carregando componentes...");
            
            // Carrega o sidebar se a função existir
            if (typeof carregarSidebar === 'function') {
                await carregarSidebar();
                console.log("Sidebar carregada com sucesso");
            } else {
                console.error("Função carregarSidebar não encontrada!");
            }
            
            // Inicia o relógio
            atualizarRelogio();
            
            // Resolve a promise quando os componentes forem carregados
            return Promise.resolve();
        } catch (error) {
            console.error("Erro ao carregar componentes:", error);
            return Promise.reject(error);
        }
    }

    // Inicializa a UI
    async function inicializar() {
        try {
            await loadComponents();
            
            // Verificar se os elementos críticos existem
            console.log("Verificando elementos DOM...");
            const empresaSelect = document.getElementById('empresa');
            const tabsContent = document.querySelector('.tab-content');
            const tabPane = document.querySelector('.tab-pane');
            
            console.log("Elementos críticos:", {
                'select empresas': empresaSelect ? 'OK' : 'NÃO ENCONTRADO',
                'tab content': tabsContent ? 'OK' : 'NÃO ENCONTRADO',
                'tab pane': tabPane ? 'OK' : 'NÃO ENCONTRADO',
                'wrapper': document.querySelector('.wrapper') ? 'OK' : 'NÃO ENCONTRADO',
                'sidebar': document.querySelector('.sidebar') ? 'OK' : 'NÃO ENCONTRADO',
                'content': document.getElementById('content') ? 'OK' : 'NÃO ENCONTRADO'
            });
            
            // Tentar forçar a visibilidade do conteúdo
            if (tabsContent) {
                tabsContent.style.display = 'block';
                console.log("Forçando visibilidade do conteúdo das abas");
            }
            
            if (tabPane) {
                tabPane.style.display = 'block';
                console.log("Forçando visibilidade do primeiro painel de aba");
            }
            
            // Inicializa os componentes da UI
            inicializarAbas();
            await carregarFormulario();
            await inicializarModalConfig();
            configurarEventListeners();
            
            console.log("Interface de relatórios inicializada com sucesso");
        } catch (error) {
            console.error("Erro ao inicializar interface de relatórios:", error);
            alert("Erro ao carregar a interface. Por favor, recarregue a página.");
        }
    }

    // API pública do módulo
    return {
        inicializar,
        inicializarAbas,
        atualizarRelogio,
        loadComponents,
        configurarEventos: configurarEventListeners,
        configurarEventListeners,
        carregarEmpresas: carregarFormulario
    };
})();

// Verifica se o DOM já foi carregado e inicializa
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM carregado, inicializando interface de relatórios...");
    try {
        relatoriosUI.inicializar();
    } catch (e) {
        console.error("Erro ao inicializar a UI:", e);
        alert("Ocorreu um erro ao inicializar a página. Por favor, recarregue.");
    }
}); 