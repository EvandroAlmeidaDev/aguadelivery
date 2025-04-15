/**
 * Controlador para gerenciar as entregas
 */
export class EntregasController {
    constructor(storageService, notificationService, validationService, loadingService) {
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.validationService = validationService;
        this.loadingService = loadingService;
        
        // Elementos do DOM
        this.tabelaEntregas = document.getElementById('tabelaEntregas');
        this.tbody = this.tabelaEntregas ? this.tabelaEntregas.querySelector('tbody') : null;
        this.novaEntregaBtn = document.getElementById('novaEntregaBtn');
        this.entregaModal = document.getElementById('entregaModal');
        this.entregaForm = document.getElementById('entregaForm');
        this.closeModal = document.querySelector('.close');
        this.cancelarEntregaBtn = document.getElementById('cancelarEntrega');
        this.filtroData = document.getElementById('filtroData');
        this.filtroMotorista = document.getElementById('filtroMotorista');
        
        // Guarda o id da entrega em edição
        this.entregaEditando = null;
        
        // Regras de validação do formulário
        this.validationRules = {
            data: {
                required: true
            },
            motorista: {
                required: true
            },
            placa: {
                required: true
            },
            km: {
                min: 0,
                pattern: '^[0-9]+(\\.[0-9]+)?$',
                patternMessage: 'Informe apenas números'
            },
            origem: {
                required: true,
                minLength: 3
            },
            destino: {
                required: true,
                minLength: 3
            },
            capacidade: {
                required: true,
                pattern: '^[0-9]+(\\.[0-9]+)?$',
                patternMessage: 'Informe apenas números'
            },
            valor: {
                required: true,
                custom: (value) => {
                    const numericValue = this.validationService.parseCurrency(value);
                    return numericValue <= 0 ? 'Valor deve ser maior que zero' : null;
                }
            }
        };
    }
    
    /**
     * Inicializa o controlador de entregas
     */
    init() {
        // Inicializa os eventos
        this.initEventListeners();
        
        // Inicializa máscaras de entrada
        this.initInputMasks();
        
        // Carrega os dados iniciais
        this.carregarEntregas();
    }
    
