/**
 * Controlador da página de Motoristas
 * Sistema de Gestão Água Delivery
 */

// Variáveis globais
let motoristas = [];
let motoristasSelecionados = [];
let motoristaEmEdicao = null;
let api;

document.addEventListener('DOMContentLoaded', async function() {
    // Elementos da interface
    const totalMotoristas = document.getElementById('total-motoristas');
    const motoristasDisponiveis = document.getElementById('motoristas-disponiveis');
    const motoristasRota = document.getElementById('motoristas-rota');
    const cnhVencer = document.getElementById('cnh-vencer');
    
    const buscaMotorista = document.getElementById('busca-motorista');
    const filtroDisponibilidade = document.getElementById('filtro-disponibilidade');
    const filtroCategoria = document.getElementById('filtro-categoria');
    const filtroValidade = document.getElementById('filtro-validade');
    
    const tabelaMotoristas = document.getElementById('tabela-motoristas');
    const emptyState = document.getElementById('empty-state');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    const btnNovoMotorista = document.getElementById('btn-novo-motorista');
    const modal = document.getElementById('modal-motorista');
    const modalTitulo = document.getElementById('modal-titulo');
    const formMotorista = document.getElementById('form-motorista');
    const btnFecharModal = document.getElementById('btn-fechar-modal');
    const btnCancelar = document.getElementById('btn-cancelar');
    
    // Inicialização da página
    await inicializar();
    
    // Função para inicializar a página
    async function inicializar() {
        console.log("Inicializando página de motoristas...");

        try {
            // Inicializar a API do Supabase
            const { SupabaseAPI } = await import('./supabase-api.js');
            api = new SupabaseAPI();
            
            // Verificar se todos os elementos do DOM existem
            const elementosObrigatorios = [
                { id: 'tabela-motoristas', nome: 'Tabela de motoristas' },
                { id: 'btn-novo-motorista', nome: 'Botão novo motorista' },
                { id: 'modal-motorista', nome: 'Modal de motorista' },
                { id: 'btn-fechar-modal', nome: 'Botão fechar modal' },
                { id: 'form-motorista', nome: 'Formulário de motorista' },
                { id: 'btn-cancelar', nome: 'Botão cancelar' }
            ];
    
            let todosElementosExistem = true;
            elementosObrigatorios.forEach(elemento => {
                const el = document.getElementById(elemento.id);
                if (!el) {
                    console.error(`Elemento não encontrado: ${elemento.nome} (ID: ${elemento.id})`);
                    todosElementosExistem = false;
                }
            });
    
            if (!todosElementosExistem) {
                exibirMensagem("Alguns elementos da página não foram encontrados. A funcionalidade pode estar comprometida.", "error");
                return;
            }
    
            // Carregar dados dos motoristas
            await carregarMotoristas();
            
            // Eventos
            buscaMotorista.addEventListener('input', filtrarMotoristas);
            filtroDisponibilidade.addEventListener('change', filtrarMotoristas);
            filtroCategoria.addEventListener('change', filtrarMotoristas);
            filtroValidade.addEventListener('change', filtrarMotoristas);
            
            btnNovoMotorista.addEventListener('click', abrirModalNovoMotorista);
            btnFecharModal.addEventListener('click', fecharModal);
            btnCancelar.addEventListener('click', fecharModal);
            formMotorista.addEventListener('submit', salvarMotorista);
            
            // Inicializar eventos para gerenciamento de senhas
            initSenhaEvents();
            
            // Adicionar coluna de status de acesso na tabela
            adicionarColunaStatusAcesso();
        } catch (error) {
            console.error("Erro na inicialização:", error);
            exibirMensagem("Erro ao carregar a página. Por favor, tente novamente.", "error");
        }
    }
    
    // Adicionar coluna de status de acesso (se não existir)
    function adicionarColunaStatusAcesso() {
        const thAcesso = document.querySelector('th.col-acesso');
        if (!thAcesso) {
            console.warn('Coluna de acesso não encontrada na tabela. Verifique a estrutura HTML.');
        }
    }
    
    // Inicializar eventos relacionados a senha
    function initSenhaEvents() {
        // Toggle para mostrar/esconder senha
        const togglePasswordBtn = document.querySelector('.toggle-password');
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', function() {
                const senhaInput = document.getElementById('motorista-senha');
                const icon = this.querySelector('i');
                
                if (senhaInput.type === 'password') {
                    senhaInput.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    senhaInput.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        }
        
        // Botão de gerar senha
        const generatePasswordBtn = document.querySelector('.generate-password');
        if (generatePasswordBtn) {
            generatePasswordBtn.addEventListener('click', function() {
                const senhaInput = document.getElementById('motorista-senha');
                senhaInput.value = gerarSenhaAleatoria();
                senhaInput.type = 'text';
                
                const toggleIcon = document.querySelector('.toggle-password i');
                if (toggleIcon) {
                    toggleIcon.className = 'fas fa-eye-slash';
                }
                
                // Mostrar senha por 3 segundos e depois ocultar
                setTimeout(() => {
                    senhaInput.type = 'password';
                    if (toggleIcon) {
                        toggleIcon.className = 'fas fa-eye';
                    }
                }, 3000);
            });
        }
    }
    
    // Funções para manipulação de dados
    async function carregarMotoristas() {
        console.log("Iniciando carregamento de motoristas...");
        mostrarLoading();
        
        try {
            // Obter motoristas do Supabase
            motoristas = await api.getMotoristas();
            console.log(`Número de motoristas carregados: ${motoristas.length}`);
            
            // Log de debug para verificar a estrutura dos dados
            if (motoristas.length > 0) {
                console.log("Primeiro motorista para exemplo:", motoristas[0]);
            }
            
            motoristasSelecionados = [...motoristas];
            
            // Atualiza o dashboard e a tabela
            atualizarDashboard();
            atualizarTabela();
            
            if (motoristas.length === 0) {
                mostrarEstadoVazio();
            } else {
                esconderEstadoVazio();
            }
        } catch (error) {
            console.error('Erro ao carregar motoristas:', error);
            exibirMensagem("Erro ao carregar os dados dos motoristas. Por favor, tente novamente.", "error");
            motoristasSelecionados = [];
            motoristas = [];
            mostrarEstadoVazio();
        } finally {
            esconderLoading();
        }
    }
    
    function atualizarDashboard() {
        // Atualizar os cards de dashboard
        const dataAtual = new Date();
        const proximosMeses = new Date(dataAtual);
        proximosMeses.setMonth(dataAtual.getMonth() + 3); // Próximos 3 meses
        
        const totais = motoristas.reduce((acc, motorista) => {
            acc.total++;
            if (motorista.disponivel) acc.disponiveis++;
            if (motorista.em_rota) acc.emRota++;
            
            // Verificar CNH próxima de vencer
            const dataValidade = new Date(motorista.data_validade_cnh);
            if (dataValidade <= proximosMeses) acc.cnhVencer++;
            
            return acc;
        }, { total: 0, disponiveis: 0, emRota: 0, cnhVencer: 0 });
        
        if (totalMotoristas) totalMotoristas.textContent = totais.total;
        if (motoristasDisponiveis) motoristasDisponiveis.textContent = totais.disponiveis;
        if (motoristasRota) motoristasRota.textContent = totais.emRota;
        if (cnhVencer) cnhVencer.textContent = totais.cnhVencer;
    }
    
    function filtrarMotoristas() {
        const termoBusca = buscaMotorista.value.toLowerCase();
        const disponibilidade = filtroDisponibilidade.value;
        const categoria = filtroCategoria.value;
        const validade = filtroValidade.value;
        
        motoristasSelecionados = motoristas.filter(motorista => {
            // Filtrar por termo de busca
            const matchBusca = 
                motorista.nome.toLowerCase().includes(termoBusca) || 
                motorista.email.toLowerCase().includes(termoBusca) ||
                (motorista.cpf && motorista.cpf.includes(termoBusca));
            
            // Filtrar por disponibilidade
            let matchDisponibilidade = true;
            if (disponibilidade === 'disponiveis') {
                matchDisponibilidade = motorista.disponivel;
            } else if (disponibilidade === 'indisponiveis') {
                matchDisponibilidade = !motorista.disponivel;
            } else if (disponibilidade === 'rota') {
                matchDisponibilidade = motorista.em_rota;
            }
            
            // Filtrar por categoria de CNH
            const matchCategoria = categoria ? motorista.categoria_cnh === categoria : true;
            
            // Filtrar por validade
            let matchValidade = true;
            if (validade) {
                const hoje = new Date();
                const dataValidade = new Date(motorista.data_validade_cnh);
                
                if (validade === 'vencida') {
                    matchValidade = dataValidade < hoje;
                } else if (validade === 'proxima') {
                    const proximosMeses = new Date(hoje);
                    proximosMeses.setMonth(hoje.getMonth() + 3);
                    matchValidade = dataValidade >= hoje && dataValidade <= proximosMeses;
                } else if (validade === 'valida') {
                    matchValidade = dataValidade > hoje;
                }
            }
            
            return matchBusca && matchDisponibilidade && matchCategoria && matchValidade;
        });
        
        atualizarTabela();
    }
    
    function atualizarTabela() {
        console.log("Atualizando tabela com dados filtrados:", motoristasSelecionados.length);
        
        if (!tabelaMotoristas) {
            console.error("Elemento de tabela não encontrado");
            return;
        }
        
        // Limpar tabela, mantendo o cabeçalho
        tabelaMotoristas.innerHTML = '';
        
        if (motoristasSelecionados.length === 0) {
            // Exibir estado vazio se não houver resultados
            mostrarEstadoVazio();
            esconderLoading();
            return;
        }
        
        // Esconder estado vazio
        esconderEstadoVazio();
        
        // Adicionar motoristas à tabela
        motoristasSelecionados.forEach(motorista => {
            const linha = document.createElement('tr');
            linha.setAttribute('data-id', motorista.id);
            
            // Definir classes de destaque se necessário
            if (motorista.vencimento_proximo) {
                linha.classList.add('destaque-vencimento');
            }
            
            // Formatar estado de disponibilidade
            let statusDisponibilidade = 'Disponível';
            let classeStatus = 'status-disponivel';
            
            if (motorista.em_rota) {
                statusDisponibilidade = 'Em rota';
                classeStatus = 'status-emrota';
            } else if (!motorista.disponivel) {
                statusDisponibilidade = 'Indisponível';
                classeStatus = 'status-indisponivel';
            }
            
            // Formatar estado de acesso
            let statusAcesso = motorista.acesso_ativo ? 'Ativo' : 'Inativo';
            let classeAcesso = motorista.acesso_ativo ? 'status-ativo' : 'status-inativo';
            
            // Verificar validade da CNH
            const hoje = new Date();
            const dataValidade = new Date(motorista.data_validade_cnh);
            let alertaValidade = '';
            
            if (dataValidade < hoje) {
                alertaValidade = 'vencida';
            }
            
            // Criar células da tabela
            linha.innerHTML = `
                <td>${motorista.id}</td>
                <td>${motorista.nome}</td>
                <td>${motorista.cpf || '-'}</td>
                <td>${motorista.cnh || '-'}</td>
                <td>${motorista.categoria_cnh || '-'}</td>
                <td class="${alertaValidade}">${formatarData(motorista.data_validade_cnh)}</td>
                <td>${motorista.telefone || '-'}</td>
                <td><span class="status ${classeStatus}">${statusDisponibilidade}</span></td>
                <td><span class="status ${classeAcesso}">${statusAcesso}</span></td>
                <td class="acoes">
                    <button class="btn-acao editar" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-acao excluir" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-acao reset-senha" title="Resetar Senha">
                        <i class="fas fa-key"></i>
                    </button>
                </td>
            `;
            
            tabelaMotoristas.appendChild(linha);
        });
        
        // Adicionar eventos aos botões da tabela
        adicionarEventosTabela();
        
        // Esconder indicador de carregamento
        esconderLoading();
    }
    
    function adicionarEventosTabela() {
        // Adicionar eventos aos botões de ação
        const botoes = {
            editar: document.querySelectorAll('.btn-acao.editar'),
            excluir: document.querySelectorAll('.btn-acao.excluir'),
            resetSenha: document.querySelectorAll('.btn-acao.reset-senha')
        };
        
        // Botões de editar
        botoes.editar.forEach(btn => {
            btn.setAttribute('data-open-modal', 'modal-motorista');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.closest('tr').getAttribute('data-id');
                if (id) {
                    abrirModalEdicao(id);
                }
            });
        });
        
        // Botões de excluir
        botoes.excluir.forEach(btn => {
            btn.setAttribute('data-open-modal', 'modal-confirmacao');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.closest('tr').getAttribute('data-id');
                if (id) {
                    confirmarExclusao(id);
                }
            });
        });
        
        // Botões de resetar senha
        botoes.resetSenha.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.closest('tr').getAttribute('data-id');
                if (id) {
                    resetarSenhaMotorista(id);
                }
            });
        });
    }
    
    async function toggleStatusAcesso(id, estadoAtual) {
        try {
            mostrarLoading();
            
            const novoEstado = estadoAtual === 'on' ? false : true;
            await api.atualizarMotorista(id, { ativo: novoEstado });
            
            // Atualizar dados
            await carregarMotoristas();
            
            exibirMensagem(
                `Acesso do motorista ${novoEstado ? 'ativado' : 'desativado'} com sucesso!`,
                'success'
            );
        } catch (error) {
            console.error('Erro ao alterar status de acesso:', error);
            exibirMensagem('Erro ao alterar status de acesso', 'error');
        } finally {
            esconderLoading();
        }
    }
    
    function abrirModalNovoMotorista() {
        // Limpar o formulário
        formMotorista.reset();
        
        // Atualizar título e botão do modal
        modalTitulo.textContent = 'Novo Motorista';
        document.getElementById('btn-salvar').textContent = 'Cadastrar';
        
        // Resetar o ID do motorista em edição
        motoristaEmEdicao = null;
        
        // Definir valores padrão no formulário
        document.getElementById('motorista-status').value = 'disponivel';
        document.getElementById('acesso-ativo').checked = true;
        document.getElementById('motorista-categoria').value = '';
        
        // Mostra o campo de senha (que deve estar escondido na edição)
        const campoSenha = document.getElementById('campo-senha');
        if (campoSenha) {
            campoSenha.style.display = 'block';
        }
        
        // Exibir o modal usando a nova abordagem com classes
        const modal = document.getElementById('modal-motorista');
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
        }
    }
    
    async function abrirModalEdicao(id) {
        motoristaEmEdicao = id;
        
        try {
            // Buscar dados atualizados do motorista
            const motorista = await api.getMotorista(id);
            
            if (!motorista) {
                exibirMensagem("Motorista não encontrado.", "error");
                return;
            }
            
            modalTitulo.textContent = 'Editar Motorista';
            document.getElementById('btn-salvar').textContent = 'Atualizar';
            
            // Preencher formulário com dados do motorista
            document.getElementById('motorista-nome').value = motorista.nome || '';
            document.getElementById('motorista-cpf').value = motorista.cpf || '';
            document.getElementById('motorista-cnh').value = motorista.cnh || '';
            document.getElementById('motorista-categoria').value = motorista.categoria_cnh || '';
            document.getElementById('motorista-validade-cnh').value = motorista.data_validade_cnh ? motorista.data_validade_cnh.split('T')[0] : '';
            document.getElementById('motorista-telefone').value = motorista.telefone || '';
            document.getElementById('motorista-endereco').value = motorista.endereco || '';
            document.getElementById('motorista-status').value = motorista.disponivel ? 'disponivel' : 'indisponivel';
            
            // Status de acesso
            document.getElementById('acesso-ativo').checked = motorista.acesso_ativo === true;
            document.getElementById('acesso-inativo').checked = motorista.acesso_ativo === false;
            
            // Esconder campo de senha na edição
            const campoSenha = document.getElementById('campo-senha');
            if (campoSenha) {
                campoSenha.style.display = 'none';
            }
            
            // Exibir modal usando a nova abordagem
            const modal = document.getElementById('modal-motorista');
            if (modal) {
                modal.classList.add('active');
                document.body.classList.add('modal-open');
            }
        } catch (error) {
            console.error('Erro ao buscar dados do motorista:', error);
            exibirMensagem("Erro ao carregar dados do motorista.", "error");
        }
    }
    
    function fecharModal() {
        const modal = document.getElementById('modal-motorista');
        if (modal) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }
    
    async function salvarMotorista(event) {
        event.preventDefault();
        
        // Validar dados
        const nome = document.getElementById('motorista-nome').value.trim();
        const cpf = document.getElementById('motorista-cpf').value.trim();
        const email = document.getElementById('motorista-email').value.trim();
        const telefone = document.getElementById('motorista-telefone').value.trim();
        const cnh = document.getElementById('motorista-cnh').value.trim();
        const categoriaCNH = document.getElementById('motorista-categoria-cnh').value;
        const validadeCNH = document.getElementById('motorista-validade-cnh').value;
        const disponivel = document.getElementById('motorista-disponivel').checked;
        
        // Validação básica
        if (!nome) {
            exibirMensagem('O nome é obrigatório', 'error');
            return;
        }
        
        if (!cpf) {
            exibirMensagem('O CPF é obrigatório', 'error');
            return;
        }
        
        if (!email) {
            exibirMensagem('O e-mail é obrigatório', 'error');
            return;
        }
        
        if (!cnh) {
            exibirMensagem('O número da CNH é obrigatório', 'error');
            return;
        }
        
        if (!categoriaCNH) {
            exibirMensagem('A categoria da CNH é obrigatória', 'error');
            return;
        }
        
        if (!validadeCNH) {
            exibirMensagem('A data de validade da CNH é obrigatória', 'error');
            return;
        }
        
        // Montando objeto do motorista
        const motorista = {
            nome,
            cpf,
            email,
            telefone,
            numero_cnh: cnh,
            categoria_cnh: categoriaCNH,
            data_validade_cnh: validadeCNH,
            disponivel,
            em_rota: false // Inicialmente não está em rota
        };
        
        // Dados de acesso
        const usuario = document.getElementById('motorista-usuario');
        const senha = document.getElementById('motorista-senha');
        const ativo = document.getElementById('motorista-ativo');
        
        if (usuario) motorista.usuario = usuario.value.trim();
        if (senha && senha.value.trim()) motorista.senha = senha.value.trim();
        if (ativo) motorista.ativo = ativo.checked;
        
        // Se não tiver usuário definido, usar CPF como usuário
        if (!motorista.usuario) {
            motorista.usuario = cpf;
        }
        
        try {
            mostrarLoading();
            
            let mensagemSucesso;
            if (motoristaEmEdicao) {
                // Atualizar motorista existente
                const id = document.getElementById('motorista-id').value;
                await api.atualizarMotorista(id, motorista);
                mensagemSucesso = 'Motorista atualizado com sucesso!';
            } else {
                // Criar novo motorista
                if (!motorista.senha) {
                    // Gerar senha padrão se não informada
                    motorista.senha = gerarSenhaAleatoria();
                }
                
                await api.criarMotorista(motorista);
                mensagemSucesso = 'Motorista cadastrado com sucesso!';
            }
            
            // Fechar modal e recarregar dados
            fecharModal();
            await carregarMotoristas();
            
            exibirMensagem(mensagemSucesso, 'success');
        } catch (error) {
            console.error('Erro ao salvar motorista:', error);
            exibirMensagem('Erro ao salvar os dados do motorista', 'error');
        } finally {
            esconderLoading();
        }
    }
    
    async function confirmarExclusao(id) {
        if (!confirm('Tem certeza que deseja excluir este motorista? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        try {
            mostrarLoading();
            
            // Excluir motorista
            await api.excluirMotorista(id);
            
            // Recarregar dados
            await carregarMotoristas();
            
            exibirMensagem('Motorista excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir motorista:', error);
            exibirMensagem('Erro ao excluir motorista', 'error');
        } finally {
            esconderLoading();
        }
    }
    
    function formatarData(dataString) {
        if (!dataString) return '-';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    }
    
    function mostrarLoading() {
        if (loadingSpinner) loadingSpinner.style.display = 'flex';
    }
    
    function esconderLoading() {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
    
    function mostrarEstadoVazio() {
        if (emptyState) emptyState.style.display = 'flex';
    }
    
    function esconderEstadoVazio() {
        if (emptyState) emptyState.style.display = 'none';
    }
    
    function exibirMensagem(mensagem, tipo = 'info') {
        // Criar elemento de notificação
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao ${tipo}`