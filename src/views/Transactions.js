import { store } from '../store/store.js';
import { esc, formatBRL, formatDate } from '../utils/sanitize.js';
import { getLocalTodayStr } from '../utils/date.js';

// ── Helpers de renderização da tabela ─────────────────────────────────────
const renderRows = (list, cards) => {
  if (list.length === 0) {
    return `<tr><td colspan="6" style="text-align:center;padding:4rem;color:var(--text-muted);">
      <i data-lucide="search-x" style="width:48px;height:48px;display:block;margin:0 auto 1rem;opacity:.3;"></i>
      Nenhuma transação encontrada para os filtros aplicados.
    </td></tr>`;
  }
  return list.map(t => {
    const card      = cards.find(c => c.id === t.cardId);
    const isExpense = t.type === 'expense';
    return `
      <tr class="ledger-row" style="background:var(--surface-color);transition:var(--transition);cursor:pointer;" data-action="edit-tx" data-id="${esc(t.id)}">
        <td style="padding:1.2rem;border-radius:12px 0 0 12px;font-size:.9rem;color:var(--text-muted);">${formatDate(t.date)}</td>
        <td style="padding:1.2rem;font-weight:500;">${esc(t.description)}</td>
        <td style="padding:1.2rem;">
          <span class="badge" style="background:var(--surface-light);font-size:.75rem;">${esc(t.category)}</span>
        </td>
        <td style="padding:1.2rem;font-size:.85rem;color:var(--text-muted);">
          ${card
            ? `<div style="display:flex;align-items:center;gap:.5rem;">
                <div style="width:10px;height:10px;border-radius:50%;background:var(--card-${esc(card.color)});"></div>
                <span>${esc(card.name)}</span>
               </div>`
            : '<div style="display:flex;align-items:center;gap:.5rem;"><i data-lucide="wallet" style="width:14px;"></i> Dinheiro</div>'}
        </td>
        <td style="padding:1.2rem;font-weight:700;color:${isExpense ? '#ff5252' : '#00e676'};">
          ${isExpense ? '-' : '+'} R$ ${formatBRL(t.amount)}
        </td>
        <td style="padding:1.2rem;border-radius:0 12px 12px 0;text-align:right;">
          <div style="display:flex;gap:.5rem;justify-content:flex-end;">
            <button class="card-action-icon delete" data-action="delete-tx" data-id="${esc(t.id)}" onclick="event.stopPropagation()">
              <i data-lucide="trash-2" style="width:16px;"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
};

export const TransactionsView = {
  render: () => {
    const { transactions = [], cards = [], customCategories = [] } = store.state;
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalIncome  = sorted.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = sorted.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Coleta categorias únicas das transações + fixas + customizadas
    const fixedCategories = [
      'Alimentação','Moradia','Transporte','Saúde','Educação','Lazer',
      'Vestuário','Assinaturas','Cartão de Crédito','Empréstimos',
      'Salário','Freelance','Investimentos','Presente','Reembolso','Outros'
    ];
    const usedCategories = [...new Set(sorted.map(t => t.category).filter(Boolean))];
    const allCategories  = [...new Set([...fixedCategories, ...customCategories, ...usedCategories])].sort();

    return `
      <div class="fade-in" id="tx-view-content">
        <div class="stats-grid" style="margin-bottom:2rem;">
          <div class="glass stat-card" style="border-top:4px solid #00e676;">
            <span class="stat-label">Entradas</span>
            <span class="stat-value" style="color:#00e676;">+ R$ ${formatBRL(totalIncome)}</span>
            <span style="color:var(--text-muted);font-size:.8rem;">Total recebido</span>
          </div>
          <div class="glass stat-card" style="border-top:4px solid #ff5252;">
            <span class="stat-label">Saídas</span>
            <span class="stat-value" style="color:#ff5252;">- R$ ${formatBRL(totalExpense)}</span>
            <span style="color:var(--text-muted);font-size:.8rem;">Total gasto</span>
          </div>
          <div class="glass stat-card" style="border-top:4px solid var(--primary-color);">
            <span class="stat-label">Saldo Líquido</span>
            <span class="stat-value" style="color:${totalIncome - totalExpense >= 0 ? 'var(--text-main)' : '#ff5252'}">R$ ${formatBRL(totalIncome - totalExpense)}</span>
            <span style="color:var(--text-muted);font-size:.8rem;">Resultado do período</span>
          </div>
        </div>

        <div class="glass" style="padding:2rem;">
          <!-- Cabeçalho -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;gap:1rem;flex-wrap:wrap;">
            <div>
              <h3>Livro Caixa</h3>
              <p style="color:var(--text-muted);font-size:.9rem;">Histórico completo de movimentações.</p>
            </div>
            <div style="display:flex;gap:.75rem;">
              <button class="btn btn-ghost" id="btn-exp-json" style="font-size:.85rem;background:var(--surface-color);">
                <i data-lucide="download" style="width:16px;"></i> Exportar JSON
              </button>
              <button class="btn btn-ghost" id="btn-exp-csv" style="font-size:.85rem;background:var(--surface-color);">
                <i data-lucide="file-spreadsheet" style="width:16px;"></i> Exportar CSV
              </button>
            </div>
          </div>

          <!-- Barra de Filtros -->
          <div id="tx-filter-bar" style="display:grid;grid-template-columns:1fr auto auto auto auto;gap:.75rem;margin-bottom:1.5rem;align-items:center;flex-wrap:wrap;">
            <div style="position:relative;">
              <i data-lucide="search" style="position:absolute;left:.85rem;top:50%;transform:translateY(-50%);width:16px;color:var(--text-muted);pointer-events:none;"></i>
              <input id="tx-search" type="text" class="input-field" placeholder="Buscar descrição..." style="padding-left:2.5rem;height:42px;">
            </div>
            <select id="tx-filter-type" class="input-field" style="height:42px;width:auto;min-width:130px;">
              <option value="">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
            <select id="tx-filter-cat" class="input-field" style="height:42px;width:auto;min-width:150px;">
              <option value="">Todas as categorias</option>
              ${allCategories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
            </select>
            <input id="tx-filter-from" type="date" class="input-field" style="height:42px;width:auto;" title="De">
            <input id="tx-filter-to"   type="date" class="input-field" style="height:42px;width:auto;" title="Até">
          </div>

          <!-- Contador de resultados + botão limpar -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <span id="tx-count" style="font-size:.85rem;color:var(--text-muted);">${sorted.length} transação(ões)</span>
            <button id="tx-clear-filters" class="btn btn-ghost" style="font-size:.8rem;padding:.4rem .8rem;display:none;">
              <i data-lucide="x-circle" style="width:14px;"></i> Limpar filtros
            </button>
          </div>

          <!-- Tabela -->
          <div class="table-container" style="overflow-x:auto;">
            <table style="width:100%;border-collapse:separate;border-spacing:0 .5rem;">
              <thead>
                <tr style="text-align:left;color:var(--text-muted);font-size:.85rem;text-transform:uppercase;letter-spacing:1px;">
                  <th style="padding:1rem;">Data</th>
                  <th style="padding:1rem;">Descrição</th>
                  <th style="padding:1rem;">Categoria</th>
                  <th style="padding:1rem;">Pagamento</th>
                  <th style="padding:1rem;">Valor</th>
                  <th style="padding:1rem;text-align:right;">Ações</th>
                </tr>
              </thead>
              <tbody id="tx-tbody">
                ${sorted.length === 0
                  ? `<tr><td colspan="6" style="text-align:center;padding:4rem;color:var(--text-muted);">
                      <i data-lucide="info" style="width:48px;height:48px;display:block;margin:0 auto 1rem;opacity:.3;"></i>
                      Nenhuma transação registrada.
                    </td></tr>`
                  : renderRows(sorted, cards)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  init: () => {
    // ── Exportações ───────────────────────────────────────────────────────
    const download = (content, filename, mime) => {
      const blob = new Blob([content], { type: mime });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    };
    const today = getLocalTodayStr;

    document.getElementById('btn-exp-json').onclick = () =>
      download(store.exportJSON(), `vizfin_backup_${today()}.json`, 'application/json');
    document.getElementById('btn-exp-csv').onclick = () =>
      download('\uFEFF' + store.exportCSV(), `vizfin_transacoes_${today()}.csv`, 'text/csv;charset=utf-8');

    // ── Lógica de Filtros ─────────────────────────────────────────────────
    const { transactions = [], cards = [] } = store.state;
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    const tbody      = document.getElementById('tx-tbody');
    const countLabel = document.getElementById('tx-count');
    const clearBtn   = document.getElementById('tx-clear-filters');
    const searchEl   = document.getElementById('tx-search');
    const typeEl     = document.getElementById('tx-filter-type');
    const catEl      = document.getElementById('tx-filter-cat');
    const fromEl     = document.getElementById('tx-filter-from');
    const toEl       = document.getElementById('tx-filter-to');

    const applyFilters = () => {
      const q    = searchEl.value.toLowerCase().trim();
      const type = typeEl.value;
      const cat  = catEl.value;
      const from = fromEl.value;
      const to   = toEl.value;

      const hasFilter = q || type || cat || from || to;
      clearBtn.style.display = hasFilter ? 'flex' : 'none';

      const filtered = sorted.filter(t => {
        if (type && t.type !== type) return false;
        if (cat  && t.category !== cat) return false;
        if (from && t.date < from) return false;
        if (to   && t.date > to)   return false;
        if (q && !t.description?.toLowerCase().includes(q) && !t.category?.toLowerCase().includes(q)) return false;
        return true;
      });

      tbody.innerHTML = renderRows(filtered, cards);
      countLabel.textContent = `${filtered.length} transação(ões)${hasFilter ? ' encontrada(s)' : ''}`;
      lucide.createIcons();
    };

    const clearFilters = () => {
      searchEl.value = '';
      typeEl.value   = '';
      catEl.value    = '';
      fromEl.value   = '';
      toEl.value     = '';
      applyFilters();
    };

    // Eventos dos filtros
    [searchEl, typeEl, catEl, fromEl, toEl].forEach(el =>
      el.addEventListener('input', applyFilters)
    );
    clearBtn.addEventListener('click', clearFilters);

    // ── Ações na tabela ────────────────────────────────────────────────────
    const viewContainer = document.getElementById('tx-view-content');
    if (viewContainer) {
      viewContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const { action, id } = btn.dataset;
        if (action === 'edit-tx')   window.app.showAddTransactionModal(id);
        if (action === 'delete-tx') {
          window.showConfirm('Excluir esta transação? Isso afetará seu saldo.', () => store.deleteTransaction(id));
        }
      });
    }

    lucide.createIcons();
  }
};
