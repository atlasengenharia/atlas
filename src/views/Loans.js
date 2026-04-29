import { store } from '../store/store.js';
import { esc, formatBRL } from '../utils/sanitize.js';
import { parseCurrency, formatCurrency } from '../utils/mask.js';
import { getLocalTodayStr } from '../utils/date.js';

export const LoansView = {
  render: () => {
    const { loans = [] } = store.state;
    const active = loans.filter(l => (parseInt(l.paidInstallments) || 0) < (parseInt(l.totalInstallments) || 1));
    const totalRemaining   = active.reduce((s, l) => s + (parseFloat(l.remainingAmount) || 0), 0);
    const totalInstallments = active.reduce((s, l) => s + (parseFloat(l.installmentValue) || 0), 0);

    return `
      <div class="fade-in" id="loans-view-content">
        <div class="stats-grid" style="margin-bottom: 2rem;">
          <div class="glass stat-card" style="border-top: 4px solid #ff3d00;">
            <span class="stat-label">Total Devedor</span>
            <span class="stat-value" style="color: #ff3d00;">R$ ${formatBRL(totalRemaining)}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">Saldo remanescente</span>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid var(--primary-color);">
            <span class="stat-label">Comprometimento Mensal</span>
            <span class="stat-value">R$ ${formatBRL(totalInstallments)}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">Soma das parcelas</span>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid var(--secondary-color);">
            <span class="stat-label">Contratos Ativos</span>
            <span class="stat-value">${active.length}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">${active.length === 0 ? 'Nenhum pendente' : 'Em andamento'}</span>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Lista -->
          <div class="glass" style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
              <h3>Controle de Empréstimos</h3>
              <button class="btn btn-primary" id="btn-add-loan" style="display: none;">
                <i data-lucide="plus" style="width: 16px;"></i>
                Novo Empréstimo
              </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              ${loans.length === 0
                ? `<div style="text-align: center; padding: 3rem;">
                    <i data-lucide="info" style="width: 48px; height: 48px; color: var(--text-dim); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-muted);">Nenhum empréstimo cadastrado.</p>
                   </div>`
                : loans.map(loan => {
                    const total  = loan.totalInstallments || 1;
                    const paid   = loan.paidInstallments  || 0;
                    const isDone = paid >= total;
                    const pct    = Math.min((paid / total) * 100, 100);
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const dueDay = parseInt(loan.dueDate) || 1;
                    
                    let payDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
                    if (today.getDate() > dueDay) {
                      payDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
                    }
                    
                    const diff = Math.ceil((payDate - today) / 86400000);
                    const isExpiring = diff >= 0 && diff <= 3 && !isDone;
                    return `
                      <div class="ledger-row" 
                           style="background: var(--surface-color); border-radius: 15px; padding: 1.25rem; position: relative; border: 1px solid ${isDone ? '#00e67633' : (isExpiring ? '#ff5252' : 'var(--border-color)')}; box-shadow: ${isExpiring ? '0 0 15px rgba(255,82,82,0.2)' : 'none'}; opacity: ${isDone ? '0.7' : '1'}; transition: var(--transition); cursor: pointer;"
                           data-action="edit-loan" data-id="${esc(loan.id)}">
                        
                        ${isExpiring ? `
                        <div style="position:absolute;top:-1px;left:50%;transform:translateX(-50%);display:flex;gap:0.5rem;z-index:10;">
                          <div style="background:rgba(255,82,82,0.9);color:#fff;padding:.3rem 1.2rem;border-bottom-left-radius:12px;border-bottom-right-radius:12px;font-size:.65rem;font-weight:900;letter-spacing:1px;box-shadow: 0 4px 15px rgba(255,82,82,0.4);white-space:nowrap;animation: pulse 2s infinite; display:flex; align-items:center;">VENCE ${diff === 0 ? 'HOJE' : `EM ${diff} ${diff === 1 ? 'DIA' : 'DIAS'}`}</div>
                        </div>
                        ` : ''}

                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                          <div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                              <h4 style="font-size: 1.1rem;">${esc(loan.name)}</h4>
                              ${isDone ? '<span class="badge" style="background: rgba(0,230,118,0.1); color: #00e676;">QUITADO</span>' : ''}
                            </div>
                            <span style="font-size: 0.85rem; color: var(--text-muted);">Parcela: R$ ${formatBRL(loan.installmentValue)} | Vence dia ${esc(loan.dueDate)}</span>
                          </div>
                          <div style="display: flex; gap: 0.5rem;">
                            <button class="card-action-icon delete" data-action="delete-loan" data-id="${esc(loan.id)}" onclick="event.stopPropagation()">
                              <i data-lucide="trash-2" style="width: 14px;"></i>
                            </button>
                          </div>
                        </div>

                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                          <span style="color: var(--primary-color); font-weight: 600;">${paid} de ${total} parcelas</span>
                          <span style="font-weight: 700; color: ${isDone ? '#00e676' : 'var(--text-main)'}">${Math.round(pct)}% Pago</span>
                        </div>
                        <div class="progress-track" style="height: 10px; background: var(--surface-light); border-radius: 6px; overflow: hidden; transition: var(--transition);">
                          <div style="width: ${pct}%; height: 100%; background: ${isDone ? '#00e676' : 'var(--primary-gradient)'}; border-radius: 6px; transition: width 0.6s ease;"></div>
                        </div>
                        
                        <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                          <div style="font-size: 0.8rem; color: var(--text-muted);">
                            ${isDone ? 'Contrato encerrado com sucesso' : `Restam <strong style="color: var(--text-main);">R$ ${formatBRL(loan.remainingAmount)}</strong>`}
                          </div>
                          <div style="display: flex; align-items: center; gap: 0.8rem;">
                            ${!isDone ? `
                              <button class="btn btn-primary" style="padding:.6rem 1.5rem; font-size:.8rem; border-radius:8px; font-weight:700; background:var(--primary-gradient); color:white; border:none; box-shadow:0 4px 15px rgba(0,229,255,0.2);"
                                data-action="pay-loan" data-id="${esc(loan.id)}" onclick="event.stopPropagation()">
                                <i data-lucide="check-circle" style="width:16px;margin-right:6px;"></i> Pagar Parcela
                              </button>` : ''}
                          </div>
                        </div>
                      </div>`;
                  }).join('')}
            </div>
          </div>

          <!-- Dicas / Info -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="glass" style="padding: 1.5rem;">
              <h3>Dicas de Quitação</h3>
              <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem;">
                <div style="display: flex; gap: 1rem;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(0,229,255,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i data-lucide="zap" style="width: 16px; color: var(--primary-color);"></i>
                  </div>
                  <p style="font-size: 0.85rem; color: var(--text-muted);">Antecipar parcelas pode reduzir drasticamente o total de juros pagos.</p>
                </div>
                <div style="display: flex; gap: 1rem;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(124, 77, 255, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i data-lucide="target" style="width: 16px; color: var(--secondary-color);"></i>
                  </div>
                  <p style="font-size: 0.85rem; color: var(--text-muted);">Priorize a quitação dos contratos com as maiores taxas de juros primeiro.</p>
                </div>
              </div>
            </div>

            <div class="glass" style="padding: 1.5rem; background: linear-gradient(135deg, rgba(0,229,255,0.05) 0%, rgba(124, 77, 255, 0.05) 100%);">
              <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <i data-lucide="shield-check" style="color: var(--primary-color);"></i>
                <h4 style="margin: 0;">Saúde Financeira</h4>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Mantenha seu comprometimento mensal abaixo de 30% da sua renda para evitar superendividamento.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init: () => {
    const modal    = document.getElementById('loan-modal');
    const form     = document.getElementById('loan-form');
    const btnAdd   = document.getElementById('btn-add-loan');
    const btnClose = document.getElementById('btn-close-loan-modal');

    const openModal = (loan = null) => {
      form.reset();
      document.getElementById('loan-id').value = '';
      document.getElementById('loan-modal-title').innerText = 'Novo Empréstimo';
      if (loan) {
        document.getElementById('loan-id').value                 = loan.id;
        document.getElementById('loan-name').value               = loan.name;
        document.getElementById('loan-total').value              = formatCurrency(loan.totalAmount);
        document.getElementById('loan-installment').value        = formatCurrency(loan.installmentValue);
        document.getElementById('loan-total-installments').value = loan.totalInstallments || '';
        document.getElementById('loan-paid-installments').value  = loan.paidInstallments  || '';
        document.getElementById('loan-due').value                = loan.dueDate;
        document.getElementById('loan-modal-title').innerText    = 'Editar Empréstimo';
      }
      modal.classList.add('active');
    };

    btnAdd.onclick   = () => openModal();
    btnClose.onclick = () => modal.classList.remove('active');

    const viewContainer = document.getElementById('loans-view-content');
    if (viewContainer) {
      viewContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const { action, id } = btn.dataset;
        if (action === 'edit-loan') {
          const loan = store.state.loans.find(l => l.id === id);
          if (loan) openModal(loan);
        }
        if (action === 'delete-loan') {
          window.showConfirm('Excluir este empréstimo? O histórico de pagamentos será mantido.', () => store.deleteLoan(id));
        }
        if (action === 'pay-loan') {
          const loan = store.state.loans.find(l => l.id === id);
          if (!loan) return;
          window.showConfirm(
            `Pagar parcela de R$ ${formatBRL(loan.installmentValue)} de "${loan.name}"?\nUma despesa será registrada automaticamente.`,
            () => {
              const newPaid = (loan.paidInstallments || 0) + 1;
              store.addTransaction({
                description: `Parcela: ${loan.name} (${newPaid}/${loan.totalInstallments})`,
                amount: loan.installmentValue, type: 'expense',
                category: 'Empréstimos',
                date: getLocalTodayStr(), cardId: null,
              });
              store.updateLoan(id, {
                paidInstallments: newPaid,
                remainingAmount:  Math.max(0, (loan.totalInstallments - newPaid) * loan.installmentValue),
              });
            }
          );
        }
      });
    }

    form.onsubmit = (e) => {
      e.preventDefault();
      const id     = document.getElementById('loan-id').value;
      const total  = parseInt(document.getElementById('loan-total-installments').value);
      const paid   = parseInt(document.getElementById('loan-paid-installments').value);
      const inst   = parseCurrency(document.getElementById('loan-installment').value);
      const data   = {
        name:             document.getElementById('loan-name').value,
        totalAmount:      parseCurrency(document.getElementById('loan-total').value),
        installmentValue: inst,
        totalInstallments: total,
        paidInstallments:  paid,
        remainingAmount:   Math.max(0, (total - paid) * inst),
        dueDate:          document.getElementById('loan-due').value,
      };
      id ? store.updateLoan(id, data) : store.addLoan(data);
      modal.classList.remove('active');
    };
  }
};
