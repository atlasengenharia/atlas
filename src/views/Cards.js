import { store } from '../store/store.js';
import { esc, formatBRL } from '../utils/sanitize.js';
import { parseCurrency, formatCurrency } from '../utils/mask.js';
import { getLocalTodayStr } from '../utils/date.js';

export const CardsView = {
  render: () => {
    const { cards } = store.state;

    // ── Dias úteis (Seg-Sex) ──────────────────────────────────────────
    const getFifthBusinessDay = (year, month) => {
      let count = 0, day = 1;
      while (count < 5) {
        const dow = new Date(year, month, day).getDay();
        if (dow !== 0 && dow !== 6) count++;
        if (count === 5) return day;
        day++;
      }
      return 5;
    };

    const getAdvanceDay = (year, month) => {
      let day = 20;
      while (true) {
        const dow = new Date(year, month, day).getDay();
        if (dow !== 0 && dow !== 6) return day;
        day--;
      }
    };

    // ── Algoritmo Melhor Cartão ───────────────────────────────────────
    // Critério: maior prazo para pagar (postergar gasto).
    // Ajuste fino: leve penalidade em cartões que vencem no dia do
    // recebimento maior, para proteger a grana principal.
    const getBestCardId = (cardsList) => {
      if (!cardsList?.length) return null;
      const today = new Date();
      const cy = today.getFullYear(), cm = today.getMonth(), cd = today.getDate();

      let has40_60 = false, has60_40 = false;
      (store.state.incomeSources || []).forEach(src => {
        if (src.distribution === '40_60') has40_60 = true;
        if (src.distribution === '60_40') has60_40 = true;
      });

      let bestId = null, maxScore = -Infinity;

      cardsList.forEach(card => {
        const closing = parseInt(card.closingDate) || Math.max(1, parseInt(card.dueDate) - 7);
        const due     = parseInt(card.dueDate) || 1;

        // Próximo fechamento
        let nextClose = new Date(cy, cm, closing);
        if (cd >= closing) nextClose = new Date(cy, cm + 1, closing);

        // Vencimento associado ao fechamento
        let payDate = new Date(nextClose.getFullYear(), nextClose.getMonth(), due);
        if (payDate <= nextClose) payDate = new Date(nextClose.getFullYear(), nextClose.getMonth() + 1, due);

        const diff = Math.ceil((payDate - new Date(cy, cm, cd)) / 86400000);
        const pm = payDate.getMonth(), py = payDate.getFullYear();
        const fifth  = getFifthBusinessDay(py, pm);
        const adv    = getAdvanceDay(py, pm);

        let score = diff; // base: maior prazo = melhor

        if (has60_40) {
          // Maior recebimento no dia 5 → protege esse dinheiro
          if (due >= fifth && due <= fifth + 5) score -= 15;
          if (due >= adv   && due <= adv + 5)   score += 30;
        } else if (has40_60) {
          // Maior recebimento no dia 20 → protege esse dinheiro
          if (due >= adv  && due <= adv + 5)   score -= 15;
          if (due >= fifth && due <= fifth + 5) score += 30;
        } else {
          // Recebimento integral → apenas evitar antes do dia 5
          if (due < fifth) score -= 30;
          if (due >= fifth && due <= fifth + 7) score += 15;
        }

        if (score > maxScore) { maxScore = score; bestId = card.id; }
      });
      return bestId;
    };

    const bestCardId = getBestCardId(cards);

    const totalLimit = cards.reduce((sum, c) => sum + (parseFloat(c.limit) || 0), 0);
    const totalUsed  = cards.reduce((sum, c) => sum + (parseFloat(c.used) || 0), 0);
    const totalAvailable = Math.max(0, totalLimit - totalUsed);

    return `
      <div class="fade-in" id="cards-view-content">
        <div class="stats-grid" style="margin-bottom: 2rem;">
          <div class="glass stat-card" style="border-top: 4px solid var(--primary-color);">
            <span class="stat-label">Limite Total</span>
            <span class="stat-value" style="color: var(--primary-color);">R$ ${formatBRL(totalLimit)}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">Soma dos limites cadastrados</span>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid #ff5252;">
            <span class="stat-label">Saldo Devedor</span>
            <span class="stat-value" style="color: #ff5252;">R$ ${formatBRL(totalUsed)}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">Faturas em aberto</span>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid #00e676;">
            <span class="stat-label">Limite Disponível</span>
            <span class="stat-value" style="color: #00e676;">R$ ${formatBRL(totalAvailable)}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">Livre para compras globais</span>
          </div>
        </div>

        <div class="glass" style="padding: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap;">
            <div>
              <h3>Meus Cartões</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem;">Gerencie seus limites, prazos de fechamento e faturas.</p>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.5rem;width:100%;">
            ${cards.length === 0
              ? `<div style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:3rem 1rem;">
                   <i data-lucide="credit-card" style="width:40px;height:40px;opacity:.3;margin-bottom:1rem;display:block;margin-left:auto;margin-right:auto;"></i>
                   Nenhum cartão cadastrado. Clique em <strong>Novo Cartão</strong> no menu superior para começar.
                 </div>`
                  : cards.map(card => {
                      const progress = Math.min((card.used / card.limit) * 100, 100);
                      const isBest   = card.id === bestCardId;
                      const day      = new Date().getDate();
                      const diff     = parseInt(card.dueDate) - day;
                      const isExpiring = diff >= 0 && diff <= 3 && card.used > 0;
                      
                      const todayDate = new Date();
                      const cy = todayDate.getFullYear(), cm = todayDate.getMonth(), cd = todayDate.getDate();
                      const closing = parseInt(card.closingDate) || Math.max(1, parseInt(card.dueDate) - 7);
                      const due = parseInt(card.dueDate) || 1;
                      
                      let nextClose = new Date(cy, cm, closing);
                      if (cd >= closing) nextClose = new Date(cy, cm + 1, closing);
                      
                      let payDate = new Date(nextClose.getFullYear(), nextClose.getMonth(), due);
                      if (payDate <= nextClose) payDate = new Date(nextClose.getFullYear(), nextClose.getMonth() + 1, due);

                      const closeStr = `${String(nextClose.getDate()).padStart(2, '0')}/${String(nextClose.getMonth() + 1).padStart(2, '0')}`;
                      const dueStr   = `${String(payDate.getDate()).padStart(2, '0')}/${String(payDate.getMonth() + 1).padStart(2, '0')}`;
                      
                      const alertStyles = isExpiring ? 'border: 2px solid #ff5252; box-shadow: 0 0 20px rgba(255,82,82,0.4);' : '';
                      const bestStyles  = isBest ? 'box-shadow:0 0 20px rgba(255,215,0,.4);border:1px solid rgba(255,215,0,.5);' : '';

                      return `
                      <div style="background: var(--surface-color); border-radius: 20px; padding: 1.5rem; position:relative; display: flex; flex-direction: column; gap: 1.5rem; border: 1px solid var(--border-color); ${alertStyles} ${!isExpiring ? bestStyles : ''}">
                        
                        <div style="position:absolute;top:-1px;left:50%;transform:translateX(-50%);display:flex;gap:0.5rem;z-index:10;">
                          ${isBest ? `<div style="background:linear-gradient(90deg, #ffd700, #ffaa00);color:#000;padding:.3rem 1.2rem;border-bottom-left-radius:12px;border-bottom-right-radius:12px;font-size:.65rem;font-weight:900;letter-spacing:1px;box-shadow: 0 4px 15px rgba(255,215,0,0.3);white-space:nowrap;">MELHOR DIA DE COMPRA</div>` : ''}
                          ${isExpiring ? `<div style="background:rgba(255,82,82,0.9);color:#fff;padding:.3rem 1.2rem;border-bottom-left-radius:12px;border-bottom-right-radius:12px;font-size:.65rem;font-weight:900;letter-spacing:1px;box-shadow: 0 4px 15px rgba(255,82,82,0.4);white-space:nowrap;animation: pulse 2s infinite; display:flex; align-items:center;">VENCE ${diff === 0 ? 'HOJE' : `EM ${diff} ${diff === 1 ? 'DIA' : 'DIAS'}`}</div>` : ''}
                        </div>

                        <!-- Realistic Credit Card -->
                        <div class="card-visual ${esc(card.color) || 'blue'}" 
                             style="container-type: inline-size; position: relative; border-radius: clamp(12px, 4cqw, 16px); padding: clamp(1rem, 5cqw, 1.5rem); color: white; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.15); aspect-ratio: 1.586 / 1; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer;"
                             data-action="edit-card" data-id="${esc(card.id)}">
                          
                          <!-- Soft light overlays for realism -->
                          <div style="position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15) 0%, transparent 40%);pointer-events:none;z-index:1;"></div>
                          <div style="position:absolute;bottom:-30%;left:10%;width:100%;height:100%;background:radial-gradient(circle at 30% 70%, rgba(255,255,255,0.08) 0%, transparent 50%);pointer-events:none;z-index:1;"></div>

                          <!-- Top Row -->
                          <div style="display: flex; justify-content: space-between; align-items: flex-start; z-index: 2;">
                            <!-- Chip and Contactless -->
                            <div style="display: flex; align-items: center; gap: 0.8rem; padding-top: 0.2rem;">
                              <div style="width: 38px; height: 28px; background: linear-gradient(135deg, #e6c875 0%, #b89535 100%); border-radius: 4px; position: relative; overflow: hidden; box-shadow: inset 0 1px 2px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.1);">
                                <div style="position:absolute; width:100%; height:1px; background:rgba(0,0,0,0.2); top:35%;"></div>
                                <div style="position:absolute; width:100%; height:1px; background:rgba(0,0,0,0.2); bottom:35%;"></div>
                                <div style="position:absolute; width:1px; height:100%; background:rgba(0,0,0,0.2); left:30%;"></div>
                                <div style="position:absolute; width:1px; height:100%; background:rgba(0,0,0,0.2); right:30%;"></div>
                                <div style="position:absolute; width:14px; height:10px; border:1px solid rgba(0,0,0,0.15); top:50%; left:50%; transform:translate(-50%, -50%); border-radius: 2px;"></div>
                              </div>
                              <i data-lucide="wifi" style="width: 20px; height: 20px; transform: rotate(90deg); opacity: 0.8;"></i>
                            </div>
                            <button class="card-action-icon delete" style="width:32px;height:32px;background:rgba(0,0,0,0.2);color:white;border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(5px);transition:background 0.3s;" data-action="delete-card" data-id="${esc(card.id)}" title="Excluir" onclick="event.stopPropagation()">
                              <i data-lucide="trash-2" style="width:14px;"></i>
                            </button>
                          </div>

                          <!-- Middle Row: Numbers & Dates -->
                          <div style="z-index: 2; margin-top: auto; padding-bottom: clamp(0.2rem, 1.5cqw, 0.5rem); padding-top: clamp(0.5rem, 3cqw, 1.5rem);">
                            <div style="font-size: clamp(1rem, 6.5cqw, 1.4rem); white-space: nowrap; overflow: hidden; font-family: 'Courier New', monospace; font-weight: 600; letter-spacing: clamp(1px, 0.5cqw, 2px); text-shadow: 0 2px 4px rgba(0,0,0,0.2); margin-bottom: clamp(0.3rem, 1.5cqw, 0.5rem);">
                              •••• •••• •••• ${esc(card.lastDigits) || '0000'}
                            </div>
                            <div style="display: flex; gap: clamp(0.5rem, 3cqw, 1.5rem); font-size: clamp(0.7rem, 4cqw, 0.9rem); white-space: nowrap; opacity: 0.85; font-family: 'Courier New', monospace; letter-spacing: 1px;">
                              <div style="display:flex;gap:0.4rem;align-items:center;">
                                <span style="font-size:0.8em;opacity:0.8;">FECH</span>
                                <span style="font-weight: 900;">${esc(card.closingDate) ? closeStr : '--/--'}</span>
                              </div>
                              <div style="display:flex;gap:0.4rem;align-items:center;">
                                <span style="font-size:0.8em;opacity:0.8;">VENC</span>
                                <span style="font-weight: 900;">${esc(card.dueDate) ? dueStr : '--/--'}</span>
                              </div>
                            </div>
                          </div>

                          <!-- Bottom Row: Name & Logo -->
                          <div style="display: flex; justify-content: space-between; align-items: flex-end; z-index: 2; margin-top: clamp(0.5rem, 3cqw, 1rem);">
                            <div style="font-weight: 500; font-size: clamp(0.8rem, 4cqw, 1rem); letter-spacing: 0.5px; text-shadow: 0 1px 3px rgba(0,0,0,0.3); max-width: 75%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: uppercase;">
                              ${esc(card.name)}
                            </div>
                            <div style="font-weight: 800; font-size: clamp(1rem, 5cqw, 1.3rem); font-style: italic; letter-spacing: 1px; opacity: 0.9; text-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                              VISA
                            </div>
                          </div>
                        </div>

                        <!-- Financial Info -->
                        <div>
                          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:.5rem;">
                            <div>
                              <div style="font-size:.65rem;color:var(--text-muted);font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Saldo Devedor</div>
                              <div style="font-size:1.3rem;font-weight:800;letter-spacing:-0.5px;color:var(--text-main);">R$ ${formatBRL(card.used)}</div>
                            </div>
                            <div style="text-align:right;">
                              <div style="font-size:.65rem;color:var(--text-muted);font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">Limite Disponível</div>
                              <div style="font-size:1rem;font-weight:700;color:var(--text-main);">R$ ${formatBRL(card.limit - card.used)}</div>
                            </div>
                          </div>
                          <div style="height:8px;background:var(--surface-light);border-radius:4px;overflow:hidden;">
                            <div style="width:${progress}%;height:100%;background:var(--primary-gradient);border-radius:4px;transition: width 0.6s ease;"></div>
                          </div>

                          <!-- Actions -->
                          <div style="display:flex;justify-content:flex-end;align-items:center;margin-top:1.5rem;gap:1rem;">
                            <button class="btn btn-primary" style="padding:.6rem 1.5rem; font-size:.8rem; border-radius:8px; font-weight:700; background:var(--primary-gradient); color:white; border:none; box-shadow:0 4px 15px rgba(0,229,255,0.2);"
                                    data-action="pay-card" data-id="${esc(card.id)}">
                              <i data-lucide="check-circle" style="width:16px;margin-right:6px;"></i> Pagar Fatura
                            </button>
                          </div>
                        </div>
                      </div>`;
                }).join('')
            }
          </div>
        </div>
      </div>
    `;
  },

  init: () => {
    // Delegação de eventos — sem funções globais em window
    const viewContainer = document.getElementById('cards-view-content');
    if (viewContainer) {
      viewContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const { action, id } = btn.dataset;

        if (action === 'edit-card')   CardsView._openEditModal(id);
        if (action === 'delete-card') {
          window.showConfirm(`Excluir o cartão? Esta ação é irreversível.`, () => store.deleteCard(id));
        }
        if (action === 'pay-card')    CardsView._payCard(id);
      });
    }

    const modal    = document.getElementById('card-modal');
    const form     = document.getElementById('card-form');
    const btnAdd   = document.getElementById('add-card-header-btn');
    const btnClose = document.getElementById('btn-close-card-modal');
    const btnSubmit = document.getElementById('btn-submit-card');

    const colorInput   = document.getElementById('card-color');
    const colorOptions = document.querySelectorAll('#color-picker .color-option');

    const setColor = (color) => {
      colorInput.value = color || 'blue';
      colorOptions.forEach(o => o.classList.toggle('active', o.dataset.color === (color || 'blue')));
    };
    colorOptions.forEach(o => o.addEventListener('click', () => setColor(o.dataset.color)));

    btnAdd.onclick = () => {
      form.reset();
      document.getElementById('card-id').value = '';
      document.getElementById('card-modal-title').innerText = 'Novo Cartão';
      btnSubmit.innerText = 'Salvar Cartão';
      setColor('blue');
      modal.classList.add('active');
    };

    btnClose.onclick = () => modal.classList.remove('active');

    form.onsubmit = (e) => {
      e.preventDefault();
      const id   = document.getElementById('card-id').value;
      const data = {
        name:        document.getElementById('card-name').value,
        lastDigits:  document.getElementById('card-digits').value,
        closingDate: document.getElementById('card-closing').value,
        dueDate:     document.getElementById('card-due').value,
        limit:       parseCurrency(document.getElementById('card-limit').value),
        used:        parseCurrency(document.getElementById('card-used').value || '0'),
        color:       document.getElementById('card-color').value,
      };
      id ? store.updateCard(id, data) : store.addCard(data);
      modal.classList.remove('active');
    };
  },

  _openEditModal(id) {
    const card = store.state.cards.find(c => c.id === id);
    if (!card) return;
    const modal = document.getElementById('card-modal');
    document.getElementById('card-id').value       = card.id;
    document.getElementById('card-name').value     = card.name;
    document.getElementById('card-digits').value   = card.lastDigits;
    document.getElementById('card-closing').value  = card.closingDate || '';
    document.getElementById('card-due').value      = card.dueDate;
    document.getElementById('card-limit').value    = formatCurrency(card.limit);
    document.getElementById('card-used').value     = formatCurrency(card.used);
    document.getElementById('card-modal-title').innerText = 'Editar Cartão';
    document.getElementById('btn-submit-card').innerText  = 'Atualizar Cartão';
    const colorInput   = document.getElementById('card-color');
    const colorOptions = document.querySelectorAll('#color-picker .color-option');
    colorInput.value = card.color || 'blue';
    colorOptions.forEach(o => o.classList.toggle('active', o.dataset.color === (card.color || 'blue')));
    modal.classList.add('active');
  },

  _payCard(id) {
    const card = store.state.cards.find(c => c.id === id);
    if (!card) return;
    if (card.used <= 0) { window.showToast('Este cartão não tem saldo devedor.', 'error'); return; }
    window.showConfirm(
      `Pagar fatura de R$ ${formatBRL(card.used)} do cartão ${card.name}?\nIsso registrará uma despesa e resetará o saldo devedor.`,
      () => {
        store.addTransaction({
          description: `Pagamento Fatura: ${card.name}`,
          amount: card.used, type: 'expense',
          category: 'Cartão de Crédito',
          date: getLocalTodayStr(), cardId: null,
        });
        store.updateCard(id, { used: 0 });
      }
    );
  }
};
