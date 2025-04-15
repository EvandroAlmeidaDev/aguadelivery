/**
 * Classe modelo para representar uma entrega
 */
export class EntregaModel {
    /**
     * Cria uma nova instância de entrega
     * @param {Object} dados - Dados da entrega
     */
    constructor(dados = {}) {
        this.id = dados.id || Date.now();
        this.data = dados.data || '';
        this.motorista = dados.motorista || '';
        this.placa = dados.placa || '';
        this.km = dados.km || 0;
        this.origem = dados.origem || '';
        this.destino = dados.destino || '';
        this.capacidade = dados.capacidade || 0;
        this.valor = dados.valor || 0;
        this.statusPagamento = dados.statusPagamento || false;
        this.dataCriacao = dados.dataCriacao || new Date().toISOString();
        this.dataAtualizacao = dados.dataAtualizacao || new Date().toISOString();
    }

    /**
     * Atualiza os dados da entrega
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
     * @returns {Object} Objeto com os dados da entrega
     */
    paraJSON() {
        return {
            id: this.id,
            data: this.data,
            motorista: this.motorista,
            placa: this.placa,
            km: this.km,
            origem: this.origem,
            destino: this.destino,
            capacidade: this.capacidade,
            valor: this.valor,
            statusPagamento: this.statusPagamento,
            dataCriacao: this.dataCriacao,
            dataAtualizacao: this.dataAtualizacao
        };
    }

    /**
     * Cria uma instância de EntregaModel a partir de um objeto JSON
     * @param {Object} json - Objeto com dados da entrega
     * @returns {EntregaModel} Nova instância de EntregaModel
     */
    static deJSON(json) {
        return new EntregaModel(json);
    }
} 