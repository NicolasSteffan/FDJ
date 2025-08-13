const toast = document.getElementById('toast');
const btn = document.getElementById('actionBtn');
const menu = document.querySelector('.menu');
const chart = document.getElementById('chart');
const menuCanvas = document.getElementById('menuCanvas');

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
}

