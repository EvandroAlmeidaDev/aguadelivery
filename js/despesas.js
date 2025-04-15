import { MockAPI } from './mock-api.js';

class DespesasController {
    constructor() {
        this.api = new MockAPI();
        this.tableBody = document.querySelector('#tabela-despesas');
        this.modal = document.querySelector('#modal-despesa');
        this.form = document.querySelector('#form-despesa');
        this.searchInput = document.querySelector('#busca');
        this.dateFilterStart = document.querySelector('#filtro-data-inicio');
        this.dateFilterEnd = document.querySelector('#filtro-data-fim');
        this.categoryFilter = document.querySelector('#filtro-categoria');
        this.veiculoFilter = document.querySelector('#filtro-veiculo');
        
        this.initializeEventListeners();
        this.loadDespesas();
        this.loadVeiculos();
        this.loadMotoristas();
    }

    initializeEventListeners() {
        // Botão Nova Despesa
        document.querySelector('#btn-nova-despesa').addEventListener('click', () => this.openModal());
        
        // Fechar Modal
        document.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        document.querySelector('#btn-cancelar').addEventListener('click', () => this.closeModal());
        
        // Submit do formulário
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Filtros e Busca
        this.searchInput.addEventListener('input', debounce(() => this.filterDespesas(), 300));
        this.dateFilterStart.addEventListener('change', () => this.filterDespesas());
        this.dateFilterEnd.addEventListener('change', () => this.filterDespesas());
        this.categoryFilter.addEventListener('change', () => this.filterDespesas());
        this.veiculoFilter.addEventListener('change', () => this.filterDespesas());
        
        // Delegação de eventos para ações na tabela
        this.tableBody.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            
            const row = target.closest('tr');
            if (!row) return;
            
            const id = row.dataset.id;
            
            if (target.classList.contains('btn-editar')) {
                this.editDespesa(id);
            } else if (target.classList.contains('btn-excluir')) {
                this.deleteDespesa(id);
            } else if (target.classList.contains('btn-comprovante')) {
                this.viewComprovante(id);
            }
        });

        // Evento para atualizar campos do formulário baseado na categoria
        document.querySelector('#despesa-categoria').addEventListener('change', () => this.atualizarCamposCategoria());

        // Adicionar evento para o upload de arquivo
        document.getElementById('despesa-comprovante').addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) {
                document.getElementById('file-name-display').textContent = 'Nenhum arquivo selecionado';
                document.getElementById('comprovante-preview-container').style.display = 'none';
                return;
            }
            
            // Atualizar o nome do arquivo
            document.getElementById('file-name-display').textContent = file.name;
            
            // Mostrar preview do arquivo
            const previewContainer = document.getElementById('comprovante-preview-container');
            const preview = document.getElementById('comprovante-preview');
            previewContainer.style.display = 'block';
            preview.innerHTML = '';
            
            if (file.type.startsWith('image/')) {
                // Preview de imagem
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview do comprovante">`;
                };
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                // Preview de PDF (ícone)
                preview.innerHTML = `
                    <div class="pdf-preview">
                        <i class="fas fa-file-pdf"></i>
                        <div>
                            <strong>${file.name}</strong>
                            <div>Documento PDF (${this.formatFileSize(file.size)})</div>
                        </div>
                    </div>
                `;
            } else {
                // Outros tipos de arquivos
                preview.innerHTML = `
                    <div class="pdf-preview">
                        <i class="fas fa-file"></i>
                        <div>
                            <strong>${file.name}</strong>
                            <div>Arquivo (${this.formatFileSize(file.size)})</div>
                        </div>
                    </div>
                `;
            }
        });
        
        // Fechar o modal quando clicar fora dele
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modal-despesa');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    async loadDespesas() {
        try {
            this.showLoading();
            const despesas = await this.api.getDespesas();
            this.renderDespesas(despesas);
            this.updateDashboardCards(despesas);
        } catch (error) {
            this.showError('Erro ao carregar despesas');
            console.error(error);
        } finally {
            this.hideLoading();
        }
    }

    async loadVeiculos() {
        try {
            const veiculos = await this.api.getFrota();
            const selectForm = document.querySelector('#despesa-veiculo');
            const selectFilter = document.querySelector('#filtro-veiculo');
            
            // Limpar opções atuais
            selectForm.innerHTML = '<option value="">Selecione um veículo</option>';
            selectFilter.innerHTML = '<option value="">Todos</option>';
            
            veiculos.forEach(veiculo => {
                const optionForm = document.createElement('option');
                optionForm.value = veiculo.placa;
                optionForm.textContent = `${veiculo.placa} - ${veiculo.modelo}`;
                selectForm.appendChild(optionForm.cloneNode(true));
                
                const optionFilter = document.createElement('option');
                optionFilter.value = veiculo.placa;
                optionFilter.textContent = `${veiculo.placa} - ${veiculo.modelo}`;
                selectFilter.appendChild(optionFilter);
            });
        } catch (error) {
            console.error('Erro ao carregar veículos:', error);
            this.showError('Erro ao carregar veículos');
        }
    }

    async loadMotoristas() {
        try {
            const motoristas = await this.api.getMotoristas();
            const select = document.querySelector('#despesa-motorista');
            select.innerHTML = '<option value="">Selecione um motorista</option>';
            motoristas.forEach(motorista => {
                const option = document.createElement('option');
                option.value = motorista.nome;
                option.textContent = motorista.nome;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar motoristas:', error);
            this.showError('Erro ao carregar motoristas');
        }
    }

    renderDespesas(despesas) {
        if (!despesas.length) {
            this.showEmptyState();
            return;
        }

        this.tableBody.innerHTML = '';
        despesas.forEach(despesa => {
            const row = document.createElement('tr');
            row.dataset.id = despesa.id;
            row.innerHTML = `
                <td>${this.formatDate(despesa.data)}</td>
                <td>${despesa.descricao}</td>
                <td>
                    <span class="categoria-badge categoria-${despesa.categoria.toLowerCase()}">
                        ${this.traduzirCategoria(despesa.categoria)}
                    </span>
                </td>
                <td>${despesa.veiculo ? despesa.veiculo : '-'} ${despesa.motorista ? `/ ${despesa.motorista}` : ''}</td>
                <td>R$ ${this.formatCurrency(despesa.valor)}</td>
                <td>
                    ${despesa.comprovante ? 
                        `<button class="btn-icon btn-comprovante" title="Ver Comprovante">
                            <i class="fas fa-file-alt"></i>
                        </button>` : 
                        '-'
                    }
                </td>
                <td class="actions">
                    <button class="btn-icon btn-editar" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-excluir" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            this.tableBody.appendChild(row);
        });
    }

    updateDashboardCards(despesas) {
        const totalDespesas = despesas.length;
        const totalValor = despesas.reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
        
        // Filtrar despesas do mês atual
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        
        const despesasMes = despesas.filter(d => {
            const data = new Date(d.data);
            return data >= primeiroDiaMes && data <= ultimoDiaMes;
        });
        
        const valorDespesasMes = despesasMes.reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
        
        // Filtrar por categoria e calcular valores
        const categoriasValores = {
            combustivel: 0,
            manutencao: 0,
            abastecimento: 0
        };
        
        despesas.forEach(d => {
            const categoria = d.categoria.toLowerCase();
            if (categoriasValores.hasOwnProperty(categoria)) {
                categoriasValores[categoria] += parseFloat(d.valor);
            }
        });

        // Atualizar os cards
        document.querySelector('#total-despesas').textContent = totalDespesas;
        document.querySelector('#total-valor').textContent = `R$ ${this.formatCurrency(totalValor)}`;
        document.querySelector('#total-mes').textContent = `R$ ${this.formatCurrency(valorDespesasMes)}`;
        document.querySelector('#total-combustivel').textContent = `R$ ${this.formatCurrency(categoriasValores.combustivel)}`;
        document.querySelector('#total-manutencao').textContent = `R$ ${this.formatCurrency(categoriasValores.manutencao)}`;
        document.querySelector('#total-abastecimento').textContent = `R$ ${this.formatCurrency(categoriasValores.abastecimento)}`;
    }

    async handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(this.form);
        const despesa = {
            data: formData.get('data'),
            descricao: formData.get('descricao'),
            categoria: formData.get('categoria'),
            valor: formData.get('valor'),
            veiculo: formData.get('veiculo'),
            motorista: formData.get('motorista'),
            comprovante: formData.get('comprovante'),
            observacoes: formData.get('observacoes')
        };

        try {
            const id = this.form.dataset.id;
            if (id) {
                await this.api.atualizarDespesa(id, despesa);
                this.showSuccess('Despesa atualizada com sucesso!');
            } else {
                await this.api.criarDespesa(despesa);
                this.showSuccess('Despesa criada com sucesso!');
            }
            this.closeModal();
            this.loadDespesas();
        } catch (error) {
            this.showError('Erro ao salvar despesa');
            console.error(error);
        }
    }

    async editDespesa(id) {
        try {
            const despesa = await this.api.getDespesa(id);
            this.form.dataset.id = id;
            this.form.elements['data'].value = despesa.data;
            this.form.elements['descricao'].value = despesa.descricao;
            this.form.elements['categoria'].value = despesa.categoria;
            this.form.elements['valor'].value = despesa.valor;
            this.form.elements['veiculo'].value = despesa.veiculo || '';
            this.form.elements['motorista'].value = despesa.motorista || '';
            this.form.elements['observacoes'].value = despesa.observacoes || '';
            this.openModal();
        } catch (error) {
            this.showError('Erro ao carregar despesa');
            console.error(error);
        }
    }

    async deleteDespesa(id) {
        if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;
        
        try {
            await this.api.excluirDespesa(id);
            this.showSuccess('Despesa excluída com sucesso!');
            this.loadDespesas();
        } catch (error) {
            this.showError('Erro ao excluir despesa');
            console.error(error);
        }
    }

    filterDespesas() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const dateFilterStart = this.dateFilterStart.value;
        const dateFilterEnd = this.dateFilterEnd.value;
        const categoryFilter = this.categoryFilter.value;
        const veiculoFilter = this.veiculoFilter.value;
        
        const rows = this.tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const descricao = row.children[1].textContent.toLowerCase();
            const data = row.children[0].textContent;
            const categoria = row.children[2].textContent;
            
            const matchesSearch = descricao.includes(searchTerm);
            const matchesDate = (!dateFilterStart || data >= dateFilterStart) && (!dateFilterEnd || data <= dateFilterEnd);
            const matchesCategory = !categoryFilter || categoria === categoryFilter;
            const matchesVeiculo = !veiculoFilter || row.children[3].textContent.includes(veiculoFilter);
            
            row.style.display = matchesSearch && matchesDate && matchesCategory && matchesVeiculo ? '' : 'none';
        });
    }

    viewComprovante(id) {
        // Implementar visualização do comprovante
        alert('Funcionalidade de visualização do comprovante será implementada em breve.');
    }

    openModal() {
        const modal = document.getElementById('modal-despesa');
        modal.style.display = 'block';
        
        // Adicionar as classes para animar a entrada do modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        if (!this.form.dataset.id) {
            this.form.reset();
            delete this.form.dataset.id;
            
            // Definir data de hoje como padrão
            const hoje = new Date().toISOString().split('T')[0];
            document.getElementById('despesa-data').value = hoje;
            
            // Esconder o preview do comprovante
            document.getElementById('comprovante-preview-container').style.display = 'none';
            document.getElementById('file-name-display').textContent = 'Nenhum arquivo selecionado';
        }
        
        // Atualizar campos baseado na categoria selecionada
        this.atualizarCamposCategoria();
    }

    closeModal() {
        const modal = document.getElementById('modal-despesa');
        
        // Remover a classe active para iniciar a animação de saída
        modal.classList.remove('active');
        
        // Aguardar a animação terminar antes de esconder o modal
        setTimeout(() => {
            modal.style.display = 'none';
            this.form.reset();
            delete this.form.dataset.id;
        }, 300);
    }

    showLoading() {
        this.tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Carregando...</p>
                </td>
            </tr>
        `;
    }

    hideLoading() {
        const loadingRow = this.tableBody.querySelector('.loading-spinner')?.parentElement;
        if (loadingRow) loadingRow.remove();
    }

    showEmptyState() {
        this.tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Nenhuma despesa encontrada</p>
                </td>
            </tr>
        `;
    }

    showSuccess(message) {
        // Implementar toast de sucesso
        alert(message);
    }

    showError(message) {
        // Implementar toast de erro
        alert(message);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR');
    }

    formatCurrency(value) {
        return parseFloat(value).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    atualizarCamposCategoria() {
        const categoria = document.querySelector('#despesa-categoria').value;
        const grupoVeiculo = document.querySelector('#grupo-veiculo');
        const grupoMotorista = document.querySelector('#grupo-motorista');
        
        if (categoria === 'combustivel' || categoria === 'manutencao') {
            grupoVeiculo.style.display = 'block';
            grupoMotorista.style.display = 'block';
        } else {
            grupoVeiculo.style.display = 'none';
            grupoMotorista.style.display = 'none';
            document.querySelector('#despesa-veiculo').value = '';
            document.querySelector('#despesa-motorista').value = '';
        }
    }

    traduzirCategoria(categoria) {
        const categorias = {
            'combustivel': 'Combustível',
            'manutencao': 'Manutenção',
            'abastecimento': 'Abastecimento',
            'administrativo': 'Administrativo',
            'outros': 'Outros'
        };
        return categorias[categoria.toLowerCase()] || categoria;
    }

    // Função para formatar o tamanho do arquivo
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
}

// Função auxiliar para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    new DespesasController();
});