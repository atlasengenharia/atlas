import { store } from '../store/store.js';
import { formatLocalDate } from '../utils/date.js';

export const DashboardView = {
  render: () => {
    const stats = store.getDynamicStats();
    const alerts = store.getAlerts();
    const { transactions } = store.state;
    
    const formatPct = (pct) => {
      const sign = pct > 0 ? '+' : '';
      return `${sign}${pct.toFixed(1)}%`;
    };
    
    const pctColor = (pct, invertGoodBad = false) => {
      if (pct === 0) return 'var(--text-muted)';
      const isGood = invertGoodBad ? pct < 0 : pct > 0;
      return isGood ? '#00e676' : '#ff3d00';
    };

    const balanceColor = stats.balance >= 0 ? '#00e676' : '#ff3d00';

    return `
      <div class="fade-in">
        ${alerts.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem;">
            ${alerts.map(alert => `
              <div class="glass" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-left: 4px solid ${alert.type === 'danger' ? '#ff3d00' : 'var(--accent-color)'}; cursor: pointer; transition: var(--transition);" 
                   onclick="window.app.navigateTo('${alert.view}')"
                   onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background=''">
                <div style="display: flex; align-items: center; gap: 1.25rem;">
                  <i data-lucide="${alert.type === 'danger' ? 'alert-octagon' : 'alert-triangle'}" 
                     style="color: ${alert.type === 'danger' ? '#ff3d00' : 'var(--accent-color)'}; width: 20px;"></i>
                  <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                    <span style="font-size: 0.95rem; color: var(--text-main); line-height: 1.2;">${alert.text}</span>
                  </div>
                </div>
                <div class="btn" style="padding: 0.5rem 1rem; font-size: 0.75rem; background: var(--surface-light); border: 1px solid var(--border-color); color: var(--text-main); display: flex; align-items: center; gap: 0.5rem; border-radius: 8px;">
                  Ir para ${alert.view === 'cards' ? 'Cartões' : 'Empréstimos'}
                  <i data-lucide="chevron-right" style="width: 14px;"></i>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="stats-grid">
          <div class="glass stat-card" style="border-top: 4px solid var(--primary-color);">
            <span class="stat-label">Saldo Total</span>
            <span class="stat-value" style="color: ${balanceColor}">R$ ${stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <div style="color: ${pctColor(stats.balancePct)}; font-size: 0.8rem; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.2rem;">
              <i data-lucide="${stats.balancePct >= 0 ? 'trending-up' : 'trending-down'}" style="width: 14px; height: 14px;"></i>
              ${formatPct(stats.balancePct)} no mês
            </div>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid #00e676;">
            <span class="stat-label">Receitas (Mês)</span>
            <span class="stat-value" style="color: #00e676;">R$ ${stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <div style="color: ${pctColor(stats.incomePct)}; font-size: 0.8rem; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.2rem;">
              <i data-lucide="${stats.incomePct >= 0 ? 'trending-up' : 'trending-down'}" style="width: 14px; height: 14px;"></i>
              ${formatPct(stats.incomePct)} no mês
            </div>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid #ff3d00;">
            <span class="stat-label">Despesas (Mês)</span>
            <span class="stat-value" style="color: #ff3d00;">R$ ${stats.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <div style="color: ${pctColor(stats.expensesPct, true)}; font-size: 0.8rem; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.2rem;">
              <i data-lucide="${stats.expensesPct >= 0 ? 'trending-up' : 'trending-down'}" style="width: 14px; height: 14px;"></i>
              ${formatPct(stats.expensesPct)} no mês
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Dual Column Finance Overview Card -->
          <div class="glass finance-card">
            <div class="finance-header">
              <h3>Resumo Financeiro</h3>
              <div class="finance-controls">
                <select id="financePeriodSelect" class="finance-select">
                  <option value="30">Último mês</option>
                  <option value="7">Última semana</option>
                  <option value="365">Último ano</option>
                </select>
              </div>
            </div>

            <div class="finance-tabs">
              <button class="finance-tab active" data-tab="tab-expense">Despesas</button>
              <button class="finance-tab" data-tab="tab-income">Receitas</button>
              <button class="finance-tab" data-tab="tab-card">Cartões</button>
              <button class="finance-tab" data-tab="tab-total">Gasto Total</button>
            </div>

            <div class="finance-columns">
              <!-- Column 1: Despesas -->
              <div class="finance-column active" id="tab-expense">
                <div class="tab-layout">
                  <div class="tab-metrics-side">
                    <div class="metric-tile">
                      <span class="metric-label">Gasto Diário</span>
                      <div class="metric-value" id="daily-expense">0,00 <span>R$</span></div>
                    </div>
                    <div class="metric-tile">
                      <span class="metric-label">Gasto Semanal</span>
                      <div class="metric-value" id="weekly-expense">0,00 <span>R$</span></div>
                    </div>
                    <div class="metric-tile">
                      <span class="metric-label">Gasto Mensal</span>
                      <div class="metric-value" id="monthly-expense">0,00 <span>R$</span></div>
                    </div>
                  </div>

                  <div class="tab-chart-side">
                    <div class="chart-section">
                      <div class="bar-wrapper">
                        <canvas id="expenseBarChart"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Column 2: Receitas -->
              <div class="finance-column" id="tab-income">
                <div class="tab-layout">
                  <div class="tab-metrics-side">
                    <div class="metric-tile">
                      <span class="metric-label">Entrada Diária</span>
                      <div class="metric-value" id="daily-income">0,00 <span>R$</span></div>
                    </div>
                    <div class="metric-tile">
                      <span class="metric-label">Entrada Semanal</span>
                      <div class="metric-value" id="weekly-income">0,00 <span>R$</span></div>
                    </div>
                    <div class="metric-tile">
                      <span class="metric-label">Entrada Mensal</span>
                      <div class="metric-value" id="monthly-income">0,00 <span>R$</span></div>
                    </div>
                  </div>

                  <div class="tab-chart-side">
                    <div class="chart-section">
                      <div class="bar-wrapper">
                        <canvas id="incomeBarChart"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Column 3: Cartões -->
              <div class="finance-column" id="tab-card">
                <div class="tab-layout">
                  <div class="tab-metrics-side">
                    <div class="metric-tile">
                      <span class="metric-label">Uso Diário</span>
                      <div class="metric-value" id="daily-card">0,00 <span>R$</span></div>
                    </div>
                    <div class="metric-tile">
                      <span class="metric-label">Uso Semanal</span>
                      <div class="metric-value" id="weekly-card">0,00 <span>R$</span></div>
                    </div>
                    <div class="metric-tile">
                      <span class="metric-label">Uso Mensal</span>
                      <div class="metric-value" id="monthly-card">0,00 <span>R$</span></div>
                    </div>
                  </div>

                  <div class="tab-chart-side">
                    <div class="chart-section">
                      <div class="bar-wrapper">
                        <canvas id="cardBarChart"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Column 4: Gasto Total -->
              <div class="finance-column" id="tab-total">
                <div class="tab-layout">
                  <div class="tab-metrics-side">
                    <div class="metric-tile">
                      <span class="metric-label">Total Diário</span>
                      <div class="metric-value" id="daily-total">0,00 <span>R$</span></div>
                    </div>
                    <div class="metric-tile">
                      <span class="metric-label">Total Semanal</span>
                      <div class="metric-value" id="weekly-total">0,00 <span>R$</span></div>
                    </div>
                    <div class="metric-tile">
                      <span class="metric-label">Total Mensal</span>
                      <div class="metric-value" id="monthly-total">0,00 <span>R$</span></div>
                    </div>
                  </div>

                  <div class="tab-chart-side">
                    <div class="chart-section">
                      <div class="bar-wrapper">
                        <canvas id="totalBarChart"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Transactions -->
          <div class="glass" style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3 style="margin: 0;">Transações Recentes</h3>
              <button class="finance-btn" onclick="window.app.navigateTo('transactions')" title="Ver todas as transações" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; padding: 0;">
                <i data-lucide="arrow-right" style="width: 16px;"></i>
              </button>
            </div>
            <div class="recent-list">
              ${transactions.length === 0 ? '<p style="text-align: center; color: var(--text-muted); padding: 1rem;">Nenhuma transação.</p>' : transactions.slice(-6).reverse().map(t => `
                <div class="recent-item">
                  <div class="recent-info">
                    <div class="recent-icon">
                      <i data-lucide="${t.type === 'income' ? 'arrow-down-left' : 'arrow-up-right'}" style="width: 16px; color: ${t.type === 'income' ? '#00e676' : '#ff3d00'}"></i>
                    </div>
                    <div class="recent-details">
                      <div class="recent-name">${t.description}</div>
                      <div class="recent-cat">${t.category}</div>
                    </div>
                  </div>
                  <div class="recent-amount" style="color: ${t.type === 'income' ? '#00e676' : 'var(--text-main)'}">
                    ${t.type === 'income' ? '+' : '-'} R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="glass" style="padding: 1.5rem; margin-top: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3>Fluxo de Caixa</h3>
            <select id="chartPeriodSelect" class="input-field" style="width: auto; padding: 0.4rem 1rem;">
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
            </select>
          </div>
          <div class="chart-container">
            <canvas id="cashflowChart"></canvas>
          </div>
        </div>
      </div>
    `;
  },

  init: () => {
    lucide.createIcons();
    
    // --- Summary Metrics Logic ---
    const updateMetrics = () => {
      const now = new Date();
      // Usar componentes locais para evitar bug de fuso UTC (Brasil UTC-3):
      // toISOString() retornaria amanhã após as 21h — comparações diárias falhariam.
      const pad = (n) => String(n).padStart(2, '0');
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const todayDay = now.getDate();

      // Normalizar lastWeek para meia-noite local evita excluir transações por diferença de horário
      const lastWeek = new Date(now); lastWeek.setDate(now.getDate() - 7); lastWeek.setHours(0, 0, 0, 0);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1); // já é meia-noite local ✓

      // Helper: parseia 'YYYY-MM-DD' como data LOCAL (sem sufixo, Date() interpreta como UTC)
      const parseLocal = (dateStr) => dateStr ? new Date(dateStr + 'T00:00:00') : new Date(0);

      const txs = store.state.transactions;
      const expenses = txs.filter(t => t.type === 'expense');
      const income   = txs.filter(t => t.type === 'income');
      const cards    = txs.filter(t => t.type === 'expense' && t.cardId);

      const getLoansTotal = (days) => {
        const activeLoans = store.state.loans.filter(l => (parseInt(l.paidInstallments) || 0) < (parseInt(l.totalInstallments) || 1));
        if (days >= 30) return activeLoans.reduce((s, l) => s + Number(l.installmentValue), 0);
        return activeLoans.filter(l => {
          const due = parseInt(l.dueDate);
          if (days === 1) return due === todayDay;
          const start = todayDay - 7;
          return (due <= todayDay && due > start) || (start < 0 && due > (30 + start));
        }).reduce((s, l) => s + Number(l.installmentValue), 0);
      };

      // Todos os filtros usam parseLocal para consistência entre tabs
      const calc = (list, includeLoans = 0) => ({
        daily:   list.filter(t => t.date === todayStr).reduce((s, t) => s + Number(t.amount), 0) + (includeLoans ? getLoansTotal(1) : 0),
        weekly:  list.filter(t => parseLocal(t.date) >= lastWeek).reduce((s, t) => s + Number(t.amount), 0) + (includeLoans ? getLoansTotal(7) : 0),
        monthly: list.filter(t => parseLocal(t.date) >= thisMonth).reduce((s, t) => s + Number(t.amount), 0) + (includeLoans ? getLoansTotal(30) : 0)
      });

      const expStats = calc(expenses);
      const incStats = calc(income);

      // Cartões: diário/semanal via transações com cardId; mensal via card.used (= página Cartões)
      const cardStats = {
        daily:   cards.filter(t => t.date === todayStr).reduce((s, t) => s + Number(t.amount), 0),
        weekly:  cards.filter(t => parseLocal(t.date) >= lastWeek).reduce((s, t) => s + Number(t.amount), 0),
        monthly: store.state.cards.reduce((s, c) => s + (parseFloat(c.used) || 0), 0)
      };

      const totalStats = calc(expenses, true);

      // Render
      const set = (prefix, stats) => {
        document.getElementById(`daily-${prefix}`).innerHTML   = `${stats.daily.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span>R$</span>`;
        document.getElementById(`weekly-${prefix}`).innerHTML  = `${stats.weekly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span>R$</span>`;
        document.getElementById(`monthly-${prefix}`).innerHTML = `${stats.monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span>R$</span>`;
      };

      set('expense', expStats); set('income', incStats); set('card', cardStats); set('total', totalStats);
    };

    updateMetrics();

    // --- Donut Charts Logic ---
    const CATEGORY_COLORS = {
      'Alimentação': '#ff8a65', 'Moradia': '#7986cb', 'Transporte': '#4fc3f7',
      'Saúde': '#81c784', 'Educação': '#ffd54f', 'Lazer': '#f06292',
      'Vestuário': '#e57373', 'Assinaturas': '#9575cd', 'Outros': '#90a4ae',
      'Salário': '#00e676', 'Freelance': '#00bfa5', 'Investimentos': '#00e5ff',
      'Presente': '#1de9b6', 'Reembolso': '#64ffda', 'Empréstimos': '#7c4dff'
    };
    
    const CARD_COLORS = ['#4fc3f7', '#7986cb', '#ff8a65', '#81c784', '#ffd54f', '#f06292'];

    const renderBarChart = (type, canvasId, days, mode = 'category') => {
      // Fix #1: destruir instância anterior neste canvas para evitar erro "Canvas already in use"
      const existingChart = Chart.getChart(canvasId);
      if (existingChart) existingChart.destroy();
      // Normalizar startDate para meia-noite local e parsear t.date como local (não UTC)
      const startDate = new Date(); startDate.setDate(startDate.getDate() - days); startDate.setHours(0, 0, 0, 0);
      let txs = store.state.transactions.filter(t => t.type === (type === 'total' ? 'expense' : type) && new Date(t.date + 'T00:00:00') >= startDate);
      
      const totalsCount = {};
      const totalsAmount = {};
      
      txs.forEach(t => {
        let label = t.category;
        if (mode === 'card') {
          if (!t.cardId) return;
          const card = store.state.cards.find(c => c.id === t.cardId);
          if (!card) return; // Fix #2: ignorar transações órfãs de cartões deletados
          label = card.name;
        }
        totalsCount[label] = (totalsCount[label] || 0) + 1;
        totalsAmount[label] = (totalsAmount[label] || 0) + Number(t.amount);
      });

      if (type === 'total') {
        // Fix #3: escalar parcelas de empréstimos proporcionalmente ao período selecionado
        // 30 dias = 1 mês completo | 7 dias ≈ ¼ mês | 365 dias ≈ 12 meses
        const activeLoans = store.state.loans
          .filter(l => (parseInt(l.paidInstallments) || 0) < (parseInt(l.totalInstallments) || 1));
        const monthlyLoansTotal = activeLoans.reduce((s, l) => s + Number(l.installmentValue), 0);
        const loanScaled = monthlyLoansTotal * (days / 30);
        if (loanScaled > 0) {
          totalsAmount['Empréstimos'] = (totalsAmount['Empréstimos'] || 0) + loanScaled;
          totalsCount['Empréstimos'] = (totalsCount['Empréstimos'] || 0) + activeLoans.length;
        }
      }

      const labels = Object.keys(totalsCount);
      const data = Object.values(totalsCount);

      // Custom plugin for dashed line to Y-axis on hover
      const hoverLinePlugin = {
        id: 'hoverLine',
        afterDraw: chart => {
          if (chart.tooltip?._active?.length) {
            let x = chart.tooltip._active[0].element.x;
            let y = chart.tooltip._active[0].element.y;
            let yAxis = chart.scales.y;
            let ctx = chart.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(yAxis.right, y);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.restore();
          }
        }
      };

      // Plugin to show "No Data" message
      const noDataPlugin = {
        id: 'noData',
        afterDraw: (chart) => {
          if (chart.data.datasets[0].data.length === 0) {
            const ctx = chart.ctx;
            const width = chart.width;
            const height = chart.height;
            chart.clear();
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '14px Outfit, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText('Nenhum dado no período', width / 2, height / 2);
            ctx.restore();
          }
        }
      };

      const ctx = document.getElementById(canvasId).getContext('2d');
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: function(context) {
              const chart = context.chart;
              const {ctx, chartArea} = chart;
              if (!chartArea) return 'rgba(0,0,0,0)';
              const idx = context.dataIndex;
              const l = chart.data.labels[idx];
              if (!l) return 'rgba(0,0,0,0)';
              const color = mode === 'card' ? CARD_COLORS[idx % CARD_COLORS.length] : (CATEGORY_COLORS[l] || (type === 'income' ? '#00e676' : '#90a4ae'));
              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, color);
              gradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
              return gradient;
            },
            borderWidth: 0,
            borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }]
        },
        options: {
          responsive: true, 
          maintainAspectRatio: false,
          interaction: {
             mode: 'index',
             intersect: false,
          },
          plugins: { 
             legend: { display: false },
             tooltip: {
                backgroundColor: 'rgba(20, 25, 40, 0.95)',
                titleFont: { size: 12, family: 'Outfit' },
                bodyFont: { size: 14, family: 'Outfit', weight: 'bold' },
                padding: { left: 14, right: 14, top: 8, bottom: 8 },
                cornerRadius: 12,
                displayColors: false,
                callbacks: {
                   title: function(context) {
                      return context[0].label;
                   },
                   label: function(context) {
                      const lbl = context.chart.data.labels[context.dataIndex];
                      const amount = totalsAmount[lbl] || 0;
                      return `Qtd: ${context.parsed.y} | R$ ${amount.toLocaleString('pt-BR')}`;
                   }
                }
             }
          },
          scales: {
             x: { 
                 grid: { display: false, drawBorder: false },
                 ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted'), font: { family: 'Outfit', size: 11 } }
             },
             y: { 
                 position: 'right',
                 grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                 ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted'), font: { family: 'Outfit', size: 11 }, padding: 10, stepSize: 1 },
                 beginAtZero: true 
             }
          }
        },
        plugins: [hoverLinePlugin, noDataPlugin]
      });

      return chart;
    };

    // Gráfico de Cartões: lê card.used diretamente (mesma fonte que a página Cartões)
    // Isso garante que saldos definidos manualmente também aparecem no gráfico
    const renderCardChart = (canvasId) => {
      const existingChart = Chart.getChart(canvasId);
      if (existingChart) existingChart.destroy();

      const cards = store.state.cards;

      const noDataPlugin = {
        id: 'noData',
        afterDraw: (chart) => {
          if (!chart.data.datasets[0].data.length || chart.data.datasets[0].data.every(v => v === 0)) {
            const { ctx, width, height } = chart;
            chart.clear();
            ctx.save();
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.font = '14px Outfit, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText('Nenhum cartão com saldo devedor', width / 2, height / 2);
            ctx.restore();
          }
        }
      };

      const ctx = document.getElementById(canvasId).getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: cards.map(c => c.name),
          datasets: [{
            data: cards.map(c => parseFloat(c.used) || 0),
            backgroundColor: function(context) {
              const { ctx: c2d, chartArea } = context.chart;
              if (!chartArea) return 'rgba(0,0,0,0)';
              const color = CARD_COLORS[context.dataIndex % CARD_COLORS.length];
              const g = c2d.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0.05)');
              return g;
            },
            borderWidth: 0,
            borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
            barPercentage: 0.6, categoryPercentage: 0.8
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(20, 25, 40, 0.95)',
              titleFont: { size: 12, family: 'Outfit' },
              bodyFont: { size: 14, family: 'Outfit', weight: 'bold' },
              padding: { left: 14, right: 14, top: 8, bottom: 8 },
              cornerRadius: 12, displayColors: false,
              callbacks: {
                title: (ctx) => ctx[0].label,
                label: (ctx) => {
                  const card = cards[ctx.dataIndex];
                  const used = parseFloat(card.used) || 0;
                  const limit = parseFloat(card.limit) || 0;
                  const pct = limit > 0 ? ((used / limit) * 100).toFixed(1) : '0.0';
                  return `Saldo: R$ ${used.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${pct}% do limite)`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false, drawBorder: false },
              ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted'), font: { family: 'Outfit', size: 11 } }
            },
            y: {
              position: 'right',
              grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
              ticks: {
                color: getComputedStyle(document.body).getPropertyValue('--text-muted'),
                font: { family: 'Outfit', size: 11 }, padding: 10,
                callback: (v) => `R$ ${v.toLocaleString('pt-BR')}`
              },
              beginAtZero: true
            }
          }
        },
        plugins: [noDataPlugin]
      });
    };

    // Fix #1: controle de instâncias delegado ao Chart.getChart dentro de renderBarChart/renderCardChart
    const renderActiveChart = (days) => {
      const activeTab = document.querySelector('.finance-column.active')?.id || 'tab-expense';
      if (activeTab === 'tab-expense') renderBarChart('expense', 'expenseBarChart', days);
      else if (activeTab === 'tab-income') renderBarChart('income', 'incomeBarChart', days);
      else if (activeTab === 'tab-card') renderCardChart('cardBarChart');
      else if (activeTab === 'tab-total') renderBarChart('total', 'totalBarChart', days);
    };

    renderActiveChart(30);

    const financeSelect = document.getElementById('financePeriodSelect');
    if (financeSelect) financeSelect.addEventListener('change', e => renderActiveChart(parseInt(e.target.value)));

    // --- Cashflow Chart ---
    let cashflowInstance = null;
    const renderCashflow = (days) => {
      const today = new Date();
      const labels = [], data = [];
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const dateStr = formatLocalDate(d);
        labels.push(days === 7 ? dayNames[d.getDay()] : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`);
        data.push(store.state.transactions.filter(t => t.date === dateStr).reduce((s, t) => t.type === 'income' ? s + Number(t.amount) : s - Number(t.amount), 0));
      }
      const ctx = document.getElementById('cashflowChart').getContext('2d');
      if (cashflowInstance) cashflowInstance.destroy();
      cashflowInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Fluxo Líquido', data, borderColor: '#00e5ff', backgroundColor: 'rgba(0, 229, 255, 0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color') }, ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted') } },
            x: { grid: { display: false }, ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted') } }
          }
        }
      });
    };
    renderCashflow(7);
    const cfSelect = document.getElementById('chartPeriodSelect');
    if (cfSelect) cfSelect.addEventListener('change', e => renderCashflow(parseInt(e.target.value)));

    // --- Tab Switching Logic ---
    const tabs = document.querySelectorAll('.finance-tab');
    const cols = document.querySelectorAll('.finance-column');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;
        
        // Update tabs
        tabs.forEach(t => t.classList.toggle('active', t === tab));
        
        // Update columns
        cols.forEach(c => {
          const isActive = c.id === targetId;
          c.classList.toggle('active', isActive);
        });

        // Render the chart only for the newly visible tab
        setTimeout(() => {
          const days = parseInt(document.getElementById('financePeriodSelect')?.value) || 30;
          renderActiveChart(days);
        }, 50);
      });
    });
  }
};
