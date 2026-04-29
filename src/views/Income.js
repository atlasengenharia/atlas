import { store } from '../store/store.js';
import { esc, formatBRL } from '../utils/sanitize.js';
import { parseCurrency, formatCurrency } from '../utils/mask.js';

export const IncomeView = {
  render: () => {
    const { incomeSources = [], monthlyIncome = 0 } = store.state;

    const distLabel = (src) => {
      if (src.distribution === '40_60') return '40% (Dia 5) / 60% (Dia 20)';
      if (src.distribution === '60_40') return '60% (Dia 5) / 40% (Dia 20)';
      return src.dueDate ? `Vence dia ${esc(src.dueDate)}` : 'Recebimento único';
    };

    const mainSource = incomeSources.length > 0 ? [...incomeSources].sort((a, b) => b.amount - a.amount)[0] : null;

    return `
      <div class="fade-in" id="income-view-content">
        <div class="stats-grid" style="margin-bottom: 2rem;">
          <div class="glass stat-card" style="border-top: 4px solid #00e676;">
            <span class="stat-label">Renda Mensal Total</span>
            <span class="stat-value" style="color: #00e676;">R$ ${formatBRL(monthlyIncome)}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">Soma de todas as fontes</span>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid var(--primary-color);">
            <span class="stat-label">Principal Fonte</span>
            <span class="stat-value" style="font-size: 1.2rem;">${mainSource ? esc(mainSource.name) : '---'}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">${mainSource ? `R$ ${formatBRL(mainSource.amount)}` : 'Nenhuma cadastrada'}</span>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid var(--secondary-color);">
            <span class="stat-label">Projeção Anual</span>
            <span class="stat-value">R$ ${formatBRL(monthlyIncome * 12)}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">Renda bruta estimada</span>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Lista -->
          <div class="glass" style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
              <h3>Fontes de Renda</h3>
              <button class="btn btn-primary" id="btn-add-income" style="display: none;">
                <i data-lucide="plus" style="width: 16px;"></i>
                Nova Fonte
              </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1.2rem;">
              ${incomeSources.length === 0
                ? `<div style="text-align: center; padding: 4rem; color: var(--text-muted);">
                    <i data-lucide="briefcase" style="width: 48px; height: 48px; display: block; margin: 0 auto 1.5rem; opacity: 0.2;"></i>
                    Nenhuma fonte de renda cadastrada.
                   </div>`
                : incomeSources.map(source => `
                  <div class="ledger-row" 
                       style="background: rgba(0,230,118,0.03); border-radius: 16px; padding: 1.25rem; border: 1px solid rgba(0,230,118,0.1); transition: var(--transition); cursor: pointer;"
                       data-action="edit-income" data-id="${esc(source.id)}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                      <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(0,230,118,0.1); display: flex; align-items: center; justify-content: center; color: #00e676;">
                          <i data-lucide="${esc(source.icon || 'briefcase')}" style="width: 20px;"></i>
                        </div>
                        <div>
                          <h4 style="font-size: 1.1rem; margin-bottom: 0.1rem;">${esc(source.name)}</h4>
                          <span style="font-size: 0.8rem; color: var(--text-muted);">${esc(source.company)}</span>
                        </div>
                      </div>
                      <div style="display: flex; gap: 0.5rem;">
                        <button class="card-action-icon delete" data-action="delete-income" data-id="${esc(source.id)}" onclick="event.stopPropagation()">
                          <i data-lucide="trash-2" style="width: 14px;"></i>
                        </button>
                      </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                      <span style="font-size: 0.8rem; color: var(--text-muted);">${esc(source.frequency)} · ${distLabel(source)}</span>
                      <span style="font-weight: 700; color: #00e676; font-size: 1.1rem;">R$ ${formatBRL(source.amount)}</span>
                    </div>
                  </div>`).join('')}
            </div>
          </div>

          <!-- Coluna Lateral -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="glass" style="padding: 1.5rem;">
              <h3>Distribuição de Renda</h3>
              <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem;">
                <div style="display: flex; gap: 1rem; align-items: flex-start;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(0,229,255,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i data-lucide="pie-chart" style="width: 16px; color: var(--primary-color);"></i>
                  </div>
                  <div>
                    <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">Acompanhe como suas fontes se distribuem ao longo do mês para planejar pagamentos.</p>
                  </div>
                </div>
                <div style="display: flex; gap: 1rem; align-items: flex-start;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(124, 77, 255, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i data-lucide="calendar" style="width: 16px; color: var(--secondary-color);"></i>
                  </div>
                  <div>
                    <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">Fontes com divisão 40/60 ou 60/40 são ideais para manter liquidez quinzenal.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="glass" style="padding: 1.5rem; background: linear-gradient(135deg, rgba(0,230,118,0.05) 0%, rgba(0,229,255,0.05) 100%);">
              <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem;">
                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(0,230,118,0.1); display: flex; align-items: center; justify-content: center;">
                  <i data-lucide="target" style="color: #00e676; width: 20px;"></i>
                </div>
                <h4 style="margin: 0;">Salário Ideal</h4>
              </div>
              
              ${(() => {
                const stats = store.getDynamicStats();
                const exp = stats.expenses || 0;
                // Regra: Gastos devem ser no máximo 70% da renda para uma vida saudável
                const ideal = exp / 0.7;
                const diff = ideal - monthlyIncome;
                const isIdeal = monthlyIncome >= ideal;
                const pct = Math.min((monthlyIncome / ideal) * 100, 100);

                return `
                  <div style="margin-bottom: 1rem;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Baseado em seus gastos de <strong style="color: var(--text-main);">R$ ${formatBRL(exp)}</strong>:</div>
                    <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary-color);">R$ ${formatBRL(ideal)}</div>
                  </div>
                  
                  <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; margin-bottom: 1rem; overflow: hidden;">
                    <div style="width: ${pct}%; height: 100%; background: ${isIdeal ? '#00e676' : 'var(--primary-gradient)'}; border-radius: 3px;"></div>
                  </div>

                  <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">
                    ${isIdeal 
                      ? `<span style="color: #00e676; font-weight: 600;">Parabéns!</span> Sua renda atual cobre seus gastos com uma margem de segurança de 30%.`
                      : `Para manter uma saúde financeira sólida, você precisaria de mais <strong style="color: var(--text-main);">R$ ${formatBRL(diff)}</strong> mensais.`}
                  </p>
                `;
              })()}
            </div>

            <div class="glass" style="padding: 1.5rem;">
              <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem;">
                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(124, 77, 255, 0.1); display: flex; align-items: center; justify-content: center;">
                  <i data-lucide="line-chart" style="color: var(--secondary-color); width: 20px;"></i>
                </div>
                <h4 style="margin: 0;">Dicas de Investimento</h4>
              </div>
              <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.8rem;">
                <li style="font-size: 0.8rem; color: var(--text-muted); display: flex; gap: 0.5rem;">
                  <i data-lucide="check-circle-2" style="width: 14px; color: #00e676; flex-shrink: 0;"></i>
                  <span>Reserve 10-20% da sua renda para ativos geradores de caixa.</span>
                </li>
                <li style="font-size: 0.8rem; color: var(--text-muted); display: flex; gap: 0.5rem;">
                  <i data-lucide="check-circle-2" style="width: 14px; color: #00e676; flex-shrink: 0;"></i>
                  <span>Diversifique entre Renda Fixa (Segurança) e Renda Variável (Crescimento).</span>
                </li>
                <li style="font-size: 0.8rem; color: var(--text-muted); display: flex; gap: 0.5rem;">
                  <i data-lucide="check-circle-2" style="width: 14px; color: #00e676; flex-shrink: 0;"></i>
                  <span>Reinvista seus dividendos para acelerar os juros compostos.</span>
                </li>
              </ul>
              <button class="btn btn-ghost" style="width: 100%; margin-top: 1rem; font-size: 0.8rem; padding: 0.5rem;" onclick="window.app.navigateTo('investments')">
                Ver Mercado em Tempo Real
              </button>
            </div>

            <div class="glass" style="padding: 1.5rem; background: linear-gradient(135deg, rgba(124, 77, 255, 0.05) 0%, rgba(0, 229, 255, 0.05) 100%);">
              <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <i data-lucide="rocket" style="color: var(--secondary-color);"></i>
                <h4 style="margin: 0;">Foco em Crescimento</h4>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Considere diversificar suas fontes de renda com ativos ou serviços extras para aumentar sua segurança financeira e atingir o patamar ideal.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init: () => {
    const modal    = document.getElementById('income-modal');
    const form     = document.getElementById('income-form');
    const btnAdd   = document.getElementById('btn-add-income');
    const btnClose = document.getElementById('btn-close-income-modal');

    const openModal = (source = null) => {
      form.reset();
      document.getElementById('income-id').value = '';
      document.getElementById('income-modal-title').innerText = 'Nova Fonte de Renda';
      document.getElementById('income-distribution').value = 'single';
      document.getElementById('income-due-container').style.display = 'block';

      if (source) {
        document.getElementById('income-id').value          = source.id;
        document.getElementById('income-name').value        = source.name;
        document.getElementById('income-company').value     = source.company;
        document.getElementById('income-amount').value      = formatCurrency(source.amount);
        document.getElementById('income-frequency').value   = source.frequency;
        document.getElementById('income-distribution').value= source.distribution || 'single';
        document.getElementById('income-due').value         = source.dueDate || '';
        document.getElementById('income-icon').value        = source.icon || 'briefcase';
        document.getElementById('income-modal-title').innerText = 'Editar Fonte de Renda';
        const isSplit = source.distribution === '40_60' || source.distribution === '60_40';
        document.getElementById('income-due-container').style.display = isSplit ? 'none' : 'block';
      }
      modal.classList.add('active');
    };

    btnAdd.onclick   = () => openModal();
    btnClose.onclick = () => modal.classList.remove('active');

    const viewContainer = document.getElementById('income-view-content');
    if (viewContainer) {
      viewContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const { action, id } = btn.dataset;
        if (action === 'edit-income') {
          const source = store.state.incomeSources.find(s => s.id === id);
          if (source) openModal(source);
        }
        if (action === 'delete-income') {
          window.showConfirm('Excluir esta fonte de renda?', () => store.deleteIncomeSource(id));
        }
      });
    }

    form.onsubmit = (e) => {
      e.preventDefault();
      const id   = document.getElementById('income-id').value;
      const data = {
        name:         document.getElementById('income-name').value,
        company:      document.getElementById('income-company').value,
        amount:       parseCurrency(document.getElementById('income-amount').value),
        frequency:    document.getElementById('income-frequency').value,
        distribution: document.getElementById('income-distribution').value,
        dueDate:      document.getElementById('income-due').value,
        icon:         document.getElementById('income-icon').value,
      };
      id ? store.updateIncomeSource(id, data) : store.addIncomeSource(data);
      modal.classList.remove('active');
    };
  }
};
