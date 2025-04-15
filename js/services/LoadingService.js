/**
 * Serviço para gerenciar indicadores de carregamento
 */
export class LoadingService {
    constructor() {
        this.loadingOverlay = null;
        this.loadingCount = 0;
    }
    
    /**
     * Mostra o indicador de carregamento
     * @param {boolean} fullScreen - Se deve mostrar em tela cheia
     * @param {HTMLElement} container - Container para mostrar o indicador (se não for tela cheia)
     * @returns {HTMLElement} - Elemento do indicador de carregamento
     */
    show(fullScreen = false, container = null) {
        this.loadingCount++;
        
        if (fullScreen) {
            // Verifica se já existe um overlay
            if (this.loadingOverlay) {
                this.loadingOverlay.style.display = 'flex';
                return this.loadingOverlay;
            }
            
            // Cria o overlay de carregamento
            this.loadingOverlay = document.createElement('div');
            this.loadingOverlay.className = 'loading-overlay';
            
            // Cria o spinner
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            
            // Adiciona o spinner ao overlay
            this.loadingOverlay.appendChild(spinner);
            
            // Adiciona o overlay ao body
            document.body.appendChild(this.loadingOverlay);
            
            return this.loadingOverlay;
        } else if (container) {
            // Cria um spinner para o container
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            
            // Adiciona o spinner ao container
            container.appendChild(spinner);
            
            // Adiciona uma classe ao container
            container.classList.add('loading');
            
            return spinner;
        }
        
        return null;
    }
    
    /**
     * Esconde o indicador de carregamento
     * @param {boolean} fullScreen - Se deve esconder o indicador de tela cheia
     * @param {HTMLElement} container - Container que contém o indicador
     * @param {HTMLElement} spinner - Elemento do spinner a ser removido
     */
    hide(fullScreen = false, container = null, spinner = null) {
        this.loadingCount = Math.max(0, this.loadingCount - 1);
        
        if (fullScreen && this.loadingOverlay) {
            if (this.loadingCount === 0) {
                this.loadingOverlay.style.display = 'none';
            }
        } else if (container && spinner) {
            // Remove o spinner
            if (spinner.parentNode === container) {
                container.removeChild(spinner);
            }
            
            // Remove a classe do container
            container.classList.remove('loading');
        }
    }
    
    /**
     * Executa uma função assíncrona mostrando um indicador de carregamento
     * @param {Function} asyncFn - Função assíncrona a ser executada
     * @param {boolean} fullScreen - Se deve mostrar em tela cheia
     * @param {HTMLElement} container - Container para mostrar o indicador
     * @returns {Promise<any>} - Resultado da função assíncrona
     */
    async execute(asyncFn, fullScreen = false, container = null) {
        // Mostra o indicador de carregamento
        const spinner = this.show(fullScreen, container);
        
        try {
            // Executa a função assíncrona
            const result = await asyncFn();
            return result;
        } finally {
            // Esconde o indicador de carregamento
            this.hide(fullScreen, container, spinner);
        }
    }
} 