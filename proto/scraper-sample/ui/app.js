let selectedDate = '2025-08-08';

function $(sel) { return document.querySelector(sel); }
function showError(id, message, data) {
  const el = $(id);
  el.hidden = false;
  el.textContent = message + (data ? `\n${JSON.stringify(data, null, 2)}` : '');
}
function hideError(id) {
  const el = $(id);
  if (el) { el.hidden = true; el.textContent = ''; }
}

function showJson(id, data, ok=true) {
  const el = $(id);
  if (!el) return;
  el.hidden = false;
  el.classList.remove('ok','error');
  el.classList.add(ok ? 'ok' : 'error');
  el.textContent = JSON.stringify(data, null, 2);
}

function formatNums(values, isStar=false) {
  const arr = values || [];
  return arr.map(v => `<span class="chip${isStar ? ' star' : ''}">${v}</span>`).join('');
}

function renderTirage(tirageArray) {
  const status = $('#tirageStatus');
  const errBox = '#tirage-error';
  const numsBox = $('#numbers');
  const starsBox = $('#stars');
  const dateText = $('#dateText');

  if (!Array.isArray(tirageArray)) {
    showError(errBox, 'Tirage indisponible', tirageArray);
    status.textContent = 'erreur'; status.className = 'status error';
    return;
  }
  const data = tirageArray[0];
  if (!data) {
    showError(errBox, 'Tirage indisponible');
    status.textContent = 'vide'; status.className = 'status empty';
    return;
  }
  hideError(errBox);
  numsBox.innerHTML = formatNums(data.numbers || data.numeros, false);
      starsBox.innerHTML = formatNums(data.stars, true);
  dateText.textContent = data.date || (selectedDate + 'T00:00:00.000Z');
  status.textContent = 'OK'; status.className = 'status ok';
}

function formatMoney(amount, currency) {
  if (typeof amount !== 'number') return `${amount ?? ''} ${currency ?? ''}`;
  try { return amount.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' ' + (currency || ''); }
  catch { return `${amount} ${currency ?? ''}`; }
}

function renderGains(tirageArray) {
  const status = $('#gainsStatus');
  const errBox = '#gains-error';
  const tableBox = $('#gainsTable');
  const totalsBox = $('#gainsTotals');

  if (!Array.isArray(tirageArray)) {
    showError(errBox, 'Gains indisponibles', tirageArray);
    status.textContent = 'erreur'; status.className = 'status error';
    return;
  }
  const data = tirageArray[0];
  const rows = (data && data.breakdown) || [];
  if (!data) { showError(errBox, 'Gains indisponibles'); status.textContent = 'vide'; status.className = 'status empty'; return; }
  if (!Array.isArray(rows) || rows.length === 0) { showError(errBox, 'Aucun gain trouvé pour cette source/date', data.meta); status.textContent = 'vide'; status.className = 'status empty'; return; }

  const html = [`<table class="table"><thead><tr><th>Rang</th><th>Gagnants</th><th>Montant</th></tr></thead><tbody>`];
  for (const r of rows) {
    html.push(`<tr>
      <td>${r.rankLabel || r.rank || ''}</td>
      <td>${r.winners ?? ''}</td>
      <td>${formatMoney(r.amount, r.currency)}</td>
    </tr>`);
  }
  html.push('</tbody></table>');
  tableBox.innerHTML = html.join('');

  // Totaux avec/sans étoiles si présents
  totalsBox.innerHTML = '';
  const agg = data.meta && data.meta.aggregate;
  if (agg) {
    const ws = agg.withStars || { totalWinners: 0, totalPayout: 0, currency: '' };
    const wos = agg.withoutStars || { totalWinners: 0, totalPayout: 0, currency: '' };
    totalsBox.innerHTML = `
      <div>Avec étoiles: ${ws.totalWinners} gagnants – ${formatMoney(ws.totalPayout, ws.currency)}</div>
      <div>Sans étoiles: ${wos.totalWinners} gagnants – ${formatMoney(wos.totalPayout, wos.currency)}</div>
    `;
  }
  hideError(errBox);
  status.textContent = 'OK'; status.className = 'status ok';
}



async function loadJson(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function renderDiagnostics(tirageArray) {
  const list = $('#diagList');
  const items = [];

  // tirage meta.errors
  try {
    const meta = Array.isArray(tirageArray) && tirageArray[0] && tirageArray[0].meta;
    const errs = (meta && meta.errors) || [];
    for (const er of errs) {
      items.push(`<div class="item"><div><span class="key">[TIRAGE]</span> ${er.provider || ''} – ${er.status || ''}</div><div>${er.endpoint || ''}</div><div>${er.message || ''}</div></div>`);
    }
  } catch {}

  list.innerHTML = items.join('') || '<div class="muted">Aucun diagnostic.</div>';
}

function buildDataPaths(ymd) {
  // Endpoints fixes pour proto; extensions futures pourront mapper la date vers d'autres fichiers
  return {
    tirage: '../data/tirage.json'
  };
}

async function main() {
  $('#global-status').textContent = 'Chargement...';
  try {
    // Appel API interne pour scrapper et écrire les JSON, sans .bat
    await fetch(`/api/scrape?date=${selectedDate}`, { cache: 'no-store' });
    const paths = buildDataPaths(selectedDate);
    const tirage = await loadJson(paths.tirage).catch(e => ({ error: e.message }));
    renderTirage(tirage);
    renderGains(tirage);
    renderDiagnostics(tirage);
    $('#global-status').textContent = 'OK';
  } catch (e) {
    $('#global-status').textContent = 'Erreur: ' + e.message;
  }
}

document.getElementById('reloadBtn').addEventListener('click', main);
document.getElementById('datePicker').addEventListener('change', (e) => {
  selectedDate = e.target.value || '2025-08-08';
  main();
});

main();

