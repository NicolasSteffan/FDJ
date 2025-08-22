// ========================================
// PAGE T2 - JavaScript
// ========================================

// ========================================
// GESTION SECTIONS PLIABLES T2 (style tirage-tag)
// ========================================

// Fonction pour basculer les sections T2 (utilise le système tirage-tag)
function toggleTirageTag(tagId) {
  const tag = document.getElementById(tagId);
  const content = tag.querySelector('.tirage-tag-content');
  const led = tag.querySelector('.led_generique_petite');
  const arrow = tag.querySelector('.tirage-expand-arrow');
  
  if (tag.classList.contains('collapsed')) {
    // Déplier
    tag.classList.remove('collapsed');
    tag.classList.add('expanded');
    led.classList.remove('collapsed');
    led.classList.add('expanded');
    arrow.textContent = '▲';
  } else {
    // Plier
    tag.classList.remove('expanded');
    tag.classList.add('collapsed');
    led.classList.remove('expanded');
    led.classList.add('collapsed');
    arrow.textContent = '▼';
  }
}

// ========================================
// FONCTIONS CLEAR POUR CHAQUE SECTION
// ========================================

// Section Alpha
function clearAlphaLog() {
  const alphaContent = document.getElementById('alpha-content');
  if (alphaContent) {
    alphaContent.innerHTML = `
      <div style="color: #ffff00; margin-bottom: 10px;">📡 Section Alpha</div>
      <div>Section Alpha initialisée</div>
      <div style="color: #888; margin-top: 10px;">Prêt...</div>
    `;
  }
}

// Section Beta
function clearBetaLog() {
  const betaContent = document.getElementById('beta-content');
  if (betaContent) {
    betaContent.innerHTML = `
      <div style="color: #ffff00; margin-bottom: 10px;">📡 Section Beta</div>
      <div>Section Beta initialisée</div>
      <div style="color: #888; margin-top: 10px;">Prêt...</div>
    `;
  }
}

// Section Gamma
function clearGammaLog() {
  const gammaContent = document.getElementById('gamma-content');
  if (gammaContent) {
    gammaContent.innerHTML = `
      <div style="color: #ffff00; margin-bottom: 10px;">📡 Section Gamma</div>
      <div>Section Gamma initialisée</div>
      <div style="color: #888; margin-top: 10px;">Prêt...</div>
    `;
  }
}

// Section Delta
function clearDeltaLog() {
  const deltaContent = document.getElementById('delta-content');
  if (deltaContent) {
    deltaContent.innerHTML = `
      <div style="color: #ffff00; margin-bottom: 10px;">📡 Section Delta</div>
      <div>Section Delta initialisée</div>
      <div style="color: #888; margin-top: 10px;">Prêt...</div>
    `;
  }
}

// Section Epsilon
function clearEpsilonLog() {
  const epsilonContent = document.getElementById('epsilon-content');
  if (epsilonContent) {
    epsilonContent.innerHTML = `
      <div style="color: #ffff00; margin-bottom: 10px;">📡 Section Epsilon</div>
      <div>Section Epsilon initialisée</div>
      <div style="color: #888; margin-top: 10px;">Prêt...</div>
    `;
  }
}

// Section Zeta
function clearZetaLog() {
  const zetaContent = document.getElementById('zeta-content');
  if (zetaContent) {
    zetaContent.innerHTML = `
      <div style="color: #ffff00; margin-bottom: 10px;">📡 Section Zeta</div>
      <div>Section Zeta initialisée</div>
      <div style="color: #888; margin-top: 10px;">Prêt...</div>
    `;
  }
}

// Section Eta
function clearEtaLog() {
  const etaContent = document.getElementById('eta-content');
  if (etaContent) {
    etaContent.innerHTML = `
      <div style="color: #ffff00; margin-bottom: 10px;">📡 Section Eta</div>
      <div>Section Eta initialisée</div>
      <div style="color: #888; margin-top: 10px;">Prêt...</div>
    `;
  }
}

// Section Theta
function clearThetaLog() {
  const thetaContent = document.getElementById('theta-content');
  if (thetaContent) {
    thetaContent.innerHTML = `
      <div style="color: #ffff00; margin-bottom: 10px;">📡 Section Theta</div>
      <div>Section Theta initialisée</div>
      <div style="color: #888; margin-top: 10px;">Prêt...</div>
    `;
  }
}

// Section Iota
function clearIotaLog() {
  const iotaContent = document.getElementById('iota-content');
  if (iotaContent) {
    iotaContent.innerHTML = `
      <div style="color: #ffff00; margin-bottom: 10px;">📡 Section Iota</div>
      <div>Section Iota initialisée</div>
      <div style="color: #888; margin-top: 10px;">Prêt...</div>
    `;
  }
}

// Section Kappa
function clearKappaLog() {
  const kappaContent = document.getElementById('kappa-content');
  if (kappaContent) {
    kappaContent.innerHTML = `
      <div style="color: #ffff00; margin-bottom: 10px;">📡 Section Kappa</div>
      <div>Section Kappa initialisée</div>
      <div style="color: #888; margin-top: 10px;">Prêt...</div>
    `;
  }
}

// ========================================
// FONCTIONS D'AJOUT DE LOGS POUR CHAQUE SECTION
// ========================================

// Fonction générique pour ajouter du contenu à une section
function addLogToSection(sectionId, message, type = 'info') {
  const sectionContent = document.getElementById(sectionId + '-content');
  if (sectionContent) {
    const timestamp = new Date().toLocaleTimeString();
    let color = '#00ff00'; // vert par défaut
    
    switch(type) {
      case 'error': color = '#ff0000'; break;
      case 'warning': color = '#ffff00'; break;
      case 'success': color = '#00ff00'; break;
      case 'info': color = '#00ffff'; break;
    }
    
    const logEntry = document.createElement('div');
    logEntry.style.color = color;
    logEntry.innerHTML = `[${timestamp}] ${message}`;
    
    sectionContent.appendChild(logEntry);
    sectionContent.scrollTop = sectionContent.scrollHeight;
  }
}

// Fonctions spécifiques pour chaque section
function addAlphaLog(message, type = 'info') {
  addLogToSection('alpha', message, type);
}

function addBetaLog(message, type = 'info') {
  addLogToSection('beta', message, type);
}

function addGammaLog(message, type = 'info') {
  addLogToSection('gamma', message, type);
}

function addDeltaLog(message, type = 'info') {
  addLogToSection('delta', message, type);
}

function addEpsilonLog(message, type = 'info') {
  addLogToSection('epsilon', message, type);
}

function addZetaLog(message, type = 'info') {
  addLogToSection('zeta', message, type);
}

function addEtaLog(message, type = 'info') {
  addLogToSection('eta', message, type);
}

function addThetaLog(message, type = 'info') {
  addLogToSection('theta', message, type);
}

function addIotaLog(message, type = 'info') {
  addLogToSection('iota', message, type);
}

function addKappaLog(message, type = 'info') {
  addLogToSection('kappa', message, type);
}

// ========================================
// INITIALISATION PAGE T2
// ========================================

// Initialiser la page T2
function initializeT2() {
  console.log('Page T2 initialisée');
  
  // Ajouter des messages de test dans quelques sections
  setTimeout(() => {
    addAlphaLog('Section Alpha prête', 'success');
    addBetaLog('Section Beta prête', 'success');
    addGammaLog('Section Gamma prête', 'success');
  }, 1000);
}

// Auto-initialisation si on est dans le navigateur
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si on est sur la page T2
    if (document.getElementById('alpha-main-tag')) {
      initializeT2();
    }
  });
}
