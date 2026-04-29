import { store } from '../store/store.js';

// Emojis disponíveis para escolha de avatar
const AVATAR_OPTIONS = [
  '😊','😎','🧔','👩','🧑','👦','👧','🧓','🦸','🦹',
  '🧙','🧝','🧛','🤖','👻','🐱','🐶','🦊','🐼','🦁',
  '💰','📈','🚀','💎','🌟','🔥','⚡','🎯','🏆','💡',
];

const renderProfileCard = (profile, isEditMode) => `
  <div class="profile-pick-card ${isEditMode ? 'edit-mode' : ''}">
    <div class="profile-pick-avatar" data-action="${isEditMode ? 'edit-profile' : 'select-profile'}" data-id="${profile.id}">
      <span class="profile-pick-emoji">${profile.avatar || '😊'}</span>
      ${isEditMode ? `<div class="profile-pick-edit-overlay"><i data-lucide="pencil" style="width:24px;height:24px;"></i></div>` : ''}
    </div>
    ${isEditMode
      ? `<input class="profile-pick-name-input" type="text" value="${profile.name}" data-id="${profile.id}" maxlength="20">`
      : `<span class="profile-pick-name">${profile.name}</span>`
    }
    ${isEditMode
      ? `<button class="profile-pick-delete" data-action="delete-profile" data-id="${profile.id}" title="Excluir"><i data-lucide="x" style="width:14px;height:14px;"></i></button>`
      : ''}
  </div>
`;

// ── Modal DOM criado uma vez no body ────────────────────────────────────────
let _modalEl = null;

const ensureModal = () => {
  if (_modalEl && document.body.contains(_modalEl)) return;
  _modalEl = document.createElement('div');
  _modalEl.id = 'profile-edit-modal';
  _modalEl.className = 'modal-overlay';
  _modalEl.innerHTML = `
    <div class="modal-content glass" style="max-width:420px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
        <h2 id="profile-modal-title" style="margin:0;">Novo Perfil</h2>
        <button type="button" id="btn-close-profile-modal-x" class="btn btn-ghost btn-close-modal-x" style="padding:.4rem;">
          <i data-lucide="x" style="width:18px;"></i>
        </button>
      </div>
      <div style="text-align:center;margin-bottom:1.5rem;">
        <div id="avatar-preview" style="font-size:4rem;width:96px;height:96px;border-radius:16px;background:rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;margin:0 auto .75rem;border:2px solid var(--glass-border);cursor:pointer;" title="Clique para mudar">😊</div>
        <p style="font-size:.8rem;color:var(--text-muted);">Clique no avatar para trocar</p>
      </div>
      <div id="emoji-picker" style="display:none;flex-wrap:wrap;gap:.5rem;justify-content:center;margin-bottom:1.5rem;padding:.75rem;background:rgba(255,255,255,.03);border-radius:12px;border:1px solid var(--glass-border);">
        ${AVATAR_OPTIONS.map(e => `<span class="emoji-opt" data-emoji="${e}" style="font-size:1.6rem;cursor:pointer;padding:.25rem;border-radius:8px;transition:var(--transition);">${e}</span>`).join('')}
      </div>
      <div class="form-group">
        <label>Nome do Perfil</label>
        <input type="text" id="profile-modal-name" class="input-field" placeholder="Ex: João, Trabalho..." maxlength="20">
      </div>
      <input type="hidden" id="profile-modal-id">
      <input type="hidden" id="profile-modal-avatar" value="😊">
      <div class="modal-footer">
        <button type="button" id="btn-cancel-profile-modal" class="btn btn-ghost" style="flex:1;">Cancelar</button>
        <button type="button" id="btn-save-profile-modal" class="btn btn-primary" style="flex:2;">Salvar Perfil</button>
      </div>
    </div>
  `;
  document.body.appendChild(_modalEl);
  _bindModalEvents();
};

const _bindModalEvents = () => {
  const modal      = _modalEl;
  const avatarPrev = modal.querySelector('#avatar-preview');
  const picker     = modal.querySelector('#emoji-picker');
  const avatarIn   = modal.querySelector('#profile-modal-avatar');

  avatarPrev.addEventListener('click', () => {
    picker.style.display = picker.style.display === 'flex' ? 'none' : 'flex';
  });

  picker.addEventListener('click', (e) => {
    const opt = e.target.closest('.emoji-opt');
    if (!opt) return;
    const emoji = opt.dataset.emoji;
    avatarIn.value = emoji;
    avatarPrev.textContent = emoji;
    picker.style.display = 'none';
    picker.querySelectorAll('.emoji-opt').forEach(o => o.style.background = 'transparent');
    opt.style.background = 'rgba(0,229,255,.2)';
  });

  modal.querySelector('#btn-cancel-profile-modal').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.querySelector('#btn-save-profile-modal').addEventListener('click', () => {
    const name   = modal.querySelector('#profile-modal-name').value.trim();
    const avatar = modal.querySelector('#profile-modal-avatar').value;
    const pid    = modal.querySelector('#profile-modal-id').value;

    if (!name) { window.showToast('Digite um nome para o perfil.', 'error'); return; }

    if (pid) {
      store.updateProfile(pid, { name, avatar });
    } else {
      store.createProfile(name, avatar);
    }
    modal.classList.remove('active');
    window.app.navigateTo('profile-select');
  });
};

