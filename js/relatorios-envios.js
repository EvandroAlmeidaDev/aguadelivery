// relatorios-envios.js - Funções para controle de envios e configurações

// Funções de cálculo de datas e prazos
function calcularProximoEnvio(diaEnvio) {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();
    
    // Criar data do próximo envio neste mês
    let proximoEnvio = new Date(anoAtual, mesAtual, diaEnvio);
    
    // Se o dia já passou, avançar para o próximo mês
    if (proximoEnvio < hoje) {
        proximoEnvio = new Date(anoAtual, mesAtual + 1, diaEnvio);
    }
    
    return proximoEnvio;
}

function calcularPrazo(proximoEnvio, diasAviso) {
    const hoje = new Date();
    
    // Calcular dias restantes
    const diferencaTempo = proximoEnvio.getTime() - hoje.getTime();
    const diasRestantes = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));
    
    // Determinar status e percentual de prazo
    let status, percentualPrazo;
    
    if (diasRestantes < 0) {
        status = 'atrasado';
        percentualPrazo = 100;
    } else if (diasRestantes <= diasAviso) {
        status = 'proximo';
        percentualPrazo = 100 - Math.floor((diasRestantes / diasAviso) * 100);
    } else {
        status = 'pendente';
        // Para pendentes, considerar que 30 dias é 0% e o dia de aviso é 90%
        const diasTotais = 30; // Padrão para visualização
        percentualPrazo = Math.max(0, Math.min(90, 90 - (diasRestantes - diasAviso) * (90 / (diasTotais - diasAviso))));
    }
    
    return { diasRestantes, status, percentualPrazo };
}

function getStatusText(status) {
    const statusMap = {
        'atrasado': 'Atrasado',
        'proximo': 'Próximo',
        'pendente': 'Pendente',
        'enviado': 'Enviado'
    };
    
    return statusMap[status] || status;
}

