const toast = document.getElementById('toast');
const btn = document.getElementById('actionBtn');
const menu = document.querySelector('.menu');
const chart = document.getElementById('chart');
const menuCanvas = document.getElementById('menuCanvas');
const btnHealth = document.getElementById('btnHealth');
const healthOut = document.getElementById('healthOut');
const datePick = document.getElementById('datePick');
const btnPick = document.getElementById('btnPick');
const latestCard = document.getElementById('latestCard');

btn.addEventListener('click', () => {
  showToast('Action déclenchée (placeholder).');
});

menu.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-target]');
  if (!link) return;
  e.preventDefault();
  const targetId = link.getAttribute('data-target');
  switchPage(targetId);
});

// Réinitialise l'affichage des sous-menus à chaque mouvement de souris
menu.addEventListener('mouseover', (e) => {
  const item = e.target.closest('.menu-root > li');
  document.querySelectorAll('.submenu').forEach(s => (s.style.display = 'none'));
  if (!item) return;
  const sm = item.querySelector('.submenu');
  if (sm) sm.style.display = 'block';
});

menu.addEventListener('mouseleave', () => {
  document.querySelectorAll('.submenu').forEach(s => (s.style.display = 'none'));
});

window.addEventListener('resize', drawCylMenu);
window.addEventListener('load', drawCylMenu);

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2000);
}

