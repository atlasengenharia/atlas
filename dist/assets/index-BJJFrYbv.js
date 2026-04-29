(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`finlux_profiles`,t=`finlux_active`,n=e=>`finlux_data_${e}`,r=()=>({cards:[],transactions:[],loans:[],incomeSources:[],customCategories:[],settings:{defaultView:`dashboard`,theme:`original`,notificationsEnabled:!0},isAuthenticated:!1}),i=new class{constructor(){this.listeners=[],this._migrate(),this._loadProfiles(),this._loadActiveData()}_migrate(){let r=localStorage.getItem(`finlux_state`);if(r&&!localStorage.getItem(e)){let i=`profile_default`;localStorage.setItem(e,JSON.stringify([{id:i,name:`Meu Perfil`,avatar:`😊`,createdAt:new Date().toISOString()}])),localStorage.setItem(t,i),localStorage.setItem(n(i),r),localStorage.removeItem(`finlux_state`)}}_loadProfiles(){if(this.profiles=JSON.parse(localStorage.getItem(e))||[],this.profiles.length===0){let e=`profile_`+Date.now();this.profiles=[{id:e,name:`Meu Perfil`,avatar:`😊`,createdAt:new Date().toISOString()}],this._saveProfiles()}}_saveProfiles(){localStorage.setItem(e,JSON.stringify(this.profiles))}get activeProfile(){return this.profiles.find(e=>e.id===this.activeProfileId)||this.profiles[0]}createProfile(e,t=`😊`){let i={id:`profile_`+Date.now(),name:e,avatar:t,createdAt:new Date().toISOString()};return this.profiles.push(i),this._saveProfiles(),localStorage.setItem(n(i.id),JSON.stringify(r())),i}switchProfile(e){if(!this.profiles.find(t=>t.id===e))return;let n=this.state.isAuthenticated;localStorage.setItem(t,e),this._loadActiveData(),this.state.isAuthenticated=n,this.listeners.forEach(e=>e(this.state))}updateProfile(e,t){let n=this.profiles.findIndex(t=>t.id===e);n!==-1&&(this.profiles[n]={...this.profiles[n],...t},this._saveProfiles(),this.listeners.forEach(e=>e(this.state)))}deleteProfile(e){return this.profiles.length<=1?!1:(this.profiles=this.profiles.filter(t=>t.id!==e),this._saveProfiles(),localStorage.removeItem(n(e)),this.activeProfileId===e&&this.switchProfile(this.profiles[0].id),!0)}_loadActiveData(){let e=localStorage.getItem(t);(!e||!this.profiles.find(t=>t.id===e))&&(e=this.profiles[0].id,localStorage.setItem(t,e)),this.activeProfileId=e;let i=JSON.parse(localStorage.getItem(n(e))),a=r();this.state=i?{...a,...i}:a,[`cards`,`transactions`,`loans`,`incomeSources`,`customCategories`].forEach(e=>{Array.isArray(this.state[e])||(this.state[e]=[])}),this.state.settings||(this.state.settings=a.settings),this._refreshDerived()}_refreshDerived(){this.state.balance=this._calcBalance(),this.state.monthlyIncome=this._calcMonthlyIncome(),this.state.monthlyExpenses=this._calcMonthlyExpenses()}_calcBalance(){return this.state.transactions.reduce((e,t)=>t.type===`income`?e+Number(t.amount):e-Number(t.amount),0)}_calcMonthlyIncome(){return this.state.incomeSources.reduce((e,t)=>e+(parseFloat(t.amount)||0),0)}_calcMonthlyExpenses(){return this.state.loans.filter(e=>(parseInt(e.paidInstallments)||0)<(parseInt(e.totalInstallments)||1)).reduce((e,t)=>e+(parseFloat(t.installmentValue)||0),0)+this.state.cards.reduce((e,t)=>e+(parseFloat(t.used)||0),0)}notify(){let{balance:e,monthlyIncome:t,monthlyExpenses:r,isAuthenticated:i,...a}=this.state;localStorage.setItem(n(this.activeProfileId),JSON.stringify(a)),this.listeners.forEach(e=>e(this.state))}subscribe(e){this.listeners.push(e)}updateSettings(e){this.state.settings={...this.state.settings,...e},this.notify()}addCategory(e){let t=e.trim();return!t||this.state.customCategories.includes(t)?!1:(this.state.customCategories.push(t),this.notify(),!0)}deleteCategory(e){this.state.customCategories=this.state.customCategories.filter(t=>t!==e),this.notify()}addTransaction(e){if(this.state.transactions.push({...e,id:Date.now().toString()}),e.cardId&&e.type===`expense`){let t=this.state.cards.find(t=>t.id===e.cardId);t&&(t.used=(parseFloat(t.used)||0)+Number(e.amount))}this._refreshDerived(),this.notify()}deleteTransaction(e){let t=this.state.transactions.find(t=>t.id===e);if(t){if(t.cardId&&t.type===`expense`){let e=this.state.cards.find(e=>e.id===t.cardId);e&&(e.used=Math.max(0,(parseFloat(e.used)||0)-Number(t.amount)))}this.state.transactions=this.state.transactions.filter(t=>t.id!==e),this._refreshDerived(),this.notify()}}updateTransaction(e,t){let n=this.state.transactions.findIndex(t=>t.id===e);if(n===-1)return;let r=this.state.transactions[n];if(r.cardId&&r.type===`expense`){let e=this.state.cards.find(e=>e.id===r.cardId);e&&(e.used=Math.max(0,(parseFloat(e.used)||0)-Number(r.amount)))}this.state.transactions[n]={...r,...t};let i=this.state.transactions[n];if(i.cardId&&i.type===`expense`){let e=this.state.cards.find(e=>e.id===i.cardId);e&&(e.used=(parseFloat(e.used)||0)+Number(i.amount))}this._refreshDerived(),this.notify()}addCard(e){this.state.cards.push({...e,id:Date.now().toString(),used:e.used||0,color:e.color||`blue`}),this._refreshDerived(),this.notify()}updateCard(e,t){let n=this.state.cards.findIndex(t=>t.id===e);n!==-1&&(this.state.cards[n]={...this.state.cards[n],...t},this._refreshDerived(),this.notify())}deleteCard(e){this.state.cards=this.state.cards.filter(t=>t.id!==e),this._refreshDerived(),this.notify()}addIncomeSource(e){this.state.incomeSources.push({...e,id:Date.now().toString()}),this._refreshDerived(),this.notify()}updateIncomeSource(e,t){let n=this.state.incomeSources.findIndex(t=>t.id===e);n!==-1&&(this.state.incomeSources[n]={...this.state.incomeSources[n],...t},this._refreshDerived(),this.notify())}deleteIncomeSource(e){this.state.incomeSources=this.state.incomeSources.filter(t=>t.id!==e),this._refreshDerived(),this.notify()}addLoan(e){this.state.loans.push({...e,id:Date.now().toString()}),this._refreshDerived(),this.notify()}updateLoan(e,t){let n=this.state.loans.findIndex(t=>t.id===e);n!==-1&&(this.state.loans[n]={...this.state.loans[n],...t},this._refreshDerived(),this.notify())}deleteLoan(e){this.state.loans=this.state.loans.filter(t=>t.id!==e),this._refreshDerived(),this.notify()}exportJSON(){let{balance:e,monthlyIncome:t,monthlyExpenses:n,...r}=this.state;return JSON.stringify({profile:this.activeProfile,exportedAt:new Date().toISOString(),version:`2.0`,data:r},null,2)}exportCSV(){let{transactions:e,cards:t}=this.state;return[`Data;Descrição;Categoria;Tipo;Cartão;Valor (R$)`,...[...e].sort((e,t)=>new Date(t.date)-new Date(e.date)).map(e=>{let n=t.find(t=>t.id===e.cardId),r=(e.description||``).replace(/"/g,`""`),i=(e.category||``).replace(/"/g,`""`);return[e.date||``,`"${r}"`,`"${i}"`,e.type===`income`?`Receita`:`Despesa`,n?`${n.name} (****${n.lastDigits})`:`Dinheiro/Saldo`,(e.amount||0).toFixed(2)].join(`;`)})].join(`
`)}importJSON(e){try{let t=JSON.parse(e),n=t.data||t,i=r();return this.state={...i,cards:Array.isArray(n.cards)?n.cards:[],transactions:Array.isArray(n.transactions)?n.transactions:[],loans:Array.isArray(n.loans)?n.loans:[],incomeSources:Array.isArray(n.incomeSources)?n.incomeSources:[],settings:n.settings||i.settings},this._refreshDerived(),this.notify(),!0}catch(e){return console.error(`Importação falhou:`,e),!1}}resetData(){this.state=r(),this._refreshDerived(),this.notify()}getAlerts(){let e=new Date().getDate(),t={cards:{type:`warning`,items:[]},loans:{type:`danger`,items:[]}};this.state.cards.forEach(n=>{let r=parseInt(n.dueDate)-e;r>=0&&r<=5&&t.cards.items.push({name:n.name,diff:r})}),this.state.loans.filter(e=>(parseInt(e.paidInstallments)||0)<(parseInt(e.totalInstallments)||1)).forEach(n=>{let r=parseInt(n.dueDate)-e;r>=0&&r<=5&&t.loans.items.push({name:n.name,diff:r})});let n=[];if(t.cards.items.length>0){let e=t.cards.items,r=e.length===1?`Fatura do <strong>${e[0].name}</strong> vence em <strong>${e[0].diff} dia${e[0].diff===1?``:`s`}</strong>.`:`Você tem <strong>${e.length} faturas</strong> de cartões vencendo em breve.`;n.push({type:`warning`,view:`cards`,text:r,count:e.length})}if(t.loans.items.length>0){let e=t.loans.items,r=e.length===1?`Parcela de <strong>${e[0].name}</strong> vence em <strong>${e[0].diff} dia${e[0].diff===1?``:`s`}</strong>.`:`Você tem <strong>${e.length} parcelas</strong> de empréstimos vencendo em breve.`;n.push({type:`danger`,view:`loans`,text:r,count:e.length})}return n}getDynamicStats(){let e=new Date,t=e.getMonth(),n=e.getFullYear(),r=t===0?11:t-1,i=t===0?n-1:n,a=(e,t,n)=>{if(!e)return!1;let r=new Date(e+`T00:00:00`);return r.getMonth()===t&&r.getFullYear()===n},o=this._calcMonthlyIncome(),s=this.state.transactions.filter(e=>e.type===`income`&&a(e.date,t,n)).reduce((e,t)=>e+Number(t.amount),0),c=this.state.transactions.filter(e=>e.type===`income`&&a(e.date,r,i)).reduce((e,t)=>e+Number(t.amount),0),l=o+s,u=o+c,d=this._calcMonthlyExpenses()+this.state.transactions.filter(e=>e.type===`expense`&&a(e.date,t,n)).reduce((e,t)=>e+Number(t.amount),0),f=this.state.transactions.filter(e=>e.type===`expense`&&a(e.date,r,i)).reduce((e,t)=>e+Number(t.amount),0),p=this.state.balance,m=(e,t)=>t===0?e>0?100:e<0?-100:0:(e-t)/Math.abs(t)*100;return{balance:p,balancePct:m(p,p-l+d),income:l,incomePct:m(l,u),expenses:d,expensesPct:m(d,f)}}login(e,t){return e&&t?(this.state.isAuthenticated=!0,this.notify(),!0):!1}logout(){this.state.isAuthenticated=!1,this.notify()}},a={render:()=>{let e=i.getDynamicStats(),t=i.getAlerts(),{transactions:n}=i.state,r=e=>`${e>0?`+`:``}${e.toFixed(1)}%`,a=(e,t=!1)=>e===0?`var(--text-muted)`:(t?e<0:e>0)?`#00e676`:`#ff3d00`,o=e.balance>=0?`#00e676`:`#ff3d00`;return`
      <div class="fade-in">
        ${t.length>0?`
          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem;">
            ${t.map(e=>`
              <div class="glass" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-left: 4px solid ${e.type===`danger`?`#ff3d00`:`var(--accent-color)`}; cursor: pointer; transition: var(--transition);" 
                   onclick="window.app.navigateTo('${e.view}')"
                   onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background=''">
                <div style="display: flex; align-items: center; gap: 1.25rem;">
                  <i data-lucide="${e.type===`danger`?`alert-octagon`:`alert-triangle`}" 
                     style="color: ${e.type===`danger`?`#ff3d00`:`var(--accent-color)`}; width: 20px;"></i>
                  <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                    <span style="font-size: 0.95rem; color: var(--text-main); line-height: 1.2;">${e.text}</span>
                  </div>
                </div>
                <div class="btn" style="padding: 0.5rem 1rem; font-size: 0.75rem; background: var(--surface-light); border: 1px solid var(--border-color); color: var(--text-main); display: flex; align-items: center; gap: 0.5rem; border-radius: 8px;">
                  Ir para ${e.view===`cards`?`Cartões`:`Empréstimos`}
                  <i data-lucide="chevron-right" style="width: 14px;"></i>
                </div>
              </div>
            `).join(``)}
          </div>
        `:``}

        <div class="stats-grid">
          <div class="glass stat-card" style="border-top: 4px solid var(--primary-color);">
            <span class="stat-label">Saldo Total</span>
            <span class="stat-value" style="color: ${o}">R$ ${e.balance.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}</span>
            <div style="color: ${a(e.balancePct)}; font-size: 0.8rem; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.2rem;">
              <i data-lucide="${e.balancePct>=0?`trending-up`:`trending-down`}" style="width: 14px; height: 14px;"></i>
              ${r(e.balancePct)} no mês
            </div>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid #00e676;">
            <span class="stat-label">Receitas (Mês)</span>
            <span class="stat-value" style="color: #00e676;">R$ ${e.income.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}</span>
            <div style="color: ${a(e.incomePct)}; font-size: 0.8rem; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.2rem;">
              <i data-lucide="${e.incomePct>=0?`trending-up`:`trending-down`}" style="width: 14px; height: 14px;"></i>
              ${r(e.incomePct)} no mês
            </div>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid #ff3d00;">
            <span class="stat-label">Despesas (Mês)</span>
            <span class="stat-value" style="color: #ff3d00;">R$ ${e.expenses.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}</span>
            <div style="color: ${a(e.expensesPct,!0)}; font-size: 0.8rem; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.2rem;">
              <i data-lucide="${e.expensesPct>=0?`trending-up`:`trending-down`}" style="width: 14px; height: 14px;"></i>
              ${r(e.expensesPct)} no mês
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
                <button class="finance-btn" onclick="window.app.navigateTo('transactions')">
                  <i data-lucide="arrow-right"></i>
                </button>
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
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3 style="margin: 0;">Transações Recentes</h3>
            </div>
            <div class="recent-list">
              ${n.length===0?`<p style="text-align: center; color: var(--text-muted); padding: 1rem;">Nenhuma transação.</p>`:n.slice(-6).reverse().map(e=>`
                <div class="recent-item">
                  <div class="recent-info">
                    <div class="recent-icon">
                      <i data-lucide="${e.type===`income`?`arrow-down-left`:`arrow-up-right`}" style="width: 16px; color: ${e.type===`income`?`#00e676`:`#ff3d00`}"></i>
                    </div>
                    <div class="recent-details">
                      <div class="recent-name">${e.description}</div>
                      <div class="recent-cat">${e.category}</div>
                    </div>
                  </div>
                  <div class="recent-amount" style="color: ${e.type===`income`?`#00e676`:`var(--text-main)`}">
                    ${e.type===`income`?`+`:`-`} R$ ${e.amount.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}
                  </div>
                </div>
              `).join(``)}
            </div>
            <button class="btn btn-ghost" style="width: 100%; margin-top: 1rem; font-size: 0.85rem;" onclick="window.app.navigateTo('transactions')">Ver tudo</button>
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
    `},init:()=>{lucide.createIcons(),(()=>{let e=new Date,t=e.toISOString().split(`T`)[0],n=e.getDate(),r=new Date(e);r.setDate(e.getDate()-7);let a=new Date(e.getFullYear(),e.getMonth(),1),o=i.state.transactions,s=o.filter(e=>e.type===`expense`),c=o.filter(e=>e.type===`income`),l=o.filter(e=>e.type===`expense`&&e.cardId),u=e=>{let t=i.state.loans.filter(e=>(parseInt(e.paidInstallments)||0)<(parseInt(e.totalInstallments)||1));return e>=30?t.reduce((e,t)=>e+Number(t.installmentValue),0):t.filter(t=>{let r=parseInt(t.dueDate);if(e===1)return r===n;let i=n-7;return r<=n&&r>i||i<0&&r>30+i}).reduce((e,t)=>e+Number(t.installmentValue),0)},d=(e,n=0)=>({daily:e.filter(e=>e.date===t).reduce((e,t)=>e+Number(t.amount),0)+(n?u(1):0),weekly:e.filter(e=>new Date(e.date)>=r).reduce((e,t)=>e+Number(t.amount),0)+(n?u(7):0),monthly:e.filter(e=>new Date(e.date)>=a).reduce((e,t)=>e+Number(t.amount),0)+(n?u(30):0)}),f=d(s),p=d(c),m=d(l),h=d(s,!0),g=(e,t)=>{document.getElementById(`daily-${e}`).innerHTML=`${t.daily.toLocaleString(`pt-BR`,{minimumFractionDigits:2})} <span>R$</span>`,document.getElementById(`weekly-${e}`).innerHTML=`${t.weekly.toLocaleString(`pt-BR`,{minimumFractionDigits:2})} <span>R$</span>`,document.getElementById(`monthly-${e}`).innerHTML=`${t.monthly.toLocaleString(`pt-BR`,{minimumFractionDigits:2})} <span>R$</span>`};g(`expense`,f),g(`income`,p),g(`card`,m),g(`total`,h)})();let e={Alimentação:`#ff8a65`,Moradia:`#7986cb`,Transporte:`#4fc3f7`,Saúde:`#81c784`,Educação:`#ffd54f`,Lazer:`#f06292`,Vestuário:`#e57373`,Assinaturas:`#9575cd`,Outros:`#90a4ae`,Salário:`#00e676`,Freelance:`#00bfa5`,Investimentos:`#00e5ff`,Presente:`#1de9b6`,Reembolso:`#64ffda`,Empréstimos:`#7c4dff`},t=[`#4fc3f7`,`#7986cb`,`#ff8a65`,`#81c784`,`#ffd54f`,`#f06292`],n={},r=(n,r,a,o=`category`)=>{let s=new Date;s.setDate(s.getDate()-a);let c=i.state.transactions.filter(e=>e.type===(n===`total`?`expense`:n)&&new Date(e.date)>=s),l={},u={};if(c.forEach(e=>{let t=e.category;if(o===`card`){if(!e.cardId)return;let n=i.state.cards.find(t=>t.id===e.cardId);t=n?n.name:`Outros`}l[t]=(l[t]||0)+1,u[t]=(u[t]||0)+Number(e.amount)}),n===`total`){let e=i.state.loans.filter(e=>(parseInt(e.paidInstallments)||0)<(parseInt(e.totalInstallments)||1)).reduce((e,t)=>e+Number(t.installmentValue),0);if(e>0){u.Empréstimos=(u.Empréstimos||0)+e;let t=i.state.loans.filter(e=>(parseInt(e.paidInstallments)||0)<(parseInt(e.totalInstallments)||1)).length;l.Empréstimos=(l.Empréstimos||0)+t}}let d=Object.keys(l),f=Object.values(l),p={id:`hoverLine`,afterDraw:e=>{if(e.tooltip?._active?.length){let t=e.tooltip._active[0].element.x,n=e.tooltip._active[0].element.y,r=e.scales.y,i=e.ctx;i.save(),i.beginPath(),i.moveTo(t,n),i.lineTo(r.right,n),i.lineWidth=1,i.strokeStyle=`rgba(255, 255, 255, 0.4)`,i.setLineDash([4,4]),i.stroke(),i.restore()}}},m=document.getElementById(r).getContext(`2d`);return new Chart(m,{type:`bar`,data:{labels:d,datasets:[{data:f,backgroundColor:function(r){let i=r.chart,{ctx:a,chartArea:s}=i;if(!s)return`rgba(0,0,0,0)`;let c=r.dataIndex,l=i.data.labels[c],u=o===`card`?t[c%t.length]:e[l]||(n===`income`?`#00e676`:`#90a4ae`),d=a.createLinearGradient(0,s.top,0,s.bottom);return d.addColorStop(0,u),d.addColorStop(1,`rgba(0, 0, 0, 0.05)`),d},borderWidth:0,borderRadius:{topLeft:6,topRight:6,bottomLeft:0,bottomRight:0},barPercentage:.6,categoryPercentage:.8}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{mode:`index`,intersect:!1},plugins:{legend:{display:!1},tooltip:{backgroundColor:`rgba(20, 25, 40, 0.95)`,titleFont:{size:12,family:`Outfit`},bodyFont:{size:14,family:`Outfit`,weight:`bold`},padding:{left:14,right:14,top:8,bottom:8},cornerRadius:12,displayColors:!1,callbacks:{title:function(e){return e[0].label},label:function(e){let t=u[e.label]||0;return`Qtd: ${e.parsed.y} | R$ ${t.toLocaleString(`pt-BR`)}`}}}},scales:{x:{grid:{display:!1,drawBorder:!1},ticks:{color:getComputedStyle(document.body).getPropertyValue(`--text-muted`),font:{family:`Outfit`,size:11}}},y:{position:`right`,grid:{color:`rgba(255, 255, 255, 0.05)`,drawBorder:!1},ticks:{color:getComputedStyle(document.body).getPropertyValue(`--text-muted`),font:{family:`Outfit`,size:11},padding:10,stepSize:1},beginAtZero:!0}}},plugins:[p]})},a=e=>{Object.values(n).forEach(e=>e.destroy());let t=document.querySelector(`.finance-column.active`)?.id||`tab-expense`;t===`tab-expense`&&(n.exp=r(`expense`,`expenseBarChart`,e)),t===`tab-income`&&(n.inc=r(`income`,`incomeBarChart`,e)),t===`tab-card`&&(n.crd=r(`expense`,`cardBarChart`,e,`card`)),t===`tab-total`&&(n.tot=r(`total`,`totalBarChart`,e))};a(30);let o=document.getElementById(`financePeriodSelect`);o&&o.addEventListener(`change`,e=>a(parseInt(e.target.value)));let s=null,c=e=>{let t=new Date,n=[],r=[],a=[`Dom`,`Seg`,`Ter`,`Qua`,`Qui`,`Sex`,`Sab`];for(let o=e-1;o>=0;o--){let s=new Date(t);s.setDate(t.getDate()-o);let c=s.toISOString().split(`T`)[0];n.push(e===7?a[s.getDay()]:`${String(s.getDate()).padStart(2,`0`)}/${String(s.getMonth()+1).padStart(2,`0`)}`),r.push(i.state.transactions.filter(e=>e.date===c).reduce((e,t)=>t.type===`income`?e+Number(t.amount):e-Number(t.amount),0))}let o=document.getElementById(`cashflowChart`).getContext(`2d`);s&&s.destroy(),s=new Chart(o,{type:`line`,data:{labels:n,datasets:[{label:`Fluxo Líquido`,data:r,borderColor:`#00e5ff`,backgroundColor:`rgba(0, 229, 255, 0.1)`,fill:!0,tension:.4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{y:{grid:{color:getComputedStyle(document.body).getPropertyValue(`--border-color`)},ticks:{color:getComputedStyle(document.body).getPropertyValue(`--text-muted`)}},x:{grid:{display:!1},ticks:{color:getComputedStyle(document.body).getPropertyValue(`--text-muted`)}}}}})};c(7);let l=document.getElementById(`chartPeriodSelect`);l&&l.addEventListener(`change`,e=>c(parseInt(e.target.value)));let u=document.querySelectorAll(`.finance-tab`),d=document.querySelectorAll(`.finance-column`);u.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.tab;u.forEach(t=>t.classList.toggle(`active`,t===e)),d.forEach(e=>{let n=e.id===t;e.classList.toggle(`active`,n)}),setTimeout(()=>{a(parseInt(document.getElementById(`financePeriodSelect`)?.value)||30)},50)})})}},o=e=>e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`),s=e=>(parseFloat(e)||0).toLocaleString(`pt-BR`,{minimumFractionDigits:2}),c=e=>e?new Date(e+`T00:00:00`).toLocaleDateString(`pt-BR`):`-`,l=e=>e==null||isNaN(e)?`0,00`:new Intl.NumberFormat(`pt-BR`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(e),u=e=>{if(!e)return 0;let t=e.replace(/\D/g,``);return parseFloat(t)/100},d=e=>{let t=e.value.replace(/\D/g,``);if(t===``){e.value=``;return}e.value=l(parseFloat(t)/100)},f={render:()=>{let{cards:e}=i.state,t=(e,t)=>{let n=0,r=1;for(;n<5;){let i=new Date(e,t,r).getDay();if(i!==0&&i!==6&&n++,n===5)return r;r++}return 5},n=(e,t)=>{let n=20;for(;;){let r=new Date(e,t,n).getDay();if(r!==0&&r!==6)return n;n--}},r=(e=>{if(!e?.length)return null;let r=new Date,a=r.getFullYear(),o=r.getMonth(),s=r.getDate(),c=!1,l=!1;(i.state.incomeSources||[]).forEach(e=>{e.distribution===`40_60`&&(c=!0),e.distribution===`60_40`&&(l=!0)});let u=null,d=-1/0;return e.forEach(e=>{let r=parseInt(e.closingDate)||Math.max(1,parseInt(e.dueDate)-7),i=parseInt(e.dueDate)||1,f=new Date(a,o,r);s>=r&&(f=new Date(a,o+1,r));let p=new Date(f.getFullYear(),f.getMonth(),i);p<=f&&(p=new Date(f.getFullYear(),f.getMonth()+1,i));let m=Math.ceil((p-new Date(a,o,s))/864e5),h=p.getMonth(),g=p.getFullYear(),_=t(g,h),v=n(g,h),y=m;l?(i>=_&&i<=_+5&&(y-=15),i>=v&&i<=v+5&&(y+=30)):c?(i>=v&&i<=v+5&&(y-=15),i>=_&&i<=_+5&&(y+=30)):(i<_&&(y-=30),i>=_&&i<=_+7&&(y+=15)),y>d&&(d=y,u=e.id)}),u})(e),a=e.reduce((e,t)=>e+(parseFloat(t.limit)||0),0),c=e.reduce((e,t)=>e+(parseFloat(t.used)||0),0),l=Math.max(0,a-c);return`
      <div class="fade-in" id="cards-view-content">
        <div class="stats-grid" style="margin-bottom: 2rem;">
          <div class="glass stat-card" style="border-top: 4px solid var(--primary-color);">
            <span class="stat-label">Limite Total</span>
            <span class="stat-value" style="color: var(--primary-color);">R$ ${s(a)}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">Soma dos limites cadastrados</span>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid #ff5252;">
            <span class="stat-label">Saldo Devedor</span>
            <span class="stat-value" style="color: #ff5252;">R$ ${s(c)}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">Faturas em aberto</span>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid #00e676;">
            <span class="stat-label">Limite Disponível</span>
            <span class="stat-value" style="color: #00e676;">R$ ${s(l)}</span>
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
            ${e.length===0?`<div style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:3rem 1rem;">
                   <i data-lucide="credit-card" style="width:40px;height:40px;opacity:.3;margin-bottom:1rem;display:block;margin-left:auto;margin-right:auto;"></i>
                   Nenhum cartão cadastrado. Clique em <strong>Novo Cartão</strong> no menu superior para começar.
                 </div>`:e.map(e=>{let t=Math.min(e.used/e.limit*100,100),n=e.id===r,i=new Date().getDate(),a=parseInt(e.dueDate)-i,c=a>=0&&a<=3&&e.used>0,l=c?`border: 2px solid #ff5252; box-shadow: 0 0 20px rgba(255,82,82,0.4);`:``,u=n?`box-shadow:0 0 20px rgba(255,215,0,.4);border:1px solid rgba(255,215,0,.5);`:``;return`
                      <div class="card-visual ${o(e.color)||`blue`}" 
                           style="min-height: 190px; padding: 1.25rem; cursor: pointer; position:relative; ${l} ${c?``:u}"
                           data-action="edit-card" data-id="${o(e.id)}">
                        
                        ${n?`<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);background:#fff;color:#000;padding:.25rem 1rem;border-bottom-left-radius:8px;border-bottom-right-radius:8px;font-size:.65rem;font-weight:900;letter-spacing:.8px;z-index:10;box-shadow: 0 2px 10px rgba(0,0,0,0.15);">MELHOR COMPRA</div>`:``}
                        


                        <div style="display:flex;justify-content:space-between;align-items:flex-start;${n?`margin-top:.6rem;`:``}">
                      <div>
                        <div style="font-size:1rem;opacity:1;font-weight:700;margin-bottom:.1rem;letter-spacing:-0.2px;">${o(e.name)}</div>
                        <div style="font-weight:500;font-size:.85rem;letter-spacing:1px;opacity:0.8;">**** ${o(e.lastDigits)}</div>
                      </div>
                      <div style="display:flex;gap:.4rem;">
                        <button class="card-action-icon delete" style="width:34px;height:34px;position:relative;z-index:2;" data-action="delete-card" data-id="${o(e.id)}" title="Excluir" onclick="event.stopPropagation()">
                          <i data-lucide="trash-2" style="width:16px;"></i>
                        </button>
                      </div>
                    </div>

                    <div style="margin-top:1.2rem;">
                      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:.4rem;">
                        <div>
                          <div style="font-size:.65rem;opacity:.8;font-weight:700;letter-spacing:0.5px;">SALDO DEVEDOR</div>
                          <div style="font-size:1.3rem;font-weight:800;letter-spacing:-0.4px;">R$ ${s(e.used)}</div>
                        </div>
                        <div style="text-align:right;">
                          <div style="font-size:.65rem;opacity:.8;font-weight:700;letter-spacing:0.5px;">DISPONÍVEL</div>
                          <div style="font-size:.95rem;font-weight:700;">R$ ${s(e.limit-e.used)}</div>
                        </div>
                      </div>
                      <div style="height:6px;background:rgba(255,255,255,.2);border-radius:3px;margin:.5rem 0;">
                        <div style="width:${t}%;height:100%;background:#fff;border-radius:3px;box-shadow:0 0 8px rgba(255,255,255,.5);"></div>
                      </div>
                      <div style="display:flex;justify-content:space-between;font-size:.7rem;opacity:.9;font-weight:600;">
                        <span>Fech: dia ${o(e.closingDate)||`-`}</span>
                        <span>Venc: dia ${o(e.dueDate)}</span>
                      </div>
                    </div>

                    <div style="display:flex;justify-content:center;align-items:center;margin-top:auto;padding-top:.8rem;border-top:1px solid rgba(255,255,255,.15);gap:.8rem;">
                      ${c?`
                        <div style="background:#ff5252; color:#fff; padding:.4rem .8rem; border-radius:10px; font-size:.65rem; font-weight:900; animation: pulse 2s infinite; display:flex; align-items:center; white-space:nowrap;">
                          VENCE ${a===0?`HOJE`:`EM ${a} ${a===1?`DIA`:`DIAS`}`}
                        </div>
                      `:``}
                      <button class="btn btn-primary" style="padding:.5rem 1.5rem;font-size:.75rem;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:white;box-shadow:none;border-radius:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;"
                              data-action="pay-card" data-id="${o(e.id)}">
                        Pagar Fatura
                      </button>
                    </div>
                  </div>`}).join(``)}
          </div>
        </div>
      </div>
    `},init:()=>{let e=document.getElementById(`cards-view-content`);e&&e.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let{action:n,id:r}=t.dataset;n===`edit-card`&&f._openEditModal(r),n===`delete-card`&&window.showConfirm(`Excluir o cartão? Esta ação é irreversível.`,()=>i.deleteCard(r)),n===`pay-card`&&f._payCard(r)});let t=document.getElementById(`card-modal`),n=document.getElementById(`card-form`),r=document.getElementById(`add-card-header-btn`),a=document.getElementById(`btn-close-card-modal`),o=document.getElementById(`btn-submit-card`),s=document.getElementById(`card-color`),c=document.querySelectorAll(`#color-picker .color-option`),l=e=>{s.value=e||`blue`,c.forEach(t=>t.classList.toggle(`active`,t.dataset.color===(e||`blue`)))};c.forEach(e=>e.addEventListener(`click`,()=>l(e.dataset.color))),r.onclick=()=>{n.reset(),document.getElementById(`card-id`).value=``,document.getElementById(`card-modal-title`).innerText=`Novo Cartão`,o.innerText=`Salvar Cartão`,l(`blue`),t.classList.add(`active`)},a.onclick=()=>t.classList.remove(`active`),n.onsubmit=e=>{e.preventDefault();let n=document.getElementById(`card-id`).value,r={name:document.getElementById(`card-name`).value,lastDigits:document.getElementById(`card-digits`).value,closingDate:document.getElementById(`card-closing`).value,dueDate:document.getElementById(`card-due`).value,limit:u(document.getElementById(`card-limit`).value),used:u(document.getElementById(`card-used`).value||`0`),color:document.getElementById(`card-color`).value};n?i.updateCard(n,r):i.addCard(r),t.classList.remove(`active`)}},_openEditModal(e){let t=i.state.cards.find(t=>t.id===e);if(!t)return;let n=document.getElementById(`card-modal`);document.getElementById(`card-id`).value=t.id,document.getElementById(`card-name`).value=t.name,document.getElementById(`card-digits`).value=t.lastDigits,document.getElementById(`card-closing`).value=t.closingDate||``,document.getElementById(`card-due`).value=t.dueDate,document.getElementById(`card-limit`).value=l(t.limit),document.getElementById(`card-used`).value=l(t.used),document.getElementById(`card-modal-title`).innerText=`Editar Cartão`,document.getElementById(`btn-submit-card`).innerText=`Atualizar Cartão`;let r=document.getElementById(`card-color`),a=document.querySelectorAll(`#color-picker .color-option`);r.value=t.color||`blue`,a.forEach(e=>e.classList.toggle(`active`,e.dataset.color===(t.color||`blue`))),n.classList.add(`active`)},_payCard(e){let t=i.state.cards.find(t=>t.id===e);if(t){if(t.used<=0){window.showToast(`Este cartão não tem saldo devedor.`,`error`);return}window.showConfirm(`Pagar fatura de R$ ${s(t.used)} do cartão ${t.name}?\nIsso registrará uma despesa e resetará o saldo devedor.`,()=>{i.addTransaction({description:`Pagamento Fatura: ${t.name}`,amount:t.used,type:`expense`,category:`Cartão de Crédito`,date:new Date().toISOString().slice(0,10),cardId:null}),i.updateCard(e,{used:0})})}}},p={render:()=>{let{loans:e=[]}=i.state,t=e.filter(e=>(parseInt(e.paidInstallments)||0)<(parseInt(e.totalInstallments)||1)),n=t.reduce((e,t)=>e+(parseFloat(t.remainingAmount)||0),0),r=t.reduce((e,t)=>e+(parseFloat(t.installmentValue)||0),0);return`
      <div class="fade-in" id="loans-view-content">
        <div class="stats-grid" style="margin-bottom: 2rem;">
          <div class="glass stat-card" style="border-top: 4px solid #ff3d00;">
            <span class="stat-label">Total Devedor</span>
            <span class="stat-value" style="color: #ff3d00;">R$ ${s(n)}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">Saldo remanescente</span>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid var(--primary-color);">
            <span class="stat-label">Comprometimento Mensal</span>
            <span class="stat-value">R$ ${s(r)}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">Soma das parcelas</span>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid var(--secondary-color);">
            <span class="stat-label">Contratos Ativos</span>
            <span class="stat-value">${t.length}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">${t.length===0?`Nenhum pendente`:`Em andamento`}</span>
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
              ${e.length===0?`<div style="text-align: center; padding: 3rem;">
                    <i data-lucide="info" style="width: 48px; height: 48px; color: var(--text-dim); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-muted);">Nenhum empréstimo cadastrado.</p>
                   </div>`:e.map(e=>{let t=e.totalInstallments||1,n=e.paidInstallments||0,r=n>=t,i=Math.min(n/t*100,100),a=new Date().getDate(),c=parseInt(e.dueDate)-a,l=c>=0&&c<=3&&!r;return`
                      <div class="ledger-row" 
                           style="background: var(--surface-color); border-radius: 15px; padding: 1.25rem; border: 1px solid ${r?`#00e67633`:`var(--border-color)`}; opacity: ${r?`0.7`:`1`}; transition: var(--transition); cursor: pointer;"
                           data-action="edit-loan" data-id="${o(e.id)}">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                          <div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                              <h4 style="font-size: 1.1rem;">${o(e.name)}</h4>
                              ${r?`<span class="badge" style="background: rgba(0,230,118,0.1); color: #00e676;">QUITADO</span>`:``}
                            </div>
                            <span style="font-size: 0.85rem; color: var(--text-muted);">Parcela: R$ ${s(e.installmentValue)} | Vence dia ${o(e.dueDate)}</span>
                          </div>
                          <div style="display: flex; gap: 0.5rem;">
                            <button class="card-action-icon delete" data-action="delete-loan" data-id="${o(e.id)}" onclick="event.stopPropagation()">
                              <i data-lucide="trash-2" style="width: 14px;"></i>
                            </button>
                          </div>
                        </div>

                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                          <span style="color: var(--primary-color); font-weight: 600;">${n} de ${t} parcelas</span>
                          <span style="font-weight: 700; color: ${r?`#00e676`:`var(--text-main)`}">${Math.round(i)}% Pago</span>
                        </div>
                        <div class="progress-track" style="height: 10px; background: var(--surface-light); border-radius: 6px; overflow: hidden; transition: var(--transition);">
                          <div style="width: ${i}%; height: 100%; background: ${r?`#00e676`:`var(--primary-gradient)`}; border-radius: 6px; transition: width 0.6s ease;"></div>
                        </div>
                        
                        <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                          <div style="font-size: 0.8rem; color: var(--text-muted);">
                            ${r?`Contrato encerrado com sucesso`:`Restam <strong style="color: var(--text-main);">R$ ${s(e.remainingAmount)}</strong>`}
                          </div>
                          <div style="display: flex; align-items: center; gap: 0.8rem;">
                            ${r?``:`
                              ${l?`
                                <div style="background:#ff5252; color:#fff; padding:.4rem .8rem; border-radius:10px; font-size:.65rem; font-weight:900; animation: pulse 2s infinite; display:flex; align-items:center; white-space:nowrap;">
                                  VENCE ${c===0?`HOJE`:`EM ${c} ${c===1?`DIA`:`DIAS`}`}
                                </div>
                              `:``}
                              <button class="btn btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.85rem; background: rgba(0,229,255,0.1); border: 1px solid var(--primary-color); color: var(--primary-color);"
                                data-action="pay-loan" data-id="${o(e.id)}" onclick="event.stopPropagation()">
                                Pagar Próxima
                              </button>`}
                          </div>
                        </div>
                      </div>`}).join(``)}
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
    `},init:()=>{let e=document.getElementById(`loan-modal`),t=document.getElementById(`loan-form`),n=document.getElementById(`btn-add-loan`),r=document.getElementById(`btn-close-loan-modal`),a=(n=null)=>{t.reset(),document.getElementById(`loan-id`).value=``,document.getElementById(`loan-modal-title`).innerText=`Novo Empréstimo`,n&&(document.getElementById(`loan-id`).value=n.id,document.getElementById(`loan-name`).value=n.name,document.getElementById(`loan-total`).value=l(n.totalAmount),document.getElementById(`loan-installment`).value=l(n.installmentValue),document.getElementById(`loan-total-installments`).value=n.totalInstallments||``,document.getElementById(`loan-paid-installments`).value=n.paidInstallments||``,document.getElementById(`loan-due`).value=n.dueDate,document.getElementById(`loan-modal-title`).innerText=`Editar Empréstimo`),e.classList.add(`active`)};n.onclick=()=>a(),r.onclick=()=>e.classList.remove(`active`);let o=document.getElementById(`loans-view-content`);o&&o.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let{action:n,id:r}=t.dataset;if(n===`edit-loan`){let e=i.state.loans.find(e=>e.id===r);e&&a(e)}if(n===`delete-loan`&&window.showConfirm(`Excluir este empréstimo? O histórico de pagamentos será mantido.`,()=>i.deleteLoan(r)),n===`pay-loan`){let e=i.state.loans.find(e=>e.id===r);if(!e)return;window.showConfirm(`Pagar parcela de R$ ${s(e.installmentValue)} de "${e.name}"?\nUma despesa será registrada automaticamente.`,()=>{let t=(e.paidInstallments||0)+1;i.addTransaction({description:`Parcela: ${e.name} (${t}/${e.totalInstallments})`,amount:e.installmentValue,type:`expense`,category:`Empréstimos`,date:new Date().toISOString().slice(0,10),cardId:null}),i.updateLoan(r,{paidInstallments:t,remainingAmount:Math.max(0,(e.totalInstallments-t)*e.installmentValue)})})}}),t.onsubmit=t=>{t.preventDefault();let n=document.getElementById(`loan-id`).value,r=parseInt(document.getElementById(`loan-total-installments`).value),a=parseInt(document.getElementById(`loan-paid-installments`).value),o=u(document.getElementById(`loan-installment`).value),s={name:document.getElementById(`loan-name`).value,totalAmount:u(document.getElementById(`loan-total`).value),installmentValue:o,totalInstallments:r,paidInstallments:a,remainingAmount:Math.max(0,(r-a)*o),dueDate:document.getElementById(`loan-due`).value};n?i.updateLoan(n,s):i.addLoan(s),e.classList.remove(`active`)}}},m={render:()=>{let{incomeSources:e=[],monthlyIncome:t=0}=i.state,n=e=>e.distribution===`40_60`?`40% (Dia 5) / 60% (Dia 20)`:e.distribution===`60_40`?`60% (Dia 5) / 40% (Dia 20)`:e.dueDate?`Vence dia ${o(e.dueDate)}`:`Recebimento único`,r=e.length>0?[...e].sort((e,t)=>t.amount-e.amount)[0]:null;return`
      <div class="fade-in" id="income-view-content">
        <div class="stats-grid" style="margin-bottom: 2rem;">
          <div class="glass stat-card" style="border-top: 4px solid #00e676;">
            <span class="stat-label">Renda Mensal Total</span>
            <span class="stat-value" style="color: #00e676;">R$ ${s(t)}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">Soma de todas as fontes</span>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid var(--primary-color);">
            <span class="stat-label">Principal Fonte</span>
            <span class="stat-value" style="font-size: 1.2rem;">${r?o(r.name):`---`}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">${r?`R$ ${s(r.amount)}`:`Nenhuma cadastrada`}</span>
          </div>
          <div class="glass stat-card" style="border-top: 4px solid var(--secondary-color);">
            <span class="stat-label">Projeção Anual</span>
            <span class="stat-value">R$ ${s(t*12)}</span>
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
              ${e.length===0?`<div style="text-align: center; padding: 4rem; color: var(--text-muted);">
                    <i data-lucide="briefcase" style="width: 48px; height: 48px; display: block; margin: 0 auto 1.5rem; opacity: 0.2;"></i>
                    Nenhuma fonte de renda cadastrada.
                   </div>`:e.map(e=>`
                  <div class="ledger-row" 
                       style="background: rgba(0,230,118,0.03); border-radius: 16px; padding: 1.25rem; border: 1px solid rgba(0,230,118,0.1); transition: var(--transition); cursor: pointer;"
                       data-action="edit-income" data-id="${o(e.id)}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                      <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(0,230,118,0.1); display: flex; align-items: center; justify-content: center; color: #00e676;">
                          <i data-lucide="${o(e.icon||`briefcase`)}" style="width: 20px;"></i>
                        </div>
                        <div>
                          <h4 style="font-size: 1.1rem; margin-bottom: 0.1rem;">${o(e.name)}</h4>
                          <span style="font-size: 0.8rem; color: var(--text-muted);">${o(e.company)}</span>
                        </div>
                      </div>
                      <div style="display: flex; gap: 0.5rem;">
                        <button class="card-action-icon delete" data-action="delete-income" data-id="${o(e.id)}" onclick="event.stopPropagation()">
                          <i data-lucide="trash-2" style="width: 14px;"></i>
                        </button>
                      </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                      <span style="font-size: 0.8rem; color: var(--text-muted);">${o(e.frequency)} · ${n(e)}</span>
                      <span style="font-weight: 700; color: #00e676; font-size: 1.1rem;">R$ ${s(e.amount)}</span>
                    </div>
                  </div>`).join(``)}
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
              
              ${(()=>{let e=i.getDynamicStats().expenses||0,n=e/.7,r=n-t,a=t>=n,o=Math.min(t/n*100,100);return`
                  <div style="margin-bottom: 1rem;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Baseado em seus gastos de <strong style="color: var(--text-main);">R$ ${s(e)}</strong>:</div>
                    <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary-color);">R$ ${s(n)}</div>
                  </div>
                  
                  <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; margin-bottom: 1rem; overflow: hidden;">
                    <div style="width: ${o}%; height: 100%; background: ${a?`#00e676`:`var(--primary-gradient)`}; border-radius: 3px;"></div>
                  </div>

                  <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">
                    ${a?`<span style="color: #00e676; font-weight: 600;">Parabéns!</span> Sua renda atual cobre seus gastos com uma margem de segurança de 30%.`:`Para manter uma saúde financeira sólida, você precisaria de mais <strong style="color: var(--text-main);">R$ ${s(r)}</strong> mensais.`}
                  </p>
                `})()}
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
    `},init:()=>{let e=document.getElementById(`income-modal`),t=document.getElementById(`income-form`),n=document.getElementById(`btn-add-income`),r=document.getElementById(`btn-close-income-modal`),a=(n=null)=>{if(t.reset(),document.getElementById(`income-id`).value=``,document.getElementById(`income-modal-title`).innerText=`Nova Fonte de Renda`,document.getElementById(`income-distribution`).value=`single`,document.getElementById(`income-due-container`).style.display=`block`,n){document.getElementById(`income-id`).value=n.id,document.getElementById(`income-name`).value=n.name,document.getElementById(`income-company`).value=n.company,document.getElementById(`income-amount`).value=l(n.amount),document.getElementById(`income-frequency`).value=n.frequency,document.getElementById(`income-distribution`).value=n.distribution||`single`,document.getElementById(`income-due`).value=n.dueDate||``,document.getElementById(`income-icon`).value=n.icon||`briefcase`,document.getElementById(`income-modal-title`).innerText=`Editar Fonte de Renda`;let e=n.distribution===`40_60`||n.distribution===`60_40`;document.getElementById(`income-due-container`).style.display=e?`none`:`block`}e.classList.add(`active`)};n.onclick=()=>a(),r.onclick=()=>e.classList.remove(`active`);let o=document.getElementById(`income-view-content`);o&&o.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let{action:n,id:r}=t.dataset;if(n===`edit-income`){let e=i.state.incomeSources.find(e=>e.id===r);e&&a(e)}n===`delete-income`&&window.showConfirm(`Excluir esta fonte de renda?`,()=>i.deleteIncomeSource(r))}),t.onsubmit=t=>{t.preventDefault();let n=document.getElementById(`income-id`).value,r={name:document.getElementById(`income-name`).value,company:document.getElementById(`income-company`).value,amount:u(document.getElementById(`income-amount`).value),frequency:document.getElementById(`income-frequency`).value,distribution:document.getElementById(`income-distribution`).value,dueDate:document.getElementById(`income-due`).value,icon:document.getElementById(`income-icon`).value};n?i.updateIncomeSource(n,r):i.addIncomeSource(r),e.classList.remove(`active`)}}},h=(e,t)=>e.length===0?`<tr><td colspan="6" style="text-align:center;padding:4rem;color:var(--text-muted);">
      <i data-lucide="search-x" style="width:48px;height:48px;display:block;margin:0 auto 1rem;opacity:.3;"></i>
      Nenhuma transação encontrada para os filtros aplicados.
    </td></tr>`:e.map(e=>{let n=t.find(t=>t.id===e.cardId),r=e.type===`expense`;return`
      <tr class="ledger-row" style="background:var(--surface-color);transition:var(--transition);cursor:pointer;" data-action="edit-tx" data-id="${o(e.id)}">
        <td style="padding:1.2rem;border-radius:12px 0 0 12px;font-size:.9rem;color:var(--text-muted);">${c(e.date)}</td>
        <td style="padding:1.2rem;font-weight:500;">${o(e.description)}</td>
        <td style="padding:1.2rem;">
          <span class="badge" style="background:var(--surface-light);font-size:.75rem;">${o(e.category)}</span>
        </td>
        <td style="padding:1.2rem;font-size:.85rem;color:var(--text-muted);">
          ${n?`<div style="display:flex;align-items:center;gap:.5rem;">
                <div style="width:10px;height:10px;border-radius:50%;background:var(--card-${o(n.color)});"></div>
                <span>${o(n.name)}</span>
               </div>`:`<div style="display:flex;align-items:center;gap:.5rem;"><i data-lucide="wallet" style="width:14px;"></i> Dinheiro</div>`}
        </td>
        <td style="padding:1.2rem;font-weight:700;color:${r?`#ff5252`:`#00e676`};">
          ${r?`-`:`+`} R$ ${s(e.amount)}
        </td>
        <td style="padding:1.2rem;border-radius:0 12px 12px 0;text-align:right;">
          <div style="display:flex;gap:.5rem;justify-content:flex-end;">
            <button class="card-action-icon delete" data-action="delete-tx" data-id="${o(e.id)}" onclick="event.stopPropagation()">
              <i data-lucide="trash-2" style="width:16px;"></i>
            </button>
          </div>
        </td>
      </tr>`}).join(``),g={render:()=>{let{transactions:e=[],cards:t=[],customCategories:n=[]}=i.state,r=[...e].sort((e,t)=>new Date(t.date)-new Date(e.date)),a=r.filter(e=>e.type===`income`).reduce((e,t)=>e+t.amount,0),c=r.filter(e=>e.type===`expense`).reduce((e,t)=>e+t.amount,0),l=[`Alimentação`,`Moradia`,`Transporte`,`Saúde`,`Educação`,`Lazer`,`Vestuário`,`Assinaturas`,`Cartão de Crédito`,`Empréstimos`,`Salário`,`Freelance`,`Investimentos`,`Presente`,`Reembolso`,`Outros`],u=[...new Set(r.map(e=>e.category).filter(Boolean))],d=[...new Set([...l,...n,...u])].sort();return`
      <div class="fade-in" id="tx-view-content">
        <div class="stats-grid" style="margin-bottom:2rem;">
          <div class="glass stat-card" style="border-top:4px solid #00e676;">
            <span class="stat-label">Entradas</span>
            <span class="stat-value" style="color:#00e676;">+ R$ ${s(a)}</span>
            <span style="color:var(--text-muted);font-size:.8rem;">Total recebido</span>
          </div>
          <div class="glass stat-card" style="border-top:4px solid #ff5252;">
            <span class="stat-label">Saídas</span>
            <span class="stat-value" style="color:#ff5252;">- R$ ${s(c)}</span>
            <span style="color:var(--text-muted);font-size:.8rem;">Total gasto</span>
          </div>
          <div class="glass stat-card" style="border-top:4px solid var(--primary-color);">
            <span class="stat-label">Saldo Líquido</span>
            <span class="stat-value" style="color:${a-c>=0?`var(--text-main)`:`#ff5252`}">R$ ${s(a-c)}</span>
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
              ${d.map(e=>`<option value="${o(e)}">${o(e)}</option>`).join(``)}
            </select>
            <input id="tx-filter-from" type="date" class="input-field" style="height:42px;width:auto;" title="De">
            <input id="tx-filter-to"   type="date" class="input-field" style="height:42px;width:auto;" title="Até">
          </div>

          <!-- Contador de resultados + botão limpar -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <span id="tx-count" style="font-size:.85rem;color:var(--text-muted);">${r.length} transação(ões)</span>
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
                ${r.length===0?`<tr><td colspan="6" style="text-align:center;padding:4rem;color:var(--text-muted);">
                      <i data-lucide="info" style="width:48px;height:48px;display:block;margin:0 auto 1rem;opacity:.3;"></i>
                      Nenhuma transação registrada.
                    </td></tr>`:h(r,t)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `},init:()=>{let e=(e,t,n)=>{let r=new Blob([e],{type:n}),i=URL.createObjectURL(r),a=Object.assign(document.createElement(`a`),{href:i,download:t});document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i)},t=()=>new Date().toISOString().slice(0,10);document.getElementById(`btn-exp-json`).onclick=()=>e(i.exportJSON(),`vizfin_backup_${t()}.json`,`application/json`),document.getElementById(`btn-exp-csv`).onclick=()=>e(`﻿`+i.exportCSV(),`vizfin_transacoes_${t()}.csv`,`text/csv;charset=utf-8`);let{transactions:n=[],cards:r=[]}=i.state,a=[...n].sort((e,t)=>new Date(t.date)-new Date(e.date)),o=document.getElementById(`tx-tbody`),s=document.getElementById(`tx-count`),c=document.getElementById(`tx-clear-filters`),l=document.getElementById(`tx-search`),u=document.getElementById(`tx-filter-type`),d=document.getElementById(`tx-filter-cat`),f=document.getElementById(`tx-filter-from`),p=document.getElementById(`tx-filter-to`),m=()=>{let e=l.value.toLowerCase().trim(),t=u.value,n=d.value,i=f.value,m=p.value,g=e||t||n||i||m;c.style.display=g?`flex`:`none`;let _=a.filter(r=>!(t&&r.type!==t||n&&r.category!==n||i&&r.date<i||m&&r.date>m||e&&!r.description?.toLowerCase().includes(e)&&!r.category?.toLowerCase().includes(e)));o.innerHTML=h(_,r),s.textContent=`${_.length} transação(ões)${g?` encontrada(s)`:``}`,lucide.createIcons()};[l,u,d,f,p].forEach(e=>e.addEventListener(`input`,m)),c.addEventListener(`click`,()=>{l.value=``,u.value=``,d.value=``,f.value=``,p.value=``,m()});let g=document.getElementById(`tx-view-content`);g&&g.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let{action:n,id:r}=t.dataset;n===`edit-tx`&&window.app.showAddTransactionModal(r),n===`delete-tx`&&window.showConfirm(`Excluir esta transação? Isso afetará seu saldo.`,()=>i.deleteTransaction(r))}),lucide.createIcons()}},_={render:()=>{let e=i.getDynamicStats(),t=e.income-e.expenses,n=e.balance,r=e.income>0?Math.max(0,Math.min(100,t/e.income*100)):0,a=n+t*3;return`
      <div class="fade-in" style="display:flex;flex-direction:column;gap:1.5rem;">
        <div class="stats-grid" style="margin-bottom:0;">
          <div class="glass stat-card" style="border-top:4px solid #00e676;">
            <span class="stat-label">Saldo em 3 Meses</span>
            <span class="stat-value" style="font-size:1.4rem;color:${a>=0?`#00e676`:`#ff5252`};">R$ ${s(a)}</span>
            <span style="color:var(--text-muted);font-size:.8rem;">
              ${t>=0?`+`:``}R$ ${s(t*3)} acumulado
            </span>
          </div>
          <div class="glass stat-card" style="border-top:4px solid var(--primary-color);">
            <span class="stat-label">Capacidade de Poupança</span>
            <span class="stat-value">${r.toFixed(0)}%</span>
            <span style="color:var(--text-muted);font-size:.8rem;">Da renda mensal</span>
          </div>
          <div class="glass stat-card" style="border-top:4px solid var(--secondary-color);">
            <span class="stat-label">Saldo Líquido Mensal</span>
            <span class="stat-value" style="font-size:1.4rem;color:${t>=0?`#00e676`:`#ff5252`};">
              ${t>=0?`+`:``}R$ ${s(t)}
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
              <div style="font-weight:600;color:${t>=0?`#00e676`:`#ff5252`};">
                ${t>=0?`Positivo`:`Deficitário`}
              </div>
            </div>
          </div>
          <div class="chart-container" style="height:350px;">
            <canvas id="projectionsChart"></canvas>
          </div>
        </div>
      </div>
    `},init:()=>{let e=i.getDynamicStats(),t=e.income-e.expenses,n=e.balance,r=new Date,a=[],o=[];for(let e=1;e<=6;e++){let i=new Date(r.getFullYear(),r.getMonth()+e,1);a.push(i.toLocaleDateString(`pt-BR`,{month:`short`,year:`2-digit`})),o.push(parseFloat((n+t*e).toFixed(2)))}let s=document.getElementById(`projectionsChart`)?.getContext(`2d`);s&&new Chart(s,{type:`line`,data:{labels:a,datasets:[{label:`Saldo Projetado`,data:o,borderColor:`#00e5ff`,backgroundColor:`rgba(0,229,255,.08)`,fill:!0,tension:.4,pointBackgroundColor:`#00e5ff`,pointRadius:5},{label:`Ponto de Equilíbrio`,data:a.map(()=>0),borderColor:`rgba(255,255,255,.15)`,borderDash:[5,5],fill:!1,pointRadius:0,tension:0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,labels:{color:`#94a3b8`,font:{family:`Outfit`}}},tooltip:{callbacks:{label:e=>` R$ ${e.parsed.y.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}`}}},scales:{y:{grid:{color:`rgba(255,255,255,.05)`},ticks:{color:`#94a3b8`,callback:e=>`R$ `+e.toLocaleString(`pt-BR`)}},x:{grid:{display:!1},ticks:{color:`#94a3b8`}}}}})}},v={render:()=>`
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
    `,init:async()=>{lucide.createIcons();let e=async()=>{try{let e=await fetch(`https://brapi.dev/api/quote/PETR4,VALE3,ITUB4,BBDC4,ABEV3,MGLU3,WEGE3,IBOV?range=1d&interval=1d`);if(!e.ok)throw Error(`API request failed`);let i=await e.json();i&&i.results&&Array.isArray(i.results)?(n(i.results),t(i.results)):r()}catch(e){console.error(`Erro ao buscar dados do mercado:`,e),r()}},t=e=>{let t=e.find(e=>e.symbol===`IBOV`);if(t){document.getElementById(`ibov-value`).innerText=t.regularMarketPrice.toLocaleString(`pt-BR`)+` pts`;let e=t.regularMarketChangePercent||0;document.getElementById(`ibov-pct`).innerHTML=`<span style="color: ${e>=0?`#00e676`:`#ff5252`}">${e>=0?`+`:``}${e.toFixed(2)}%</span>`}fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT`).then(e=>e.json()).then(e=>{document.getElementById(`btc-value`).innerText=`US$ `+parseFloat(e.lastPrice).toLocaleString(`en-US`);let t=parseFloat(e.priceChangePercent);document.getElementById(`btc-pct`).innerHTML=`<span style="color: ${t>=0?`#00e676`:`#ff5252`}">${t>=0?`+`:``}${t.toFixed(2)}%</span>`}),fetch(`https://economia.awesomeapi.com.br/json/last/USD-BRL`).then(e=>e.json()).then(e=>{let t=e.USDBRL;document.getElementById(`usd-value`).innerText=`R$ `+parseFloat(t.bid).toFixed(2);let n=parseFloat(t.pctChange);document.getElementById(`usd-pct`).innerHTML=`<span style="color: ${n>=0?`#00e676`:`#ff5252`}">${n>=0?`+`:``}${n.toFixed(2)}%</span>`})},n=e=>{let t=document.getElementById(`market-table-body`),n=document.getElementById(`top-gainers`);if(!t)return;let r=e.filter(e=>e.symbol!==`IBOV`);t.innerHTML=r.map(e=>{let t=e.regularMarketChangePercent||0;return`
          <tr class="ledger-row" style="background: var(--surface-color); transition: var(--transition);">
            <td style="padding: 1.2rem; border-radius: 12px 0 0 12px; font-weight: 700; color: var(--primary-color);">${e.symbol}</td>
            <td style="padding: 1.2rem; font-size: 0.9rem; color: var(--text-muted);">${e.longName||e.shortName||`---`}</td>
            <td style="padding: 1.2rem; font-weight: 600;">R$ ${e.regularMarketPrice.toFixed(2)}</td>
            <td style="padding: 1.2rem; font-weight: 700; color: ${t>=0?`#00e676`:`#ff5252`};">
              ${t>=0?`+`:``}${t.toFixed(2)}%
            </td>
            <td style="padding: 1.2rem; border-radius: 0 12px 12px 0; text-align: right;">
              <div style="width: 80px; height: 30px; margin-left: auto; background: ${t>=0?`rgba(0,230,118,0.05)`:`rgba(255,82,82,0.05)`}; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                 <i data-lucide="trending-${t>=0?`up`:`down`}" style="width: 16px; color: ${t>=0?`#00e676`:`#ff5252`}"></i>
              </div>
            </td>
          </tr>
        `}).join(``),n.innerHTML=[...r].sort((e,t)=>(t.regularMarketChangePercent||0)-(e.regularMarketChangePercent||0)).slice(0,3).map(e=>`
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: rgba(0,230,118,0.03); border-radius: 10px; border: 1px solid rgba(0,230,118,0.1);">
          <div style="font-weight: 600;">${e.symbol}</div>
          <div style="color: #00e676; font-weight: 700;">+${(e.regularMarketChangePercent||0).toFixed(2)}%</div>
        </div>
      `).join(``),lucide.createIcons()},r=()=>{let e=[{symbol:`PETR4`,longName:`Petróleo Brasileiro S.A. - Petrobras`,regularMarketPrice:41.2,regularMarketChangePercent:1.25},{symbol:`VALE3`,longName:`Vale S.A.`,regularMarketPrice:68.45,regularMarketChangePercent:-.45},{symbol:`ITUB4`,longName:`Itaú Unibanco Holding S.A.`,regularMarketPrice:34.12,regularMarketChangePercent:.82},{symbol:`BBDC4`,longName:`Banco Bradesco S.A.`,regularMarketPrice:14.5,regularMarketChangePercent:-1.1},{symbol:`ABEV3`,longName:`Ambev S.A.`,regularMarketPrice:12.15,regularMarketChangePercent:.15},{symbol:`IBOV`,regularMarketPrice:127450,regularMarketChangePercent:.42}];n(e),t(e)};e()}},y=[`😊`,`😎`,`🤑`,`🦁`,`🐯`,`🦊`,`🐻`,`🐼`,`🦄`,`🚀`,`💎`,`⚡`],b={render:()=>{let{settings:e={}}=i.state,t=i.activeProfile;return`
      <div class="fade-in" style="display:flex;flex-direction:column;gap:1.5rem;">

        <!-- ── Perfis ────────────────────────────────────────────── -->
        <div class="glass" style="padding:1.5rem;">
          <h3 style="margin-bottom:1.5rem;display:flex;align-items:center;gap:.6rem;">
            <i data-lucide="user-circle" style="color:var(--primary-color);width:20px;"></i>
            Perfis
          </h3>

          <!-- Lista de perfis -->
          <div style="display:flex;flex-direction:column;gap:.75rem;margin-bottom:1.5rem;" id="profile-list">
            ${i.profiles.map(e=>`
              <div class="settings-row ${e.id===t.id?`active-profile`:``}">
                <div style="display:flex;align-items:center;gap:.9rem;">
                  <span style="font-size:1.8rem;line-height:1;">${o(e.avatar)}</span>
                  <div>
                    <div style="font-weight:600;">${o(e.name)}</div>
                    <div style="font-size:.75rem;color:var(--text-muted);">
                      ${e.id===t.id?`<span style="color:var(--primary-color);">● Ativo</span>`:`Inativo`}
                    </div>
                  </div>
                </div>
                <div style="display:flex;gap:.4rem;">
                  <button class="card-action-icon" onclick="window.openEditProfile('${o(e.id)}')" title="Editar">
                    <i data-lucide="edit-3" style="width:14px;"></i>
                  </button>
                  ${e.id===t.id?``:`
                    <button class="card-action-icon" onclick="window.switchToProfile('${o(e.id)}')" title="Ativar" style="background:rgba(0,229,255,.1);border-color:rgba(0,229,255,.3);">
                      <i data-lucide="log-in" style="width:14px;color:var(--primary-color);"></i>
                    </button>
                    <button class="card-action-icon delete" onclick="window.deleteProfile('${o(e.id)}')" title="Excluir">
                      <i data-lucide="trash-2" style="width:14px;"></i>
                    </button>
                  `}
                </div>
              </div>
            `).join(``)}
          </div>

          <button class="btn btn-primary" id="btn-create-profile" style="width:100%;justify-content:center;">
            <i data-lucide="plus" style="width:16px;"></i> Novo Perfil
          </button>
        </div>

        <!-- ── Dados & Backup ────────────────────────────────────── -->
        <div class="glass" style="padding:1.5rem;">
          <h3 style="margin-bottom:1.5rem;display:flex;align-items:center;gap:.6rem;">
            <i data-lucide="database" style="color:var(--primary-color);width:20px;"></i>
            Dados & Backup
          </h3>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
            <button class="btn btn-ghost settings-action-btn" id="btn-export-json">
              <i data-lucide="download" style="width:16px;"></i>
              Exportar JSON
            </button>
            <button class="btn btn-ghost settings-action-btn" id="btn-export-csv">
              <i data-lucide="file-spreadsheet" style="width:16px;"></i>
              Exportar CSV
            </button>
          </div>

          <label class="btn btn-ghost settings-action-btn" style="width:100%;justify-content:center;cursor:pointer;margin-bottom:1rem;">
            <i data-lucide="upload" style="width:16px;"></i>
            Importar JSON
            <input type="file" id="import-file" accept=".json" style="display:none;">
          </label>

          <div style="border-top:1px solid var(--border-color);padding-top:1rem;margin-top:.5rem;">
            <button class="btn settings-action-btn" id="btn-reset-data"
              style="width:100%;justify-content:center;background:rgba(255,61,0,.08);border:1px solid rgba(255,61,0,.3);color:#ff5252;">
              <i data-lucide="alert-triangle" style="width:16px;"></i>
              Resetar Todos os Dados
            </button>
            <p style="font-size:.75rem;color:var(--text-muted);text-align:center;margin-top:.5rem;">
              Esta ação é irreversível. Faça um backup antes.
            </p>
          </div>
        </div>

        <!-- ── Preferências ──────────────────────────────────────── -->
        <div class="glass" style="padding:1.5rem;">
          <h3 style="margin-bottom:1.5rem;display:flex;align-items:center;gap:.6rem;">
            <i data-lucide="sliders" style="color:var(--primary-color);width:20px;"></i>
            Preferências
          </h3>

          <div class="form-group">
            <label>Vista padrão ao abrir</label>
            <select id="pref-default-view" class="input-field">
              <option value="dashboard" ${e.defaultView===`dashboard`?`selected`:``}>Dashboard</option>
              <option value="cards"     ${e.defaultView===`cards`?`selected`:``}>Cartões</option>
              <option value="income"    ${e.defaultView===`income`?`selected`:``}>Fontes de Renda</option>
              <option value="transactions" ${e.defaultView===`transactions`?`selected`:``}>Transações</option>
            </select>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;background:rgba(255,255,255,.02);border-radius:12px;border:1px solid var(--border-color);">
            <div>
              <div style="font-weight:500;">Notificações de vencimento</div>
              <div style="font-size:.8rem;color:var(--text-muted);">Alerta quando fatura vence em até 5 dias</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="pref-notifications" ${e.notificationsEnabled===!1?``:`checked`}>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div style="margin-top:1rem;text-align:right;">
            <button class="btn btn-primary" id="btn-save-prefs">
              <i data-lucide="save" style="width:16px;"></i>
              Salvar Preferências
            </button>
          </div>
        </div>

      </div>

      <!-- ── Modal Criar/Editar Perfil ──────────────────────────── -->
      <div id="profile-modal" class="modal-overlay">
        <div class="modal-content glass">
          <h2 id="profile-modal-title" style="margin-bottom:1.5rem;">Novo Perfil</h2>
          <input type="hidden" id="profile-modal-id">

          <div class="form-group">
            <label>Nome do Perfil</label>
            <input type="text" id="profile-modal-name" class="input-field" placeholder="Ex: João Silva" required maxlength="30">
          </div>

          <div class="form-group">
            <label>Avatar</label>
            <div style="display:flex;flex-wrap:wrap;gap:.6rem;margin-top:.3rem;" id="avatar-picker">
              ${y.map(e=>`
                <button type="button" class="avatar-option" data-avatar="${e}"
                  style="font-size:1.6rem;background:rgba(255,255,255,.05);border:2px solid transparent;
                         border-radius:10px;width:44px;height:44px;cursor:pointer;transition:all .2s;">
                  ${e}
                </button>
              `).join(``)}
            </div>
            <input type="hidden" id="profile-modal-avatar" value="😊">
          </div>

          <div class="modal-footer">
            <button type="button" id="btn-close-profile-modal" class="btn btn-ghost" style="flex:1;">Cancelar</button>
            <button type="button" id="btn-save-profile" class="btn btn-primary" style="flex:2;">Salvar Perfil</button>
          </div>
        </div>
      </div>
    `},init:()=>{let e=(e,t,n)=>{let r=new Blob([e],{type:n}),i=URL.createObjectURL(r),a=Object.assign(document.createElement(`a`),{href:i,download:t});document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i)},t=()=>new Date().toISOString().slice(0,10);document.getElementById(`btn-export-json`).onclick=()=>{e(i.exportJSON(),`vizfin_backup_${t()}.json`,`application/json`)},document.getElementById(`btn-export-csv`).onclick=()=>{e(`﻿`+i.exportCSV(),`vizfin_transacoes_${t()}.csv`,`text/csv;charset=utf-8`)},document.getElementById(`import-file`).onchange=e=>{let t=e.target.files[0];if(!t)return;let n=new FileReader;n.onload=e=>{let t=i.importJSON(e.target.result);window.showToast(t?`✅ Dados importados com sucesso!`:`❌ Arquivo inválido ou corrompido.`,t?`success`:`error`),t&&window.app.navigateTo(`dashboard`)},n.readAsText(t)},document.getElementById(`btn-reset-data`).onclick=()=>{window.showConfirm(`⚠️ Tem certeza? Todos os dados deste perfil serão apagados permanentemente.`,()=>{i.resetData(),window.app.navigateTo(`dashboard`)})},document.getElementById(`btn-save-prefs`).onclick=()=>{i.updateSettings({defaultView:document.getElementById(`pref-default-view`).value,notificationsEnabled:document.getElementById(`pref-notifications`).checked}),window.showToast(`✅ Preferências salvas!`,`success`)};let n=document.getElementById(`profile-modal`),r=(e=null)=>{let t=document.getElementById(`profile-modal-name`),r=document.getElementById(`profile-modal-id`),a=document.getElementById(`profile-modal-avatar`),o=document.getElementById(`profile-modal-title`);if(t.value=``,r.value=``,a.value=`😊`,o.innerText=`Novo Perfil`,document.querySelectorAll(`.avatar-option`).forEach(e=>e.style.borderColor=`transparent`),e){let n=i.profiles.find(t=>t.id===e);if(n){t.value=n.name,r.value=n.id,a.value=n.avatar||`😊`,o.innerText=`Editar Perfil`;let e=document.querySelector(`.avatar-option[data-avatar="${n.avatar}"]`);e&&(e.style.borderColor=`var(--primary-color)`)}}else{let e=document.querySelector(`.avatar-option`);e&&(e.style.borderColor=`var(--primary-color)`)}n.classList.add(`active`)};document.getElementById(`btn-create-profile`).onclick=()=>r(),document.getElementById(`btn-close-profile-modal`).onclick=()=>n.classList.remove(`active`),window.openEditProfile=e=>r(e),window.switchToProfile=e=>{i.switchProfile(e),window.app.navigateTo(i.state.settings.defaultView||`dashboard`)},window.deleteProfile=e=>{let t=i.profiles.find(t=>t.id===e);window.showConfirm(`Excluir o perfil "${t?.name}"? Todos os dados dele serão perdidos.`,()=>{i.deleteProfile(e)?window.app.navigateTo(`settings`):window.showToast(`❌ Não é possível excluir o único perfil.`,`error`)})},document.querySelectorAll(`.avatar-option`).forEach(e=>{e.onclick=()=>{document.querySelectorAll(`.avatar-option`).forEach(e=>e.style.borderColor=`transparent`),e.style.borderColor=`var(--primary-color)`,document.getElementById(`profile-modal-avatar`).value=e.dataset.avatar}}),document.getElementById(`btn-save-profile`).onclick=()=>{let e=document.getElementById(`profile-modal-name`).value.trim(),t=document.getElementById(`profile-modal-avatar`).value,r=document.getElementById(`profile-modal-id`).value;if(!e){window.showToast(`❌ Informe um nome para o perfil.`,`error`);return}r?i.updateProfile(r,{name:e,avatar:t}):i.createProfile(e,t),n.classList.remove(`active`),window.app.navigateTo(`settings`)}}},x={render:()=>`
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
  `,init:()=>{let e=document.getElementById(`login-form`);e&&e.addEventListener(`submit`,t=>{t.preventDefault();let n=document.getElementById(`login-email`).value,r=document.getElementById(`login-password`).value,a=e.querySelector(`.login-submit-btn`),o=a.innerHTML;a.innerHTML=`<i data-lucide="loader-2" class="spin"></i> Autenticando...`,lucide.createIcons(),a.style.pointerEvents=`none`,setTimeout(()=>{if(i.login(n,r))window.showToast(`Bem-vindo de volta!`,`success`),window.app.navigateTo(`profile-select`);else{window.showToast(`Credenciais inválidas.`,`danger`),a.innerHTML=o,lucide.createIcons(),a.style.pointerEvents=`all`;let e=document.querySelector(`.login-glass-container`);e.classList.add(`shake`),setTimeout(()=>e.classList.remove(`shake`),500)}},1200)})}},S=`😊.😎.🧔.👩.🧑.👦.👧.🧓.🦸.🦹.🧙.🧝.🧛.🤖.👻.🐱.🐶.🦊.🐼.🦁.💰.📈.🚀.💎.🌟.🔥.⚡.🎯.🏆.💡`.split(`.`),C=(e,t)=>`
  <div class="profile-pick-card ${t?`edit-mode`:``}">
    <div class="profile-pick-avatar" data-action="${t?`edit-profile`:`select-profile`}" data-id="${e.id}">
      <span class="profile-pick-emoji">${e.avatar||`😊`}</span>
      ${t?`<div class="profile-pick-edit-overlay"><i data-lucide="pencil" style="width:24px;height:24px;"></i></div>`:``}
    </div>
    ${t?`<input class="profile-pick-name-input" type="text" value="${e.name}" data-id="${e.id}" maxlength="20">`:`<span class="profile-pick-name">${e.name}</span>`}
    ${t?`<button class="profile-pick-delete" data-action="delete-profile" data-id="${e.id}" title="Excluir"><i data-lucide="x" style="width:14px;height:14px;"></i></button>`:``}
  </div>
`,w=null,T=()=>{w&&document.body.contains(w)||(w=document.createElement(`div`),w.id=`profile-edit-modal`,w.className=`modal-overlay`,w.innerHTML=`
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
        ${S.map(e=>`<span class="emoji-opt" data-emoji="${e}" style="font-size:1.6rem;cursor:pointer;padding:.25rem;border-radius:8px;transition:var(--transition);">${e}</span>`).join(``)}
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
  `,document.body.appendChild(w),E())},E=()=>{let e=w,t=e.querySelector(`#avatar-preview`),n=e.querySelector(`#emoji-picker`),r=e.querySelector(`#profile-modal-avatar`);t.addEventListener(`click`,()=>{n.style.display=n.style.display===`flex`?`none`:`flex`}),n.addEventListener(`click`,e=>{let i=e.target.closest(`.emoji-opt`);if(!i)return;let a=i.dataset.emoji;r.value=a,t.textContent=a,n.style.display=`none`,n.querySelectorAll(`.emoji-opt`).forEach(e=>e.style.background=`transparent`),i.style.background=`rgba(0,229,255,.2)`}),e.querySelector(`#btn-cancel-profile-modal`).addEventListener(`click`,()=>{e.classList.remove(`active`)}),e.querySelector(`#btn-save-profile-modal`).addEventListener(`click`,()=>{let t=e.querySelector(`#profile-modal-name`).value.trim(),n=e.querySelector(`#profile-modal-avatar`).value,r=e.querySelector(`#profile-modal-id`).value;if(!t){window.showToast(`Digite um nome para o perfil.`,`error`);return}r?i.updateProfile(r,{name:t,avatar:n}):i.createProfile(t,n),e.classList.remove(`active`),window.app.navigateTo(`profile-select`)})},D=e=>{T();let t=w,n=t.querySelector(`#emoji-picker`);n.style.display=`none`,t.querySelectorAll(`.emoji-opt`).forEach(e=>e.style.background=`transparent`);let r=t.querySelector(`#profile-modal-title`),a=t.querySelector(`#profile-modal-name`),o=t.querySelector(`#profile-modal-id`),s=t.querySelector(`#profile-modal-avatar`),c=t.querySelector(`#avatar-preview`);if(e){let t=i.profiles.find(t=>t.id===e);if(!t)return;r.innerText=`Editar Perfil`,a.value=t.name,o.value=t.id,s.value=t.avatar||`😊`,c.textContent=t.avatar||`😊`}else r.innerText=`Novo Perfil`,a.value=``,o.value=``,s.value=`😊`,c.textContent=`😊`;t.classList.add(`active`),a.focus()},O={_editMode:!1,render:()=>{let e=i.profiles,t=O._editMode;return`
      <div class="profile-select-wrapper">
        <div class="profile-select-logo">
          <span style="background:var(--primary-gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;font-size:1.5rem;letter-spacing:2px;">VIZNANCEIRO</span>
        </div>

        <h1 class="profile-select-title">${t?`Gerenciar Perfis`:`Quem está gerenciando?`}</h1>

        <div class="profile-pick-grid">
          ${e.map(e=>C(e,t)).join(``)}

          ${t?``:`
            <div class="profile-pick-card" id="btn-add-profile">
              <div class="profile-pick-avatar add-new">
                <i data-lucide="plus" style="width:40px;height:40px;color:var(--text-muted);"></i>
              </div>
              <span class="profile-pick-name" style="color:var(--text-muted);">Adicionar perfil</span>
            </div>
          `}
        </div>

        <div class="profile-select-actions">
          ${t?`<button class="btn btn-primary" id="btn-finish-edit" style="min-width:180px;">Concluído</button>`:`<button class="btn btn-ghost" id="btn-manage-profiles" style="border:1px solid rgba(255,255,255,.3);color:var(--text-muted);min-width:180px;">Gerenciar Perfis</button>`}
        </div>
      </div>
    `},init:()=>{T(),lucide.createIcons(),document.getElementById(`content-area`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let{action:n,id:r}=t.dataset;if(n===`select-profile`){if(O._editMode)return;i.switchProfile(r);let e=i.activeProfile?.name||`você`;window.showToast(`Bem-vindo, ${e}!`,`success`),window.app.navigateTo(`dashboard`)}if(n===`edit-profile`){if(!O._editMode)return;D(r)}if(n===`delete-profile`){let e=i.profiles.find(e=>e.id===r);if(!e)return;window.showConfirm(`Excluir o perfil "${e.name}"? Todos os dados associados serão perdidos.`,()=>{i.deleteProfile(r),i.profiles.length===0&&(O._editMode=!1),window.app.navigateTo(`profile-select`)})}}),document.getElementById(`btn-add-profile`)?.addEventListener(`click`,()=>{D(null)}),document.getElementById(`btn-manage-profiles`)?.addEventListener(`click`,()=>{O._editMode=!0,window.app.navigateTo(`profile-select`)}),document.getElementById(`btn-finish-edit`)?.addEventListener(`click`,()=>{document.querySelectorAll(`.profile-pick-name-input`).forEach(e=>{let t=e.dataset.id,n=e.value.trim();n&&i.updateProfile(t,{name:n})}),O._editMode=!1,window.app.navigateTo(`profile-select`)})}},k={dashboard:a,cards:f,loans:p,income:m,transactions:g,projections:_,investments:v,settings:b,login:x,"profile-select":O},A={dashboard:`Dashboard`,cards:`Cartões`,loans:`Empréstimos`,income:`Fontes de Renda`,transactions:`Transações`,projections:`Projeções`,investments:`Investimentos`,settings:`Configurações`},j=class{constructor(){this.contentArea=document.getElementById(`content-area`),this.pageTitle=document.getElementById(`page-title`),this.navItems=document.querySelectorAll(`.nav-item[data-page]`),this.currentPage=`dashboard`,this._init()}_init(){let e=document.getElementById(`mobile-menu-toggle`),t=document.getElementById(`close-sidebar`),n=document.getElementById(`sidebar`),r=document.getElementById(`sidebar-overlay`),a=()=>{n.classList.toggle(`active`),r.classList.toggle(`active`)};e?.addEventListener(`click`,a),t?.addEventListener(`click`,a),r?.addEventListener(`click`,a),this.navItems.forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),this.navigateTo(e.dataset.page),n.classList.contains(`active`)&&a()})}),document.getElementById(`add-transaction-btn`)?.addEventListener(`click`,()=>{this.currentPage===`dashboard`||this.currentPage===`transactions`?this.showAddTransactionModal():this.currentPage===`loans`?document.getElementById(`btn-add-loan`)?.click():this.currentPage===`income`&&document.getElementById(`btn-add-income`)?.click()});let o=document.getElementById(`notification-bell`),s=document.getElementById(`notification-dropdown`);o&&s&&(o.addEventListener(`click`,()=>{let e=s.style.display===`flex`;s.style.display=e?`none`:`flex`}),document.addEventListener(`click`,e=>{!o.contains(e.target)&&!s.contains(e.target)&&(s.style.display=`none`)}));let c=document.getElementById(`profile-trigger`),l=document.getElementById(`profile-dropdown`);c&&l&&(c.addEventListener(`click`,e=>{e.stopPropagation();let t=l.style.display===`flex`;l.style.display=t?`none`:`flex`,!t&&s&&(s.style.display=`none`)}),document.addEventListener(`click`,e=>{!c.contains(e.target)&&!l.contains(e.target)&&(l.style.display=`none`)})),i.subscribe(()=>{this._refreshPage(),this._updateNotifications(),this._updateHeaderProfile()}),document.body.addEventListener(`click`,e=>{if(e.target.closest(`.btn-close-modal-x`)){let t=e.target.closest(`.modal-overlay`);t&&t.classList.remove(`active`)}e.target.classList.contains(`modal-overlay`)&&e.target.classList.remove(`active`);let t=e.target.closest(`.theme-btn`);if(t){let e=t.dataset.theme;i.updateSettings({theme:e})}}),document.body.addEventListener(`input`,e=>{e.target.classList.contains(`currency-input`)&&d(e.target)});let u=i.state.settings?.defaultView||`dashboard`;this.navigateTo(u),this._updateNotifications(),this._updateHeaderProfile(),lucide.createIcons()}navigateTo(e){!i.state.isAuthenticated&&e!==`login`?e=`login`:i.state.isAuthenticated&&e===`login`&&(e=`profile-select`),k[e]||(e=`dashboard`),this.currentPage=e,e===`login`||e===`profile-select`?document.body.classList.add(`unauthenticated`):document.body.classList.remove(`unauthenticated`),this.navItems.forEach(t=>t.classList.toggle(`active`,t.dataset.page===e)),this.pageTitle.innerText=A[e]||e;let t=document.getElementById(`add-transaction-btn`),n=document.getElementById(`add-card-header-btn`);e===`dashboard`||e===`transactions`?(t.style.display=`flex`,t.innerHTML=`<i data-lucide="plus"></i> Nova Transação`):e===`loans`?(t.style.display=`flex`,t.innerHTML=`<i data-lucide="plus"></i> Novo Empréstimo`):e===`income`?(t.style.display=`flex`,t.innerHTML=`<i data-lucide="plus"></i> Nova Fonte`):t.style.display=`none`,n.style.display=e===`cards`?`flex`:`none`;let r=this.contentArea.cloneNode(!1);this.contentArea.parentNode.replaceChild(r,this.contentArea),this.contentArea=r;let a=k[e];this.contentArea.innerHTML=a.render(),a.init?.(),lucide.createIcons(),this.applyTheme()}applyTheme(){let e=i.state.settings?.theme||`original`;document.body.classList.remove(`theme-light`,`theme-dark`),e!==`original`&&document.body.classList.add(`theme-${e}`),document.querySelectorAll(`.theme-btn`).forEach(t=>{let n=t.dataset.theme===e;t.style.background=n?`var(--surface-light)`:`transparent`,t.style.borderColor=n?`var(--primary-color)`:`var(--border-color)`})}_refreshPage(){let e=k[this.currentPage],t=this.contentArea.cloneNode(!1);this.contentArea.parentNode.replaceChild(t,this.contentArea),this.contentArea=t,this.contentArea.innerHTML=e.render(),e.init?.(),lucide.createIcons(),this.applyTheme()}_updateHeaderProfile(){let e=document.getElementById(`header-profile-avatar`),t=document.getElementById(`header-profile-name`),n=document.getElementById(`dropdown-active-avatar`),r=document.getElementById(`dropdown-active-name`),a=document.getElementById(`profile-list-container`),o=document.getElementById(`btn-logout`);if(!e||!a)return;let s=i.activeProfile;e.textContent=s.avatar||`😊`,t&&(t.textContent=s.name),n&&(n.textContent=s.avatar||`😊`),r&&(r.textContent=s.name);let c=i.profiles.filter(e=>e.id!==s.id);c.length===0?a.style.display=`none`:(a.style.display=``,a.innerHTML=c.map(e=>`
        <div class="profile-item" data-profile-id="${e.id}"
          style="display:flex;align-items:center;gap:.75rem;padding:.55rem .75rem;border-radius:10px;cursor:pointer;transition:var(--transition);">
          <div style="font-size:1.4rem;width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;">${e.avatar||`😊`}</div>
          <span style="font-size:.88rem;">${e.name}</span>
        </div>
      `).join(``),a.querySelectorAll(`.profile-item`).forEach(e=>{e.onmouseenter=()=>e.style.background=`rgba(255,255,255,.05)`,e.onmouseleave=()=>e.style.background=`transparent`,e.onclick=()=>{i.switchProfile(e.dataset.profileId),document.getElementById(`profile-dropdown`).style.display=`none`}}));let l=document.getElementById(`profile-dropdown`),u=document.getElementById(`dd-manage-profiles`);u&&(u.onclick=e=>{e.preventDefault(),l.style.display=`none`,O._editMode=!0,this.navigateTo(`profile-select`)});let d=document.getElementById(`dd-settings`);d&&(d.onclick=e=>{e.preventDefault(),l.style.display=`none`,this._openSettingsModal()}),o&&(o.onclick=e=>{e.preventDefault(),window.showConfirm(`Deseja realmente sair da aplicação? Seus dados estão salvos localmente.`,()=>{i.logout(),this.navigateTo(`login`)})})}_openSettingsModal(){let e=document.getElementById(`settings-popup-modal`);e||(e=document.createElement(`div`),e.id=`settings-popup-modal`,e.className=`modal-overlay`,e.style.cssText=`z-index:3000;`,e.innerHTML=`
        <div class="modal-content glass" style="max-width:560px;max-height:85vh;overflow-y:auto;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
            <h2 style="margin:0;">Configurações</h2>
            <button id="btn-close-settings-popup" class="btn btn-ghost btn-close-modal-x" style="padding:.4rem;">
              <i data-lucide="x" style="width:18px;"></i>
            </button>
          </div>
          <div id="settings-popup-body"></div>
        </div>
      `,document.body.appendChild(e));let{settings:t={}}=i.state;e.querySelector(`#settings-popup-body`).innerHTML=`
      <div style="margin-bottom:1.5rem;">
        <h4 style="display:flex;align-items:center;gap:.5rem;margin-bottom:1rem;color:var(--text-muted);font-size:.8rem;text-transform:uppercase;letter-spacing:1px;">
          <i data-lucide="sliders" style="width:14px;color:var(--primary-color);"></i> Preferências
        </h4>
        <div class="form-group" style="margin-bottom:1rem;">
          <label>Vista padrão ao abrir</label>
          <select id="sp-default-view" class="input-field">
            <option value="dashboard"    ${t.defaultView===`dashboard`?`selected`:``}>Dashboard</option>
            <option value="cards"        ${t.defaultView===`cards`?`selected`:``}>Cartões</option>
            <option value="income"       ${t.defaultView===`income`?`selected`:``}>Fontes de Renda</option>
            <option value="transactions" ${t.defaultView===`transactions`?`selected`:``}>Transações</option>
          </select>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;background:rgba(255,255,255,.02);border-radius:12px;border:1px solid var(--border-color);margin-bottom:1rem;">
          <div>
            <div style="font-weight:500;">Notificações de vencimento</div>
            <div style="font-size:.8rem;color:var(--text-muted);">Alerta quando fatura vence em até 5 dias</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="sp-notifications" ${t.notificationsEnabled===!1?``:`checked`}>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div style="text-align:right;">
          <button class="btn btn-primary" id="sp-save-prefs" style="min-width:160px;">
            <i data-lucide="save" style="width:16px;"></i> Salvar Preferências
          </button>
        </div>
      </div>
      <div style="border-top:1px solid var(--border-color);padding-top:1.5rem;">
        <h4 style="display:flex;align-items:center;gap:.5rem;margin-bottom:1rem;color:var(--text-muted);font-size:.8rem;text-transform:uppercase;letter-spacing:1px;">
          <i data-lucide="database" style="width:14px;color:var(--primary-color);"></i> Dados & Backup
        </h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem;">
          <button class="btn btn-ghost" id="sp-export-json" style="justify-content:center;"><i data-lucide="download" style="width:15px;"></i> Exportar JSON</button>
          <button class="btn btn-ghost" id="sp-export-csv"  style="justify-content:center;"><i data-lucide="file-spreadsheet" style="width:15px;"></i> Exportar CSV</button>
        </div>
        <label class="btn btn-ghost" style="width:100%;justify-content:center;cursor:pointer;margin-bottom:.75rem;display:flex;align-items:center;gap:.5rem;">
          <i data-lucide="upload" style="width:15px;"></i> Importar JSON
          <input type="file" id="sp-import-file" accept=".json" style="display:none;">
        </label>
        <button class="btn" id="sp-reset-data" style="width:100%;justify-content:center;background:rgba(255,61,0,.08);border:1px solid rgba(255,61,0,.3);color:#ff5252;">
          <i data-lucide="alert-triangle" style="width:15px;"></i> Resetar Todos os Dados
        </button>
        <p style="font-size:.75rem;color:var(--text-muted);text-align:center;margin-top:.4rem;">Esta ação é irreversível. Faça um backup antes.</p>
      </div>
    `,lucide.createIcons();let n=(e,t,n)=>{let r=new Blob([e],{type:n}),i=URL.createObjectURL(r),a=Object.assign(document.createElement(`a`),{href:i,download:t});document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i)},r=()=>new Date().toISOString().slice(0,10);e.querySelector(`#sp-save-prefs`).onclick=()=>{i.updateSettings({defaultView:e.querySelector(`#sp-default-view`).value,notificationsEnabled:e.querySelector(`#sp-notifications`).checked}),window.showToast(`Preferências salvas!`,`success`)},e.querySelector(`#sp-export-json`).onclick=()=>n(i.exportJSON(),`vizfin_backup_${r()}.json`,`application/json`),e.querySelector(`#sp-export-csv`).onclick=()=>n(`﻿`+i.exportCSV(),`vizfin_transacoes_${r()}.csv`,`text/csv;charset=utf-8`),e.querySelector(`#sp-import-file`).onchange=t=>{let n=t.target.files[0];if(!n)return;let r=new FileReader;r.onload=t=>{let n=i.importJSON(t.target.result);window.showToast(n?`Dados importados com sucesso!`:`Arquivo inválido.`,n?`success`:`error`),n&&(e.classList.remove(`active`),this.navigateTo(`dashboard`))},r.readAsText(n)},e.querySelector(`#sp-reset-data`).onclick=()=>{window.showConfirm(`⚠️ Tem certeza? Todos os dados deste perfil serão apagados.`,()=>{i.resetData(),e.classList.remove(`active`),this.navigateTo(`dashboard`)})},e.classList.add(`active`)}showAddTransactionModal(e=null){let t=document.getElementById(`transaction-modal`),n=document.getElementById(`transaction-form`),r=document.getElementById(`btn-close-trans-modal`),a=document.getElementById(`trans-card`),o=document.getElementById(`trans-type`),s=document.getElementById(`card-selection-group`),c=document.getElementById(`transaction-modal-title`),d=document.getElementById(`trans-id`),f=document.getElementById(`trans-category`),p=document.getElementById(`new-category-group`),m=document.getElementById(`new-category-input`),h=document.getElementById(`btn-save-category`),g=document.getElementById(`custom-categories-group`);n.reset(),d.value=``,c.innerText=`Nova Transação`,document.getElementById(`trans-date`).value=new Date().toISOString().slice(0,10),s.style.display=`block`,p.style.display=`none`;let{cards:_,transactions:v,customCategories:y=[]}=i.state;if(g.innerHTML=y.map(e=>`<option value="${e}">${e}</option>`).join(``),g.style.display=y.length>0?``:`none`,a.innerHTML=`<option value="">Nenhum (Dinheiro/Saldo)</option>`+_.map(e=>`<option value="${e.id}">${e.name} (**** ${e.lastDigits})</option>`).join(``),f.onchange=()=>{f.value===`__new__`?(p.style.display=`block`,m.focus()):p.style.display=`none`},h.onclick=()=>{let e=m.value.trim();if(!e){window.showToast(`Digite um nome para a categoria.`,`error`);return}if(!i.addCategory(e)){window.showToast(`Categoria já existe.`,`error`);return}let t=document.createElement(`option`);t.value=e,t.textContent=e,g.appendChild(t),g.style.display=``,f.value=e,p.style.display=`none`,m.value=``,window.showToast(`Categoria "${e}" criada!`,`success`)},e){let t=v.find(t=>t.id===e);if(t){c.innerText=`Editar Transação`,d.value=t.id,document.getElementById(`trans-desc`).value=t.description;let e=document.getElementById(`trans-amount`);if(e.value=l(t.amount),o.value=t.type,![...f.options].some(e=>e.value===t.category)&&t.category){let e=document.createElement(`option`);e.value=t.category,e.textContent=t.category,g.appendChild(e),g.style.display=``}f.value=t.category,document.getElementById(`trans-date`).value=t.date,a.value=t.cardId||``,s.style.display=t.type===`expense`?`block`:`none`}}o.onchange=()=>{s.style.display=o.value===`expense`?`block`:`none`},t.classList.add(`active`),r.onclick=()=>t.classList.remove(`active`),n.onsubmit=e=>{e.preventDefault();let n=f.value;if(n===`__new__`){window.showToast(`Salve a nova categoria antes de continuar.`,`error`);return}let r={description:document.getElementById(`trans-desc`).value,amount:u(document.getElementById(`trans-amount`).value),type:o.value,category:n,date:document.getElementById(`trans-date`).value,cardId:o.value===`expense`?a.value:null};d.value?i.updateTransaction(d.value,r):i.addTransaction(r),t.classList.remove(`active`)}}_updateNotifications(){if(i.state.settings?.notificationsEnabled===!1)return;let e=i.getAlerts(),t=document.getElementById(`notification-dot`),n=document.getElementById(`notification-dropdown`);!t||!n||(t.style.display=e.length>0?`block`:`none`,n.innerHTML=e.length===0?`<div style="text-align:center;color:var(--text-muted);font-size:.85rem;padding:1rem;">Nenhuma notificação.</div>`:`<h4 style="margin-bottom:.5rem;font-size:.9rem;border-bottom:1px solid var(--border-color);padding-bottom:.5rem;">Notificações</h4>
          ${e.map(e=>`
            <div style="display:flex;gap:.8rem;align-items:flex-start;padding:.8rem;background:var(--surface-light);border-radius:8px;border:1px solid var(--border-color);margin-bottom:.5rem;cursor:pointer;transition:var(--transition);" 
                 onclick="window.app.navigateTo('${e.view}'); document.getElementById('notification-dropdown').classList.remove('active');"
                 onmouseover="this.style.background='var(--surface-color)'" onmouseout="this.style.background='var(--surface-light)'">
              <i data-lucide="${e.type===`danger`?`alert-octagon`:`alert-triangle`}" style="color:${e.type===`danger`?`#ff3d00`:`var(--accent-color)`};width:18px;flex-shrink:0;"></i>
              <div style="font-size:.78rem;color:var(--text-muted);line-height:1.4;">${e.text}</div>
            </div>`).join(``)}`,lucide.createIcons())}};window.showConfirm=(e,t)=>{let n=document.getElementById(`confirm-modal`),r=document.getElementById(`confirm-modal-msg`),i=document.getElementById(`confirm-modal-ok`),a=document.getElementById(`confirm-modal-cancel`);r.innerText=e,n.classList.add(`active`);let o=()=>n.classList.remove(`active`);i.onclick=()=>{o(),t()},a.onclick=o},window.showToast=(e,t=`success`)=>{let n=document.getElementById(`app-toast`);n||(n=document.createElement(`div`),n.id=`app-toast`,document.body.appendChild(n)),n.innerText=e,n.className=`app-toast app-toast--${t} app-toast--visible`,clearTimeout(n._timeout),n._timeout=setTimeout(()=>n.classList.remove(`app-toast--visible`),3e3)},window.app=new j;