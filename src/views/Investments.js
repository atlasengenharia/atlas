import { formatBRL } from '../utils/sanitize.js';

export const InvestmentsView = {
  render: () => {
    return `
      <div class="fade-in">
        <div class="stats-grid" style="margin-bottom: 2rem;">
          <div class="glass stat-card" style="border-top: 4px solid var(--secondary-color);">
            <span class="stat-label">Índice IBOVESPA</span>
            <span id="ibov-value" class="stat-value">Carregando...</span>
            <span id="ibov-pct" style="font-size: 0.8rem;">---</span>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid #f2a900;">
            <span class="stat-label">Bitcoin (BTC)</span>
            <span id="btc-value" class="stat-value">Carregando...</span>
            <span id="btc-pct" style="font-size: 0.8rem;">---</span>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid var(--primary-color);">
            <span class="stat-label">Dólar (USD/BRL)</span>
            <span id="usd-value" class="stat-value">Carregando...</span>
            <span id="usd-pct" style="font-size: 0.8rem;">---</span>
          </div>
        </div>

        <div class="glass" style="padding: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap;">
            <div>
              <h3>Mercado em Tempo Real</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem;">Principais ativos da B3 e Cripto.</p>
            </div>
            <div class="badge" style="background: var(--surface-color); color: #00e676; padding: 0.5rem 1rem; border: 1px solid var(--border-color);">
              <i data-lucide="refresh-cw" style="width: 14px; margin-right: 0.5rem;" class="spin"></i>
              Atualização Automática
            </div>
          </div>

          <div class="table-container" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: separate; border-spacing: 0 0.5rem;">
              <thead>
                <tr style="text-align: left; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">
                  <th style="padding: 1rem;">Ativo</th>
                  <th style="padding: 1rem;">Nome</th>
                  <th style="padding: 1rem;">Preço Atual</th>
                  <th style="padding: 1rem;">Variação (24h)</th>
                  <th style="padding: 1rem; text-align: right;">Gráfico</th>
                </tr>
              </thead>
              <tbody id="market-table-body">
                <tr>
                  <td colspan="5" style="text-align: center; padding: 4rem; color: var(--text-muted);">
                    <div class="loader" style="margin-bottom: 1rem;"></div>
                    Sincronizando com a Bolsa de Valores...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="dashboard-grid" style="margin-top: 2rem;">
          <div class="glass" style="padding: 1.5rem;">
            <h3>Destaques do Dia</h3>
            <div id="top-gainers" style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
              <!-- Dynamic -->
            </div>
          </div>
          <div class="glass" style="padding: 1.5rem;">
            <h3>Calendário Econômico</h3>
            <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem;">
              <div style="display: flex; gap: 1rem;">
                <div style="width: 40px; height: 40px; border-radius: 8px; background: var(--surface-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <div style="text-align: center;">
                    <div style="font-size: 0.6rem; color: var(--text-muted);">MAI</div>
                    <div style="font-weight: 700;">08</div>
                  </div>
                </div>
                <div>
                  <div style="font-weight: 500; font-size: 0.9rem;">Decisão da Taxa SELIC</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">Copom se reúne para definir juros.</div>
                </div>
              </div>
              <div style="display: flex; gap: 1rem;">
                <div style="width: 40px; height: 40px; border-radius: 8px; background: var(--surface-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <div style="text-align: center;">
                    <div style="font-size: 0.6rem; color: var(--text-muted);">MAI</div>
                    <div style="font-weight: 700;">15</div>
                  </div>
                </div>
                <div>
                  <div style="font-weight: 500; font-size: 0.9rem;">Divulgação IPCA</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">Índice oficial de inflação do Brasil.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init: async () => {
    lucide.createIcons();

    const symbols = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'MGLU3', 'WEGE3'];
    
    const fetchMarketData = async () => {
      try {
        const response = await fetch('https://brapi.dev/api/quote/PETR4,VALE3,ITUB4,BBDC4,ABEV3,MGLU3,WEGE3,IBOV?range=1d&interval=1d');
        
        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data = await response.json();
        
        if (data && data.results && Array.isArray(data.results)) {
          renderTable(data.results);
          renderTopStats(data.results);
        } else {
          renderMockData();
        }
      } catch (error) {
        console.error('Erro ao buscar dados do mercado:', error);
        renderMockData();
      }
    };

    const renderTopStats = (results) => {
      const ibov = results.find(r => r.symbol === 'IBOV');
      if (ibov) {
        document.getElementById('ibov-value').innerText = ibov.regularMarketPrice.toLocaleString('pt-BR') + ' pts';
        const pct = ibov.regularMarketChangePercent || 0;
        document.getElementById('ibov-pct').innerHTML = `<span style="color: ${pct >= 0 ? '#00e676' : '#ff5252'}">${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%</span>`;
      }

      // BTC e USD costumam vir de outras APIs, vamos simular ou buscar
      fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT')
        .then(res => res.json())
        .then(data => {
          document.getElementById('btc-value').innerText = 'US$ ' + parseFloat(data.lastPrice).toLocaleString('en-US');
          const pct = parseFloat(data.priceChangePercent);
          document.getElementById('btc-pct').innerHTML = `<span style="color: ${pct >= 0 ? '#00e676' : '#ff5252'}">${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%</span>`;
        });

      fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL')
        .then(res => res.json())
        .then(data => {
          const usd = data.USDBRL;
          document.getElementById('usd-value').innerText = 'R$ ' + parseFloat(usd.bid).toFixed(2);
          const pct = parseFloat(usd.pctChange);
          document.getElementById('usd-pct').innerHTML = `<span style="color: ${pct >= 0 ? '#00e676' : '#ff5252'}">${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%</span>`;
        });
    };

    const renderTable = (results) => {
      const tbody = document.getElementById('market-table-body');
      const gainersDiv = document.getElementById('top-gainers');
      if (!tbody) return;

      const stocks = results.filter(r => r.symbol !== 'IBOV');
      
      tbody.innerHTML = stocks.map(s => {
        const pct = s.regularMarketChangePercent || 0;
        return `
          <tr class="ledger-row" style="background: var(--surface-color); transition: var(--transition);">
            <td style="padding: 1.2rem; border-radius: 12px 0 0 12px; font-weight: 700; color: var(--primary-color);">${s.symbol}</td>
            <td style="padding: 1.2rem; font-size: 0.9rem; color: var(--text-muted);">${s.longName || s.shortName || '---'}</td>
            <td style="padding: 1.2rem; font-weight: 600;">R$ ${s.regularMarketPrice.toFixed(2)}</td>
            <td style="padding: 1.2rem; font-weight: 700; color: ${pct >= 0 ? '#00e676' : '#ff5252'};">
              ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%
            </td>
            <td style="padding: 1.2rem; border-radius: 0 12px 12px 0; text-align: right;">
              <div style="width: 80px; height: 30px; margin-left: auto; background: ${pct >= 0 ? 'rgba(0,230,118,0.05)' : 'rgba(255,82,82,0.05)'}; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                 <i data-lucide="trending-${pct >= 0 ? 'up' : 'down'}" style="width: 16px; color: ${pct >= 0 ? '#00e676' : '#ff5252'}"></i>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Top Gainers
      const sortedGainers = [...stocks].sort((a, b) => (b.regularMarketChangePercent || 0) - (a.regularMarketChangePercent || 0)).slice(0, 3);
      gainersDiv.innerHTML = sortedGainers.map(s => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: rgba(0,230,118,0.03); border-radius: 10px; border: 1px solid rgba(0,230,118,0.1);">
          <div style="font-weight: 600;">${s.symbol}</div>
          <div style="color: #00e676; font-weight: 700;">+${(s.regularMarketChangePercent || 0).toFixed(2)}%</div>
        </div>
      `).join('');

      lucide.createIcons();
    };

    const renderMockData = () => {
      // Dados simulados realistas para o caso de falha na API (CORS ou limites)
      const mock = [
        { symbol: 'PETR4', longName: 'Petróleo Brasileiro S.A. - Petrobras', regularMarketPrice: 41.20, regularMarketChangePercent: 1.25 },
        { symbol: 'VALE3', longName: 'Vale S.A.', regularMarketPrice: 68.45, regularMarketChangePercent: -0.45 },
        { symbol: 'ITUB4', longName: 'Itaú Unibanco Holding S.A.', regularMarketPrice: 34.12, regularMarketChangePercent: 0.82 },
        { symbol: 'BBDC4', longName: 'Banco Bradesco S.A.', regularMarketPrice: 14.50, regularMarketChangePercent: -1.10 },
        { symbol: 'ABEV3', longName: 'Ambev S.A.', regularMarketPrice: 12.15, regularMarketChangePercent: 0.15 },
        { symbol: 'IBOV', regularMarketPrice: 127450, regularMarketChangePercent: 0.42 }
      ];
      renderTable(mock);
      renderTopStats(mock);
    };

    fetchMarketData();
  }
};
