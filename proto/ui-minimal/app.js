const toast = document.getElementById('toast');
const btn = document.getElementById('actionBtn');
const menuMonitoring = document.getElementById('menu-monitoring');
const monitoringSection = document.getElementById('monitoring');
const chart = document.getElementById('chart');

btn.addEventListener('click', () => { showToast('Action déclenchée (placeholder).'); });
menuMonitoring.addEventListener('click', (e) => { e.preventDefault(); monitoringSection.classList.toggle('hidden'); if (!monitoringSection.classList.contains('hidden')) { renderChart(); } });

function showToast(message) { toast.textContent = message; toast.classList.remove('hidden'); setTimeout(() => toast.classList.add('hidden'), 2000); }

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
    line.setAttribute('x1', `${padding}`); line.setAttribute('x2', `${width - padding}`);
    line.setAttribute('y1', `${y}`); line.setAttribute('y2', `${y}`);
    grid.appendChild(line);
  }
  chart.appendChild(grid);
  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('fill', 'none'); polyline.setAttribute('stroke', '#3fb6ff'); polyline.setAttribute('stroke-width', '2');
  polyline.setAttribute('points', points);
  chart.appendChild(polyline);
}