// Funções de interface para controle de envios
async function carregarTabelaControleEnvios() {
    console.log('Carregando tabela de controle de envios...');
    
    const tbody = document.getElementById('tabela-controle-envios');
    const emptyState = document.getElementById('empty-state-envios');
    
    if (!tbody || !emptyState) {
        console.error('Elementos da tabela não encontrados');
        return;
    }
    
    try {
        // Usar a função correta para obter empresas, que retorna uma Promise
        const empresas = await relatoriosCore.getEmpresas();
        
        if (!empresas || !Array.isArray(empresas) || empresas.length === 0) {
            console.warn('Nenhuma empresa encontrada para exibir');
            emptyState.style.display = 'block';
            return;
        }
        
        // Usar a função correta para obter configurações
        const configEmpresas = relatoriosCore.obterConfiguracoesEmpresas ? 
            relatoriosCore.obterConfiguracoesEmpresas() : {};
        
        // Limpar a tabela
        tbody.innerHTML = '';
        
        // Array para armazenar as linhas filtradas
        let linhasFiltradas = [];
        
        // Para cada empresa, criar uma linha na tabela
        empresas.forEach(empresa => {
            const config = configEmpresas[empresa.id] || {
                diaEnvio: 5, // Padrão: dia 5 de cada mês
                diasAviso: 3, // Padrão: avisar 3 dias antes
                ativo: true,
                ultimoEnvio: null
            };
            
            // Calcular próximo envio
            const proximoEnvio = calcularProximoEnvio(config.diaEnvio);
            
            // Calcular prazo e status
            const { diasRestantes, status, percentualPrazo } = calcularPrazo(proximoEnvio, config.diasAviso);
            
            // Criar linha da tabela
            const row = document.createElement('tr');
            row.dataset.empresa = empresa.id;
            row.dataset.status = status;
            
            // Definir a classe baseada no status
            if (status === 'atrasado') {
                row.classList.add('table-danger');
            } else if (status === 'proximo') {
                row.classList.add('table-warning');
            }
            
            // Formatar o HTML da linha
            row.innerHTML = `
                <td>${empresa.nome}</td>
                <td>${config.ultimoEnvio ? relatoriosCore.formatarDataBR(config.ultimoEnvio) : 'Nunca enviado'}</td>
                <td>${relatoriosCore.formatarDataBR(proximoEnvio.toISOString().split('T')[0])}</td>
                <td>
                    <div class="prazo-container">
                        <span class="prazo-dias">${diasRestantes} dias</span>
                        <div class="prazo-barra">
                            <div class="prazo-progresso ${status === 'atrasado' ? 'prazo-atrasado' : status === 'proximo' ? 'prazo-proximo' : 'prazo-normal'}" 
                                 style="width: ${percentualPrazo}%"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge ${status === 'enviado' ? 'badge-success' : status === 'atrasado' ? 'badge-danger' : status === 'proximo' ? 'badge-warning' : 'badge-info'}">
                        ${getStatusText(status)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary btn-acao btn-enviar" data-id="${empresa.id}">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                    <button class="btn btn-sm btn-info btn-acao btn-editar" data-id="${empresa.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm ${config.ativo ? 'btn-danger' : 'btn-success'} btn-acao btn-toggle-ativo" data-id="${empresa.id}">
                        <i class="fas ${config.ativo ? 'fa-toggle-off' : 'fa-toggle-on'}"></i>
                    </button>
                </td>
            `;
            
            // Adicionar eventos aos botões
            try {
                const btnEnviar = row.querySelector('.btn-enviar');
                if (btnEnviar) {
                    btnEnviar.addEventListener('click', function() {
                        abrirGerarRelatorio(empresa.id);
                    });
                }
                
                const btnEditar = row.querySelector('.btn-editar');
                if (btnEditar) {
                    btnEditar.addEventListener('click', function() {
                        abrirModalConfigDatas(empresa.id);
                    });
                }
                
                const btnToggle = row.querySelector('.btn-toggle-ativo');
                if (btnToggle) {
                    btnToggle.addEventListener('click', function() {
                        toggleEmpresaAtiva(empresa.id);
                    });
                }
            } catch (e) {
                console.error('Erro ao configurar eventos dos botões:', e);
            }
            
            // Adicionar à lista de linhas filtradas
            linhasFiltradas.push(row);
            
            // Adicionar à tabela
            tbody.appendChild(row);
        });
        
        // Aplicar filtros atuais
        aplicarFiltros(linhasFiltradas);
        
        // Mostrar ou esconder o estado vazio
        emptyState.style.display = tbody.children.length > 0 ? 'none' : 'block';
        
        console.log(`Tabela carregada com ${tbody.children.length} empresas`);
        
    } catch (error) {
        console.error('Erro ao carregar tabela de controle de envios:', error);
        emptyState.style.display = 'block';
    }
}

function abrirGerarRelatorio(empresaId) {
    // Navegar para a aba de geração de relatório
    document.querySelector('a[href="#gerar-relatorio"]').click();
    
    // Selecionar a empresa no dropdown
    const selectEmpresa = document.getElementById('empresa');
    if (selectEmpresa) {
        selectEmpresa.value = empresaId;
    }
    
    // Focar no formulário
    document.getElementById('data-inicio').focus();
}

function filtrarEmpresas() {
    console.log('Filtrando empresas...');
    
    const busca = document.getElementById('busca-empresa').value.toLowerCase();
    const filtroStatus = document.getElementById('filtro-status').value;
    
    const linhas = Array.from(document.querySelectorAll('#tabela-controle-envios tr'));
    let linhasFiltradas = [];
    
    // Aplicar filtros
    linhas.forEach(linha => {
        const nomeEmpresa = linha.cells[0].textContent.toLowerCase();
        const statusEmpresa = linha.dataset.status;
        
        // Filtrar por nome
        const passaBusca = nomeEmpresa.includes(busca);
        
        // Filtrar por status
        const passaStatus = filtroStatus === 'todos' || 
                          (filtroStatus === 'pendente' && statusEmpresa === 'pendente') ||
                          (filtroStatus === 'enviado' && statusEmpresa === 'enviado') ||
                          (filtroStatus === 'atrasado' && statusEmpresa === 'atrasado') ||
                          (filtroStatus === 'proximo' && statusEmpresa === 'proximo');
        
        // Adicionar à lista filtrada se passar em ambos os filtros
        if (passaBusca && passaStatus) {
            linhasFiltradas.push(linha);
        }
    });
    
    // Aplicar os filtros
    aplicarFiltros(linhasFiltradas);
}