const openModal = (profileId) => {
  ensureModal();
  const modal      = _modalEl;
  const picker     = modal.querySelector('#emoji-picker');
  picker.style.display = 'none';
  modal.querySelectorAll('.emoji-opt').forEach(o => o.style.background = 'transparent');

  const title   = modal.querySelector('#profile-modal-title');
  const nameIn  = modal.querySelector('#profile-modal-name');
  const idIn    = modal.querySelector('#profile-modal-id');
  const avatarIn= modal.querySelector('#profile-modal-avatar');
  const avatarPrev = modal.querySelector('#avatar-preview');

  if (profileId) {
    const p = store.profiles.find(p => p.id === profileId);
    if (!p) return;
    title.innerText        = 'Editar Perfil';
    nameIn.value           = p.name;
    idIn.value             = p.id;
    avatarIn.value         = p.avatar || '😊';
    avatarPrev.textContent = p.avatar || '😊';
  } else {
    title.innerText        = 'Novo Perfil';
    nameIn.value           = '';
    idIn.value             = '';
    avatarIn.value         = '😊';
    avatarPrev.textContent = '😊';
  }
  modal.classList.add('active');
  nameIn.focus();
};

// ── View ────────────────────────────────────────────────────────────────────
export const ProfileSelectView = {
  _editMode: false,

  render: () => {
    const profiles = store.profiles;
    const isEdit   = ProfileSelectView._editMode;

    return `
      <div class="profile-select-wrapper">
        <div class="profile-select-logo">
          <span style="background:var(--primary-gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;font-size:1.5rem;letter-spacing:2px;">VIZNANCEIRO</span>
        </div>

        <h1 class="profile-select-title">${isEdit ? 'Gerenciar Perfis' : 'Quem está gerenciando?'}</h1>

        <div class="profile-pick-grid">
          ${profiles.map(p => renderProfileCard(p, isEdit)).join('')}

          ${!isEdit ? `
            <div class="profile-pick-card" id="btn-add-profile">
              <div class="profile-pick-avatar add-new">
                <i data-lucide="plus" style="width:40px;height:40px;color:var(--text-muted);"></i>
              </div>
              <span class="profile-pick-name" style="color:var(--text-muted);">Adicionar perfil</span>
            </div>
          ` : ''}
        </div>

        <div class="profile-select-actions">
          ${isEdit
            ? `<button class="btn btn-primary" id="btn-finish-edit" style="min-width:180px;">Concluído</button>`
            : `<button class="btn btn-ghost" id="btn-manage-profiles" style="border:1px solid rgba(255,255,255,.3);color:var(--text-muted);min-width:180px;">Gerenciar Perfis</button>`
          }
        </div>
      </div>
    `;
  },

  init: () => {
    ensureModal();
    lucide.createIcons();

    const area = document.getElementById('content-area');

    area.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const { action, id } = target.dataset;

      if (action === 'select-profile') {
        if (ProfileSelectView._editMode) return;
        store.switchProfile(id);
        const name = store.activeProfile?.name || 'você';
        window.showToast(`Bem-vindo, ${name}!`, 'success');
        window.app.navigateTo('dashboard');
      }

      if (action === 'edit-profile') {
        if (!ProfileSelectView._editMode) return;
        openModal(id);
      }

      if (action === 'delete-profile') {
        const profile = store.profiles.find(p => p.id === id);
        if (!profile) return;
        window.showConfirm(
          `Excluir o perfil "${profile.name}"? Todos os dados associados serão perdidos.`,
          () => {
            store.deleteProfile(id);
            if (store.profiles.length === 0) ProfileSelectView._editMode = false;
            window.app.navigateTo('profile-select');
          }
        );
      }
    });

    document.getElementById('btn-add-profile')?.addEventListener('click', () => {
      openModal(null);
    });

    document.getElementById('btn-manage-profiles')?.addEventListener('click', () => {
      ProfileSelectView._editMode = true;
      window.app.navigateTo('profile-select');
    });

    document.getElementById('btn-finish-edit')?.addEventListener('click', () => {
      document.querySelectorAll('.profile-pick-name-input').forEach(input => {
        const pid  = input.dataset.id;
        const name = input.value.trim();
        if (name) store.updateProfile(pid, { name });
      });
      ProfileSelectView._editMode = false;
      window.app.navigateTo('profile-select');
    });
  },
};
