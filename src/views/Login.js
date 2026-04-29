import { store } from '../store/store.js';

export const LoginView = {
  render: () => `
    <div class="login-page-wrapper">
      <div class="login-bg-orbits">
        <div class="orbit orbit-1"></div>
        <div class="orbit orbit-2"></div>
        <div class="orbit orbit-3"></div>
      </div>
      
      <div class="login-glass-container fade-in">
        <div class="login-header">
          <div class="logo-icon glow-pulse" style="margin: 0 auto 1rem auto; width: 60px; height: 60px; font-size: 1.8rem;">VN</div>
          <h2 style="background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 2rem; margin-bottom: 0.5rem; text-align: center;">VIZNANCEIRO</h2>
          <p style="color: var(--text-muted); text-align: center; margin-bottom: 2rem;">Acesse sua central financeira.</p>
        </div>

        <form id="login-form" class="login-form">
          <div class="form-group login-input-group">
            <i data-lucide="mail" class="input-icon"></i>
            <input type="email" id="login-email" class="input-field login-input" placeholder="Seu e-mail" required autocomplete="email">
          </div>
          
          <div class="form-group login-input-group">
            <i data-lucide="lock" class="input-icon"></i>
            <input type="password" id="login-password" class="input-field login-input" placeholder="Sua senha" required autocomplete="current-password">
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; font-size: 0.85rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); cursor: pointer;">
              <input type="checkbox" checked style="accent-color: var(--primary-color);"> Lembrar-me
            </label>
            <a href="#" style="color: var(--primary-color); text-decoration: none; transition: var(--transition);" onmouseover="this.style.textShadow='0 0 10px rgba(0,229,255,0.5)'" onmouseout="this.style.textShadow='none'">Esqueceu a senha?</a>
          </div>

          <button type="submit" class="btn btn-primary login-submit-btn" style="width: 100%; justify-content: center; font-size: 1.1rem; padding: 1rem;">
            <span>Entrar na Plataforma</span>
            <i data-lucide="arrow-right"></i>
          </button>
        </form>
      </div>
    </div>
  `,

  init: () => {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = form.querySelector('.login-submit-btn');

        // Estado visual de loading
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Autenticando...';
        lucide.createIcons();
        btn.style.pointerEvents = 'none';

        // Mock Timeout para demonstrar a animação sênior
        setTimeout(() => {
          const success = store.login(email, password);
          if (success) {
            window.showToast('Bem-vindo de volta!', 'success');
            window.app.navigateTo('profile-select');
          } else {
            window.showToast('Credenciais inválidas.', 'danger');
            btn.innerHTML = originalText;
            lucide.createIcons();
            btn.style.pointerEvents = 'all';
            
            // Shake effect
            const container = document.querySelector('.login-glass-container');
            container.classList.add('shake');
            setTimeout(() => container.classList.remove('shake'), 500);
          }
        }, 1200);
      });
    }
  }
};
