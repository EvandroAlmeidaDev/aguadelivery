/**
 * Módulo de Autenticação
 * Este arquivo contém as funções relacionadas à autenticação de usuários no sistema.
 * Depende do arquivo supabase-client.js para acesso ao Supabase.
 */

// Variável para armazenar a sessão atual
let sessaoAtual = null;

/**
 * Inicializa o cliente Supabase se ainda não estiver inicializado
 * @returns {Object} Objeto contendo o status da inicialização
 */
async function initSupabase() {
    try {
        // Verifica se o cliente já foi inicializado
        if (typeof window.supabaseClient === 'undefined') {
            // Verifica se a função de inicialização está disponível
            if (typeof window.supabaseInit === 'function') {
                // Inicializa o cliente Supabase
                window.supabaseInit();
                console.log('Cliente Supabase inicializado com sucesso pelo auth.js');
            } else {
                throw new Error('Função de inicialização do Supabase não está disponível');
            }
        }
        
        // Verifica a conexão com o Supabase
        const connectionResult = await window.testSupabaseConnection();
        if (!connectionResult.success) {
            console.warn('Aviso de conexão:', connectionResult.message);
        }
        
        return { success: true, cliente: window.supabaseClient };
    } catch (error) {
        console.error('Erro ao inicializar Supabase em auth.js:', error);
        return { 
            success: false, 
            message: error.message || 'Erro ao inicializar o cliente Supabase',
            error
        };
    }
}

/**
 * Realiza o login do usuário no sistema
 * @param {string} usuario - Email para admin ou ID para motorista
 * @param {string} senha - Senha do usuário
 * @param {string} tipo - Tipo de usuário ('admin' ou 'driver')
 * @returns {Object} Objeto contendo o status do login e dados do usuário
 */
async function fazerLogin(usuario, senha, tipo = 'admin') {
    try {
        // Valida os parâmetros
        if (!usuario || !senha) {
            throw new Error('Usuário e senha são obrigatórios');
        }
        
        // Certifica que o tipo é válido
        tipo = tipo.toLowerCase();
        if (tipo !== 'admin' && tipo !== 'driver') {
            throw new Error('Tipo de usuário inválido');
        }
        
        // Inicializa o Supabase se necessário
        const init = await initSupabase();
        if (!init.success) {
            throw new Error(init.message || 'Falha ao inicializar o cliente Supabase');
        }
        
        // Definindo qual método de login usar com base no tipo
        let resultado;
        
        if (tipo === 'admin') {
            // Login com email/senha para administradores
            resultado = await window.supabaseClient.auth.signInWithPassword({
                email: usuario,
                password: senha
            });
        } else {
            // Para motoristas, usamos o ID como identificador
            // Primeiro verificamos se o ID existe e a senha corresponde
            const { data, error } = await window.supabaseClient
                .from('drivers')
                .select('*')
                .eq('driver_id', usuario)
                .single();
                
            if (error || !data) {
                throw new Error('Motorista não encontrado');
            }
            
            // Verifica a senha (aqui você pode implementar sua própria lógica de verificação)
            // Caso esteja usando hash de senha, utilize um método de comparação adequado
            if (data.password !== senha) {
                throw new Error('Senha incorreta');
            }
            
            // Se chegou aqui, o login foi bem-sucedido
            resultado = { 
                data: { 
                    session: { 
                        user: { 
                            id: data.id, 
                            role: 'driver',
                            user_metadata: data 
                        } 
                    } 
                }, 
                error: null 
            };
        }
        
        // Verifica se houve erro na autenticação
        if (resultado.error) {
            throw new Error(resultado.error.message || 'Falha na autenticação');
        }
        
        // Se não houver sessão, algo deu errado
        if (!resultado.data || !resultado.data.session) {
            throw new Error('Sessão não foi criada corretamente');
        }
        
        // Armazena sessão atual
        sessaoAtual = {
            token: tipo === 'admin' ? resultado.data.session.access_token : 'driver_token',
            usuario: resultado.data.session.user,
            tipo: tipo,
            expira: new Date(Date.now() + 3600 * 1000) // Expira em 1 hora
        };
        
        // Armazena no localStorage para persistência
        localStorage.setItem('agua_delivery_session', JSON.stringify(sessaoAtual));
        
        console.log(`Login bem-sucedido como ${tipo}`);
        return { success: true, usuario: sessaoAtual.usuario, tipo: sessaoAtual.tipo };
    } catch (error) {
        console.error('Erro no processo de login:', error);
        
        // Formata a mensagem de erro para o usuário
        let mensagemErro = 'Falha na autenticação';
        
        if (error.message.includes('Email')) {
            mensagemErro = 'Email inválido ou não cadastrado';
        } else if (error.message.includes('password')) {
            mensagemErro = 'Senha incorreta';
        } else if (error.message.includes('motorista')) {
            mensagemErro = 'ID de motorista não encontrado';
        } else if (error.message.includes('connection')) {
            mensagemErro = 'Erro de conexão com o servidor';
        }
        
        return { success: false, message: mensagemErro, error };
    }
}

