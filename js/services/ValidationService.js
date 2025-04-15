/**
 * Serviço para validação de formulários e formatação de dados
 */
export class ValidationService {
    /**
     * Valida um formulário
     * @param {HTMLFormElement} form - Formulário a ser validado
     * @param {Object} rules - Regras de validação por campo
     * @returns {Object} - Objeto com o resultado da validação
     */
    validateForm(form, rules = {}) {
        const results = {
            isValid: true,
            fields: {},
            errors: {}
        };
        
        // Obtém todos os campos do formulário
        const formData = new FormData(form);
        
        // Valida cada campo
        for (const [fieldName, value] of formData.entries()) {
            // Armazena o valor
            results.fields[fieldName] = value;
            
            // Se não tiver regras para este campo, pula
            if (!rules[fieldName]) continue;
            
            // Aplica as regras de validação
            const fieldRules = rules[fieldName];
            const fieldElement = form.elements[fieldName];
            const fieldErrors = [];
            
            // Verifica se é obrigatório
            if (fieldRules.required && !value.trim()) {
                fieldErrors.push('Este campo é obrigatório');
            }
            
            // Verifica o tamanho mínimo
            if (fieldRules.minLength && value.length < fieldRules.minLength) {
                fieldErrors.push(`Este campo deve ter pelo menos ${fieldRules.minLength} caracteres`);
            }
            
            // Verifica o tamanho máximo
            if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
                fieldErrors.push(`Este campo deve ter no máximo ${fieldRules.maxLength} caracteres`);
            }
            
            // Verifica o valor mínimo (para números)
            if (fieldRules.min !== undefined && Number(value) < fieldRules.min) {
                fieldErrors.push(`O valor mínimo é ${fieldRules.min}`);
            }
            
            // Verifica o valor máximo (para números)
            if (fieldRules.max !== undefined && Number(value) > fieldRules.max) {
                fieldErrors.push(`O valor máximo é ${fieldRules.max}`);
            }
            
            // Verifica o padrão (regex)
            if (fieldRules.pattern && !new RegExp(fieldRules.pattern).test(value)) {
                fieldErrors.push(fieldRules.patternMessage || 'Formato inválido');
            }
            
            // Verifica funções customizadas
            if (fieldRules.custom && typeof fieldRules.custom === 'function') {
                const customError = fieldRules.custom(value, formData);
                if (customError) {
                    fieldErrors.push(customError);
                }
            }
            
            // Se tem erros, marca o campo e armazena os erros
            if (fieldErrors.length > 0) {
                results.isValid = false;
                results.errors[fieldName] = fieldErrors;
                
                // Adiciona classe de erro e mensagem
                if (fieldElement) {
                    fieldElement.classList.add('is-invalid');
                    
                    // Adiciona mensagem de erro
                    let errorContainer = form.querySelector(`.feedback-${fieldName}`);
                    if (!errorContainer) {
                        errorContainer = document.createElement('div');
                        errorContainer.className = `invalid-feedback feedback-${fieldName}`;
                        fieldElement.parentNode.appendChild(errorContainer);
                    }
                    
                    errorContainer.textContent = fieldErrors[0];
                }
            } else {
                // Remove classe de erro
                if (fieldElement) {
                    fieldElement.classList.remove('is-invalid');
                    fieldElement.classList.add('is-valid');
                    
                    // Remove mensagem de erro
                    const errorContainer = form.querySelector(`.feedback-${fieldName}`);
                    if (errorContainer) {
                        errorContainer.textContent = '';
                    }
                }
            }
        }
        
