/**
 * Serviço para gerenciar o armazenamento local dos dados
 */
export class StorageService {
    constructor() {
        this.storage = localStorage;
        this.PREFIX = 'agua_delivery_';
    }
    
    /**
     * Salva dados no armazenamento local
     * @param {string} key - Chave para acessar os dados
     * @param {any} data - Dados a serem salvos
     */
    save(key, data) {
        const fullKey = this.PREFIX + key;
        try {
            const serializedData = JSON.stringify(data);
            this.storage.setItem(fullKey, serializedData);
            return true;
        } catch (error) {
            console.error(`Erro ao salvar dados: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Recupera dados do armazenamento local
     * @param {string} key - Chave para acessar os dados
     * @returns {any} - Dados recuperados ou null se não existirem
     */
    get(key) {
        const fullKey = this.PREFIX + key;
        try {
            const serializedData = this.storage.getItem(fullKey);
            if (!serializedData) return null;
            return JSON.parse(serializedData);
        } catch (error) {
            console.error(`Erro ao recuperar dados: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Remove dados do armazenamento local
     * @param {string} key - Chave para acessar os dados a serem removidos
     */
    remove(key) {
        const fullKey = this.PREFIX + key;
        try {
            this.storage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error(`Erro ao remover dados: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Atualiza um item em uma coleção de dados
     * @param {string} collectionKey - Chave da coleção
     * @param {number} id - ID do item a ser atualizado
     * @param {any} newData - Novos dados para o item
     * @returns {boolean} - Sucesso da operação
     */
    updateItem(collectionKey, id, newData) {
        const collection = this.get(collectionKey);
        if (!collection) return false;
        
        const index = collection.findIndex(item => item.id === id);
        if (index === -1) return false;
        
        collection[index] = { ...collection[index], ...newData };
        return this.save(collectionKey, collection);
    }
    
    /**
     * Adiciona um item a uma coleção de dados
     * @param {string} collectionKey - Chave da coleção
     * @param {any} item - Item a ser adicionado
     * @returns {boolean} - Sucesso da operação
     */
    addItem(collectionKey, item) {
        const collection = this.get(collectionKey) || [];
        
        // Gera um novo ID para o item
        const newId = collection.length > 0 
            ? Math.max(...collection.map(i => i.id)) + 1 
            : 1;
            
        const newItem = { ...item, id: newId };
        collection.push(newItem);
        
        return this.save(collectionKey, collection);
    }
    
    /**
     * Remove um item de uma coleção de dados
     * @param {string} collectionKey - Chave da coleção
     * @param {number} id - ID do item a ser removido
     * @returns {boolean} - Sucesso da operação
     */
    removeItem(collectionKey, id) {
        const collection = this.get(collectionKey);
        if (!collection) return false;
        
        const updatedCollection = collection.filter(item => item.id !== id);
        if (updatedCollection.length === collection.length) return false;
        
        return this.save(collectionKey, updatedCollection);
    }
} 