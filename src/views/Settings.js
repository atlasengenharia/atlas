import { store } from '../store/store.js';
import { esc, formatBRL } from '../utils/sanitize.js';
import { getLocalTodayStr } from '../utils/date.js';

const AVATARS = ['😊','😎','🤑','🦁','🐯','🦊','🐻','🐼','🦄','🚀','💎','⚡'];

export const SettingsView = {
  render: () => {
    const { settings = {} } = store.state;
    const activeProfile = store.activeProfile;
    const profiles = store.profiles;

    return `
      <div class="fade-in" style="display:flex;flex-direction:column;gap:1.5rem;">

        <!-- ── Perfis ────────────────────────────────────────────── -->
        <div class="glass" style="padding:1.5rem;">
          <h3 style="margin-bottom:1.5rem;display:flex;align-items:center;gap:.6rem;">
            <i data-lucide="user-circle" style="color:var(--primary-color);width:20px;"></i>
            Perfis
          </h3>

          <!-- Lista de perfis -->
          <div style="display:flex;flex-direction:column;gap:.75rem;margin-bottom:1.5rem;" id="profile-list">
            ${profiles.map(p => `
              <div class="settings-row ${p.id === activeProfile.id ? 'active-profile' : ''}">
                <div style="display:flex;align-items:center;gap:.9rem;">
                  <span style="font-size:1.8rem;line-height:1;">${esc(p.avatar)}</span>
                  <div>
                    <div style="font-weight:600;">${esc(p.name)}</div>
                    <div style="font-size:.75rem;color:var(--text-muted);">
                      ${p.id === activeProfile.id ? '<span style="color:var(--primary-color);">● Ativo</span>' : 'Inativo'}
                    </div>
                  </div>
                </div>
                <div style="display:flex;gap:.4rem;">
                  <button class="card-action-icon" onclick="window.openEditProfile('${esc(p.id)}')" title="Editar">
                    <i data-lucide="edit-3" style="width:14px;"></i>
                  </button>
                  ${p.id !== activeProfile.id ? `
                    <button class="card-action-icon" onclick="window.switchToProfile('${esc(p.id)}')" title="Ativar" style="background:rgba(0,229,255,.1);border-color:rgba(0,229,255,.3);">
                      <i data-lucide="log-in" style="width:14px;color:var(--primary-color);"></i>
                    </button>
                    <button class="card-action-icon delete" onclick="window.deleteProfile('${esc(p.id)}')" title="Excluir">
                      <i data-lucide="trash-2" style="width:14px;"></i>
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <button class="btn btn-primary" id="btn-create-profile" style="width:100%;justify-content:center;">
            <i data-lucide="plus" style="width:16px;"></i> Novo Perfil
          </button>
        </div>

        <!-- ── Dados & Backup ────────────────────────────────────── -->
        <div class="glass" style="padding:1.5rem;">
          <h3 style="margin-bottom:1.5rem;display:flex;align-items:center;gap:.6rem;">
            <i data-lucide="database" style="color:var(--primary-color);width:20px;"></i>
            Dados & Backup
          </h3>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
            <button class="btn btn-ghost settings-action-btn" id="btn-export-json">
              <i data-lucide="download" style="width:16px;"></i>
              Exportar JSON
            </button>
            <button class="btn btn-ghost settings-action-btn" id="btn-export-csv">
              <i data-lucide="file-spreadsheet" style="width:16px;"></i>
              Exportar CSV
            </button>
          </div>

          <label class="btn btn-ghost settings-action-btn" style="width:100%;justify-content:center;cursor:pointer;margin-bottom:1rem;">
            <i data-lucide="upload" style="width:16px;"></i>
            Importar JSON
            <input type="file" id="import-file" accept=".json" style="display:none;">
          </label>

          <div style="border-top:1px solid var(--border-color);padding-top:1rem;margin-top:.5rem;">
            <button class="btn settings-action-btn" id="btn-reset-data"
              style="width:100%;justify-content:center;background:rgba(255,61,0,.08);border:1px solid rgba(255,61,0,.3);color:#ff5252;">
              <i data-lucide="alert-triangle" style="width:16px;"></i>
              Resetar Todos os Dados
            </button>
            <p style="font-size:.75rem;color:var(--text-muted);text-align:center;margin-top:.5rem;">
              Esta ação é irreversível. Faça um backup antes.
            </p>
          </div>
        </div>

        <!-- ── Preferências ──────────────────────────────────────── -->
        <div class="glass" style="padding:1.5rem;">
          <h3 style="margin-bottom:1.5rem;display:flex;align-items:center;gap:.6rem;">
            <i data-lucide="sliders" style="color:var(--primary-color);width:20px;"></i>
            Preferências
          </h3>

          <div class="form-group">
            <label>Vista padrão ao abrir</label>
            <select id="pref-default-view" class="input-field">
              <option value="dashboard" ${settings.defaultView === 'dashboard' ? 'selected' : ''}>Dashboard</option>
              <option value="cards"     ${settings.defaultView === 'cards'     ? 'selected' : ''}>Cartões</option>
              <option value="income"    ${settings.defaultView === 'income'    ? 'selected' : ''}>Fontes de Renda</option>
              <option value="transactions" ${settings.defaultView === 'transactions' ? 'selected' : ''}>Transações</option>
            </select>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;background:rgba(255,255,255,.02);border-radius:12px;border:1px solid var(--border-color);">
            <div>
              <div style="font-weight:500;">Notificações de vencimento</div>
              <div style="font-size:.8rem;color:var(--text-muted);">Alerta quando fatura vence em até 5 dias</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="pref-notifications" ${settings.notificationsEnabled !== false ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div style="margin-top:1rem;text-align:right;">
            <button class="btn btn-primary" id="btn-save-prefs">
              <i data-lucide="save" style="width:16px;"></i>
              Salvar Preferências
            </button>
          </div>
        </div>

      </div>

      <!-- ── Modal Criar/Editar Perfil ──────────────────────────── -->
      <div id="profile-modal" class="modal-overlay">
        <div class="modal-content glass">
          <h2 id="profile-modal-title" style="margin-bottom:1.5rem;">Novo Perfil</h2>
          <input type="hidden" id="profile-modal-id">

          <div class="form-group">
            <label>Nome do Perfil</label>
            <input type="text" id="profile-modal-name" class="input-field" placeholder="Ex: João Silva" required maxlength="30">
          </div>

          <div class="form-group">
            <label>Avatar</label>
            <div style="display:flex;flex-wrap:wrap;gap:.6rem;margin-top:.3rem;" id="avatar-picker">
              ${AVATARS.map(a => `
                <button type="button" class="avatar-option" data-avatar="${a}"
                  style="font-size:1.6rem;background:rgba(255,255,255,.05);border:2px solid transparent;
                         border-radius:10px;width:44px;height:44px;cursor:pointer;transition:all .2s;">
                  ${a}
                </button>
              `).join('')}
            </div>
            <input type="hidden" id="profile-modal-avatar" value="😊">
          </div>

          <div class="modal-footer">
            <button type="button" id="btn-close-profile-modal" class="btn btn-ghost" style="flex:1;">Cancelar</button>
            <button type="button" id="btn-save-profile" class="btn btn-primary" style="flex:2;">Salvar Perfil</button>
          </div>
        </div>
      </div>
    `;
  },

  init: () => {
    // ── Helpers ──────────────────────────────────────────────────────
    const downloadFile = (content, filename, mime) => {
      const blob = new Blob([content], { type: mime });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const today = getLocalTodayStr;

    // ── Export ───────────────────────────────────────────────────────
    document.getElementById('btn-export-json').onclick = () => {
      downloadFile(store.exportJSON(), `vizfin_backup_${today()}.json`, 'application/json');
    };

    document.getElementById('btn-export-csv').onclick = () => {
      downloadFile('\uFEFF' + store.exportCSV(), `vizfin_transacoes_${today()}.csv`, 'text/csv;charset=utf-8');
    };

    // ── Import ───────────────────────────────────────────────────────
    document.getElementById('import-file').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const ok = store.importJSON(ev.target.result);
        window.showToast(ok ? '✅ Dados importados com sucesso!' : '❌ Arquivo inválido ou corrompido.', ok ? 'success' : 'error');
        if (ok) window.app.navigateTo('dashboard');
      };
      reader.readAsText(file);
    };

    // ── Reset ────────────────────────────────────────────────────────
    document.getElementById('btn-reset-data').onclick = () => {
      window.showConfirm(
        '⚠️ Tem certeza? Todos os dados deste perfil serão apagados permanentemente.',
        () => { store.resetData(); window.app.navigateTo('dashboard'); }
      );
    };

    // ── Preferências ─────────────────────────────────────────────────
    document.getElementById('btn-save-prefs').onclick = () => {
      store.updateSettings({
        defaultView: document.getElementById('pref-default-view').value,
        notificationsEnabled: document.getElementById('pref-notifications').checked,
      });
      window.showToast('✅ Preferências salvas!', 'success');
    };

    // ── Modal de Perfil ───────────────────────────────────────────────
    const profileModal = document.getElementById('profile-modal');

    const openProfileModal = (profileId = null) => {
      const nameInput   = document.getElementById('profile-modal-name');
      const idInput     = document.getElementById('profile-modal-id');
      const avatarInput = document.getElementById('profile-modal-avatar');
      const title       = document.getElementById('profile-modal-title');

      nameInput.value   = '';
      idInput.value     = '';
      avatarInput.value = '😊';
      title.innerText   = 'Novo Perfil';
      document.querySelectorAll('.avatar-option').forEach(b => b.style.borderColor = 'transparent');

      if (profileId) {
        const p = store.profiles.find(p => p.id === profileId);
        if (p) {
          nameInput.value   = p.name;
          idInput.value     = p.id;
          avatarInput.value = p.avatar || '😊';
          title.innerText   = 'Editar Perfil';
          const active = document.querySelector(`.avatar-option[data-avatar="${p.avatar}"]`);
          if (active) active.style.borderColor = 'var(--primary-color)';
        }
      } else {
        const first = document.querySelector('.avatar-option');
        if (first) first.style.borderColor = 'var(--primary-color)';
      }
      profileModal.classList.add('active');
    };

    document.getElementById('btn-create-profile').onclick = () => openProfileModal();
    document.getElementById('btn-close-profile-modal').onclick  = () => profileModal.classList.remove('active');

    window.openEditProfile = (id) => openProfileModal(id);

    window.switchToProfile = (id) => {
      store.switchProfile(id);
      window.app.navigateTo(store.state.settings.defaultView || 'dashboard');
    };

    window.deleteProfile = (id) => {
      const p = store.profiles.find(p => p.id === id);
      window.showConfirm(
        `Excluir o perfil "${p?.name}"? Todos os dados dele serão perdidos.`,
        () => {
          const ok = store.deleteProfile(id);
          if (!ok) window.showToast('❌ Não é possível excluir o único perfil.', 'error');
          else window.app.navigateTo('settings');
        }
      );
    };

    // Avatar picker
    document.querySelectorAll('.avatar-option').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.avatar-option').forEach(b => b.style.borderColor = 'transparent');
        btn.style.borderColor = 'var(--primary-color)';
        document.getElementById('profile-modal-avatar').value = btn.dataset.avatar;
      };
    });

    document.getElementById('btn-save-profile').onclick = () => {
      const name   = document.getElementById('profile-modal-name').value.trim();
      const avatar = document.getElementById('profile-modal-avatar').value;
      const id     = document.getElementById('profile-modal-id').value;
      if (!name) { window.showToast('❌ Informe um nome para o perfil.', 'error'); return; }
      if (id) {
        store.updateProfile(id, { name, avatar });
      } else {
        store.createProfile(name, avatar);
      }
      profileModal.classList.remove('active');
      window.app.navigateTo('settings');
    };
  }
};
