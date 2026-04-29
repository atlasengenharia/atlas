// ─── Chaves de armazenamento ───────────────────────────────────────────────
const PROFILES_KEY = 'finlux_profiles';
const ACTIVE_KEY   = 'finlux_active';
const dataKey      = (id) => `finlux_data_${id}`;

const DEFAULT_STATE = () => ({
  cards: [],
  transactions: [],
  loans: [],
  incomeSources: [],
  customCategories: [],
  settings: {
    defaultView: 'dashboard',
    theme: 'original',
    notificationsEnabled: true,
  },
  isAuthenticated: false
});

class Store {
  constructor() {
    this.listeners = [];
    this._migrate();
    this._loadProfiles();
    this._loadActiveData();
  }

  // ── Migração do formato antigo (finlux_state) ──────────────────────────
  _migrate() {
    const old = localStorage.getItem('finlux_state');
    if (old && !localStorage.getItem(PROFILES_KEY)) {
      const id = 'profile_default';
      localStorage.setItem(PROFILES_KEY, JSON.stringify([{
        id, name: 'Meu Perfil', avatar: '😊', createdAt: new Date().toISOString()
      }]));
      localStorage.setItem(ACTIVE_KEY, id);
      localStorage.setItem(dataKey(id), old);
      localStorage.removeItem('finlux_state');
    }
  }

  // ── Perfis ─────────────────────────────────────────────────────────────
  _loadProfiles() {
    this.profiles = JSON.parse(localStorage.getItem(PROFILES_KEY)) || [];
    if (this.profiles.length === 0) {
      const id = 'profile_' + Date.now();
      this.profiles = [{ id, name: 'Meu Perfil', avatar: '😊', createdAt: new Date().toISOString() }];
      this._saveProfiles();
    }
  }