function aplicarFiltros(linhasFiltradas) {
    const tbody = document.getElementById('tabela-controle-envios');
    const emptyState = document.getElementById('empty-state-envios');
    
    // Esconder todas as linhas
    Array.from(tbody.children).forEach(linha => {
        linha.style.display = 'none';
    });
    
    // Mostrar apenas as linhas filtradas
    linhasFiltradas.forEach(linha => {
        linha.style.display = '';
    });
    
    // Mostrar ou esconder o estado vazio
    emptyState.style.display = linhasFiltradas.length > 0 ? 'none' : 'block';
    
    console.log(`Filtro aplicado: ${linhasFiltradas.length} empresas exibidas`);
}

// Funções de configuração de datas
function abrirModalConfigDatas(empresaId) {
    console.log('Abrindo modal de configuração de datas...');
    
    const selectEmpresa = document.getElementById('config-empresa');
    const inputDiaEnvio = document.getElementById('config-dia-envio');
    const inputDiasAviso = document.getElementById('config-dias-aviso');
    const checkboxAtiva = document.getElementById('config-ativa');
    
    if (!selectEmpresa || !inputDiaEnvio || !inputDiasAviso || !checkboxAtiva) {
        console.error('Elementos do modal não encontrados');
        return;
    }
    
    // Se foi passado um ID de empresa, selecionar no dropdown
    if (empresaId) {
        selectEmpresa.value = empresaId;
        selectEmpresa.disabled = true; // Bloquear alteração
    } else {
        selectEmpresa.disabled = false;
    }
    
    // Carregar configurações da empresa selecionada
    const empresaSelecionadaId = empresaId || selectEmpresa.value;
    if (empresaSelecionadaId) {
        const configuracoes = relatoriosCore.obterConfiguracoesEmpresas();
        const configEmpresa = configuracoes[empresaSelecionadaId] || {
            diaEnvio: 5,
            diasAviso: 3,
            ativo: true
        };
        
        inputDiaEnvio.value = configEmpresa.diaEnvio;
        inputDiasAviso.value = configEmpresa.diasAviso;
        checkboxAtiva.checked = configEmpresa.ativo;
    }
    
    // Exibir o modal
    document.getElementById('modal-config-datas').style.display = 'block';
}

function salvarConfigDatas() {
    console.log('Salvando configurações de datas...');
    
    try {
        const selectEmpresa = document.getElementById('config-empresa');
        const inputDiaEnvio = document.getElementById('config-dia-envio');
        const inputDiasAviso = document.getElementById('config-dias-aviso');
        const checkboxAtiva = document.getElementById('config-ativa');
        
        if (!selectEmpresa || !inputDiaEnvio || !inputDiasAviso || !checkboxAtiva) {
            console.error('Elementos do formulário não encontrados');
            return;
        }
        
        // Validar dados
        const empresaId = selectEmpresa.value;
        if (!empresaId) {
            alert('Selecione uma empresa!');
            return;
        }
        
        const diaEnvio = parseInt(inputDiaEnvio.value);
        if (isNaN(diaEnvio) || diaEnvio < 1 || diaEnvio > 31) {
            alert('O dia de envio deve ser um número entre 1 e 31!');
            return;
        }
        
        const diasAviso = parseInt(inputDiasAviso.value);
        if (isNaN(diasAviso) || diasAviso < 1 || diasAviso > 30) {
            alert('Os dias de aviso devem ser um número entre 1 e 30!');
            return;
        }
        
        // Obter configurações atuais
        const configuracoes = relatoriosCore.obterConfiguracoesEmpresas();
        
        // Atualizar ou criar configuração para a empresa
        configuracoes[empresaId] = {
            ...(configuracoes[empresaId] || {}), // Manter configurações existentes
            diaEnvio: diaEnvio,
            diasAviso: diasAviso,
            ativo: checkboxAtiva.checked
        };
        
        // Salvar configurações
        relatoriosCore.salvarConfiguracoesEmpresas(configuracoes);
        
        // Fechar o modal
        document.getElementById('modal-config-datas').style.display = 'none';
        
        // Atualizar a tabela
        carregarTabelaControleEnvios();
        
        console.log('Configurações salvas com sucesso');
        
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        alert('Ocorreu um erro ao salvar as configurações!');
    }
}

