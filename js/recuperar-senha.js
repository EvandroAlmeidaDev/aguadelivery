// Gerenciador de Recuperação de Senha
const RecuperarSenhaManager = {
    // Estado da aplicação
    state: {
        email: '',
        tipoUsuario: '',
        codigoVerificacao: '',
        usuarioEncontrado: null,
        step: 1
    },
    
    // Inicializar
    init: function() {
        this.setupEventListeners();
        this.setupVerificationCodeInputs();
    },
    
    // Configurar listeners de eventos
    setupEventListeners: function() {
        // Formulário etapa 1
        document.getElementById('recovery-form-step1').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processStep1();
        });
        
        // Formulário etapa 2
        document.getElementById('recovery-form-step2').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processStep2();
        });
        
        // Formulário etapa 3
        document.getElementById('recovery-form-step3').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processStep3();
        });
        
        // Reenviar código
        document.getElementById('resend-code').addEventListener('click', () => {
            this.resendVerificationCode();
        });
        
        // Botões de navegação entre etapas
        document.getElementById('back-to-step1').addEventListener('click', (e) => {
            e.preventDefault();
            this.goToStep(1);
        });
        
        document.getElementById('back-to-step2').addEventListener('click', (e) => {
            e.preventDefault();
            this.goToStep(2);
        });
    },
    
    // Configurar inputs do código de verificação
    setupVerificationCodeInputs: function() {
        const inputs = document.querySelectorAll('.verification-code input');
        
        inputs.forEach((input, index) => {
            // Auto-focus no próximo input
            input.addEventListener('input', (e) => {
                // Garantir que apenas números sejam aceitos
                const value = e.target.value.replace(/[^0-9]/g, '');
                e.target.value = value;
                
                if (value !== '') {
                    // Avançar para o próximo input
                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                }
            });
            
            // Permitir backspace para voltar ao input anterior
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    inputs[index - 1].focus();
                }
            });
            
            // Permitir colar código completo
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                
                if (pastedText) {
                    const digits = pastedText.replace(/[^0-9]/g, '').split('');
                    
                    inputs.forEach((input, i) => {
                        if (digits[i]) {
                            input.value = digits[i];
                        }
                    });
                    
                    // Foco no último input preenchido ou no próximo vazio
                    for (let i = 0; i < inputs.length; i++) {
                        if (i === digits.length || !inputs[i].value) {
                            if (i < inputs.length) {
                                inputs[i].focus();
                            }
                            break;
                        }
                    }
                }
            });
        });
    },
    
    // Processar etapa 1
    processStep1: function() {
        const email = document.getElementById('email').value.trim();
        const tipoUsuario = document.getElementById('user-type').value;
        
        if (!email || !tipoUsuario) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        
        try {
            // Verificar se o usuário existe
            const usuario = this.findUserByEmail(email, tipoUsuario);
            
            if (!usuario) {
                alert('Não foi encontrado um usuário com este e-mail. Verifique as informações e tente novamente.');
                return;
            }
            
            // Usuário encontrado, seguir para o próximo passo
            this.state.email = email;
            this.state.tipoUsuario = tipoUsuario;
            this.state.usuarioEncontrado = usuario;
            
            // Gerar e "enviar" um código de verificação (simulado)
            this.generateVerificationCode();
            
            // Atualizar interface
            document.getElementById('user-email').textContent = email;
            
            // Avançar para etapa 2
            this.goToStep(2);
        } catch (error) {
            console.error('Erro ao processar etapa 1:', error);
            alert('Ocorreu um erro ao processar a solicitação. Por favor, tente novamente.');
        }
    },
    
    // Processar etapa 2
    processStep2: function() {
        const inputs = document.querySelectorAll('.verification-code input');
        let code = '';
        
        inputs.forEach(input => {
            code += input.value;
        });
        
        if (code.length !== 6) {
            alert('Por favor, digite o código de verificação completo.');
            return;
        }
        
        // Verificar se o código está correto
        if (code !== this.state.codigoVerificacao) {
            alert('Código de verificação inválido. Por favor, tente novamente.');
            return;
        }
        
        // Código válido, avançar para etapa 3
        this.goToStep(3);
    },
    
    // Processar etapa 3
    processStep3: function() {
        const novaSenha = document.getElementById('new-password').value;
        const confirmarSenha = document.getElementById('confirm-password').value;
        
        if (!novaSenha || !confirmarSenha) {
            alert('Por favor, preencha ambos os campos de senha.');
            return;
        }
        
        if (novaSenha !== confirmarSenha) {
            alert('As senhas não coincidem. Por favor, digite novamente.');
            return;
        }
        
        // Validar força da senha
        if (novaSenha.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        try {
            // Alterar a senha
            this.changeUserPassword(this.state.usuarioEncontrado.id, novaSenha);
            
            // Avançar para etapa 4 (sucesso)
            this.goToStep(4);
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            alert('Ocorreu um erro ao alterar a senha. Por favor, tente novamente.');
        }
    },
    
    // Gerar código de verificação
    generateVerificationCode: function() {
        // Código de 6 dígitos
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += Math.floor(Math.random() * 10);
        }
        
        this.state.codigoVerificacao = code;
        
        // Em um sistema real, aqui seria enviado o código por e-mail
        console.log(`Código de verificação para ${this.state.email}: ${code}`);
        
        // Para facilitar o teste, mostrar o código no console e em um alert
        alert(`[SISTEMA DE TESTE] Seu código de verificação é: ${code}`);
    },
    
    // Reenviar código de verificação
    resendVerificationCode: function() {
        this.generateVerificationCode();
        alert(`Um novo código de verificação foi enviado para ${this.state.email}.`);
    },
    
    // Encontrar usuário pelo e-mail
    findUserByEmail: function(email, tipo) {
        if (tipo === 'admin') {
            return mockApi.getAdminByEmail(email);
        } else if (tipo === 'motorista') {
            return mockApi.getMotoristaByEmail(email);
        }
        return null;
    },
    
    // Alterar senha do usuário
    changeUserPassword: function(userId, newPassword) {
        if (this.state.tipoUsuario === 'admin') {
            mockApi.alterarSenhaAdmin(userId, newPassword);
        } else if (this.state.tipoUsuario === 'motorista') {
            mockApi.alterarSenhaMotorista(userId, newPassword);
        }
    },
    
    // Ir para uma etapa específica
    goToStep: function(step) {
        // Ocultar todas as etapas
        document.querySelectorAll('.steps').forEach(el => {
            el.classList.remove('active');
        });
        
        // Mostrar etapa atual
        document.getElementById(`step${step}`).classList.add('active');
        
        // Atualizar progresso visual
        document.querySelectorAll('.progress-step').forEach((el, index) => {
            el.classList.remove('active', 'completed');
            
            if (index + 1 === step) {
                el.classList.add('active');
            } else if (index + 1 < step) {
                el.classList.add('completed');
            }
        });
        
        this.state.step = step;
    }
};

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    RecuperarSenhaManager.init();
}); 