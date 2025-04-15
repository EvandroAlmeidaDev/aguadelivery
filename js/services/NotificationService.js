/**
 * Serviço para gerenciar notificações do tipo toast
 */
export class NotificationService {
    constructor() {
        this.container = this.createContainer();
        this.toasts = [];
    }

    /**
     * Cria o container para os toasts caso não exista
     * @returns {HTMLElement} Container para os toasts
     */
    createContainer() {
        let container = document.getElementById('toast-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.classList.add('toast-container');
            document.body.appendChild(container);
        }
        
        return container;
    }

    /**
     * Mostra uma mensagem toast
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo de mensagem (success, warning, error, info)
     * @param {number} duration - Duração em milissegundos
     */
    show(message, type = 'info', duration = 3000) {
        // Cria o elemento toast
        const toast = document.createElement('div');
        toast.classList.add('toast', `toast-${type}`);
        
        // Adiciona ícone com base no tipo
        let icon = '';
        switch (type) {
            case 'success':
                icon = 'fas fa-check-circle';
                break;
            case 'warning':
                icon = 'fas fa-exclamation-triangle';
                break;
            case 'error':
                icon = 'fas fa-times-circle';
                break;
            default:
                icon = 'fas fa-info-circle';
        }
        
        // Conteúdo do toast
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${icon}"></i>
                <div class="toast-message">${message}</div>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-progress"></div>
        `;
        
        // Adiciona evento para fechar o toast
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));
        
        // Adiciona ao container
        this.container.appendChild(toast);
        
        // Inicia a barra de progresso
        const progress = toast.querySelector('.toast-progress');
        progress.style.animationDuration = `${duration}ms`;
        
        // Adiciona classe para animar entrada
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Adiciona à lista de toasts ativos
        this.toasts.push(toast);
        
        // Remove após o tempo definido
        setTimeout(() => {
            this.remove(toast);
        }, duration);
        
        return toast;
    }
    
    /**
     * Remove um toast
     * @param {HTMLElement} toast - Elemento toast a ser removido
     */
    remove(toast) {
        if (!toast) return;
        
        // Anima a saída
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        // Remove o elemento após a animação
        setTimeout(() => {
            if (toast.parentNode === this.container) {
                this.container.removeChild(toast);
            }
            
            // Remove da lista de toasts ativos
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }
    
    /**
     * Atalho para mostrar mensagem de sucesso
     * @param {string} message - Mensagem a ser exibida
     * @param {number} duration - Duração em milissegundos
     */
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }
    
    /**
     * Atalho para mostrar mensagem de erro
     * @param {string} message - Mensagem a ser exibida
     * @param {number} duration - Duração em milissegundos
     */
    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }
    
    /**
     * Atalho para mostrar mensagem de alerta
     * @param {string} message - Mensagem a ser exibida
     * @param {number} duration - Duração em milissegundos
     */
    warning(message, duration = 3500) {
        return this.show(message, 'warning', duration);
    }
    
    /**
     * Atalho para mostrar mensagem informativa
     * @param {string} message - Mensagem a ser exibida
     * @param {number} duration - Duração em milissegundos
     */
    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
} 