function renderChart() {
  const width = 640; const height = 240; const padding = 28;
  const data = [5, 10, 8, 15, 20, 18, 24, 22, 27, 30];
  const maxV = Math.max(...data);
  const points = data.map((v, i) => {
    const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
    const y = height - padding - (v / maxV) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  chart.innerHTML = '';
  const grid = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  grid.setAttribute('stroke', 'rgba(255,255,255,0.12)');
  for (let i = 0; i < 5; i++) {
    const y = padding + i * ((height - 2 * padding) / 4);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', `${padding}`);
    line.setAttribute('x2', `${width - padding}`);
    line.setAttribute('y1', `${y}`);
    line.setAttribute('y2', `${y}`);
    grid.appendChild(line);
  }
  chart.appendChild(grid);

  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke', '#3fb6ff');
  polyline.setAttribute('stroke-width', '2');
  polyline.setAttribute('points', points);
  chart.appendChild(polyline);
}

function drawCylMenu() {
  if (!menuCanvas) return;
  const header = document.querySelector('.topbar');
  const dpr = window.devicePixelRatio || 1;
  const w = header.clientWidth;
  const h = header.clientHeight;
  menuCanvas.style.position = 'absolute';
  menuCanvas.style.left = '0';
  menuCanvas.style.top = '0';
  menuCanvas.style.width = w + 'px';
  menuCanvas.style.height = h + 'px';
  menuCanvas.width = Math.floor(w * dpr);
  menuCanvas.height = Math.floor(h * dpr);
  const ctx = menuCanvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const radius = Math.min(18, h / 2 - 2);
  const padding = 8;
  const barH = Math.max(h - padding * 2, 12);
  const barW = w - padding * 2;
  const x = padding;
  const y = (h - barH) / 2;

  const grd = ctx.createLinearGradient(0, y, 0, y + barH);
  grd.addColorStop(0, 'rgba(255,255,255,0.18)');
  grd.addColorStop(0.5, 'rgba(255,255,255,0.06)');
  grd.addColorStop(1, 'rgba(0,0,0,0.18)');

  ctx.beginPath();
  roundRect(ctx, x, y, barW, barH, radius);
  ctx.fillStyle = grd;
  ctx.fill();

  // highlight specular
  ctx.beginPath();
  roundRect(ctx, x + 2, y + 2, barW - 4, barH * 0.35, radius * 0.8);
  const hi = ctx.createLinearGradient(0, y + 2, 0, y + 2 + barH * 0.35);
  hi.addColorStop(0, 'rgba(255,255,255,0.25)');
  hi.addColorStop(1, 'rgba(255,255,255,0.02)');
  ctx.fillStyle = hi;
  ctx.fill();

  // shadow bottom
  ctx.beginPath();
  roundRect(ctx, x + 2, y + barH * 0.6, barW - 4, barH * 0.35, radius * 0.8);
  const sh = ctx.createLinearGradient(0, y + barH * 0.6, 0, y + barH);
  sh.addColorStop(0, 'rgba(0,0,0,0.08)');
  sh.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = sh;
  ctx.fill();
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, height / 2));
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function switchPage(id) {
  document.querySelectorAll('.page').forEach(sec => sec.classList.add('hidden'));
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden');
  if (id === 'page-monitor-metrics') {
    renderChart();
  }
  if (id === 'page-latest') {
    loadLatest();
  }
  if (id === 'page-history') {
    loadHistory();
  }
}

btnHealth?.addEventListener('click', async () => {
  healthOut.textContent = 'Chargement...';
  try {
    const p = await fetch('http://localhost:3001/ping', { cache: 'no-store' }).then(r => r.json());
    const h = await fetch('http://localhost:3001/health', { cache: 'no-store' }).then(r => r.json());
    healthOut.textContent = JSON.stringify({ ping: p, health: h }, null, 2);
  } catch (e) {
    healthOut.textContent = 'Erreur: ' + e.message;
  }
});

async function loadLatest() {
  latestCard.innerHTML = 'Chargement...';
  try {
    const full = await fetch('http://localhost:3001/draws/latest/full', { cache: 'no-store' }).then(r => r.json());
    renderDraw(full);
  } catch (e) { pre.textContent = 'Erreur: ' + e.message; }
}

async function loadHistory() {
  const limitSel = document.getElementById('histLimit');
  const limit = Number(limitSel?.value || 10);
  const tbody = document.querySelector('#historyTable tbody');
  const pageTxt = document.getElementById('pageInfo');
  if (!tbody) return;
  pageState.page = pageState.page || 1;
  pageState.limit = limit;
  pageTxt.textContent = `page ${pageState.page}`;
  tbody.innerHTML = '<tr><td colspan="3">Chargement...</td></tr>';
  try {
    const data = await fetch(`http://localhost:3001/draws?limit=${limit}`, { cache: 'no-store' }).then(r => r.json());
    tbody.innerHTML = '';
    data.forEach(d => {
      const tr = document.createElement('tr');
      const nums = document.createElement('div'); nums.className = 'balls compact'; d.numbers.forEach(n => { const b = formatBall(n, false); b.classList.add('small'); nums.appendChild(b); });
      const sts = document.createElement('div'); sts.className = 'balls compact'; d.stars.forEach(s => { const b = formatBall(s, true); b.classList.add('small'); sts.appendChild(b); });
      tr.innerHTML = `<td><span class=\"date-chip\">${formatYmd(d.date)}</span></td>`;
      const tdN = document.createElement('td'); tdN.appendChild(nums);
      const tdS = document.createElement('td'); tdS.appendChild(sts);
      tr.appendChild(tdN); tr.appendChild(tdS);
      tbody.appendChild(tr);
    });
  } catch (e) { 
    tbody.innerHTML = `<tr><td colspan=\"3\">Erreur: ${e.message}</td></tr>`;
  }
}

const pageState = {};
document.getElementById('btnHistLoad')?.addEventListener('click', () => { pageState.page = 1; loadHistory(); });
document.getElementById('prevPage')?.addEventListener('click', () => { if ((pageState.page||1) > 1) { pageState.page--; loadHistory(); } });
document.getElementById('nextPage')?.addEventListener('click', () => { pageState.page = (pageState.page||1) + 1; loadHistory(); });

function formatBall(n, isStar) {
  const d = document.createElement('div');
  d.className = 'ball' + (isStar ? ' star' : '');
  d.textContent = n;
  return d;
}

function money(v, c) { return (v || 0).toLocaleString('fr-FR', { style: 'currency', currency: c || 'EUR' }); }

function renderDraw(payload) {
  if (!payload || !payload.draw) { latestCard.textContent = 'Aucune donnée.'; return; }
  const { draw, breakdown } = payload;
  const wrap = document.createElement('div');
  const h = document.createElement('div'); h.className = 'draw-date'; h.textContent = `Tirage du ${formatYmd(draw.date)}`; wrap.appendChild(h);
  const balls = document.createElement('div'); balls.className = 'balls';
  draw.numbers.forEach(n => balls.appendChild(formatBall(n, false)));
  draw.stars.forEach(s => balls.appendChild(formatBall(s, true)));
  wrap.appendChild(balls);
  const table = document.createElement('table'); table.className = 'breakdown';
  table.innerHTML = '<thead><tr><th>Rang</th><th>Gagnants</th><th>Gain</th></tr></thead>';
  const tb = document.createElement('tbody');
  (breakdown || []).forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.rankLabel}</td><td>${r.winners.toLocaleString('fr-FR')}</td><td>${money(r.amount, r.currency)}</td>`;
    tb.appendChild(tr);
  });
  table.appendChild(tb);
  wrap.appendChild(table);
  latestCard.innerHTML = '';
  latestCard.appendChild(wrap);
}

function formatYmd(iso) {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const da = String(d.getDate()).padStart(2,'0');
    return `${da}/${m}/${y}`;
  } catch { return iso; }
}

btnPick?.addEventListener('click', async () => {
  if (!datePick.value) return;
  latestCard.innerHTML = 'Chargement...';
  try {
    const full = await fetch(`http://localhost:3001/draws/${datePick.value}/full`, { cache: 'no-store' }).then(r => r.json());
    renderDraw(full);
  } catch (e) { latestCard.textContent = 'Erreur: ' + e.message; }
});

// le bouton Charger enchaîne: POST /scrape/run puis GET /draws/:date/full
btnPick?.addEventListener('click', async () => {
  const date = datePick.value || '';
  latestCard.innerHTML = 'Chargement...';
  try {
    if (date) {
      await fetch(`http://localhost:3001/scrape/run?date=${date}`, { method: 'POST' }).then(r => r.json());
      const full = await fetch(`http://localhost:3001/draws/${date}/full`, { cache: 'no-store' });
      if (full.ok) { renderDraw(await full.json()); return; }
      latestCard.textContent = 'Aucun résultat pour cette date.';
      return;
    }
    const full = await fetch('http://localhost:3001/draws/latest/full', { cache: 'no-store' });
    if (full.ok) { renderDraw(await full.json()); return; }
    latestCard.textContent = 'Aucun résultat disponible.';
  } catch (e) { latestCard.textContent = 'Erreur: ' + e.message; }
});