        return results;
    }
    
    /**
     * Formata um valor de moeda para exibição
     * @param {string|number} value - Valor a ser formatado
     * @returns {string} - Valor formatado como moeda
     */
    formatCurrency(value) {
        // Se for undefined ou null, retorna vazio
        if (value === undefined || value === null || value === '') {
            return '';
        }
        
        // Remove caracteres não numéricos
        let numericValue = value.toString().replace(/[^\d]/g, '');
        
        // Converte para número com 2 casas decimais
        const floatValue = parseFloat(numericValue) / 100;
        
        // Formata como moeda brasileira
        return floatValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2
        });
    }
    
    /**
     * Converte um valor formatado como moeda para número
     * @param {string} formattedValue - Valor formatado como moeda
     * @returns {number} - Valor numérico
     */
    parseCurrency(formattedValue) {
        if (!formattedValue) return 0;
        
        // Remove caracteres não numéricos, exceto ponto e vírgula
        const cleanValue = formattedValue.replace(/[^\d,.]/g, '');
        
        // Substitui vírgula por ponto
        const normalizedValue = cleanValue.replace(',', '.');
        
        // Converte para número
        return parseFloat(normalizedValue);
    }
    
    /**
     * Formata um número de placa de veículo para o padrão brasileiro
     * @param {string} plate - Número da placa
     * @returns {string} - Placa formatada
     */
    formatPlate(plate) {
        if (!plate) return '';
        
        // Remove caracteres não alfanuméricos
        const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        
        // Formata a placa para o novo padrão (Mercosul) ou antigo
        if (cleanPlate.length === 7) {
            if (/^[A-Z]{3}[0-9]{1}[A-Z0-9]{1}[0-9]{2}$/.test(cleanPlate)) {
                // Mercosul
                return `${cleanPlate.substring(0, 3)}-${cleanPlate.substring(3)}`;
            } else if (/^[A-Z]{3}[0-9]{4}$/.test(cleanPlate)) {
                // Padrão antigo
                return `${cleanPlate.substring(0, 3)}-${cleanPlate.substring(3)}`;
            }
        }
        
        return cleanPlate;
    }
    
    /**
     * Formata um valor de capacidade em litros
     * @param {string|number} value - Valor em litros
     * @returns {string} - Valor formatado
     */
    formatCapacity(value) {
        if (!value) return '';
        
        // Remove caracteres não numéricos
        const numericValue = parseFloat(value.toString().replace(/[^\d,.]/g, '').replace(',', '.'));
        
        if (isNaN(numericValue)) return '';
        
        // Formata com separador de milhares
        const formatted = numericValue.toLocaleString('pt-BR');
        
        return `${formatted} L`;
    }
    
    /**
     * Valida um CPF
     * @param {string} cpf - CPF a ser validado
     * @returns {boolean} - Se o CPF é válido
     */
    validateCPF(cpf) {
        if (!cpf) return false;
        
        // Remove caracteres não numéricos
        cpf = cpf.replace(/[^\d]/g, '');
        
        // Verifica se tem 11 dígitos
        if (cpf.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cpf)) return false;
        
        // Validação do primeiro dígito verificador
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        
        let resto = soma % 11;
        let dv1 = resto < 2 ? 0 : 11 - resto;
        
        if (parseInt(cpf.charAt(9)) !== dv1) return false;
        
        // Validação do segundo dígito verificador
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        
        resto = soma % 11;
        let dv2 = resto < 2 ? 0 : 11 - resto;
        
        return parseInt(cpf.charAt(10)) === dv2;
    }
    
    /**
     * Valida um CNPJ
     * @param {string} cnpj - CNPJ a ser validado
     * @returns {boolean} - Se o CNPJ é válido
     */
    validateCNPJ(cnpj) {
        if (!cnpj) return false;
        
        // Remove caracteres não numéricos
        cnpj = cnpj.replace(/[^\d]/g, '');
        
        // Verifica se tem 14 dígitos
        if (cnpj.length !== 14) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cnpj)) return false;
        
        // Validação do primeiro dígito verificador
        let soma = 0;
        let peso = 5;
        
        for (let i = 0; i < 12; i++) {
            soma += parseInt(cnpj.charAt(i)) * peso;
            peso = peso === 2 ? 9 : peso - 1;
        }
        
        let resto = soma % 11;
        let dv1 = resto < 2 ? 0 : 11 - resto;
        
        if (parseInt(cnpj.charAt(12)) !== dv1) return false;
        
        // Validação do segundo dígito verificador
        soma = 0;
        peso = 6;
        
        for (let i = 0; i < 13; i++) {
            soma += parseInt(cnpj.charAt(i)) * peso;
            peso = peso === 2 ? 9 : peso - 1;
        }
        
        resto = soma % 11;
        let dv2 = resto < 2 ? 0 : 11 - resto;
        
        return parseInt(cnpj.charAt(13)) === dv2;
    }
} 