// relatorios-pdf.js - Módulo para geração de relatórios em PDF

// Módulo para geração de relatórios em PDF
window.relatoriosPDF = (() => {
    // Referência para o módulo core
    const core = window.relatoriosCore;
    
    // Configurações padrão para os relatórios
    const CONFIG = {
        formatoPadrao: 'A4',
        margens: {
            topo: 20,
            direita: 15,
            baixo: 20,
            esquerda: 15
        },
        cabecalho: {
            altura: 40,
            corFundo: '#f8f9fa',
            corTexto: '#343a40'
        },
        rodape: {
            altura: 30,
            corFundo: '#f8f9fa',
            corTexto: '#6c757d'
        },
        imagens: {
            logo: 'aguadelivery/img/logo.png'
        }
    };
    
    // Mock API para simulação de envio e registro de relatórios
    const mockAPI = {
        enviarRelatorioEmail: function(dados) {
            return new Promise(resolve => {
                console.log(`[MOCK] Enviando relatório para ${dados.destinatario}...`);
                
                // Simular delay de rede e processamento
                setTimeout(() => {
                    // Simular sucesso na maioria das vezes (90%)
                    if (Math.random() > 0.1) {
                        console.log(`[MOCK] Relatório enviado com sucesso para ${dados.destinatario}`);
                        resolve({
                            sucesso: true,
                            mensagem: `Relatório enviado com sucesso para ${dados.destinatario}`,
                            codigoRastreio: 'REL-' + Math.floor(Math.random() * 1000000)
                        });
                    } else {
                        // Simular falha ocasional
                        console.log(`[MOCK] Falha ao enviar relatório para ${dados.destinatario}`);
                        resolve({
                            sucesso: false,
                            mensagem: 'Falha ao enviar e-mail. Por favor, tente novamente.',
                            erro: 'MAIL_DELIVERY_ERROR'
                        });
                    }
                }, 1500);
            });
        },
        
        registrarRelatorio: function(dados) {
            return new Promise(resolve => {
                console.log(`[MOCK] Registrando relatório de ${dados.empresa.nome}...`);
                
                // Simular delay de rede e processamento
                setTimeout(() => {
                    const relatorioId = 'R' + Date.now();
                    console.log(`[MOCK] Relatório registrado com ID ${relatorioId}`);
                    resolve({
                        sucesso: true,
                        relatorioId: relatorioId,
                        dataCriacao: new Date().toISOString()
                    });
                }, 800);
            });
        }
    };
    
    // Formatar valor monetário
    function formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }
    
    // Formatar data
    function formatarData(data) {
        if (!data) return '';
        
        const d = new Date(data);
        
        if (isNaN(d.getTime())) return '';
        
        return d.toLocaleDateString('pt-BR');
    }
    
    // Gerar conteúdo HTML para o relatório com base nos dados
    async function gerarConteudoHTML(dadosRelatorio) {
        try {
            // Verificar se temos os dados necessários
            if (!dadosRelatorio || !dadosRelatorio.empresaId || 
                !dadosRelatorio.dataInicio || !dadosRelatorio.dataFim) {
                throw new Error('Dados incompletos para geração do relatório');
            }
            
            // Obter dados da empresa
            const empresa = await core.getEmpresaById(dadosRelatorio.empresaId);
            
            if (!empresa) {
                throw new Error(`Empresa com ID ${dadosRelatorio.empresaId} não encontrada`);
            }
            
            // Obter abastecimentos no período
            const abastecimentos = await core.getAbastecimentosPorEmpresa(
                dadosRelatorio.empresaId,
                dadosRelatorio.dataInicio,
                dadosRelatorio.dataFim
            );
            
            // Calcular totais
            let totalLitros = 0;
            let totalValor = 0;
            
            abastecimentos.forEach(item => {
                totalLitros += item.litros;
                totalValor += item.valor;
            });
            
            // Formatar período para o título
            const periodoFormatado = `${formatarData(dadosRelatorio.dataInicio)} a ${formatarData(dadosRelatorio.dataFim)}`;
            
            // Montar o HTML do relatório
            let html = `
                <div class="relatorio">
                    <div class="relatorio-cabecalho">
                        <div class="logo">
                            <img src="aguadelivery/img/logo.png" alt="Logo Água Delivery">
                        </div>
                        <div class="info-relatorio">
                            <h1>Relatório de Abastecimento</h1>
                            <p class="periodo">Período: ${periodoFormatado}</p>
                        </div>
                    </div>
                    
                    <div class="info-empresa">
                        <h2>${empresa.nome}</h2>
                        <p><strong>CNPJ:</strong> ${empresa.cnpj}</p>
                        <p><strong>E-mail:</strong> ${empresa.email}</p>
                        <p><strong>Telefone:</strong> ${empresa.telefone || 'Não informado'}</p>
                        <p><strong>Endereço:</strong> ${empresa.endereco || 'Não informado'}</p>
                    </div>
                    
                    <div class="resumo">
                        <div class="card-resumo">
                            <h3>Total de Abastecimentos</h3>
                            <p class="valor-destaque">${abastecimentos.length}</p>
                        </div>
                        <div class="card-resumo">
                            <h3>Total de Litros</h3>
                            <p class="valor-destaque">${totalLitros.toLocaleString('pt-BR')}</p>
                        </div>
                        <div class="card-resumo">
                            <h3>Valor Total</h3>
                            <p class="valor-destaque">${formatarMoeda(totalValor)}</p>
                        </div>
                    </div>
            `;
            
            // Adicionar tabela de abastecimentos se houver dados
            if (abastecimentos.length > 0) {
                html += `
                    <div class="detalhamento">
                        <h3>Detalhamento dos Abastecimentos</h3>
                        <table class="tabela-abastecimentos">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Local</th>
                                    <th>Litros</th>
                                    <th>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                // Adicionar linhas da tabela
                abastecimentos.forEach(item => {
                    html += `
                        <tr>
                            <td>${formatarData(item.data)}</td>
                            <td>${item.local}</td>
                            <td>${item.litros.toLocaleString('pt-BR')}</td>
                            <td>${formatarMoeda(item.valor)}</td>
                        </tr>
                    `;
                });
                
                html += `
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="2"><strong>Total</strong></td>
                                    <td><strong>${totalLitros.toLocaleString('pt-BR')}</strong></td>
                                    <td><strong>${formatarMoeda(totalValor)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                `;
            } else {
                html += `
                    <div class="sem-dados">
                        <p>Não há abastecimentos registrados no período selecionado.</p>
                    </div>
                `;
            }
            
            // Adicionar gráfico se houver dados suficientes
            if (abastecimentos.length > 1) {
                html += `
                    <div class="grafico">
                        <h3>Consumo no Período</h3>
                        <div class="grafico-container" id="grafico-consumo">
                            <canvas id="graficoAbastecimentos"></canvas>
                        </div>
                    </div>
                `;
            }
            
            // Finalizar o HTML
            html += `
                    <div class="relatorio-rodape">
                        <p>Relatório gerado em ${new Date().toLocaleString('pt-BR')} por Água Delivery</p>
                        <p>Para mais informações, entre em contato pelo e-mail suporte@aguadelivery.com.br</p>
                    </div>
                </div>
            `;
            
            return {
                html,
                dados: {
                    empresa,
                    abastecimentos,
                    totais: {
                        quantidade: abastecimentos.length,
                        litros: totalLitros,
                        valor: totalValor
                    },
                    periodo: {
                        inicio: dadosRelatorio.dataInicio,
                        fim: dadosRelatorio.dataFim,
                        formatado: periodoFormatado
                    }
                }
            };
        } catch (error) {
            console.error('Erro ao gerar conteúdo HTML do relatório:', error);
            throw error;
        }
    }
    
    // Gerar conteúdo para visualização prévia do relatório
    async function gerarConteudoPreview(dadosRelatorio) {
        try {
            // Obter o conteúdo completo
            const { html, dados } = await gerarConteudoHTML(dadosRelatorio);
            
            // Simplificar para preview (remover gráficos e talvez limitar itens da tabela)
            const previewHtml = html
                .replace(/<div class="grafico">[\s\S]*?<\/div>/g, '') // Remove a seção de gráficos
                .replace(/id="graficoAbastecimentos"/g, 'id="graficoPreview"'); // Altera IDs para evitar conflitos
            
            return {
                html: previewHtml,
                dados
            };
        } catch (error) {
            console.error('Erro ao gerar preview do relatório:', error);
            throw error;
        }
    }
    
    // Visualizar o relatório em uma janela de preview
    async function visualizarRelatorio(dadosRelatorio) {
        try {
            // Obter o elemento de preview
            const previewContainer = document.getElementById('preview-relatorio');
            
            if (!previewContainer) {
                throw new Error('Elemento de preview não encontrado');
            }
            
            // Mostrar indicador de carregamento
            previewContainer.innerHTML = '<div class="loading">Gerando visualização...</div>';
            previewContainer.classList.add('carregando');
            
            // Obter conteúdo para preview
            const { html, dados } = await gerarConteudoPreview(dadosRelatorio);
            
            // Exibir o conteúdo
            previewContainer.innerHTML = html;
            previewContainer.classList.remove('carregando');
            
            // Se houver dados suficientes para gráfico e a biblioteca Chart.js estiver disponível
            if (dados.abastecimentos.length > 1 && window.Chart) {
                setTimeout(() => {
                    criarGraficoConsumo(dados.abastecimentos, 'graficoPreview');
                }, 100);
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao visualizar relatório:', error);
            
            // Mostrar mensagem de erro
            const previewContainer = document.getElementById('preview-relatorio');
            if (previewContainer) {
                previewContainer.innerHTML = `
                    <div class="erro">
                        <h3>Erro ao gerar visualização</h3>
                        <p>${error.message || 'Ocorreu um erro inesperado'}</p>
                    </div>
                `;
                previewContainer.classList.remove('carregando');
            }
            
            return false;
        }
    }
    
    // Criar gráfico de consumo usando Chart.js
    function criarGraficoConsumo(abastecimentos, canvasId) {
        // Verificar se a biblioteca Chart.js está disponível
        if (!window.Chart) {
            console.warn('Chart.js não está disponível. O gráfico não será renderizado.');
            return;
        }
        
        // Obter o elemento canvas
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas com ID ${canvasId} não encontrado`);
            return;
        }
        
        // Preparar dados para o gráfico
        const labels = abastecimentos.map(item => formatarData(item.data));
        const dataLitros = abastecimentos.map(item => item.litros);
        const dataValores = abastecimentos.map(item => item.valor);
        
        // Criar o gráfico
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Litros',
                        data: dataLitros,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Valores (R$)',
                        data: dataValores,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        type: 'line',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Litros'
                        },
                        position: 'left'
                    },
                    y1: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Valores (R$)'
                        },
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
    
    // Gerar e enviar relatório por e-mail
    async function gerarEEnviarRelatorio(dadosRelatorio, destinatarios) {
        try {
            // Verificar dados obrigatórios
            if (!dadosRelatorio || !destinatarios || destinatarios.length === 0) {
                throw new Error('Dados incompletos para envio do relatório');
            }
            
            // Mostrar indicador de carregamento na UI, se existir
            const btnEnviar = document.getElementById('btn-enviar-relatorio');
            if (btnEnviar) {
                btnEnviar.disabled = true;
                btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enviando...';
            }
            
            // Gerar o conteúdo HTML completo do relatório
            const { html, dados } = await gerarConteudoHTML(dadosRelatorio);
            
            // Registrar o relatório no sistema
            const registroResult = await mockAPI.registrarRelatorio({
                empresa: dados.empresa,
                periodo: dados.periodo,
                totais: dados.totais,
                dataGeracao: new Date().toISOString()
            });
            
            if (!registroResult.sucesso) {
                throw new Error('Falha ao registrar relatório no sistema');
            }
            
            // Preparar dados para envio por e-mail
            const relatorioData = {
                html: html,
                destinatarios: destinatarios,
                assunto: `Relatório de Abastecimento - ${dados.empresa.nome} - ${dados.periodo.formatado}`,
                relatorioId: registroResult.relatorioId
            };
            
            // Enviar o relatório por e-mail para cada destinatário
            const resultados = [];
            for (const destinatario of destinatarios) {
                const resultado = await mockAPI.enviarRelatorioEmail({
                    html: html,
                    destinatario: destinatario,
                    assunto: relatorioData.assunto,
                    relatorioId: relatorioData.relatorioId
                });
                
                resultados.push({
                    destinatario,
                    ...resultado
                });
            }
            
            // Restaurar estado do botão, se existir
            if (btnEnviar) {
                btnEnviar.disabled = false;
                btnEnviar.innerHTML = 'Enviar Relatório';
            }
            
            // Calcular resumo de resultados
            const sucessos = resultados.filter(r => r.sucesso).length;
            const falhas = resultados.length - sucessos;
            
            return {
                sucesso: sucessos > 0,
                resumo: {
                    total: resultados.length,
                    sucessos,
                    falhas
                },
                resultados,
                relatorioId: registroResult.relatorioId
            };
        } catch (error) {
            console.error('Erro ao gerar e enviar relatório:', error);
            
            // Restaurar estado do botão, se existir
            const btnEnviar = document.getElementById('btn-enviar-relatorio');
            if (btnEnviar) {
                btnEnviar.disabled = false;
                btnEnviar.innerHTML = 'Enviar Relatório';
            }
            
            throw error;
        }
    }
    
    // Exportar relatório como PDF
    async function exportarPDF(dadosRelatorio, nomeArquivo = null) {
        try {
            // Verificar se a biblioteca jsPDF está disponível
            if (!window.jsPDF) {
                throw new Error('A biblioteca jsPDF não está disponível');
            }
            
            // Mostrar indicador de carregamento na UI, se existir
            const btnExportar = document.getElementById('btn-exportar-pdf');
            if (btnExportar) {
                btnExportar.disabled = true;
                btnExportar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Gerando PDF...';
            }
            
            // Gerar o conteúdo HTML completo do relatório
            const { html, dados } = await gerarConteudoHTML(dadosRelatorio);
            
            // Criar elemento temporário para renderizar o HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);
            
            // Definir nome do arquivo
            const fileName = nomeArquivo || 
                             `Relatorio_${dados.empresa.nome.replace(/\s+/g, '_')}_${dados.periodo.inicio.replace(/-/g, '')}_${dados.periodo.fim.replace(/-/g, '')}.pdf`;
            
            // Criar instância do jsPDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Usar html2canvas para converter HTML para imagem
            const canvas = await html2canvas(tempDiv, {
                scale: 2, // Melhor qualidade
                useCORS: true,
                logging: false
            });
            
            // Adicionar a imagem ao PDF
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;
            
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            
            // Salvar o PDF
            pdf.save(fileName);
            
            // Remover o elemento temporário
            document.body.removeChild(tempDiv);
            
            // Restaurar estado do botão, se existir
            if (btnExportar) {
                btnExportar.disabled = false;
                btnExportar.innerHTML = 'Exportar PDF';
            }
            
            return {
                sucesso: true,
                nomeArquivo: fileName
            };
        } catch (error) {
            console.error('Erro ao exportar relatório como PDF:', error);
            
            // Restaurar estado do botão, se existir
            const btnExportar = document.getElementById('btn-exportar-pdf');
            if (btnExportar) {
                btnExportar.disabled = false;
                btnExportar.innerHTML = 'Exportar PDF';
            }
            
            throw error;
        }
    }
    
    // Inicializar interface do módulo de relatórios
    function inicializarInterface() {
        // Verificar se o módulo core está disponível
        if (!core) {
            console.error('O módulo relatoriosCore não está disponível');
            return false;
        }
        
        // Inicializar manipuladores de eventos para formulário de relatório
        const formRelatorio = document.getElementById('form-relatorio');
        if (formRelatorio) {
            formRelatorio.addEventListener('submit', async function(event) {
                event.preventDefault();
                
                try {
                    // Obter dados do formulário
                    const empresaId = document.getElementById('empresa').value;
                    const dataInicio = document.getElementById('data-inicio').value;
                    const dataFim = document.getElementById('data-fim').value;
                    const destinatarios = document.getElementById('destinatarios').value
                        .split(',')
                        .map(email => email.trim())
                        .filter(email => email);
                    
                    // Validar dados
                    if (!empresaId || !dataInicio || !dataFim) {
                        alert('Por favor, preencha todos os campos obrigatórios.');
                        return;
                    }
                    
                    if (new Date(dataInicio) > new Date(dataFim)) {
                        alert('A data inicial não pode ser posterior à data final.');
                        return;
                    }
                    
                    // Configuração do relatório
                    const dadosRelatorio = {
                        empresaId,
                        dataInicio,
                        dataFim
                    };
                    
                    // Se há destinatários, enviar o relatório por e-mail
                    if (destinatarios.length > 0) {
                        const resultado = await gerarEEnviarRelatorio(dadosRelatorio, destinatarios);
                        
                        if (resultado.sucesso) {
                            alert(`Relatório enviado com sucesso para ${resultado.resumo.sucessos} de ${resultado.resumo.total} destinatários.`);
                        } else {
                            alert(`Falha ao enviar o relatório. Por favor, tente novamente mais tarde.`);
                        }
                    } else {
                        // Se não há destinatários, apenas visualizar
                        visualizarRelatorio(dadosRelatorio);
                    }
                } catch (error) {
                    console.error('Erro ao processar formulário de relatório:', error);
                    alert(`Erro: ${error.message || 'Ocorreu um erro inesperado'}`);
                }
            });
        }
        
        // Inicializar botão de visualização
        const btnVisualizar = document.getElementById('btn-visualizar');
        if (btnVisualizar) {
            btnVisualizar.addEventListener('click', async function() {
                try {
                    // Obter dados do formulário
                    const empresaId = document.getElementById('empresa').value;
                    const dataInicio = document.getElementById('data-inicio').value;
                    const dataFim = document.getElementById('data-fim').value;
                    
                    // Validar dados
                    if (!empresaId || !dataInicio || !dataFim) {
                        alert('Por favor, preencha a empresa e o período para visualizar o relatório.');
                        return;
                    }
                    
                    if (new Date(dataInicio) > new Date(dataFim)) {
                        alert('A data inicial não pode ser posterior à data final.');
                        return;
                    }
                    
                    // Configuração do relatório
                    const dadosRelatorio = {
                        empresaId,
                        dataInicio,
                        dataFim
                    };
                    
                    // Visualizar o relatório
                    visualizarRelatorio(dadosRelatorio);
                } catch (error) {
                    console.error('Erro ao visualizar relatório:', error);
                    alert(`Erro: ${error.message || 'Ocorreu um erro inesperado'}`);
                }
            });
        }
        
        // Inicializar botão de exportação para PDF
        const btnExportarPDF = document.getElementById('btn-exportar-pdf');
        if (btnExportarPDF) {
            btnExportarPDF.addEventListener('click', async function() {
                try {
                    // Obter dados do formulário
                    const empresaId = document.getElementById('empresa').value;
                    const dataInicio = document.getElementById('data-inicio').value;
                    const dataFim = document.getElementById('data-fim').value;
                    
                    // Validar dados
                    if (!empresaId || !dataInicio || !dataFim) {
                        alert('Por favor, preencha a empresa e o período para exportar o relatório.');
                        return;
                    }
                    
                    if (new Date(dataInicio) > new Date(dataFim)) {
                        alert('A data inicial não pode ser posterior à data final.');
                        return;
                    }
                    
                    // Configuração do relatório
                    const dadosRelatorio = {
                        empresaId,
                        dataInicio,
                        dataFim
                    };
                    
                    // Exportar o relatório como PDF
                    await exportarPDF(dadosRelatorio);
                } catch (error) {
                    console.error('Erro ao exportar relatório como PDF:', error);
                    alert(`Erro: ${error.message || 'Ocorreu um erro inesperado'}`);
                }
            });
        }
        
        return true;
    }
    
    // Inicializar o módulo
    function inicializar() {
        console.log('Inicializando módulo relatoriosPDF...');
        
        // Verificar dependências
        if (!core) {
            console.error('Dependência não encontrada: relatoriosCore');
            return false;
        }
        
        // Inicializar a interface se estiver em um contexto de navegador
        if (typeof window !== 'undefined' && document.readyState === 'complete') {
            inicializarInterface();
        } else if (typeof window !== 'undefined') {
            window.addEventListener('DOMContentLoaded', inicializarInterface);
        }
        
        console.log('Módulo relatoriosPDF inicializado com sucesso');
        return true;
    }
    
    // API pública do módulo
    return {
        inicializar,
        visualizarRelatorio,
        gerarEEnviarRelatorio,
        exportarPDF,
        // Helpers
        formatarMoeda,
        formatarData
    };
})();

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o módulo core está disponível
    if (window.relatoriosCore) {
        relatoriosPDF.inicializar();
    } else {
        console.error('O módulo relatoriosCore não está disponível. Não é possível inicializar relatoriosPDF.');
    }
}); 