    /**
     * Inicializa os listeners de eventos
     */
    initEventListeners() {
        // Verifica se os elementos existem antes de adicionar os eventos
        if (this.novaEntregaBtn) {
            this.novaEntregaBtn.addEventListener('click', () => this.abrirModalEntrega());
        }
        
        if (this.closeModal) {
            this.closeModal.addEventListener('click', () => this.fecharModalEntrega());
        }
        
        if (this.cancelarEntregaBtn) {
            this.cancelarEntregaBtn.addEventListener('click', () => this.fecharModalEntrega());
        }
        
        // Evento de click fora do modal para fechá-lo
        window.addEventListener('click', (e) => {
            if (e.target === this.entregaModal) {
                this.fecharModalEntrega();
            }
        });
        
        // Evento de envio do formulário
        if (this.entregaForm) {
            this.entregaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarEntrega();
            });
        }
        
        // Eventos de filtro
        if (this.filtroData) {
            this.filtroData.addEventListener('change', () => this.filtrarEntregas());
        }
        
        if (this.filtroMotorista) {
            this.filtroMotorista.addEventListener('change', () => this.filtrarEntregas());
        }
    }
    
    /**
     * Inicializa as máscaras de entrada
     */
    initInputMasks() {
        // Campo de valor monetário
        const valorInput = document.getElementById('valor');
        if (valorInput) {
            valorInput.addEventListener('input', (e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value === '') {
                    e.target.value = '';
                    return;
                }
                
                const numericValue = parseInt(value) / 100;
                e.target.value = numericValue.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            });
        }
        
        // Campo de capacidade
        const capacidadeInput = document.getElementById('capacidade');
        if (capacidadeInput) {
            capacidadeInput.addEventListener('input', (e) => {
                // Remove todos os caracteres não numéricos
                const value = e.target.value.replace(/[^\d,.]/g, '');
                
                // Substitui vírgula por ponto para cálculos
                const numericValue = value.replace(',', '.');
                
                e.target.value = numericValue;
            });
        }
    }
    
    /**
     * Carrega as entregas do armazenamento local
     */
    async carregarEntregas() {
        if (!this.tbody) return;
        
        await this.loadingService.execute(async () => {
            // Limpa a tabela
            this.tbody.innerHTML = '';
            
            // Obtém as entregas do armazenamento local
            const entregas = this.storageService.get('entregas') || [];
            
            // Adiciona as entregas à tabela
            entregas.forEach(entrega => {
                this.adicionarEntregaNaTabela(entrega);
            });
            
            // Se não tiver entregas, mostra uma mensagem
            if (entregas.length === 0) {
                this.notificationService.info('Nenhuma entrega cadastrada.');
            }
        }, false, this.tabelaEntregas?.parentElement);
    }
    
    /**
     * Adiciona uma entrega na tabela
     * @param {Object} entrega - Dados da entrega
     */
    adicionarEntregaNaTabela(entrega) {
        if (!this.tbody) return;
        
        // Cria uma nova linha
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', entrega.id);
        
        // Formata a data
        const dataFormatada = new Date(entrega.data).toLocaleDateString('pt-BR');
        
        // Formata o valor
        const valorFormatado = this.validationService.formatCurrency(entrega.valor);
        
        // Formata data de pagamento (se houver)
        const dataPagamentoFormatada = entrega.dataPagamento ? 
            new Date(entrega.dataPagamento).toLocaleDateString('pt-BR') : '-';
        
        // Define o HTML da linha
        tr.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${entrega.motorista}</td>
            <td>${entrega.placa}</td>
            <td>${entrega.km || '-'}</td>
            <td>${entrega.origem}</td>
            <td>${entrega.destino}</td>
            <td>${entrega.capacidade} L</td>
            <td>${valorFormatado}</td>
            <td>
                <div class="toggle-status ${entrega.pago ? 'active' : ''}" data-id="${entrega.id}"></div>
            </td>
            <td>${dataPagamentoFormatada}</td>
            <td>
                <div class="row-actions">
                    <button class="btn-action view" data-id="${entrega.id}" title="Visualizar"><i class="fas fa-eye"></i></button>
                    <button class="btn-action edit" data-id="${entrega.id}" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-action delete" data-id="${entrega.id}" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        // Adiciona eventos para os botões de ação
        const viewBtn = tr.querySelector('.view');
        const editBtn = tr.querySelector('.edit');
        const deleteBtn = tr.querySelector('.delete');
        const toggleStatusBtn = tr.querySelector('.toggle-status');
        
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede que o clique propague para a linha
                this.visualizarEntrega(entrega.id);
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede que o clique propague para a linha
                this.editarEntrega(entrega.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede que o clique propague para a linha
                this.excluirEntrega(entrega.id);
            });
        }
        
        if (toggleStatusBtn) {
            toggleStatusBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede que o clique propague para a linha
                this.toggleStatusPagamento(entrega.id);
            });
        }
        
        // Adiciona evento de clique na linha para expandir/recolher
        tr.addEventListener('click', () => {
            this.toggleRowDetails(tr, entrega);
        });
        
        // Adiciona a linha na tabela
        this.tbody.appendChild(tr);
        
        // Atualiza os totais
        this.atualizarTotais();
    }
    
    /**
     * Abre o modal para adicionar uma nova entrega
     */
    abrirModalEntrega() {
        if (!this.entregaModal || !this.entregaForm) return;
        
        // Limpa o formulário
        this.entregaForm.reset();
        
        // Define a data atual como padrão
        const dataInput = document.getElementById('data');
        if (dataInput) {
            const hoje = new Date().toISOString().split('T')[0];
            dataInput.value = hoje;
        }
        
        // Reseta o ID da entrega em edição
        this.entregaEditando = null;
        
        // Altera o título do modal
        const modalTitle = this.entregaModal.querySelector('h2');
        if (modalTitle) {
            modalTitle.textContent = 'Nova Entrega';
        }
        
        // Altera o texto do botão
        const submitBtn = this.entregaForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Salvar';
        }
        
        // Mostra o modal
        this.entregaModal.style.display = 'block';
    }
    
    /**
     * Fecha o modal de entrega
     */
    fecharModalEntrega() {
        if (!this.entregaModal) return;
        
        this.entregaModal.style.display = 'none';
    }
    
    /**
     * Salva uma nova entrega ou atualiza uma existente
     */
    async salvarEntrega() {
        if (!this.entregaForm) return;
        
        // Valida o formulário
        const validationResult = this.validationService.validateForm(this.entregaForm, this.validationRules);
        
        if (!validationResult.isValid) {
            this.notificationService.error('Por favor, corrija os erros no formulário.');
            return;
        }
        
        await this.loadingService.execute(async () => {
            // Obtém os dados do formulário
            const data = document.getElementById('data').value;
            const motorista = document.getElementById('motorista').value;
            const placa = document.getElementById('placa').value;
            const km = document.getElementById('km').value || '';
            const origem = document.getElementById('origem').value;
            const destino = document.getElementById('destino').value;
            const capacidade = document.getElementById('capacidade').value;
            const valorFormatado = document.getElementById('valor').value;
            const pago = document.getElementById('pago').checked;
            
            // Converte o valor para número
            const valor = this.validationService.parseCurrency(valorFormatado);
            
            // Cria o objeto de entrega
            const entrega = {
                data,
                motorista,
                placa,
                km,
                origem,
                destino,
                capacidade,
                valor,
                pago
            };
            
            if (this.entregaEditando) {
                // Atualiza a entrega existente
                this.storageService.updateItem('entregas', this.entregaEditando, entrega);
                this.notificationService.success('Entrega atualizada com sucesso!');
            } else {
                // Salva a nova entrega
                this.storageService.addItem('entregas', entrega);
                this.notificationService.success('Entrega cadastrada com sucesso!');
            }
            
            // Recarrega a tabela
            await this.carregarEntregas();
            
            // Fecha o modal
            this.fecharModalEntrega();
        });
    }
    
    /**
     * Edita uma entrega existente
     * @param {number} id - ID da entrega a ser editada
     */
    async editarEntrega(id) {
        if (!this.entregaModal || !this.entregaForm) return;
        
        await this.loadingService.execute(async () => {
            // Obtém a entrega pelo ID
            const entregas = this.storageService.get('entregas') || [];
            const entrega = entregas.find(e => e.id === id);
            
            if (!entrega) {
                this.notificationService.error('Entrega não encontrada.');
                return;
            }
            
            // Preenche o formulário com os dados da entrega
            document.getElementById('data').value = entrega.data;
            document.getElementById('motorista').value = entrega.motorista;
            document.getElementById('placa').value = entrega.placa;
            document.getElementById('km').value = entrega.km || '';
            document.getElementById('origem').value = entrega.origem;
            document.getElementById('destino').value = entrega.destino;
            document.getElementById('capacidade').value = entrega.capacidade;
            
            // Formata o valor para exibição
            const valorInput = document.getElementById('valor');
            if (valorInput) {
                const valorFormatado = parseFloat(entrega.valor).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                valorInput.value = valorFormatado;
            }
            
            document.getElementById('pago').checked = entrega.pago;
            
            // Guarda o ID da entrega para edição
            this.entregaEditando = id;
            
            // Altera o título do modal
            const modalTitle = this.entregaModal.querySelector('h2');
            if (modalTitle) {
                modalTitle.textContent = 'Editar Entrega';
            }
            
            // Altera o texto do botão
            const submitBtn = this.entregaForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Atualizar';
            }
            
            // Mostra o modal
            this.entregaModal.style.display = 'block';
        });
    }
    
    /**
     * Exclui uma entrega
     * @param {number} id - ID da entrega a ser excluída
     */
    async excluirEntrega(id) {
        // Pergunta ao usuário se deseja realmente excluir
        if (!confirm('Tem certeza que deseja excluir esta entrega?')) return;
        
        await this.loadingService.execute(async () => {
            // Remove a entrega
            const success = this.storageService.removeItem('entregas', id);
            
            if (success) {
                this.notificationService.success('Entrega excluída com sucesso!');
                // Recarrega a tabela
                await this.carregarEntregas();
            } else {
                this.notificationService.error('Erro ao excluir entrega. Tente novamente.');
            }
        });
    }
    
    /**
     * Filtra as entregas conforme os critérios selecionados
     */
    async filtrarEntregas() {
        if (!this.tbody) return;
        
        await this.loadingService.execute(async () => {
            // Obtém os valores dos filtros
            const dataFiltro = this.filtroData?.value || '';
            const motoristaFiltro = this.filtroMotorista?.value || '';
            
            // Obtém todas as entregas
            const entregas = this.storageService.get('entregas') || [];
            
            // Aplica os filtros
            const entregasFiltradas = entregas.filter(entrega => {
                const passaFiltroData = !dataFiltro || entrega.data === dataFiltro;
                const passaFiltroMotorista = !motoristaFiltro || entrega.motorista === motoristaFiltro;
                
                return passaFiltroData && passaFiltroMotorista;
            });
            
            // Limpa a tabela
            this.tbody.innerHTML = '';
            
            // Adiciona as entregas filtradas à tabela
            entregasFiltradas.forEach(entrega => {
                this.adicionarEntregaNaTabela(entrega);
            });
            
            // Se não tiver entregas, mostra uma mensagem
            if (entregasFiltradas.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="10" class="text-center">Nenhuma entrega encontrada com os filtros selecionados.</td>`;
                this.tbody.appendChild(tr);
            }
        }, false, this.tabelaEntregas?.parentElement);
    }
    
    /**
     * Ativa/desativa o status de pagamento de uma entrega
     * @param {number} id - ID da entrega
     */
    async toggleStatusPagamento(id) {
        await this.loadingService.execute(async () => {
            // Obtém as entregas
            const entregas = this.storageService.get('entregas') || [];
            
            // Encontra a entrega pelo ID
            const index = entregas.findIndex(e => e.id === id);
            
            if (index !== -1) {
                // Inverte o status de pagamento
                entregas[index].pago = !entregas[index].pago;
                
                // Se foi marcado como pago, adiciona a data atual como data de pagamento
                if (entregas[index].pago && !entregas[index].dataPagamento) {
                    entregas[index].dataPagamento = new Date().toISOString().split('T')[0];
                }
                
                // Salva as alterações
                this.storageService.save('entregas', entregas);
                
                // Recarrega a tabela
                await this.carregarEntregas();
                
                // Exibe uma notificação
                if (entregas[index].pago) {
                    this.notificationService.success('Entrega marcada como paga!');
                } else {
                    this.notificationService.info('Entrega marcada como não paga.');
                }
            }
        });
    }
    
    /**
     * Expande/recolhe os detalhes de uma linha
     * @param {HTMLElement} row - Elemento TR da linha
     * @param {Object} entrega - Dados da entrega
     */
    toggleRowDetails(row, entrega) {
        // Verifica se a linha já está expandida
        const isExpanded = row.classList.contains('expanded');
        const nextRow = row.nextElementSibling;
        
        // Se estiver expandida, remove a linha de detalhes
        if (isExpanded && nextRow && nextRow.classList.contains('details-row')) {
            row.classList.remove('expanded');
            nextRow.remove();
            return;
        }
        
        // Adiciona a classe de expandido à linha
        row.classList.add('expanded');
        
        // Cria a linha de detalhes
        const detailsRow = document.createElement('tr');
        detailsRow.classList.add('details-row');
        
        // Pega o número de colunas na tabela
        const numCols = row.cells.length;
        
        // Cria a célula que vai conter os detalhes
        const detailsCell = document.createElement('td');
        detailsCell.setAttribute('colspan', numCols);
        
        // Obtem o template de detalhes
        const template = document.getElementById('expandRowTemplate');
        const detailsContent = template.content.cloneNode(true);
        
        // Preenche os valores nos campos
        const fields = detailsContent.querySelectorAll('[data-field]');
        fields.forEach(field => {
            const fieldName = field.getAttribute('data-field');
            
            if (fieldName === 'pago') {
                field.textContent = entrega.pago ? 'Pago' : 'Pendente';
                field.className = 'detail-value ' + (entrega.pago ? 'text-success' : 'text-warning');
            } else if (fieldName === 'valor') {
                field.textContent = this.validationService.formatCurrency(entrega.valor);
            } else if (fieldName === 'data' || fieldName === 'dataPagamento') {
                const date = entrega[fieldName] ? new Date(entrega[fieldName]).toLocaleDateString('pt-BR') : '-';
                field.textContent = date;
            } else {
                field.textContent = entrega[fieldName] || '-';
            }
        });
        
        // Configura os botões de ação
        const actionButtons = detailsContent.querySelectorAll('.details-actions button');
        actionButtons.forEach(btn => {
            btn.setAttribute('data-id', entrega.id);
            
            if (btn.classList.contains('toggle-paid')) {
                if (entrega.pago) {
                    btn.setAttribute('title', 'Marcar como Não Pago');
                    btn.classList.add('active');
                } else {
                    btn.setAttribute('title', 'Marcar como Pago');
                    btn.classList.remove('active');
                }
                
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleStatusPagamento(entrega.id);
                });
            } else if (btn.classList.contains('edit')) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.editarEntrega(entrega.id);
                });
            } else if (btn.classList.contains('delete')) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.excluirEntrega(entrega.id);
                });
            }
        });
        
        // Adiciona o conteúdo à célula
        detailsCell.appendChild(detailsContent);
        
        // Adiciona a célula à linha
        detailsRow.appendChild(detailsCell);
        
        // Insere a linha de detalhes após a linha clicada
        row.parentNode.insertBefore(detailsRow, row.nextSibling);
    }
    
    /**
     * Visualiza os detalhes de uma entrega
     * @param {number} id - ID da entrega
     */
    visualizarEntrega(id) {
        // Obtém as entregas
        const entregas = this.storageService.get('entregas') || [];
        
        // Encontra a entrega pelo ID
        const entrega = entregas.find(e => e.id === id);
        
        if (entrega) {
            // Referências do modal
            const modal = document.getElementById('detalhesEntregaModal');
            const content = document.getElementById('detalhesEntregaContent');
            const closeBtn = modal.querySelector('.close');
            const fecharBtn = document.getElementById('fecharDetalhes');
            const editarBtn = document.getElementById('editarEntregaBtn');
            
            // Formata as datas
            const dataFormatada = new Date(entrega.data).toLocaleDateString('pt-BR');
            const dataPagamentoFormatada = entrega.dataPagamento ? 
                new Date(entrega.dataPagamento).toLocaleDateString('pt-BR') : '-';
            
            // Formata o valor
            const valorFormatado = this.validationService.formatCurrency(entrega.valor);
            
            // Define o conteúdo HTML
            content.innerHTML = `
                <div class="detail-view">
                    <div class="detail-view-section">
                        <h3>Informações da Entrega</h3>
                        <div class="detail-view-grid">
                            <div class="detail-view-item">
                                <span class="detail-view-label">Data:</span>
                                <span class="detail-view-value">${dataFormatada}</span>
                            </div>
                            <div class="detail-view-item">
                                <span class="detail-view-label">Motorista:</span>
                                <span class="detail-view-value">${entrega.motorista}</span>
                            </div>
                            <div class="detail-view-item">
                                <span class="detail-view-label">Placa:</span>
                                <span class="detail-view-value">${entrega.placa}</span>
                            </div>
                            <div class="detail-view-item">
                                <span class="detail-view-label">KM:</span>
                                <span class="detail-view-value">${entrega.km || '-'}</span>
                            </div>
                            <div class="detail-view-item">
                                <span class="detail-view-label">Origem:</span>
                                <span class="detail-view-value">${entrega.origem}</span>
                            </div>
                            <div class="detail-view-item">
                                <span class="detail-view-label">Destino:</span>
                                <span class="detail-view-value">${entrega.destino}</span>
                            </div>
                            <div class="detail-view-item">
                                <span class="detail-view-label">Capacidade:</span>
                                <span class="detail-view-value">${entrega.capacidade} L</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-view-section">
                        <h3>Informações Financeiras</h3>
                        <div class="detail-view-grid">
                            <div class="detail-view-item">
                                <span class="detail-view-label">Valor:</span>
                                <span class="detail-view-value">${valorFormatado}</span>
                            </div>
                            <div class="detail-view-item">
                                <span class="detail-view-label">Status:</span>
                                <span class="detail-view-value status ${entrega.pago ? 'concluida' : 'pendente'}">
                                    ${entrega.pago ? 'Pago' : 'Pendente'}
                                </span>
                            </div>
                            <div class="detail-view-item">
                                <span class="detail-view-label">Data do Pagamento:</span>
                                <span class="detail-view-value">${dataPagamentoFormatada}</span>
                            </div>
                            <div class="detail-view-item">
                                <span class="detail-view-label">Forma de Pagamento:</span>
                                <span class="detail-view-value">${entrega.formaPagamento || '-'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-view-section">
                        <h3>Informações Adicionais</h3>
                        <div class="detail-view-grid">
                            <div class="detail-view-item">
                                <span class="detail-view-label">Nota Fiscal:</span>
                                <span class="detail-view-value">${entrega.notaFiscal || '-'}</span>
                            </div>
                            <div class="detail-view-item">
                                <span class="detail-view-label">Data de Emissão NF:</span>
                                <span class="detail-view-value">${entrega.dataNF ? new Date(entrega.dataNF).toLocaleDateString('pt-BR') : '-'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-view-section">
                        <h3>Observações</h3>
                        <p>${entrega.observacoes || 'Nenhuma observação registrada.'}</p>
                    </div>
                </div>
            `;
            
            // Abre o modal
            modal.style.display = 'flex';
            
            // Adiciona eventos
            closeBtn.onclick = () => modal.style.display = 'none';
            fecharBtn.onclick = () => modal.style.display = 'none';
            editarBtn.onclick = () => {
                modal.style.display = 'none';
                this.editarEntrega(id);
            };
            
            // Fecha o modal ao clicar fora
            window.onclick = (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            };
        }
    }
    
    /**
     * Atualiza os totais exibidos na tabela e no resumo
     */
    atualizarTotais() {
        // Obtem as entregas
        const entregas = this.storageService.get('entregas') || [];
        
        // Calcula os totais
        const totalCapacidade = entregas.reduce((acc, entrega) => {
            const capacidade = parseFloat(entrega.capacidade.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
            return acc + capacidade;
        }, 0);
        
        const totalValor = entregas.reduce((acc, entrega) => {
            const valor = this.validationService.parseCurrency(entrega.valor);
            return acc + valor;
        }, 0);
        
        const valorRecebido = entregas.reduce((acc, entrega) => {
            if (entrega.pago) {
                const valor = this.validationService.parseCurrency(entrega.valor);
                return acc + valor;
            }
            return acc;
        }, 0);
        
        const valorPendente = totalValor - valorRecebido;
        
        // Atualiza os elementos na tabela
        const totalCapacidadeEl = document.getElementById('totalCapacidade');
        const totalValorEl = document.getElementById('totalValor');
        
        if (totalCapacidadeEl) {
            totalCapacidadeEl.textContent = `${totalCapacidade.toLocaleString('pt-BR')} L`;
        }
        
        if (totalValorEl) {
            totalValorEl.textContent = this.validationService.formatCurrency(totalValor);
        }
        
        // Atualiza os cards de resumo
        const totalEntregasEl = document.getElementById('totalEntregas');
        const valorTotalEl = document.getElementById('valorTotal');
        const valorRecebidoEl = document.getElementById('valorRecebido');
        const valorPendenteEl = document.getElementById('valorPendente');
        
        if (totalEntregasEl) {
            totalEntregasEl.textContent = entregas.length;
        }
        
        if (valorTotalEl) {
            valorTotalEl.textContent = this.validationService.formatCurrency(totalValor);
        }
        
        if (valorRecebidoEl) {
            valorRecebidoEl.textContent = this.validationService.formatCurrency(valorRecebido);
        }
        
        if (valorPendenteEl) {
            valorPendenteEl.textContent = this.validationService.formatCurrency(valorPendente);
        }
    }
} 