  _saveProfiles() {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(this.profiles));
  }

  get activeProfile() {
    return this.profiles.find(p => p.id === this.activeProfileId) || this.profiles[0];
  }

  createProfile(name, avatar = '😊') {
    const profile = { id: 'profile_' + Date.now(), name, avatar, createdAt: new Date().toISOString() };
    this.profiles.push(profile);
    this._saveProfiles();
    // Inicializa estado vazio para o novo perfil
    localStorage.setItem(dataKey(profile.id), JSON.stringify(DEFAULT_STATE()));
    return profile;
  }

  switchProfile(profileId) {
    if (!this.profiles.find(p => p.id === profileId)) return;
    const wasAuthenticated = this.state.isAuthenticated; // preserva sessão
    localStorage.setItem(ACTIVE_KEY, profileId);
    this._loadActiveData();
    this.state.isAuthenticated = wasAuthenticated; // restaura após carregar novo perfil
    this.listeners.forEach(l => l(this.state));
  }

  updateProfile(profileId, data) {
    const idx = this.profiles.findIndex(p => p.id === profileId);
    if (idx !== -1) {
      this.profiles[idx] = { ...this.profiles[idx], ...data };
      this._saveProfiles();
      this.listeners.forEach(l => l(this.state));
    }
  }

  deleteProfile(profileId) {
    if (this.profiles.length <= 1) return false;
    this.profiles = this.profiles.filter(p => p.id !== profileId);
    this._saveProfiles();
    localStorage.removeItem(dataKey(profileId));
    if (this.activeProfileId === profileId) this.switchProfile(this.profiles[0].id);
    return true;
  }

  // ── Estado ────────────────────────────────────────────────────────────
  _loadActiveData() {
    let activeId = localStorage.getItem(ACTIVE_KEY);
    if (!activeId || !this.profiles.find(p => p.id === activeId)) {
      activeId = this.profiles[0].id;
      localStorage.setItem(ACTIVE_KEY, activeId);
    }
    this.activeProfileId = activeId;

    const saved = JSON.parse(localStorage.getItem(dataKey(activeId)));
    const defaults = DEFAULT_STATE();
    this.state = saved ? { ...defaults, ...saved } : defaults;

    // Garante arrays e sub-objetos
    ['cards', 'transactions', 'loans', 'incomeSources', 'customCategories'].forEach(k => {
      if (!Array.isArray(this.state[k])) this.state[k] = [];
    });
    if (!this.state.settings) this.state.settings = defaults.settings;

    // Campos derivados: sempre calculados, nunca persistidos
    this._refreshDerived();
  }

  _refreshDerived() {
    this.state.balance        = this._calcBalance();
    this.state.monthlyIncome  = this._calcMonthlyIncome();
    this.state.monthlyExpenses= this._calcMonthlyExpenses();
  }

  // Saldo derivado 100% das transações (sem drift)
  _calcBalance() {
    return this.state.transactions.reduce((sum, t) =>
      t.type === 'income' ? sum + Number(t.amount) : sum - Number(t.amount), 0);
  }

  _calcMonthlyIncome() {
    return this.state.incomeSources.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
  }

  _calcMonthlyExpenses() {
    const loansCost = this.state.loans
      .filter(l => (parseInt(l.paidInstallments) || 0) < (parseInt(l.totalInstallments) || 1))
      .reduce((sum, l) => sum + (parseFloat(l.installmentValue) || 0), 0);
    const cardsCost = this.state.cards.reduce((sum, c) => sum + (parseFloat(c.used) || 0), 0);
    return loansCost + cardsCost;
  }

  notify() {
    // Persiste apenas campos não-derivados (também ignora isAuthenticated para forçar login por sessão de aba)
    const { balance, monthlyIncome, monthlyExpenses, isAuthenticated, ...persistable } = this.state;
    localStorage.setItem(dataKey(this.activeProfileId), JSON.stringify(persistable));
    this.listeners.forEach(l => l(this.state));
  }

  subscribe(listener) { this.listeners.push(listener); }

  // ── Configurações ────────────────────────────────────────────────
  updateSettings(settings) {
    this.state.settings = { ...this.state.settings, ...settings };
    this.notify();
  }

  // ── Categorias Customizadas ───────────────────────────────────────
  addCategory(name) {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (this.state.customCategories.includes(trimmed)) return false;
    this.state.customCategories.push(trimmed);
    this.notify();
    return true;
  }

  deleteCategory(name) {
    this.state.customCategories = this.state.customCategories.filter(c => c !== name);
    this.notify();
  }

  // ── Transações ────────────────────────────────────────────────────────
  addTransaction(transaction) {
    this.state.transactions.push({ ...transaction, id: Date.now().toString() });
    if (transaction.cardId && transaction.type === 'expense') {
      const card = this.state.cards.find(c => c.id === transaction.cardId);
      if (card) card.used = (parseFloat(card.used) || 0) + Number(transaction.amount);
    }
    this._refreshDerived();
    this.notify();
  }

  deleteTransaction(id) {
    const t = this.state.transactions.find(t => t.id === id);
    if (!t) return;
    if (t.cardId && t.type === 'expense') {
      const card = this.state.cards.find(c => c.id === t.cardId);
      if (card) card.used = Math.max(0, (parseFloat(card.used) || 0) - Number(t.amount));
    }
    this.state.transactions = this.state.transactions.filter(t => t.id !== id);
    this._refreshDerived();
    this.notify();
  }

  updateTransaction(id, newData) {
    const idx = this.state.transactions.findIndex(t => t.id === id);
    if (idx === -1) return;
    const old = this.state.transactions[idx];
    if (old.cardId && old.type === 'expense') {
      const card = this.state.cards.find(c => c.id === old.cardId);
      if (card) card.used = Math.max(0, (parseFloat(card.used) || 0) - Number(old.amount));
    }
    this.state.transactions[idx] = { ...old, ...newData };
    const updated = this.state.transactions[idx];
    if (updated.cardId && updated.type === 'expense') {
      const card = this.state.cards.find(c => c.id === updated.cardId);
      if (card) card.used = (parseFloat(card.used) || 0) + Number(updated.amount);
    }
    this._refreshDerived();
    this.notify();
  }

  // ── Cartões ───────────────────────────────────────────────────────────
  addCard(card) {
    this.state.cards.push({ ...card, id: Date.now().toString(), used: card.used || 0, color: card.color || 'blue' });
    this._refreshDerived();
    this.notify();
  }

  updateCard(id, data) {
    const idx = this.state.cards.findIndex(c => c.id === id);
    if (idx !== -1) { this.state.cards[idx] = { ...this.state.cards[idx], ...data }; this._refreshDerived(); this.notify(); }
  }

  deleteCard(id) {
    this.state.cards = this.state.cards.filter(c => c.id !== id);
    this._refreshDerived();
    this.notify();
  }

  // ── Fontes de Renda ───────────────────────────────────────────────────
  addIncomeSource(source) {
    this.state.incomeSources.push({ ...source, id: Date.now().toString() });
    this._refreshDerived();
    this.notify();
  }

  updateIncomeSource(id, data) {
    const idx = this.state.incomeSources.findIndex(s => s.id === id);
    if (idx !== -1) { this.state.incomeSources[idx] = { ...this.state.incomeSources[idx], ...data }; this._refreshDerived(); this.notify(); }
  }

  deleteIncomeSource(id) {
    this.state.incomeSources = this.state.incomeSources.filter(s => s.id !== id);
    this._refreshDerived();
    this.notify();
  }

  // ── Empréstimos ───────────────────────────────────────────────────────
  addLoan(loan) {
    this.state.loans.push({ ...loan, id: Date.now().toString() });
    this._refreshDerived();
    this.notify();
  }

  updateLoan(id, data) {
    const idx = this.state.loans.findIndex(l => l.id === id);
    if (idx !== -1) { this.state.loans[idx] = { ...this.state.loans[idx], ...data }; this._refreshDerived(); this.notify(); }
  }

  deleteLoan(id) {
    this.state.loans = this.state.loans.filter(l => l.id !== id);
    this._refreshDerived();
    this.notify();
  }

  // ── Export / Import ───────────────────────────────────────────────────
  exportJSON() {
    const { balance, monthlyIncome, monthlyExpenses, ...data } = this.state;
    return JSON.stringify({ profile: this.activeProfile, exportedAt: new Date().toISOString(), version: '2.0', data }, null, 2);
  }

  exportCSV() {
    const { transactions, cards } = this.state;
    const header = 'Data;Descrição;Categoria;Tipo;Cartão;Valor (R$)';
    const rows = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(t => {
        const card = cards.find(c => c.id === t.cardId);
        const safeDesc = (t.description || '').replace(/"/g, '""');
        const safeCat  = (t.category || '').replace(/"/g, '""');
        return [
          t.date || '',
          `"${safeDesc}"`,
          `"${safeCat}"`,
          t.type === 'income' ? 'Receita' : 'Despesa',
          card ? `${card.name} (****${card.lastDigits})` : 'Dinheiro/Saldo',
          (t.amount || 0).toFixed(2)
        ].join(';');
      });
    return [header, ...rows].join('\n');
  }

  importJSON(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      const data = parsed.data || parsed;
      const defaults = DEFAULT_STATE();
      this.state = {
        ...defaults,
        cards:         Array.isArray(data.cards)         ? data.cards         : [],
        transactions:  Array.isArray(data.transactions)  ? data.transactions  : [],
        loans:         Array.isArray(data.loans)         ? data.loans         : [],
        incomeSources: Array.isArray(data.incomeSources) ? data.incomeSources : [],
        settings:      data.settings || defaults.settings,
      };
      this._refreshDerived();
      this.notify();
      return true;
    } catch (e) {
      console.error('Importação falhou:', e);
      return false;
    }
  }

  resetData() {
    this.state = DEFAULT_STATE();
    this._refreshDerived();
    this.notify();
  }

  // ── Alertas ───────────────────────────────────────────────────────────
  getAlerts() {
    const day = new Date().getDate();
    const groups = {
      cards: { type: 'warning', items: [] },
      loans: { type: 'danger', items: [] }
    };

    this.state.cards.forEach(card => {
      const diff = parseInt(card.dueDate) - day;
      if (diff >= 0 && diff <= 5) {
        groups.cards.items.push({ name: card.name, diff });
      }
    });

    this.state.loans
      .filter(l => (parseInt(l.paidInstallments) || 0) < (parseInt(l.totalInstallments) || 1))
      .forEach(loan => {
        const diff = parseInt(loan.dueDate) - day;
        if (diff >= 0 && diff <= 5) {
          groups.loans.items.push({ name: loan.name, diff });
        }
      });

    const alerts = [];
    if (groups.cards.items.length > 0) {
      const items = groups.cards.items;
      const text = items.length === 1 
        ? `Fatura do <strong>${items[0].name}</strong> vence em <strong>${items[0].diff} dia${items[0].diff !== 1 ? 's' : ''}</strong>.`
        : `Você tem <strong>${items.length} faturas</strong> de cartões vencendo em breve.`;
      alerts.push({ type: 'warning', view: 'cards', text, count: items.length });
    }

    if (groups.loans.items.length > 0) {
      const items = groups.loans.items;
      const text = items.length === 1
        ? `Parcela de <strong>${items[0].name}</strong> vence em <strong>${items[0].diff} dia${items[0].diff !== 1 ? 's' : ''}</strong>.`
        : `Você tem <strong>${items.length} parcelas</strong> de empréstimos vencendo em breve.`;
      alerts.push({ type: 'danger', view: 'loans', text, count: items.length });
    }

    return alerts;
  }

  // ── Stats do Dashboard ────────────────────────────────────────────────
  getDynamicStats() {
    const today = new Date();
    const cm = today.getMonth(), cy = today.getFullYear();
    const pm = cm === 0 ? 11 : cm - 1, py = cm === 0 ? cy - 1 : cy;

    const inMonth = (dStr, m, y) => {
      if (!dStr) return false;
      const d = new Date(dStr + 'T00:00:00');
      return d.getMonth() === m && d.getFullYear() === y;
    };

    const fixedIncome = this._calcMonthlyIncome();
    const currTxInc = this.state.transactions.filter(t => t.type === 'income' && inMonth(t.date, cm, cy)).reduce((s, t) => s + Number(t.amount), 0);
    const prevTxInc = this.state.transactions.filter(t => t.type === 'income' && inMonth(t.date, pm, py)).reduce((s, t) => s + Number(t.amount), 0);

    const currentIncome = fixedIncome + currTxInc;
    const prevIncome    = fixedIncome + prevTxInc;

    // Fix #4: card.used é saldo histórico TOTAL do cartão — não representa despesa mensal.
    // Usar apenas parcelas de empréstimos ativos + despesas do mês via transações.
    const loansCost = this.state.loans
      .filter(l => (parseInt(l.paidInstallments) || 0) < (parseInt(l.totalInstallments) || 1))
      .reduce((sum, l) => sum + (parseFloat(l.installmentValue) || 0), 0);

    const currTxExp = this.state.transactions.filter(t => t.type === 'expense' && inMonth(t.date, cm, cy)).reduce((s, t) => s + Number(t.amount), 0);
    const prevTxExp = this.state.transactions.filter(t => t.type === 'expense' && inMonth(t.date, pm, py)).reduce((s, t) => s + Number(t.amount), 0);

    const currExpenses = loansCost + currTxExp;
    const prevExpenses = loansCost + prevTxExp;

    const bal = this.state.balance;
    const pct = (c, p) => p === 0 ? (c > 0 ? 100 : c < 0 ? -100 : 0) : ((c - p) / Math.abs(p)) * 100;

    // Fix #5: comparar fluxo líquido (receita - despesa) do mês atual vs anterior.
    // O cálculo anterior era circular: usava bal - income + expenses como "saldo anterior".
    const currNet = currentIncome - currExpenses;
    const prevNet = prevIncome - prevExpenses;

    return {
      balance: bal, balancePct: pct(currNet, prevNet),
      income: currentIncome, incomePct: pct(currentIncome, prevIncome),
      expenses: currExpenses, expensesPct: pct(currExpenses, prevExpenses)
    };
  }

  // ── Autenticação ──────────────────────────────────────────────────────
  login(email, password) {
    // Mock Sênior: aceita qualquer dado preenchido como válido na simulação
    if (email && password) {
      this.state.isAuthenticated = true;
      this.notify();
      return true;
    }
    return false;
  }

  logout() {
    this.state.isAuthenticated = false;
    this.notify();
  }
}

export const store = new Store();
