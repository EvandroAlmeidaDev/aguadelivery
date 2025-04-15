/**
 * header.js - Implementa o cabeçalho unificado com o botão "Sair"
 */

document.addEventListener('DOMContentLoaded', function() {
    // Atualizar o nome do usuário na barra superior
    atualizarNomeUsuario();
    
    // Verificar se o elemento de menu do usuário existe
    if (document.querySelector('.user-menu')) {
        // Adicionar dropdown ao menu do usuário se não existir
        const userMenu = document.querySelector('.user-menu');
        
        // Verificar se o dropdown já existe
        if (!userMenu.querySelector('.user-dropdown')) {
            // Criar o dropdown
            const dropdown = document.createElement('div');
            dropdown.className = 'user-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li><a href="#" id="btn-sair"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
                </ul>
            `;
            
            // Adicionar evento de toggle ao avatar
            const avatar = userMenu.querySelector('.avatar');
            if (avatar) {
                avatar.addEventListener('click', function() {
                    dropdown.classList.toggle('active');
                });
            }
            
            // Adicionar o dropdown ao menu
            userMenu.appendChild(dropdown);
            
            // Adicionar evento ao botão sair
            document.getElementById('btn-sair').addEventListener('click', function(e) {
                e.preventDefault();
                encerrarSessao();
            });
        }
    }
});

/**
 * Atualiza o nome do usuário na interface com base nos dados da sessão
 */
function atualizarNomeUsuario() {
    try {
        // Obter dados da sessão
        const sessao = obterSessao();
        
        if (sessao && sessao.usuario) {
            // Atualizar o nome em todos os elementos com a classe .user-name
            const userNameElements = document.querySelectorAll('.user-menu span');
            userNameElements.forEach(element => {
                element.textContent = `Olá, ${sessao.usuario.nome || 'Usuário'}`;
            });
            
            // Atualizar também o elemento com ID específico se existir
            const nomeUsuarioElement = document.getElementById('nomeUsuario');
            if (nomeUsuarioElement) {
                nomeUsuarioElement.textContent = sessao.usuario.nome || 'Usuário';
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar nome do usuário:', error);
    }
} 