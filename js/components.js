// Função para carregar componentes HTML
async function loadComponent(elementId, componentPath) {
    try {
        // Verificar se o elemento de destino existe
        const targetElement = document.getElementById(elementId);
        if (!targetElement) {
            console.error(`Elemento com ID "${elementId}" não encontrado`);
            return;
        }
        
        // Verificar caminho do componente
        if (!componentPath || typeof componentPath !== 'string') {
            console.error(`Caminho de componente inválido: ${componentPath}`);
            return;
        }
        
        // Tentar carregar o componente
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }
        
        // Obter o conteúdo HTML
        try {
            const html = await response.text();
            targetElement.innerHTML = html;
        } catch (textError) {
            console.error('Erro ao obter texto da resposta:', textError);
            
            // Fallback: tentar obter a resposta como um blob e ler como texto
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onload = () => {
                targetElement.innerHTML = reader.result;
            };
            reader.readAsText(blob);
        }
    } catch (error) {
        console.error('Erro ao carregar componente:', error);
    }
}

// Carregar o header em todas as páginas que têm o elemento com id="sidebar-header"
document.addEventListener('DOMContentLoaded', () => {
    const headerElement = document.getElementById('sidebar-header');
    if (headerElement) {
        loadComponent('sidebar-header', '/components/header.html');
    }
});

// Função para carregar o sidebar
function carregarSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;
    
    sidebarContainer.innerHTML = `
        <nav class="sidebar">
            <div class="sidebar-header">
                <img src="img/LOGO BRANCA.png" alt="Logo Água Delivery" class="logo">
                <button class="toggle-sidebar" title="Expandir/Retrair Menu">
                    <i class="fas fa-chevron-left"></i>
                </button>
            </div>
            <ul class="sidebar-menu">
                <li><a href="index.html"><i class="fas fa-home"></i> <span>Dashboard</span></a></li>
                <li><a href="clientes.html"><i class="fas fa-users"></i> <span>Clientes</span></a></li>
                <li><a href="entregas.html"><i class="fas fa-truck"></i> <span>Entregas</span></a></li>
                <li><a href="frota.html"><i class="fas fa-truck-monster"></i> <span>Frota</span></a></li>
                <li><a href="motoristas.html"><i class="fas fa-id-card"></i> <span>Motoristas</span></a></li>
                <li><a href="despesas.html"><i class="fas fa-file-invoice-dollar"></i> <span>Despesas</span></a></li>
                <li><a href="relatorios.html"><i class="fas fa-file-pdf"></i> <span>Relatórios</span></a></li>
            </ul>
            <div class="sidebar-footer">
                <a href="configuracoes.html"><i class="fas fa-cog"></i> <span>Configurações</span></a>
                <a href="#" onclick="encerrarSessao()"><i class="fas fa-sign-out-alt"></i> <span>Sair</span></a>
            </div>
        </nav>
    `;
    
    // Ativar o item do menu atual
    const currentPage = window.location.pathname.split('/').pop();
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    
    menuItems.forEach(item => {
        const link = item.querySelector('a');
        if (link && link.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });
    
    // Adicionar evento de toggle ao botão
    const toggleButton = document.querySelector('.toggle-sidebar');
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('collapsed');
            document.getElementById('content').classList.toggle('expanded');
        });
    }
    
    // Restaurar estado da sidebar do localStorage
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarCollapsed) {
        document.querySelector('.sidebar').classList.add('collapsed');
        document.getElementById('content').classList.add('expanded');
    }
}

// Função para atualizar data e hora
function atualizarDataHora() {
    const datetimeElement = document.getElementById('datetime');
    if (!datetimeElement) return;
    
    function updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        datetimeElement.textContent = now.toLocaleDateString('pt-BR', options);
    }
    
    updateDateTime();
    setInterval(updateDateTime, 60000); // Atualiza a cada minuto
} 