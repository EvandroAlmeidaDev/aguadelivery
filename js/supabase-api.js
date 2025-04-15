/**
 * supabase-api.js - Serviço de API utilizando Supabase
 * Este arquivo substitui o mock-api.js, utilizando o Supabase como fonte de dados
 */

// Define a classe SupabaseAPI globalmente apenas se não estiver definida
if (typeof window.SupabaseAPI === 'undefined') {
    // Define a classe SupabaseAPI globalmente
    window.SupabaseAPI = class SupabaseAPI {
        constructor() {
            console.log('SupabaseAPI inicializada')
            this.initializeAPI()
        }

        /**
         * Inicializa a API e adiciona hooks necessários
         */
        initializeAPI() {
            console.log('Supabase API inicializada')
            // Guardar um cache de algumas entidades para performance
            this.cache = {}
            
            // Verificar se o Supabase está disponível
            this.supabaseDisponivel = window.supabase && typeof window.supabase.from === 'function'
            
            if (!this.supabaseDisponivel) {
                console.error('Supabase não está disponível. A aplicação não funcionará corretamente.')
                
                // Criar cliente mock se necessário (como fallback)
                if (typeof criarClienteMock === 'function') {
                    criarClienteMock();
                    this.supabaseDisponivel = true;
                    console.log('Cliente mock do Supabase criado com sucesso.');
                }
            }

            // Verificar autenticação
            this.verificarAutenticacao();
        }

        /**
         * Verifica se o usuário está autenticado
         */
        async verificarAutenticacao() {
            if (!this.supabaseDisponivel) return;

            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) throw error;
                
                if (!session) {
                    console.warn('Usuário não está autenticado');
                    window.location.href = 'login.html';
                    return;
                }

                // Guardar o role do usuário
                const { data: { role }, error: roleError } = await supabase
                    .from('profiles')
                    .select('role')
                    .single();

                if (!roleError && role) {
                    this.userRole = role;
                }

                console.log('Usuário autenticado com sucesso');
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                window.location.href = 'login.html';
            }
        }

        /**
         * Verifica se o usuário tem permissão de admin
         */
        isAdmin() {
            return this.userRole === 'admin';
        }

        /**
         * Limpa o cache armazenado
         */
        limparCache() {
            this.cache = {}
        }

        // ----- MÉTODOS GENÉRICOS -----

        /**
         * Obtém todos os registros de uma tabela
         * @param {string} tabela - Nome da tabela
         * @param {Object} options - Opções adicionais (order, filters)
         * @returns {Promise<Array>} Array de registros
         */
        async getTodos(tabela, options = {}) {
            if (!this.supabaseDisponivel) {
                // Em modo mock, retornar dados de exemplo
                console.warn(`getTodos(${tabela}): Usando dados mock porque o Supabase não está disponível`);
                return this.gerarDadosMock(tabela, options);
            }
            
            try {
                let query = supabase.from(tabela).select('*')
                
                // Aplicar ordenação se especificada
                if (options.order) {
                    query = query.order(options.order.column, { 
                        ascending: options.order.ascending !== false 
                    })
                }
                
                // Aplicar filtros se especificados
                if (options.filters) {
                    for (const filter of options.filters) {
                        query = query.filter(filter.column, filter.operator || 'eq', filter.value)
                    }
                }
                
                // Aplicar limite se especificado
                if (options.limit) {
                    query = query.limit(options.limit)
                }
                
                const { data, error } = await query
                
                if (error) throw error
                return data
            } catch (error) {
                console.error(`Erro ao obter dados da tabela ${tabela}:`, error)
                return this.gerarDadosMock(tabela, options);
            }
        }

        /**
         * Obtém um registro específico pelo ID
         * @param {string} tabela - Nome da tabela
         * @param {number|string} id - ID do registro
         * @returns {Promise<Object>} Registro encontrado ou null
         */
        async getById(tabela, id) {
            try {
                const { data, error } = await supabase
                    .from(tabela)
                    .select('*')
                    .eq('id', id)
                    .single()
                
                if (error) {
                    if (error.code === 'PGRST116') { // Registro não encontrado
                        return null
                    }
                    throw error
                }
                return data
            } catch (error) {
                console.error(`Erro ao obter registro de ${tabela} com ID ${id}:`, error)
                throw error
            }
        }

        /**
         * Insere um novo registro
         * @param {string} tabela - Nome da tabela
         * @param {Object} dados - Dados a serem inseridos
         * @returns {Promise<Object>} Registro inserido
         */
        async inserir(tabela, dados) {
            try {
                const { data, error } = await supabase
                    .from(tabela)
                    .insert(dados)
                    .select()
                    .single()
                
                if (error) throw error
                
                // Limpar cache relacionado
                this.limparCache()
                
                return data
            } catch (error) {
                console.error(`Erro ao inserir em ${tabela}:`, error)
                throw error
            }
        }

        /**
         * Atualiza um registro existente
         * @param {string} tabela - Nome da tabela
         * @param {number|string} id - ID do registro
         * @param {Object} dados - Dados a serem atualizados
         * @returns {Promise<Object>} Registro atualizado
         */
        async atualizar(tabela, id, dados) {
            try {
                const { data, error } = await supabase
                    .from(tabela)
                    .update(dados)
                    .eq('id', id)
                    .select()
                    .single()
                
                if (error) throw error
                
                // Limpar cache relacionado
                this.limparCache()
                
                return data
            } catch (error) {
                console.error(`Erro ao atualizar registro em ${tabela} com ID ${id}:`, error)
                throw error
            }
        }

        /**
         * Exclui um registro
         * @param {string} tabela - Nome da tabela
         * @param {number|string} id - ID do registro
         * @returns {Promise<Object>} Resultado da operação
         */
        async excluir(tabela, id) {
            try {
                const { error } = await supabase
                    .from(tabela)
                    .delete()
                    .eq('id', id)
                
                if (error) throw error
                
                // Limpar cache relacionado
                this.limparCache()
                
                return { success: true }
            } catch (error) {
                console.error(`Erro ao excluir registro em ${tabela} com ID ${id}:`, error)
                throw error
            }
        }

        // ----- MÉTODOS ESPECÍFICOS PARA ENTIDADES -----

        // ----- ENTREGAS -----
        
        async getEntregas(filtros = {}) {
            if (!this.supabaseDisponivel) {
                console.warn('getEntregas(): Usando dados mock porque o Supabase não está disponível');
                return this.gerarDadosMock('entregas');
            }
            return this.getTodos('entregas', {
                order: { column: 'data_entrega', ascending: false },
                filters: Object.entries(filtros).map(([key, value]) => ({
                    column: key,
                    value: value
                }))
            });
        }

        async getEntregaById(id) {
            return this.getById('entregas', id)
        }

        async criarEntrega(dados) {
            return this.inserir('entregas', dados)
        }

        async atualizarEntrega(id, dados) {
            return this.atualizar('entregas', id, dados)
        }

        async excluirEntrega(id) {
            return this.excluir('entregas', id)
        }

        // ----- FROTA/VEÍCULOS -----
        
        async getFrota() {
            if (!this.supabaseDisponivel) {
                console.warn('getFrota(): Usando dados mock porque o Supabase não está disponível');
                return this.gerarDadosMock('veiculos');
            }
            return this.getTodos('veiculos', {
                order: { column: 'placa' }
            });
        }

        async getVeiculoById(id) {
            if (!this.supabaseDisponivel) {
                console.warn(`getVeiculoById(${id}): Usando dados mock porque o Supabase não está disponível`);
                const veiculos = this.gerarDadosMock('veiculos');
                return veiculos.find(v => v.id == id) || null;
            }
            return this.getById('veiculos', id);
        }

        async cadastrarVeiculo(dados) {
            if (!this.supabaseDisponivel) {
                console.warn('cadastrarVeiculo(): Usando dados mock porque o Supabase não está disponível');
                const veiculos = this.gerarDadosMock('veiculos');
                const novoVeiculo = {
                    ...dados,
                    id: veiculos.length + 1
                };
                veiculos.push(novoVeiculo);
                return novoVeiculo;
            }

            // Verificar se é admin
            if (!this.isAdmin()) {
                throw new Error('Apenas administradores podem cadastrar veículos');
            }

            return this.inserir('veiculos', dados);
        }

        async atualizarVeiculo(dados) {
            if (!this.supabaseDisponivel) {
                console.warn(`atualizarVeiculo(${dados.id}): Usando dados mock porque o Supabase não está disponível`);
                const veiculos = this.gerarDadosMock('veiculos');
                const index = veiculos.findIndex(v => v.id == dados.id);
                if (index >= 0) {
                    veiculos[index] = { ...veiculos[index], ...dados };
                    return veiculos[index];
                }
                throw new Error('Veículo não encontrado');
            }

            // Verificar se é admin
            if (!this.isAdmin()) {
                throw new Error('Apenas administradores podem atualizar veículos');
            }

            return this.atualizar('veiculos', dados.id, dados);
        }

        async excluirVeiculo(id) {
            if (!this.supabaseDisponivel) {
                console.warn(`excluirVeiculo(${id}): Usando dados mock porque o Supabase não está disponível`);
                const veiculos = this.gerarDadosMock('veiculos');
                const index = veiculos.findIndex(v => v.id == id);
                if (index >= 0) {
                    veiculos.splice(index, 1);
                    return { success: true };
                }
                throw new Error('Veículo não encontrado');
            }

            // Verificar se é admin
            if (!this.isAdmin()) {
                throw new Error('Apenas administradores podem excluir veículos');
            }

            return this.excluir('veiculos', id);
        }

        // ----- MOTORISTAS -----
        
        async getMotoristas() {
            if (!this.supabaseDisponivel) {
                console.warn('getMotoristas(): Usando dados mock porque o Supabase não está disponível');
                return this.gerarDadosMock('motoristas');
            }
            return this.getTodos('motoristas', {
                order: { column: 'nome' }
            });
        }

        async getMotoristaById(id) {
            try {
                const { data, error } = await supabase
                    .from('motoristas')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) throw error;
                return data;
            } catch (error) {
                console.error(`Erro ao buscar motorista ${id}:`, error);
                throw error;
            }
        }

        async getMotoristaByEmail(email) {
            try {
                const { data, error } = await supabase
                    .from('motoristas')
                    .select('*')
                    .eq('email', email)
                    .single()
                
                if (error) {
                    if (error.code === 'PGRST116') return null
                    throw error
                }
                return data
            } catch (error) {
                console.error('Erro ao buscar motorista por email:', error)
                throw error
            }
        }

        async getMotoristaByCPF(cpf) {
            try {
                const { data, error } = await supabase
                    .from('motoristas')
                    .select('*')
                    .eq('cpf', cpf)
                    .single()
                
                if (error) {
                    if (error.code === 'PGRST116') return null
                    throw error
                }
                return data
            } catch (error) {
                console.error('Erro ao buscar motorista por CPF:', error)
                throw error
            }
        }

        async autenticarMotorista(cpf, senha) {
            try {
                const motorista = await this.getMotoristaByCPF(cpf)
                
                if (!motorista) {
                    return { autenticado: false, mensagem: 'Motorista não encontrado' }
                }
                
                // Em um sistema real, a senha estaria hasheada e a verificação seria mais segura
                if (motorista.senha === senha) {
                    return { 
                        autenticado: true, 
                        token: `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
                        usuario: {
                            id: motorista.id,
                            nome: motorista.nome,
                            cpf: motorista.cpf,
                            email: motorista.email,
                            tipo: 'motorista'
                        }
                    }
                } else {
                    return { autenticado: false, mensagem: 'Senha incorreta' }
                }
            } catch (error) {
                console.error('Erro na autenticação de motorista:', error)
                return { autenticado: false, mensagem: 'Erro durante autenticação' }
            }
        }

        async criarMotorista(motorista) {
            try {
                const { data, error } = await supabase
                    .from('motoristas')
                    .insert([motorista])
                    .select();
                
                if (error) throw error;
                return data[0];
            } catch (error) {
                console.error('Erro ao criar motorista:', error);
                throw error;
            }
        }

        async atualizarMotorista(id, dadosAtualizados) {
            try {
                const { data, error } = await supabase
                    .from('motoristas')
                    .update(dadosAtualizados)
                    .eq('id', id)
                    .select();
                
                if (error) throw error;
                return data[0];
            } catch (error) {
                console.error(`Erro ao atualizar motorista ${id}:`, error);
                throw error;
            }
        }

        async excluirMotorista(id) {
            try {
                const { error } = await supabase
                    .from('motoristas')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                return true;
            } catch (error) {
                console.error(`Erro ao excluir motorista ${id}:`, error);
                throw error;
            }
        }

        // ----- CLIENTES -----
        
        async getClientes() {
            return this.getTodos('clientes', {
                order: { column: 'nome' }
            })
        }

        async getClienteById(id) {
            return this.getById('clientes', id)
        }

        async criarCliente(dados) {
            return this.inserir('clientes', dados)
        }

        async atualizarCliente(id, dados) {
            return this.atualizar('clientes', id, dados)
        }

        async excluirCliente(id) {
            return this.excluir('clientes', id)
        }

        // ----- DESPESAS -----
        
        async getDespesas() {
            return this.getTodos('despesas', {
                order: { column: 'data', ascending: false }
            })
        }

        async getDespesaById(id) {
            return this.getById('despesas', id)
        }

        async criarDespesa(dados) {
            // Preparar dados de comprovante, se houver
            if (dados.comprovante && dados.comprovante.base64) {
                // Gerar nome único para o arquivo
                const filename = `comprovante_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
                
                try {
                    // Upload do arquivo para o storage do Supabase
                    const { data: fileData, error: fileError } = await supabase
                        .storage
                        .from('comprovantes')
                        .upload(filename, await this._base64ToBlob(dados.comprovante.base64), {
                            contentType: dados.comprovante.tipo || 'image/jpeg'
                        })
                    
                    if (fileError) throw fileError
                    
                    // Obter URL pública
                    const { data: urlData } = await supabase
                        .storage
                        .from('comprovantes')
                        .getPublicUrl(filename)
                    
                    // Atualizar dados com informações do comprovante
                    dados.comprovante = {
                        nome: filename,
                        url: urlData.publicUrl,
                        tipo: dados.comprovante.tipo || 'image/jpeg',
                        dataUpload: new Date().toISOString()
                    }
                } catch (error) {
                    console.error('Erro ao fazer upload de comprovante:', error)
                    // Continuar sem o comprovante em caso de erro
                    dados.comprovante = null
                }
            }
            
            return this.inserir('despesas', dados)
        }

        async atualizarDespesa(id, dados) {
            return this.atualizar('despesas', id, dados)
        }

        async excluirDespesa(id) {
            return this.excluir('despesas', id)
        }

        // ----- ABASTECIMENTOS -----
        
        async getAbastecimentos() {
            return this.getTodos('abastecimentos', {
                order: { column: 'data', ascending: false }
            })
        }

        async getAbastecimentosMotorista(motoristaId) {
            return this.getTodos('abastecimentos', {
                order: { column: 'data', ascending: false },
                filters: [{ column: 'motorista_id', value: motoristaId }]
            })
        }

        async getAbastecimentoVeiculo(veiculoId) {
            return this.getTodos('abastecimentos', {
                order: { column: 'data', ascending: false },
                filters: [{ column: 'veiculo_id', value: veiculoId }]
            })
        }

        async getAbastecimentoById(id) {
            return this.getById('abastecimentos', id)
        }

        async criarAbastecimento(dados) {
            // Incluir localização se disponível
            if (dados.latitude && dados.longitude) {
                dados.localizacao = `POINT(${dados.longitude} ${dados.latitude})`
            }
            
            // Preparar dados de comprovante, se houver
            if (dados.comprovante && dados.comprovante.base64) {
                // Gerar nome único para o arquivo
                const filename = `abastecimento_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
                
                try {
                    // Upload do arquivo para o storage do Supabase
                    const { data: fileData, error: fileError } = await supabase
                        .storage
                        .from('comprovantes')
                        .upload(filename, await this._base64ToBlob(dados.comprovante.base64), {
                            contentType: dados.comprovante.tipo || 'image/jpeg'
                        })
                    
                    if (fileError) throw fileError
                    
                    // Obter URL pública
                    const { data: urlData } = await supabase
                        .storage
                        .from('comprovantes')
                        .getPublicUrl(filename)
                    
                    // Atualizar dados com informações do comprovante
                    dados.comprovante = {
                        nome: filename,
                        url: urlData.publicUrl,
                        tipo: dados.comprovante.tipo || 'image/jpeg',
                        dataUpload: new Date().toISOString()
                    }
                } catch (error) {
                    console.error('Erro ao fazer upload de comprovante:', error)
                    // Continuar sem o comprovante em caso de erro
                    dados.comprovante = null
                }
            }
            
            return this.inserir('abastecimentos', dados)
        }

        // ----- PORTAL DO MOTORISTA -----
        
        // Obter veículo vinculado ao motorista
        async getVeiculoByMotorista(motoristaId) {
            const { data, error } = await supabase
                .from('motorista_veiculo')
                .select('veiculo_id')
                .eq('motorista_id', motoristaId)
                .eq('ativo', true)
                .single()
            
            if (error || !data) {
                return null
            }
            
            return await this.getVeiculoById(data.veiculo_id)
        }

        // Registrar check-in de motorista
        async registrarCheckin(dados) {
            // Incluir localização se disponível
            if (dados.latitude && dados.longitude) {
                dados.localizacao = `POINT(${dados.longitude} ${dados.latitude})`
            }
            
            return this.inserir('checkins', dados)
        }

        // Atualizar KM de veículo
        async atualizarKmVeiculo(veiculoId, kmAtual) {
            // Primeiro atualiza o veículo
            await this.atualizar('veiculos', veiculoId, {
                km_atual: kmAtual,
                updated_at: new Date().toISOString()
            })
            
            // Depois adiciona ao histórico
            await this.inserir('historico_km', {
                veiculo_id: veiculoId,
                data: new Date().toISOString(),
                km: kmAtual
            })
            
            return true
        }

        // Vincular motorista a veículo
        async vincularMotoristaVeiculo(motoristaId, veiculoId) {
            // Primeiro, desativar vinculações existentes
            const { data: vinculacoes, error: errorSelect } = await supabase
                .from('motorista_veiculo')
                .select()
                .eq('motorista_id', motoristaId)
                .eq('ativo', true)
                
            if (errorSelect) {
                console.error('Erro ao buscar vinculações:', errorSelect)
            } else if (vinculacoes && vinculacoes.length > 0) {
                // Atualizar vinculações existentes para não ativas
                for (const vinc of vinculacoes) {
                    await supabase
                        .from('motorista_veiculo')
                        .update({
                            ativo: false,
                            data_fim: new Date().toISOString()
                        })
                        .eq('id', vinc.id)
                }
            }
            
            // Criar nova vinculação
            await this.inserir('motorista_veiculo', {
                motorista_id: motoristaId,
                veiculo_id: veiculoId,
                data_inicio: new Date().toISOString(),
                ativo: true
            })
            
            return true
        }

        // Obter histórico de veículos do motorista
        async getHistoricoVeiculosMotorista(motoristaId) {
            const { data, error } = await supabase
                .from('motorista_veiculo')
                .select(`
                    id,
                    veiculo_id,
                    data_inicio,
                    data_fim,
                    veiculos:veiculo_id(placa, modelo)
                `)
                .eq('motorista_id', motoristaId)
                .eq('ativo', false)
                .order('data_inicio', { ascending: false })
                
            if (error) {
                console.error('Erro ao buscar histórico de veículos:', error)
                return []
            }
            
            // Formatar os dados para incluir o último KM registrado
            const resultado = []
            for (const item of data) {
                const kmRegistrado = await this.getUltimoKmRegistrado(item.veiculo_id, item.data_fim)
                resultado.push({
                    veiculoId: item.veiculo_id,
                    dataUso: item.data_inicio,
                    dataFim: item.data_fim,
                    kmRegistrado: kmRegistrado,
                    placa: item.veiculos?.placa,
                    modelo: item.veiculos?.modelo
                })
            }
            
            return resultado
        }

        // Obter último KM registrado para um veículo até determinada data
        async getUltimoKmRegistrado(veiculoId, dataLimite) {
            const { data, error } = await supabase
                .from('historico_km')
                .select('km')
                .eq('veiculo_id', veiculoId)
                .lt('data', dataLimite || new Date().toISOString())
                .order('data', { ascending: false })
                .limit(1)
                
            if (error || !data || data.length === 0) {
                return 0
            }
            
            return data[0].km
        }

        // Obter histórico de KM de um veículo
        async getHistoricoKmVeiculo(veiculoId) {
            const { data, error } = await supabase
                .from('historico_km')
                .select()
                .eq('veiculo_id', veiculoId)
                .order('data', { ascending: false })
                
            if (error) {
                console.error('Erro ao buscar histórico de KM:', error)
                return []
            }
            
            return data
        }

        // Registrar problema em veículo
        async registrarProblemaVeiculo(veiculoId, motoristaId, descricao) {
            return this.inserir('problemas_veiculos', {
                veiculo_id: veiculoId,
                motorista_id: motoristaId,
                descricao: descricao,
                data: new Date().toISOString(),
                status: 'pendente'
            })
        }

        // Obter última manutenção de um veículo
        async getUltimaManutencaoVeiculo(veiculoId) {
            const { data, error } = await supabase
                .from('manutencoes')
                .select()
                .eq('veiculo_id', veiculoId)
                .order('data', { ascending: false })
                .limit(1)
                
            if (error || !data || data.length === 0) {
                return null
            }
            
            return data[0]
        }

        // Obter histórico de manutenções de um veículo
        async getHistoricoManutencaoVeiculo(veiculoId) {
            try {
                const { data, error } = await supabase
                    .from('manutencoes')
                    .select()
                    .eq('veiculo_id', veiculoId)
                    .order('data', { ascending: false })
                    
                if (error) throw error;
                
                return data || [];
            } catch (error) {
                console.error('Erro ao buscar histórico de manutenções:', error);
                return [];
            }
        }

        // Método para gerar dados mockados para desenvolvimento
        gerarDadosMock(tabela, options = {}) {
            console.warn(`Gerando dados mock para a tabela ${tabela}`);
            
            // Dados mockados por tabela
            const mockData = {
                'veiculos': [
                    {
                        id: 1,
                        placa: 'ABC1234',
                        tipo: 'caminhao',
                        modelo: 'Volvo FH',
                        fabricante: 'Volvo',
                        ano: 2020,
                        capacidade: 20000,
                        quilometragem: 50000,
                        chassi: 'ABC123456789',
                        status: 'operacional',
                        ultima_manutencao: '2023-06-01',
                        proxima_manutencao: '2023-12-01',
                        tipo_manutencao: 'preventiva',
                        responsavel_manutencao: 'Oficina XYZ',
                        observacoes: 'Veículo em bom estado'
                    },
                    {
                        id: 2,
                        placa: 'DEF5678',
                        tipo: 'van',
                        modelo: 'Sprinter',
                        fabricante: 'Mercedes',
                        ano: 2019,
                        capacidade: 8000,
                        quilometragem: 75000,
                        chassi: 'DEF987654321',
                        status: 'manutencao',
                        ultima_manutencao: '2023-03-15',
                        proxima_manutencao: '2023-09-15',
                        tipo_manutencao: 'corretiva',
                        responsavel_manutencao: 'Oficina ABC',
                        observacoes: 'Problemas no sistema de freios'
                    }
                ],
                'motoristas': [
                    {
                        id: 1,
                        nome: 'João Silva',
                        cpf: '12345678901',
                        cnh: '98765432101',
                        data_nascimento: '1985-05-10',
                        telefone: '11987654321',
                        email: 'joao@exemplo.com',
                        status: 'ativo'
                    },
                    {
                        id: 2,
                        nome: 'Maria Oliveira',
                        cpf: '10987654321',
                        cnh: '12345678910',
                        data_nascimento: '1990-07-15',
                        telefone: '11912345678',
                        email: 'maria@exemplo.com',
                        status: 'ativo'
                    }
                ],
                'entregas': [
                    {
                        id: 1,
                        data_entrega: '2023-07-01',
                        motorista_id: 1,
                        motorista_nome: 'João Silva',
                        origem: 'Depósito Central',
                        destino: 'Cliente ABC',
                        capacidade: 5.5,
                        valor: 1200.00,
                        nota_fiscal: '12345',
                        status_nf: 'emitida',
                        observacoes: 'Entregar pela manhã'
                    },
                    {
                        id: 2,
                        data_entrega: '2023-07-02',
                        motorista_id: 2,
                        motorista_nome: 'Maria Oliveira',
                        origem: 'Depósito Central',
                        destino: 'Cliente XYZ',
                        capacidade: 7.8,
                        valor: 1500.00,
                        nota_fiscal: '12346',
                        status_nf: 'pendente',
                        observacoes: 'Entregar à tarde'
                    }
                ]
            };
            
            // Retornar dados da tabela solicitada ou array vazio
            return mockData[tabela] || [];
        }
    }

    // Criar uma instância global após o documento ser carregado
    document.addEventListener('DOMContentLoaded', function() {
        // Verificar se o Supabase já está carregado
        if (window.supabase) {
            window.api = new window.SupabaseAPI();
        } else {
            // Aguardar o evento 'supabaseReady' para criar a instância
            document.addEventListener('supabaseReady', function() {
                window.api = new window.SupabaseAPI();
            });
        }
    });
} else {
    console.log('SupabaseAPI já definida anteriormente');
    
    // Garantir que a API global exista
    if (!window.api) {
        document.addEventListener('DOMContentLoaded', function() {
            if (window.supabase) {
                window.api = new window.SupabaseAPI();
            } else {
                document.addEventListener('supabaseReady', function() {
                    window.api = new window.SupabaseAPI();
                });
            }
        });
    }
}

// Inicializar a API global
if (!window.api) {
    window.api = new SupabaseAPI();
}

// Não é necessário exportar, pois já está no escopo global (window) 