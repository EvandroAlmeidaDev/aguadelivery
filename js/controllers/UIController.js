/**
 * Controlador para gerenciar a interface do usuário
 */
export class UIController {
    constructor(notificationService) {
        this.notificationService = notificationService;
        
        // Referências para os elementos da navegação
        this.menuLinks = document.querySelectorAll('.menu a');
        this.pages = document.querySelectorAll('.page');
        
        // Referências para a tabela excel
        this.sortableHeaders = document.querySelectorAll('.sortable');
        this.exportExcelBtn = document.getElementById('exportExcelBtn');
        this.printBtn = document.getElementById('printBtn');
        this.clearFiltersBtn = document.getElementById('clearFiltersBtn');
        
        // Estado da UI
        this.currentSort = {
            column: null,
            direction: 'asc'
        };
        
        // Referências aos modais de abas
        this.tabNavs = document.querySelectorAll('.tab-nav-item');
        
        // Referência ao sidebar e toggle
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarToggleBtn = null;
        
        // Estado de tamanho da tela
        this.isMobile = window.innerWidth < 992;
    }
    
    /**
     * Inicializa os eventos de navegação
     */
    initNavigation() {
        // Adiciona evento de clique para os links do menu
        this.menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove a classe 'active' de todos os links
                this.menuLinks.forEach(l => l.classList.remove('active'));
                
                // Adiciona a classe 'active' ao link clicado
                link.classList.add('active');
                
                // Obtém o ID da página a ser exibida
                const pageId = link.getAttribute('data-page');
                
                // Exibe a página correspondente
                this.showPage(pageId);
                
                // Em dispositivos móveis, fecha o menu após a seleção
                if (this.isMobile) {
                    document.body.classList.remove('menu-open');
                }
            });
        });
        
        // Inicializa a navegação por abas nos formulários
        this.initTabNavigation();
        
        // Inicializa os eventos da tabela
        this.initTableEvents();
        
        // Inicializa o controle de sidebar responsiva
        this.initSidebarControl();
        
        // Adiciona listener para redimensionamento da janela
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    /**
     * Inicializa o controle da sidebar responsiva
     */
    initSidebarControl() {
        // Cria o botão de toggle se não existir
        if (!this.sidebarToggleBtn) {
            this.sidebarToggleBtn = document.createElement('button');
            this.sidebarToggleBtn.classList.add('sidebar-toggle');
            this.sidebarToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.appendChild(this.sidebarToggleBtn);
            
            // Evento de toggle da sidebar
            this.sidebarToggleBtn.addEventListener('click', () => {
                if (this.isMobile) {
                    document.body.classList.toggle('menu-open');
                } else {
                    document.body.classList.toggle('sidebar-collapsed');
                    
                    // Altera o ícone do botão
                    if (document.body.classList.contains('sidebar-collapsed')) {
                        this.sidebarToggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                    } else {
                        this.sidebarToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                }
            });
        }
        
        // Verifica o estado inicial
        this.handleResize();
    }
    
    /**
     * Manipula o redimensionamento da janela
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 992;
        
        // Se mudou de mobile para desktop ou vice-versa
        if (wasMobile !== this.isMobile) {
            // Remove classes específicas
            document.body.classList.remove('menu-open', 'sidebar-collapsed');
            
            // Atualiza ícone do botão
            if (this.sidebarToggleBtn) {
                this.sidebarToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    }
    
    /**
     * Exibe a página correspondente ao ID
     * @param {string} pageId - ID da página a ser exibida
     */
    showPage(pageId) {
        // Oculta todas as páginas
        this.pages.forEach(page => page.classList.remove('active'));
        
        // Exibe a página correspondente
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('active');
            
            // Atualiza a URL com um hash para permitir navegação direta
            window.location.hash = pageId;
            
            // Scroll para o topo
            window.scrollTo(0, 0);
            
            // Ativa funcionalidades específicas da página
            this.activatePageFeatures(pageId);
        }
    }
    
    /**
     * Ativa funcionalidades específicas de cada página
     * @param {string} pageId - ID da página atual
     */
    activatePageFeatures(pageId) {
        // Funções específicas com base na página atual
        switch (pageId) {
            case 'dashboard':
                // Se o controlador de dashboard estiver disponível globalmente
                if (window.app && window.app.controllers.dashboard) {
                    window.app.controllers.dashboard.atualizarDashboard();
                }
                break;
                
            case 'entregas':
                // Atualiza a tabela de entregas se necessário
                break;
                
            case 'financeiro':
                // Ativa funcionalidades da página financeiro
                break;
                
            case 'frota':
                // Ativa funcionalidades da página frota
                break;
                
            case 'funcionarios':
                // Ativa funcionalidades da página funcionários
                break;
                
            case 'relatorios':
                // Ativa funcionalidades da página relatórios
                break;
        }
    }
    
    /**
     * Inicializa a navegação inicial com base na URL
     */
    initFromUrl() {
        // Verifica se há hash na URL
        if (window.location.hash) {
            const pageId = window.location.hash.substring(1);
            const pageExists = Array.from(this.pages).some(page => page.id === pageId);
            
            if (pageExists) {
                // Encontra o link correto no menu e simula um clique
                const menuLink = Array.from(this.menuLinks).find(link => link.getAttribute('data-page') === pageId);
                if (menuLink) {
                    menuLink.click();
                } else {
                    // Fallback se o link não for encontrado
                    this.showPage(pageId);
                }
            }
        }
    }
    
    /**
     * Inicializa a navegação por abas nos formulários
     */
    initTabNavigation() {
        this.tabNavs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove a classe 'active' de todas as abas
                const parentNav = tab.closest('.tab-nav');
                if (!parentNav) return;
                
                const tabs = parentNav.querySelectorAll('.tab-nav-item');
                tabs.forEach(t => t.classList.remove('active'));
                
                // Adiciona a classe 'active' à aba clicada
                tab.classList.add('active');
                
                // Obtém o ID do conteúdo a ser exibido
                const tabContentId = tab.getAttribute('data-tab');
                
                // Oculta todos os conteúdos
                const tabContents = tab.closest('.form-tabs').querySelectorAll('.tab-content');
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Exibe o conteúdo correspondente
                const tabContent = document.getElementById(tabContentId);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            });
        });
    }
    
    /**
     * Inicializa os eventos da tabela
     */
    initTableEvents() {
        // Ordenação de colunas
        if (this.sortableHeaders) {
            this.sortableHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    this.sortTable(header);
                });
            });
        }
        
        // Exportação para Excel
        if (this.exportExcelBtn) {
            this.exportExcelBtn.addEventListener('click', () => {
                this.exportToExcel();
            });
        }
        
        // Impressão
        if (this.printBtn) {
            this.printBtn.addEventListener('click', () => {
                this.printTable();
            });
        }
        
        // Limpar filtros
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }
    
    /**
     * Ordena a tabela com base no cabeçalho clicado
     * @param {HTMLElement} header - O cabeçalho clicado
     */
    sortTable(header) {
        const column = header.getAttribute('data-sort');
        const table = header.closest('table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr:not(.details-row)'));
        
        // Limpa classes de ordenação de todos os cabeçalhos
        this.sortableHeaders.forEach(h => {
            h.classList.remove('asc', 'desc');
        });
        
        // Determina a direção da ordenação
        let direction = 'asc';
        if (this.currentSort.column === column) {
            direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        }
        
        // Atualiza o estado de ordenação atual
        this.currentSort.column = column;
        this.currentSort.direction = direction;
        
        // Adiciona a classe correspondente à direção
        header.classList.add(direction);
        
        // Ordena as linhas
        rows.sort((a, b) => {
            // Encontra o índice da coluna
            const headerIndex = Array.from(header.parentNode.children).indexOf(header);
            
            // Obtém os valores das células
            let aValue = a.children[headerIndex].textContent.trim();
            let bValue = b.children[headerIndex].textContent.trim();
            
            // Conversão para data, se for coluna de data
            if (column === 'data' || column === 'dataPagamento') {
                const aDate = this.parseDate(aValue);
                const bDate = this.parseDate(bValue);
                
                return direction === 'asc' ? aDate - bDate : bDate - aDate;
            }
            
            // Conversão para número, se for coluna numérica
            if (column === 'valor' || column === 'km' || column === 'capacidade') {
                aValue = this.parseNumber(aValue);
                bValue = this.parseNumber(bValue);
                
                return direction === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            // Comparação para status de pagamento
            if (column === 'pago') {
                const aStatus = a.querySelector('.toggle-status').classList.contains('active');
                const bStatus = b.querySelector('.toggle-status').classList.contains('active');
                
                return direction === 'asc' ? aStatus - bStatus : bStatus - aStatus;
            }
            
            // Comparação de texto para outras colunas
            return direction === 'asc'
                ? aValue.localeCompare(bValue, 'pt-BR')
                : bValue.localeCompare(aValue, 'pt-BR');
        });
        
        // Remove todas as linhas de detalhes existentes
        tbody.querySelectorAll('.details-row').forEach(row => row.remove());
        
        // Remove a classe 'expanded' de todas as linhas
        rows.forEach(row => row.classList.remove('expanded'));
        
        // Reinsere as linhas ordenadas
        rows.forEach(row => {
            tbody.appendChild(row);
        });
        
        // Notificação
        this.notificationService.info(`Tabela ordenada por ${header.textContent.trim()} em ordem ${direction === 'asc' ? 'crescente' : 'decrescente'}`);
    }
    
    /**
     * Exporta a tabela para Excel
     */
    exportToExcel() {
        this.notificationService.info('Preparando exportação para Excel...');
        
        // Obter a tabela
        const table = document.getElementById('tabelaEntregas');
        if (!table) return;
        
        try {
            // Criar um array para armazenar os dados
            const data = [];
            
            // Cabeçalhos
            const headers = [];
            table.querySelectorAll('thead th').forEach(th => {
                // Remove o ícone de ordenação do texto
                const headerText = th.textContent.replace(/[▲▼]|[↑↓]|\s*\u25B2\s*|\s*\u25BC\s*/, '').trim();
                headers.push(headerText);
            });
            data.push(headers);
            
            // Linhas de dados (ignorando a coluna de ações)
            table.querySelectorAll('tbody tr:not(.details-row)').forEach(tr => {
                const rowData = [];
                tr.querySelectorAll('td').forEach((td, index) => {
                    // Pula a coluna de ações (última coluna)
                    if (index < headers.length - 1) {
                        // Para o status de pagamento, verificamos a classe do toggle
                        if (index === 8) { // Índice da coluna "Pago"
                            const toggleStatus = td.querySelector('.toggle-status');
                            rowData.push(toggleStatus?.classList.contains('active') ? 'Sim' : 'Não');
                        } else {
                            rowData.push(td.textContent.trim());
                        }
                    }
                });
                data.push(rowData);
            });
            
            // Criação de um workbook e worksheet
            const ws = this.createWorksheet(data);
            const wb = this.createWorkbook(ws, 'Entregas');
            
            // Criação de um blob com os dados
            const wbout = this.generateWorkbookBlob(wb);
            
            // Criação de um link para download
            const url = URL.createObjectURL(new Blob([wbout], { type: 'application/octet-stream' }));
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `Controle_Entregas_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            // Trigger do download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            this.notificationService.success('Arquivo Excel gerado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar para Excel:', error);
            this.notificationService.error('Erro ao exportar para Excel. Por favor, tente novamente.');
        }
    }
    
    /**
     * Cria uma worksheet a partir de dados
     * @param {Array} data - Dados para a worksheet
     * @returns {Object} - Objeto worksheet
     */
    createWorksheet(data) {
        // Esta é uma função stub - na implementação real, você usaria
        // uma biblioteca como SheetJS/xlsx para criar uma worksheet
        // Aqui, apenas simulamos a funcionalidade
        console.log('Criando worksheet com os dados:', data);
        return { data };
    }
    
    /**
     * Cria um workbook a partir de uma worksheet
     * @param {Object} ws - Worksheet
     * @param {string} sheetName - Nome da planilha
     * @returns {Object} - Objeto workbook
     */
    createWorkbook(ws, sheetName) {
        // Esta é uma função stub - na implementação real, você usaria
        // uma biblioteca como SheetJS/xlsx para criar um workbook
        console.log('Criando workbook com a worksheet:', ws);
        return { 
            SheetNames: [sheetName], 
            Sheets: { [sheetName]: ws } 
        };
    }
    
    /**
     * Gera um blob a partir de um workbook
     * @param {Object} wb - Workbook
     * @returns {Uint8Array} - Dados binários do workbook
     */
    generateWorkbookBlob(wb) {
        // Esta é uma função stub - na implementação real, você usaria
        // uma biblioteca como SheetJS/xlsx para gerar o blob
        console.log('Gerando blob para o workbook:', wb);
        return new Uint8Array([]);
    }
    
    /**
     * Imprime a tabela
     */
    printTable() {
        this.notificationService.info('Preparando impressão...');
        
        try {
            // Abrir uma nova janela para impressão
            const printWindow = window.open('', '_blank');
            
            // HTML para a janela de impressão
            const table = document.getElementById('tabelaEntregas');
            
            // Estilo CSS para impressão
            const style = `
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #0056b3; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
                th { background-color: #f0f0f0; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .print-header { display: flex; justify-content: space-between; align-items: center; }
                .print-header img { height: 60px; }
                .print-date { margin-top: 10px; text-align: right; font-size: 12px; color: #777; }
                .print-footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
            `;
            
            // Clone da tabela (excluindo a coluna de ações e linhas de detalhes)
            const tableClone = table.cloneNode(true);
            
            // Remover a coluna de ações e linhas de detalhes
            const actionCells = tableClone.querySelectorAll('th:last-child, td:last-child');
            actionCells.forEach(cell => cell.remove());
            
            const detailsRows = tableClone.querySelectorAll('.details-row');
            detailsRows.forEach(row => row.remove());
            
            // Converter os toggles de status para texto
            const toggleStatuses = tableClone.querySelectorAll('.toggle-status');
            toggleStatuses.forEach(toggle => {
                const td = toggle.closest('td');
                td.innerHTML = toggle.classList.contains('active') ? 'Sim' : 'Não';
            });
            
            // Criar conteúdo HTML para impressão
            const html = `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <title>Controle de Entregas - Impressão</title>
                    <style>${style}</style>
                </head>
                <body>
                    <div class="print-header">
                        <h1>Controle de Entregas</h1>
                        <div class="company-info">
                            <p>Água Delivery</p>
                        </div>
                    </div>
                    <div class="print-date">
                        Data de impressão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
                    </div>
                    ${tableClone.outerHTML}
                    <div class="print-footer">
                        <p>© ${new Date().getFullYear()} Água Delivery - Todos os direitos reservados</p>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 500);
                        }
                    </script>
                </body>
                </html>
            `;
            
            // Escrever o HTML na nova janela
            printWindow.document.write(html);
            printWindow.document.close();
        } catch (error) {
            console.error('Erro ao preparar impressão:', error);
            this.notificationService.error('Erro ao preparar impressão. Por favor, tente novamente.');
        }
    }
    
    /**
     * Limpa todos os filtros da tabela
     */
    clearFilters() {
        // Resetar filtros de data
        const filtroData = document.getElementById('filtroData');
        if (filtroData) filtroData.value = '';
        
        // Resetar filtros de seleção
        const selects = document.querySelectorAll('.filters select');
        selects.forEach(select => select.value = '');
        
        // Disparar evento para recarregar a tabela
        const event = new Event('change');
        if (filtroData) filtroData.dispatchEvent(event);
        
        this.notificationService.info('Filtros limpos com sucesso');
    }
    
    /**
     * Lida com as ferramentas de formatação Excel-like
     * @param {HTMLElement} btn - Botão da ferramenta
     */
    handleExcelTool(btn) {
        const title = btn.getAttribute('title');
        this.notificationService.info(`Funcionalidade "${title}" em desenvolvimento`);
    }
    
    /**
     * Calcula a soma de valores selecionados
     */
    calculateSum() {
        this.notificationService.info('Funcionalidade "Soma Automática" em desenvolvimento');
    }
    
    /**
     * Parse de data para comparação
     * @param {string} dateStr - String da data
     * @returns {number} - Timestamp para comparação
     */
    parseDate(dateStr) {
        if (dateStr === '-') return 0;
        
        // Formatos possíveis: DD/MM/YYYY ou YYYY-MM-DD
        let date;
        
        if (dateStr.includes('/')) {
            // Formato DD/MM/YYYY
            const parts = dateStr.split('/');
            date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else if (dateStr.includes('-')) {
            // Formato YYYY-MM-DD
            date = new Date(dateStr);
        } else {
            return 0;
        }
        
        return date.getTime();
    }
    
    /**
     * Parse de número para comparação
     * @param {string} numStr - String do número
     * @returns {number} - Número para comparação
     */
    parseNumber(numStr) {
        // Remove formatação monetária e outros caracteres não numéricos
        return parseFloat(numStr.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
    }
} 