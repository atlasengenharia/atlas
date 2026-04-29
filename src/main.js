import { store } from './store/store.js';
import { DashboardView }    from './views/Dashboard.js';
import { CardsView }        from './views/Cards.js';
import { LoansView }        from './views/Loans.js';
import { IncomeView }       from './views/Income.js';
import { TransactionsView } from './views/Transactions.js';
import { ProjectionsView }  from './views/Projections.js';
import { InvestmentsView }  from './views/Investments.js';
import { SettingsView }     from './views/Settings.js';
import { LoginView }        from './views/Login.js';
import { ProfileSelectView } from './views/ProfileSelect.js';
import { applyCurrencyMask, parseCurrency, formatCurrency } from './utils/mask.js';
import { getLocalTodayStr } from './utils/date.js';
import './style.css';
import './views/Login.css';

const views = {
  dashboard:      DashboardView,
  cards:          CardsView,
  loans:          LoansView,
  income:         IncomeView,
  transactions:   TransactionsView,
  projections:    ProjectionsView,
  investments:    InvestmentsView,
  settings:       SettingsView,
  login:          LoginView,
  'profile-select': ProfileSelectView,
};

const PAGE_TITLES = {
  dashboard: 'Dashboard', cards: 'Cartões', loans: 'Empréstimos',
  income: 'Fontes de Renda', transactions: 'Transações',
  projections: 'Projeções', investments: 'Investimentos', settings: 'Configurações',
};

class App {
  constructor() {
    this.contentArea = document.getElementById('content-area');
    this.pageTitle   = document.getElementById('page-title');
    this.navItems    = document.querySelectorAll('.nav-item[data-page]');
    this.currentPage = 'dashboard';
    this._init();
  }

