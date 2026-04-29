import { store } from '../store/store.js';
import { formatBRL } from '../utils/sanitize.js';

export const ProjectionsView = {
  render: () => {
    const stats = store.getDynamicStats();
    const monthlyNet = stats.income - stats.expenses;
    const bal        = stats.balance;
    const savingRate = stats.income > 0 ? Math.max(0, Math.min(100, (monthlyNet / stats.income) * 100)) : 0;

    // Projeção de 3 meses
    const bal3m = bal + monthlyNet * 3;

    return `
      <div class="fade-in" style="display:flex;flex-direction:column;gap:1.5rem;">
        <div class="stats-grid" style="margin-bottom:0;">
          <div class="glass stat-card" style="border-top:4px solid #00e676;">
            <span class="stat-label">Saldo em 3 Meses</span>
            <span class="stat-value" style="font-size:1.4rem;color:${bal3m >= 0 ? '#00e676' : '#ff5252'};">R$ ${formatBRL(bal3m)}</span>
            <span style="color:var(--text-muted);font-size:.8rem;">
              ${monthlyNet >= 0 ? '+' : ''}R$ ${formatBRL(monthlyNet * 3)} acumulado
            </span>
          </div>
          <div class="glass stat-card" style="border-top:4px solid var(--primary-color);">
            <span class="stat-label">Capacidade de Poupança</span>
            <span class="stat-value">${savingRate.toFixed(0)}%</span>
            <span style="color:var(--text-muted);font-size:.8rem;">Da renda mensal</span>
          </div>
          <div class="glass stat-card" style="border-top:4px solid var(--secondary-color);">
            <span class="stat-label">Saldo Líquido Mensal</span>
            <span class="stat-value" style="font-size:1.4rem;color:${monthlyNet >= 0 ? '#00e676' : '#ff5252'};">
              ${monthlyNet >= 0 ? '+' : ''}R$ ${formatBRL(monthlyNet)}
            </span>
            <span style="color:var(--text-muted);font-size:.8rem;">Renda − Despesas fixas</span>
          </div>
        </div>

        <div class="glass" style="padding:1.5rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
            <div>
              <h3>Projeções Financeiras</h3>
              <p style="color:var(--text-muted);font-size:.9rem;">Baseado na sua renda e despesas atuais — próximos 6 meses.</p>
            </div>
            <div class="glass" style="padding:.5rem 1rem;text-align:center;">
              <div style="font-size:.7rem;color:var(--text-muted);">Cenário</div>
              <div style="font-weight:600;color:${monthlyNet >= 0 ? '#00e676' : '#ff5252'};">
                ${monthlyNet >= 0 ? 'Positivo' : 'Deficitário'}
              </div>
            </div>
          </div>
          <div class="chart-container" style="height:350px;">
            <canvas id="projectionsChart"></canvas>
          </div>
        </div>
      </div>
    `;
  },

  init: () => {
    const stats      = store.getDynamicStats();
    const monthlyNet = stats.income - stats.expenses;
    const bal        = stats.balance;

    const now    = new Date();
    const months = [];
    const data   = [];

    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push(d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
      data.push(parseFloat((bal + monthlyNet * i).toFixed(2)));
    }

    const ctx = document.getElementById('projectionsChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Saldo Projetado',
            data,
            borderColor: '#00e5ff',
            backgroundColor: 'rgba(0,229,255,.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#00e5ff',
            pointRadius: 5,
          },
          {
            label: 'Ponto de Equilíbrio',
            data: months.map(() => 0),
            borderColor: 'rgba(255,255,255,.15)',
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, labels: { color: '#94a3b8', font: { family: 'Outfit' } } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` R$ ${ctx.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255,255,255,.05)' },
            ticks: { color: '#94a3b8', callback: (v) => 'R$ ' + v.toLocaleString('pt-BR') }
          },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }
};