/**
 * Verifica se existe uma sessão ativa
 * @returns {Object|null} Dados da sessão ou null se não houver sessão
 */
function verificarSessao() {
    try {
        // Se já temos uma sessão em memória e não expirou, retorna
        if (sessaoAtual && new Date(sessaoAtual.expira) > new Date()) {
            return sessaoAtual;
        }
        
        // Tenta recuperar do localStorage
        const sessaoSalva = localStorage.getItem('agua_delivery_session');
        
        if (!sessaoSalva) {
            return null;
        }
        
        // Converte a sessão salva
        const sessao = JSON.parse(sessaoSalva);
        
        // Verifica se a sessão expirou
        if (new Date(sessao.expira) <= new Date()) {
            // Sessão expirada, remove do localStorage
            localStorage.removeItem('agua_delivery_session');
            return null;
        }
        
        // Atualiza a sessão em memória
        sessaoAtual = sessao;
        return sessaoAtual;
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        return null;
    }
}

/**
 * Realiza o logout do usuário
 * @returns {Object} Status do logout
 */
async function fazerLogout() {
    try {
        // Inicializa o Supabase se necessário (apenas para admin)
        if (sessaoAtual && sessaoAtual.tipo === 'admin') {
            // Certifica que o cliente Supabase está inicializado
            await initSupabase();
            
            // Realiza o logout no Supabase
            if (window.supabaseClient) {
                await window.supabaseClient.auth.signOut();
            }
        }
        
        // Limpa a sessão em memória e localStorage
        sessaoAtual = null;
        localStorage.removeItem('agua_delivery_session');
        
        // Redireciona para a página de login
        window.location.href = 'login.html';
        
        return { success: true };
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Verifica se o usuário possui permissão para acessar determinada rota
 * @param {string} tipo - Tipo de usuário ('admin' ou 'driver')
 * @returns {boolean} Se o usuário pode acessar a rota
 */
function verificarPermissao(tipo) {
    try {
        // Verifica se há sessão ativa
        const sessao = verificarSessao();
        if (!sessao) {
            return false;
        }
        
        // Verifica se o tipo de usuário corresponde ao necessário
        return sessao.tipo === tipo;
    } catch (error) {
        console.error('Erro ao verificar permissão:', error);
        return false;
    }
}

/**
 * Protege uma página para que apenas usuários autenticados possam acessá-la
 * @param {string} tipoPermitido - Tipo de usuário que pode acessar a página
 * @param {string} redirectUrl - URL para redirecionamento caso não tenha permissão
 */
function protegerPagina(tipoPermitido = 'admin', redirectUrl = 'login.html') {
    // Verifica se o usuário está autenticado e tem permissão
    const temPermissao = verificarPermissao(tipoPermitido);
    
    if (!temPermissao) {
        // Redireciona para a página de login ou outra página especificada
        window.location.href = redirectUrl;
    }
}

// Exporta as funções para uso global
window.fazerLogin = fazerLogin;
window.fazerLogout = fazerLogout;
window.verificarSessao = verificarSessao;
window.verificarPermissao = verificarPermissao;
window.protegerPagina = protegerPagina;