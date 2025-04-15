/**
 * template.js - Templates e estruturas HTML reutilizáveis no sistema
 */

// Template para a barra lateral
const SIDEBAR_TEMPLATE = `
<div class="sidebar-header">
    <img src="img/LOGO BRANCA.png" alt="Logo Água Delivery" class="logo">
    <button class="toggle-sidebar" title="Expandir/Retrair Menu">
        <i class="fas fa-chevron-left"></i>
    </button>
</div>
<ul class="sidebar-menu">
    <li id="menu-dashboard"><a href="index.html"><i class="fas fa-home"></i> <span>Dashboard</span></a></li>
    <li id="menu-clientes"><a href="clientes.html"><i class="fas fa-users"></i> <span>Clientes</span></a></li>
    <li id="menu-entregas"><a href="entregas.html"><i class="fas fa-truck"></i> <span>Entregas</span></a></li>
    <li id="menu-frota"><a href="frota.html"><i class="fas fa-truck-monster"></i> <span>Frota</span></a></li>
    <li id="menu-motoristas"><a href="motoristas.html"><i class="fas fa-id-card"></i> <span>Motoristas</span></a></li>
    <li id="menu-despesas"><a href="despesas.html"><i class="fas fa-file-invoice-dollar"></i> <span>Despesas</span></a></li>
    <li id="menu-relatorios"><a href="relatorios.html"><i class="fas fa-file-pdf"></i> <span>Relatórios</span></a></li>
</ul>
<div class="sidebar-footer">
    <a href="configuracoes.html"><i class="fas fa-cog"></i> <span>Configurações</span></a>
    <a href="#" onclick="encerrarSessao(); return false;"><i class="fas fa-sign-out-alt"></i> <span>Sair</span></a>
</div>
`;

// Template para a barra superior
const TOPBAR_TEMPLATE = `
<h1 id="page-title">Sistema de Gestão</h1>
<div class="user-menu">
    <span>Olá, Usuário</span>
    <img src="img/user-avatar.png" alt="Avatar" class="avatar">
</div>
`;

// Inicialização do template nas páginas
document.addEventListener('DOMContentLoaded', function() {
    // Carregar a barra lateral se existir o elemento
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.innerHTML = SIDEBAR_TEMPLATE;
        
        // Marcar item de menu ativo com base na página atual
        const paginaAtual = window.location.pathname.split('/').pop();
        if (paginaAtual === 'index.html' || paginaAtual === '') {
            document.getElementById('menu-dashboard')?.classList.add('active');
        } else {
            // Extrair o nome da página sem a extensão .html
            const nomePagina = paginaAtual.replace('.html', '');
            document.getElementById('menu-' + nomePagina)?.classList.add('active');
        }
    }
    
    // Carregar a barra superior se existir o elemento
    const topbar = document.querySelector('.top-bar');
    if (topbar) {
        topbar.innerHTML = TOPBAR_TEMPLATE;
        
        // Atualizar o título da página com base nos dados da meta tag title
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            const metaTitle = document.title;
            pageTitle.textContent = metaTitle.split(' - ')[0] || 'Sistema de Gestão';
        }
    }
}); 