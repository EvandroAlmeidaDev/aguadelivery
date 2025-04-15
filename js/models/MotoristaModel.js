/**
 * Classe modelo para representar um motorista
 */
export class MotoristaModel {
    /**
     * Cria uma nova instância de motorista
     * @param {Object} dados - Dados do motorista
     */
    constructor(dados = {}) {
        this.id = dados.id || Date.now();
        this.nome = dados.nome || '';
        this.documento = dados.documento || '';
        this.telefone = dados.telefone || '';
        this.email = dados.email || '';
        this.cnh = dados.cnh || '';
        this.categoria = dados.categoria || '';
        this.dataValidade = dados.dataValidade || '';
        this.disponivel = dados.disponivel ?? true;
        this.dataCriacao = dados.dataCriacao || new Date().toISOString();
        this.dataAtualizacao = dados.dataAtualizacao || new Date().toISOString();
    }

    /**
     * Atualiza os dados do motorista
     * @param {Object} dados - Novos dados para atualizar
     */
    atualizar(dados) {
        Object.assign(this, {
            ...dados,
            dataAtualizacao: new Date().toISOString()
        });
    }

    /**
     * Converte o modelo para um objeto simples para armazenamento
     * @returns {Object} Objeto com os dados do motorista
     */
    paraJSON() {
        return {
            id: this.id,
            nome: this.nome,
            documento: this.documento,
            telefone: this.telefone,
            email: this.email,
            cnh: this.cnh,
            categoria: this.categoria,
            dataValidade: this.dataValidade,
            disponivel: this.disponivel,
            dataCriacao: this.dataCriacao,
            dataAtualizacao: this.dataAtualizacao
        };
    }

    /**
     * Cria uma instância de MotoristaModel a partir de um objeto JSON
     * @param {Object} json - Objeto com dados do motorista
     * @returns {MotoristaModel} Nova instância de MotoristaModel
     */
    static deJSON(json) {
        return new MotoristaModel(json);
    }
} 