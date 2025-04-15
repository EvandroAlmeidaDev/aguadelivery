/**
 * Serviço para gerenciamento de emails utilizando a conta Gmail
 */
class EmailService {
    constructor() {
        this.config = {
            serviceType: 'gmail', // Tipo de serviço (apenas Gmail suportado)
            username: '',         // Email Gmail
            password: '',         // Senha de aplicativo do Gmail
            displayName: '',      // Nome de exibição
            isConfigured: false   // Indicador se o serviço está configurado
        };
        
        this.emailHistory = [];
        this.loadConfig();
    }
    
    /**
     * Carrega a configuração do localStorage
     */
    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('emailServiceConfig');
            if (savedConfig) {
                this.config = JSON.parse(savedConfig);
            } else {
                console.log('Nenhuma configuração de email encontrada');
            }
        } catch (error) {
            console.error('Erro ao carregar configuração de email:', error);
        }
    }
    
    /**
     * Salva a configuração no localStorage
     */
    saveConfig(config) {
        try {
            this.config = {
                ...this.config,
                ...config,
                isConfigured: !!config.username && !!config.password
            };
            
            localStorage.setItem('emailServiceConfig', JSON.stringify(this.config));
            return true;
        } catch (error) {
            console.error('Erro ao salvar configuração de email:', error);
            return false;
        }
    }
    
    /**
     * Verifica se o serviço de email está configurado
     */
    isConfigured() {
        return this.config.isConfigured;
    }
    
    /**
     * Envia um email
     * @param {Object} emailData Dados do email a ser enviado
     * @returns {Promise<boolean>} Resultado do envio
     */
    async sendEmail(emailData) {
        if (!this.isConfigured()) {
            throw new Error('Serviço de email não configurado');
        }
        
        // Validar campos obrigatórios
        if (!emailData.to || !emailData.subject) {
            throw new Error('Destinatário e assunto são obrigatórios');
        }
        
        try {
            // Simulando o envio de email via SMTP
            console.log(`Enviando email para ${emailData.to} com o assunto "${emailData.subject}"`);
            
            // Aguarda para simular requisição de rede
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Registra o email enviado no histórico
            const emailRecord = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                to: emailData.to,
                subject: emailData.subject,
                status: 'sent'
            };
            
            this.emailHistory.unshift(emailRecord);
            
            // Limita o histórico a 50 emails
            if (this.emailHistory.length > 50) {
                this.emailHistory = this.emailHistory.slice(0, 50);
            }
            
            // Salva o histórico no localStorage
            localStorage.setItem('emailHistory', JSON.stringify(this.emailHistory));
            
            return true;
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            
            // Registra a falha no histórico
            const emailRecord = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                to: emailData.to,
                subject: emailData.subject,
                status: 'failed',
                error: error.message
            };
            
            this.emailHistory.unshift(emailRecord);
            localStorage.setItem('emailHistory', JSON.stringify(this.emailHistory));
            
            throw error;
        }
    }
    
    /**
     * Recupera o histórico de emails enviados
     */
    getEmailHistory() {
        try {
            const savedHistory = localStorage.getItem('emailHistory');
            if (savedHistory) {
                this.emailHistory = JSON.parse(savedHistory);
            }
        } catch (error) {
            console.error('Erro ao carregar histórico de emails:', error);
        }
        
        return this.emailHistory;
    }
    
    /**
     * Testa a conexão com o serviço de email
     * @param {Object} testConfig Configuração a ser testada
     * @returns {Promise<boolean>} Resultado do teste
     */
    async testConnection(testConfig) {
        const configToTest = testConfig || this.config;
        
        if (!configToTest.username || !configToTest.password) {
            throw new Error('Email e senha de aplicativo são obrigatórios');
        }
        
        try {
            // Simulando o teste de conexão
            console.log(`Testando conexão com o Gmail usando ${configToTest.username}`);
            
            // Aguarda para simular requisição de rede
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simula uma validação básica de email
            if (!configToTest.username.includes('@') || !configToTest.username.includes('.')) {
                throw new Error('Endereço de email inválido');
            }
            
            // Se a senha for muito curta, consideramos inválida
            if (configToTest.password.length < 8) {
                throw new Error('Senha de aplicativo inválida (muito curta)');
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao testar conexão:', error);
            throw error;
        }
    }
}

// Exporta a classe para uso global
window.EmailService = EmailService; 