function toggleEmpresaAtiva(empresaId) {
    console.log(`Alterando status ativo da empresa ${empresaId}`);
    
    try {
        const configuracoes = relatoriosCore.obterConfiguracoesEmpresas();
        
        // Se não existir configuração, criar com padrões
        if (!configuracoes[empresaId]) {
            configuracoes[empresaId] = {
                diaEnvio: 5,
                diasAviso: 3,
                ativo: true
            };
        }
        
        // Inverter o status ativo
        configuracoes[empresaId].ativo = !configuracoes[empresaId].ativo;
        
        // Salvar configurações
        relatoriosCore.salvarConfiguracoesEmpresas(configuracoes);
        
        // Atualizar a tabela
        carregarTabelaControleEnvios();
        
        console.log(`Empresa ${empresaId} ${configuracoes[empresaId].ativo ? 'ativada' : 'desativada'} com sucesso`);
        
    } catch (error) {
        console.error('Erro ao alterar status da empresa:', error);
    }
}

// Função para atualizar o assunto padrão do email
function atualizarAssuntoPadrao() {
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    
    if (dataInicio && dataFim) {
        const formatarData = (data) => {
            const [ano, mes, dia] = data.split('-');
            return `${dia}/${mes}/${ano}`;
        };
        
        const periodo = `${formatarData(dataInicio)} a ${formatarData(dataFim)}`;
        document.getElementById('assunto').value = `Relatório de Abastecimento - ${periodo}`;
    }
}

// Exportar funções para uso em outros módulos
window.relatoriosEnvios = {
    calcularProximoEnvio,
    calcularPrazo,
    getStatusText,
    carregarTabelaControleEnvios,
    abrirGerarRelatorio,
    filtrarEmpresas,
    aplicarFiltros,
    abrirModalConfigDatas,
    salvarConfigDatas,
    toggleEmpresaAtiva,
    atualizarAssuntoPadrao,
    salvarConfiguracao: function(config) {
        // Implementação do método que está sendo chamado em relatoriosUI.js
        console.log('Salvando configuração:', config);
        
        try {
            if (!config.empresaId) {
                console.error('ID da empresa não informado');
                return false;
            }
            
            // Obter configurações atuais
            const configuracoes = relatoriosCore.obterConfiguracoesEmpresas();
            
            // Atualizar configuração para a empresa
            configuracoes[config.empresaId] = {
                ...(configuracoes[config.empresaId] || {}),
                diaEnvio: config.diaEnvio,
                diasAviso: config.diasAviso,
                ativo: config.ativa
            };
            
            // Salvar configurações
            relatoriosCore.salvarConfiguracoesEmpresas(configuracoes);
            
            console.log('Configuração salva com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao salvar configuração:', error);
            return false;
        }
    },
    filtrarTabelaEnvios: function(termo, status) {
        // Implementação do método que está sendo chamado em relatoriosUI.js
        console.log(`Filtrando tabela de envios - Termo: ${termo}, Status: ${status}`);
        
        try {
            const linhas = document.querySelectorAll('#tabela-controle-envios tr');
            let nenhumaVisivel = true;
            
            linhas.forEach(linha => {
                const textoEmpresa = linha.querySelector('td:first-child')?.textContent.toLowerCase() || '';
                const statusLinha = linha.getAttribute('data-status') || '';
                
                // Verificar se atende aos critérios de filtro
                const atendeTermoBusca = textoEmpresa.includes(termo);
                const atendeStatus = status === 'todos' || statusLinha === status;
                
                // Exibir ou ocultar linha
                if (atendeTermoBusca && atendeStatus) {
                    linha.style.display = '';
                    nenhumaVisivel = false;
                } else {
                    linha.style.display = 'none';
                }
            });
            
            // Exibir mensagem se nenhuma linha for visível
            const emptyState = document.getElementById('empty-state-envios');
            if (emptyState) {
                emptyState.style.display = nenhumaVisivel ? 'block' : 'none';
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao filtrar tabela:', error);
            return false;
        }
    }
}; 