  _init() {
    // Mobile sidebar
    const menuToggle  = document.getElementById('mobile-menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebar     = document.getElementById('sidebar');
    const overlay     = document.getElementById('sidebar-overlay');

    const toggleSidebar = () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    };
    menuToggle?.addEventListener('click', toggleSidebar);
    closeSidebar?.addEventListener('click', toggleSidebar);
    overlay?.addEventListener('click', toggleSidebar);

    // Navigation
    this.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo(item.dataset.page);
        if (sidebar.classList.contains('active')) toggleSidebar();
      });
    });

    // "Nova Transação" button / Main Action
    const mainActionBtn = document.getElementById('add-transaction-btn');
    mainActionBtn?.addEventListener('click', () => {
      if (this.currentPage === 'dashboard' || this.currentPage === 'transactions') {
        this.showAddTransactionModal();
      } else if (this.currentPage === 'loans') {
        document.getElementById('btn-add-loan')?.click();
      } else if (this.currentPage === 'income') {
        document.getElementById('btn-add-income')?.click();
      }
    });

    // Notification bell
    const bell     = document.getElementById('notification-bell');
    const dropdown = document.getElementById('notification-dropdown');
    if (bell && dropdown) {
      bell.addEventListener('click', () => {
        const open = dropdown.style.display === 'flex';
        dropdown.style.display = open ? 'none' : 'flex';
      });
      document.addEventListener('click', (e) => {
        if (!bell.contains(e.target) && !dropdown.contains(e.target)) dropdown.style.display = 'none';
      });
    }

    // Profile dropdown
    const profileTrigger = document.getElementById('profile-trigger');
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileTrigger && profileDropdown) {
      profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = profileDropdown.style.display === 'flex';
        profileDropdown.style.display = open ? 'none' : 'flex';
        // Fecha o de notificações se abrir o de perfil
        if (!open && dropdown) dropdown.style.display = 'none';
      });
      document.addEventListener('click', (e) => {
        if (!profileTrigger.contains(e.target) && !profileDropdown.contains(e.target)) {
          profileDropdown.style.display = 'none';
        }
      });
    }

    // Reage a mudanças no store
    store.subscribe(() => {
      this._refreshPage();
      this._updateNotifications();
      this._updateHeaderProfile();
    });

    // Fechar modais (Delegação de eventos)
    document.body.addEventListener('click', (e) => {
      // Fechar ao clicar no X
      if (e.target.closest('.btn-close-modal-x')) {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      }
      // Fechar ao clicar fora (no overlay)
      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
      }

      // Seletor de Temas
      const themeBtn = e.target.closest('.theme-btn');
      if (themeBtn) {
        const theme = themeBtn.dataset.theme;
        store.updateSettings({ theme });
      }
    });

    // Máscara de moeda global
    document.body.addEventListener('input', (e) => {
      if (e.target.classList.contains('currency-input')) {
        applyCurrencyMask(e.target);
      }
    });

    // Inicial
    const defaultView = store.state.settings?.defaultView || 'dashboard';
    this.navigateTo(defaultView);
    this._updateNotifications();
    this._updateHeaderProfile();
    lucide.createIcons();
  }

  navigateTo(page) {
    // Intercepta rotas baseadas na autenticação
    if (!store.state.isAuthenticated && page !== 'login') {
      page = 'login';
    } else if (store.state.isAuthenticated && page === 'login') {
      page = 'profile-select'; // após login, vai para seleção de perfil
    }

    if (!views[page]) page = 'dashboard';
    this.currentPage = page;

    // Gerencia visibilidade da UI Global
    if (page === 'login' || page === 'profile-select') {
      document.body.classList.add('unauthenticated');
    } else {
      document.body.classList.remove('unauthenticated');
    }

    // Nav ativo
    this.navItems.forEach(item =>
      item.classList.toggle('active', item.dataset.page === page));

    // Título
    this.pageTitle.innerText = PAGE_TITLES[page] || page;

    // Header buttons visibility and labels
    const mainBtn = document.getElementById('add-transaction-btn');
    const cardBtn = document.getElementById('add-card-header-btn');

    if (page === 'dashboard' || page === 'transactions') {
      mainBtn.style.display = 'flex';
      mainBtn.innerHTML = '<i data-lucide="plus"></i> Nova Transação';
    } else if (page === 'loans') {
      mainBtn.style.display = 'flex';
      mainBtn.innerHTML = '<i data-lucide="plus"></i> Novo Empréstimo';
    } else if (page === 'income') {
      mainBtn.style.display = 'flex';
      mainBtn.innerHTML = '<i data-lucide="plus"></i> Nova Fonte';
    } else {
      mainBtn.style.display = 'none';
    }

    cardBtn.style.display = page === 'cards' ? 'flex' : 'none';

    // Limpa listeners antigos clonando o container (garante init() limpo)
    const fresh = this.contentArea.cloneNode(false);
    this.contentArea.parentNode.replaceChild(fresh, this.contentArea);
    this.contentArea = fresh;

    // Render
    const view = views[page];
    this.contentArea.innerHTML = view.render();
    view.init?.();
    lucide.createIcons(); // único ponto de chamada
    this.applyTheme();
  }

  applyTheme() {
    const theme = store.state.settings?.theme || 'original';
    document.body.classList.remove('theme-light', 'theme-dark');
    if (theme !== 'original') {
      document.body.classList.add(`theme-${theme}`);
    }
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
      const active = btn.dataset.theme === theme;
      btn.style.background = active ? 'var(--surface-light)' : 'transparent';
      btn.style.borderColor = active ? 'var(--primary-color)' : 'var(--border-color)';
    });
  }

  _refreshPage() {
    const view = views[this.currentPage];
    // Limpa listeners antigos
    const fresh = this.contentArea.cloneNode(false);
    this.contentArea.parentNode.replaceChild(fresh, this.contentArea);
    this.contentArea = fresh;
    this.contentArea.innerHTML = view.render();
    view.init?.();
    lucide.createIcons();
    this.applyTheme();
  }

  _updateHeaderProfile() {
    const headerAvatar = document.getElementById('header-profile-avatar');
    const headerName   = document.getElementById('header-profile-name');
    const dropAvatar   = document.getElementById('dropdown-active-avatar');
    const dropName     = document.getElementById('dropdown-active-name');
    const profileList  = document.getElementById('profile-list-container');
    const btnLogout    = document.getElementById('btn-logout');

    if (!headerAvatar || !profileList) return;

    const activeP = store.activeProfile;

    // Botão trigger do header
    headerAvatar.textContent = activeP.avatar || '😊';
    if (headerName) headerName.textContent = activeP.name;

    // Cabeçalho do dropdown
    if (dropAvatar) dropAvatar.textContent = activeP.avatar || '😊';
    if (dropName)   dropName.textContent   = activeP.name;

    // Lista de troca rápida (outros perfis)
    const others = store.profiles.filter(p => p.id !== activeP.id);
    if (others.length === 0) {
      profileList.style.display = 'none';
    } else {
      profileList.style.display = '';
      profileList.innerHTML = others.map(p => `
        <div class="profile-item" data-profile-id="${p.id}"
          style="display:flex;align-items:center;gap:.75rem;padding:.55rem .75rem;border-radius:10px;cursor:pointer;transition:var(--transition);">
          <div style="font-size:1.4rem;width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;">${p.avatar || '😊'}</div>
          <span style="font-size:.88rem;">${p.name}</span>
        </div>
      `).join('');

      profileList.querySelectorAll('.profile-item').forEach(item => {
        item.onmouseenter = () => item.style.background = 'rgba(255,255,255,.05)';
        item.onmouseleave = () => item.style.background = 'transparent';
        item.onclick = () => {
          store.switchProfile(item.dataset.profileId);
          document.getElementById('profile-dropdown').style.display = 'none';
        };
      });
    }

    const profileDropdown = document.getElementById('profile-dropdown');

    // Gerenciar Perfis → tela de seleção de perfil
    const ddManage = document.getElementById('dd-manage-profiles');
    if (ddManage) {
      ddManage.onclick = (e) => {
        e.preventDefault();
        profileDropdown.style.display = 'none';
        // Garante que vai em modo de edição de forma síncrona
        ProfileSelectView._editMode = true;
        this.navigateTo('profile-select');
      };
    }

    // Configurações → modal popup
    const ddSettings = document.getElementById('dd-settings');
    if (ddSettings) {
      ddSettings.onclick = (e) => {
        e.preventDefault();
        profileDropdown.style.display = 'none';
        this._openSettingsModal();
      };
    }

    if (btnLogout) {
      btnLogout.onclick = (e) => {
        e.preventDefault();
        window.showConfirm('Deseja realmente sair da aplicação? Seus dados estão salvos localmente.', () => {
          store.logout();
          this.navigateTo('login');
        });
      };
    }
  }

  // ── Modal de Configurações (popup) ─────────────────────────────────────
  _openSettingsModal() {
    let modal = document.getElementById('settings-popup-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'settings-popup-modal';
      modal.className = 'modal-overlay';
      modal.style.cssText = 'z-index:3000;';
      modal.innerHTML = `
        <div class="modal-content glass" style="max-width:560px;max-height:85vh;overflow-y:auto;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
            <h2 style="margin:0;">Configurações</h2>
            <button id="btn-close-settings-popup" class="btn btn-ghost btn-close-modal-x" style="padding:.4rem;">
              <i data-lucide="x" style="width:18px;"></i>
            </button>
          </div>
          <div id="settings-popup-body"></div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const { settings = {} } = store.state;
    modal.querySelector('#settings-popup-body').innerHTML = `
      <div style="margin-bottom:1.5rem;">
        <h4 style="display:flex;align-items:center;gap:.5rem;margin-bottom:1rem;color:var(--text-muted);font-size:.8rem;text-transform:uppercase;letter-spacing:1px;">
          <i data-lucide="sliders" style="width:14px;color:var(--primary-color);"></i> Preferências
        </h4>
        <div class="form-group" style="margin-bottom:1rem;">
          <label>Vista padrão ao abrir</label>
          <select id="sp-default-view" class="input-field">
            <option value="dashboard"    ${settings.defaultView === 'dashboard'    ? 'selected' : ''}>Dashboard</option>
            <option value="cards"        ${settings.defaultView === 'cards'        ? 'selected' : ''}>Cartões</option>
            <option value="income"       ${settings.defaultView === 'income'       ? 'selected' : ''}>Fontes de Renda</option>
            <option value="transactions" ${settings.defaultView === 'transactions' ? 'selected' : ''}>Transações</option>
          </select>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;background:rgba(255,255,255,.02);border-radius:12px;border:1px solid var(--border-color);margin-bottom:1rem;">
          <div>
            <div style="font-weight:500;">Notificações de vencimento</div>
            <div style="font-size:.8rem;color:var(--text-muted);">Alerta quando fatura vence em até 5 dias</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="sp-notifications" ${settings.notificationsEnabled !== false ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div style="text-align:right;">
          <button class="btn btn-primary" id="sp-save-prefs" style="min-width:160px;">
            <i data-lucide="save" style="width:16px;"></i> Salvar Preferências
          </button>
        </div>
      </div>
      <div style="border-top:1px solid var(--border-color);padding-top:1.5rem;">
        <h4 style="display:flex;align-items:center;gap:.5rem;margin-bottom:1rem;color:var(--text-muted);font-size:.8rem;text-transform:uppercase;letter-spacing:1px;">
          <i data-lucide="database" style="width:14px;color:var(--primary-color);"></i> Dados & Backup
        </h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem;">
          <button class="btn btn-ghost" id="sp-export-json" style="justify-content:center;"><i data-lucide="download" style="width:15px;"></i> Exportar JSON</button>
          <button class="btn btn-ghost" id="sp-export-csv"  style="justify-content:center;"><i data-lucide="file-spreadsheet" style="width:15px;"></i> Exportar CSV</button>
        </div>
        <label class="btn btn-ghost" style="width:100%;justify-content:center;cursor:pointer;margin-bottom:.75rem;display:flex;align-items:center;gap:.5rem;">
          <i data-lucide="upload" style="width:15px;"></i> Importar JSON
          <input type="file" id="sp-import-file" accept=".json" style="display:none;">
        </label>
        <button class="btn" id="sp-reset-data" style="width:100%;justify-content:center;background:rgba(255,61,0,.08);border:1px solid rgba(255,61,0,.3);color:#ff5252;">
          <i data-lucide="alert-triangle" style="width:15px;"></i> Resetar Todos os Dados
        </button>
        <p style="font-size:.75rem;color:var(--text-muted);text-align:center;margin-top:.4rem;">Esta ação é irreversível. Faça um backup antes.</p>
      </div>
    `;

    lucide.createIcons();

    const dl = (content, name, mime) => {
      const b = new Blob([content], { type: mime });
      const u = URL.createObjectURL(b);
      const a = Object.assign(document.createElement('a'), { href: u, download: name });
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u);
    };
    const today = getLocalTodayStr;

    modal.querySelector('#sp-save-prefs').onclick = () => {
      store.updateSettings({
        defaultView: modal.querySelector('#sp-default-view').value,
        notificationsEnabled: modal.querySelector('#sp-notifications').checked,
      });
      window.showToast('Preferências salvas!', 'success');
    };
    modal.querySelector('#sp-export-json').onclick = () => dl(store.exportJSON(), `vizfin_backup_${today()}.json`, 'application/json');
    modal.querySelector('#sp-export-csv').onclick  = () => dl('\uFEFF' + store.exportCSV(), `vizfin_transacoes_${today()}.csv`, 'text/csv;charset=utf-8');
    modal.querySelector('#sp-import-file').onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const ok = store.importJSON(ev.target.result);
        window.showToast(ok ? 'Dados importados com sucesso!' : 'Arquivo inválido.', ok ? 'success' : 'error');
        if (ok) { modal.classList.remove('active'); this.navigateTo('dashboard'); }
      };
      reader.readAsText(file);
    };
    modal.querySelector('#sp-reset-data').onclick = () => {
      window.showConfirm('⚠️ Tem certeza? Todos os dados deste perfil serão apagados.', () => {
        store.resetData(); modal.classList.remove('active'); this.navigateTo('dashboard');
      });
    };

    modal.classList.add('active');
  }

  // ── Modal de Transação ─────────────────────────────────────────────────
  showAddTransactionModal(transactionId = null) {
    const modal        = document.getElementById('transaction-modal');
    const form         = document.getElementById('transaction-form');
    const closeBtn     = document.getElementById('btn-close-trans-modal');
    const cardSelect   = document.getElementById('trans-card');
    const typeSelect   = document.getElementById('trans-type');
    const cardGroup    = document.getElementById('card-selection-group');
    const title        = document.getElementById('transaction-modal-title');
    const idInput      = document.getElementById('trans-id');
    const catSelect    = document.getElementById('trans-category');
    const newCatGroup  = document.getElementById('new-category-group');
    const newCatInput  = document.getElementById('new-category-input');
    const btnSaveCat   = document.getElementById('btn-save-category');
    const customGroup  = document.getElementById('custom-categories-group');

    form.reset();
    idInput.value = '';
    title.innerText = 'Nova Transação';
    document.getElementById('trans-date').value = getLocalTodayStr();
    cardGroup.style.display = 'block';
    newCatGroup.style.display = 'none';

    // Popula categorias customizadas
    const { cards, transactions, customCategories = [] } = store.state;
    customGroup.innerHTML = customCategories
      .map(c => `<option value="${c}">${c}</option>`)
      .join('');
    customGroup.style.display = customCategories.length > 0 ? '' : 'none';

    // Popula cartões
    cardSelect.innerHTML = '<option value="">Nenhum (Dinheiro/Saldo)</option>' +
      cards.map(c => `<option value="${c.id}">${c.name} (**** ${c.lastDigits})</option>`).join('');

    // Lógica "Nova categoria..."
    catSelect.onchange = () => {
      if (catSelect.value === '__new__') {
        newCatGroup.style.display = 'block';
        newCatInput.focus();
      } else {
        newCatGroup.style.display = 'none';
      }
    };

    // Botão salvar nova categoria
    btnSaveCat.onclick = () => {
      const name = newCatInput.value.trim();
      if (!name) { window.showToast('Digite um nome para a categoria.', 'error'); return; }
      const added = store.addCategory(name);
      if (!added) { window.showToast('Categoria já existe.', 'error'); return; }

      // Adiciona a nova opção ao grupo e seleciona
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      customGroup.appendChild(opt);
      customGroup.style.display = '';
      catSelect.value = name;
      newCatGroup.style.display = 'none';
      newCatInput.value = '';
      window.showToast(`Categoria "${name}" criada!`, 'success');
    };

    if (transactionId) {
      const t = transactions.find(t => t.id === transactionId);
      if (t) {
        title.innerText = 'Editar Transação';
        idInput.value = t.id;
        document.getElementById('trans-desc').value = t.description;
        const amountInput = document.getElementById('trans-amount');
        amountInput.value = formatCurrency(t.amount);
        typeSelect.value = t.type;
        // Tenta selecionar a categoria; se não existir na lista, cria temporariamente
        const exists = [...catSelect.options].some(o => o.value === t.category);
        if (!exists && t.category) {
          const opt = document.createElement('option');
          opt.value = t.category;
          opt.textContent = t.category;
          customGroup.appendChild(opt);
          customGroup.style.display = '';
        }
        catSelect.value = t.category;
        document.getElementById('trans-date').value = t.date;
        cardSelect.value = t.cardId || '';
        cardGroup.style.display = t.type === 'expense' ? 'block' : 'none';
      }
    }

    typeSelect.onchange = () => {
      cardGroup.style.display = typeSelect.value === 'expense' ? 'block' : 'none';
    };

    modal.classList.add('active');
    closeBtn.onclick = () => modal.classList.remove('active');

    form.onsubmit = (e) => {
      e.preventDefault();
      const catValue = catSelect.value;
      if (catValue === '__new__') {
        window.showToast('Salve a nova categoria antes de continuar.', 'error');
        return;
      }
      const data = {
        description: document.getElementById('trans-desc').value,
        amount:      parseCurrency(document.getElementById('trans-amount').value),
        type:        typeSelect.value,
        category:    catValue,
        date:        document.getElementById('trans-date').value,
        cardId:      typeSelect.value === 'expense' ? cardSelect.value : null,
      };
      idInput.value ? store.updateTransaction(idInput.value, data) : store.addTransaction(data);
      modal.classList.remove('active');
    };
  }

  // ── Notificações ───────────────────────────────────────────────────────
  _updateNotifications() {
    if (store.state.settings?.notificationsEnabled === false) return;
    const alerts  = store.getAlerts();
    const dot      = document.getElementById('notification-dot');
    const dropdown = document.getElementById('notification-dropdown');
    if (!dot || !dropdown) return;

    dot.style.display = alerts.length > 0 ? 'block' : 'none';
     dropdown.innerHTML = alerts.length === 0
       ? '<div style="text-align:center;color:var(--text-muted);font-size:.85rem;padding:1rem;">Nenhuma notificação.</div>'
       : `<h4 style="margin-bottom:.5rem;font-size:.9rem;border-bottom:1px solid var(--border-color);padding-bottom:.5rem;">Notificações</h4>
          ${alerts.map(a => `
            <div style="display:flex;gap:.8rem;align-items:flex-start;padding:.8rem;background:var(--surface-light);border-radius:8px;border:1px solid var(--border-color);margin-bottom:.5rem;cursor:pointer;transition:var(--transition);" 
                 onclick="window.app.navigateTo('${a.view}'); document.getElementById('notification-dropdown').classList.remove('active');"
                 onmouseover="this.style.background='var(--surface-color)'" onmouseout="this.style.background='var(--surface-light)'">
              <i data-lucide="${a.type === 'danger' ? 'alert-octagon' : 'alert-triangle'}" style="color:${a.type === 'danger' ? '#ff3d00' : 'var(--accent-color)'};width:18px;flex-shrink:0;"></i>
              <div style="font-size:.78rem;color:var(--text-muted);line-height:1.4;">${a.text}</div>
            </div>`).join('')}`;
    lucide.createIcons();
  }
}

// ── Modal de Confirmação global ────────────────────────────────────────────
window.showConfirm = (message, onConfirm) => {
  const modal  = document.getElementById('confirm-modal');
  const msg    = document.getElementById('confirm-modal-msg');
  const btnOk  = document.getElementById('confirm-modal-ok');
  const btnNo  = document.getElementById('confirm-modal-cancel');
  msg.innerText = message;
  modal.classList.add('active');
  const close = () => modal.classList.remove('active');
  btnOk.onclick  = () => { close(); onConfirm(); };
  btnNo.onclick  = close;
};

// ── Toast global ───────────────────────────────────────────────────────────
window.showToast = (message, type = 'success') => {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.className = `app-toast app-toast--${type} app-toast--visible`;
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('app-toast--visible'), 3000);
};

window.app = new App();
