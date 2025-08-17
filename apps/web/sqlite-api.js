// ========================================
// FDJ SQLite Backend API Client
// ========================================

const SQLITE_API_BASE = 'http://localhost:3001/api';

// Configuration de l'API
const API_CONFIG = {
  timeout: 10000, // 10 secondes
  retries: 3
};

// ========================================
// Fonctions utilitaires
// ========================================

function addDumpLog(message, color = '#00ff00') {
  const dumpContent = document.getElementById('sqlite-dump-content');
  if (dumpContent) {
    const logLine = document.createElement('div');
    logLine.style.color = color;
    logLine.style.marginBottom = '2px';
    logLine.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
    dumpContent.appendChild(logLine);
    dumpContent.scrollTop = dumpContent.scrollHeight;
  }
}

function clearDumpLog() {
  const dumpContent = document.getElementById('sqlite-dump-content');
  if (dumpContent) {
    dumpContent.innerHTML = `
      <div style="color: #ffff00; margin-bottom: 10px;">📡 SQLite Backend Connection Tracer</div>
      <div>yesdata</div>
      <div style="color: #888; margin-top: 10px;">Attente connexions...</div>
    `;
  }
}

// Fonction utilitaire pour mettre à jour les LEDs de test
function updateTestLED(testId, status, message) {
  const led = document.getElementById(`${testId}-led`);
  
  if (led) {
    // Nettoyer les anciennes classes
    led.classList.remove('collapsed', 'expanded', 'testing', 'failed', 'success', 'warning');
    
    // Appliquer le nouveau statut
    switch (status) {
      case 'testing':
        led.classList.add('testing');
        led.style.background = '#ff8c00';
        break;
      case 'success':
        led.classList.add('expanded');
        led.style.background = '#00ff00';
        break;
      case 'failed':
        led.classList.add('failed');
        led.style.background = '#ff0000';
        break;
      case 'warning':
        led.classList.add('warning');
        led.style.background = '#ffaa00';
        break;
      default:
        led.classList.add('collapsed');
        led.style.background = '#666';
    }
    
    // Ajouter le message si fourni
    if (message) {
      addDumpLog(message, status === 'success' ? '#00ff00' : status === 'failed' ? '#ff0000' : '#ffaa00');
    }
  }
}

// ========================================
// Fonctions API Backend SQLite
// ========================================

async function testSQLiteBackendConnection() {
  addDumpLog('🔄 Test connexion backend SQLite...', '#ffff00');
  
  try {
    const response = await fetch(`${SQLITE_API_BASE}/test-connection`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      addDumpLog('✅ Connexion backend SQLite réussie', '#00ff00');
      addDumpLog(`⏰ Heure serveur: ${result.server_time}`, '#00ff00');
      return true;
    } else {
      addDumpLog(`❌ Erreur backend: ${result.error}`, '#ff0000');
      return false;
    }
  } catch (error) {
    addDumpLog(`❌ Erreur connexion backend: ${error.message}`, '#ff0000');
    return false;
  }
}

async function getSQLiteBackendTableData(tableName) {
  addDumpLog(`🔍 Récupération données table: ${tableName}`, '#ffff00');
  
  try {
    const response = await fetch(`${SQLITE_API_BASE}/tables/${tableName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      addDumpLog(`✅ Données récupérées: ${result.count} enregistrements`, '#00ff00');
      return result.data;
    } else {
      addDumpLog(`❌ Erreur récupération: ${result.error}`, '#ff0000');
      return [];
    }
  } catch (error) {
    addDumpLog(`❌ Erreur récupération données: ${error.message}`, '#ff0000');
    return [];
  }
}

async function recreateSQLiteBackendDatabase() {
  addDumpLog('🔄 Recréation base de données SQLite...', '#ffff00');
  
  try {
    const response = await fetch(`${SQLITE_API_BASE}/recreate-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      addDumpLog('✅ Base de données recréée avec succès', '#00ff00');
      addDumpLog('📝 Données de démonstration insérées', '#00ff00');
      return true;
    } else {
      addDumpLog(`❌ Erreur recréation: ${result.error}`, '#ff0000');
      return false;
    }
  } catch (error) {
    addDumpLog(`❌ Erreur recréation base: ${error.message}`, '#ff0000');
    return false;
  }
}

async function createTirageInSQLiteBackend(tirageData) {
  addDumpLog('💾 Création nouveau tirage...', '#ffff00');
  
  try {
    const response = await fetch(`${SQLITE_API_BASE}/tirages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tirageData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      addDumpLog(`✅ Tirage créé (ID: ${result.tirageId})`, '#00ff00');
      return result;
    } else {
      addDumpLog(`❌ Erreur création: ${result.error}`, '#ff0000');
      return null;
    }
  } catch (error) {
    addDumpLog(`❌ Erreur création tirage: ${error.message}`, '#ff0000');
    return null;
  }
}

// ========================================
// Fonctions de l'interface utilisateur
// ========================================

function showAutoStatus(message, isSuccess = true) {
  const statusDiv = document.getElementById('sqlite-auto-status');
  const logsDiv = document.getElementById('sqlite-auto-logs');
  
  if (statusDiv && logsDiv) {
    logsDiv.innerHTML = `<div style="color: ${isSuccess ? '#00ff00' : '#ff0000'};">${message}</div>`;
    statusDiv.style.display = 'block';
  }
}

function hideAutoStatus() {
  const statusDiv = document.getElementById('sqlite-auto-status');
  if (statusDiv) {
    statusDiv.style.display = 'none';
  }
}

function clearMonitoringDisplay() {
  let tableDataDiv = document.getElementById('sqlite-monitoring-table');
  if (!tableDataDiv) {
    tableDataDiv = document.getElementById('table-data');
  }
  if (tableDataDiv) {
    tableDataDiv.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #888; border: 1px dashed #444; border-radius: 8px; background: rgba(255,255,255,0.02);">
        <h4 style="color: #aaa; margin-bottom: 15px;">📊 Monitoring SQLite Backend</h4>
        <p style="margin-bottom: 10px;">Sélectionnez une table dans la liste déroulante ci-dessus pour voir les données.</p>
        <p style="font-size: 12px;">Tables disponibles : tirages, gains, sources, config, toutes les données</p>
      </div>
    `;
  }
  addDumpLog('🔄 Zone d\'affichage monitoring réinitialisée', '#00aaff');
}

// ========================================
// Fonctions principales de monitoring
// ========================================

async function autonomousBackendTableMonitoring() {
  addDumpLog('🎬 Début monitoring autonome...', '#ffff00');
  
  const selectElement = document.getElementById('sqlite-table-select');
  addDumpLog(`🔍 Élément select trouvé: ${selectElement ? 'OUI' : 'NON'}`, '#00aaff');
  
  const tableName = selectElement ? selectElement.value : '';
  addDumpLog(`📋 Table sélectionnée: "${tableName}"`, '#00aaff');
  
  if (!tableName) {
    addDumpLog('⚠️ Aucune table sélectionnée, affichage du message par défaut', '#ffaa00');
    clearMonitoringDisplay();
    return;
  }

  showAutoStatus('🔄 Connexion backend SQLite...');
  addDumpLog(`🎯 Monitoring autonome table: ${tableName}`, '#ffff00');

  try {
    // Test de connexion
    const isConnected = await testSQLiteBackendConnection();
    if (!isConnected) {
      showAutoStatus('❌ Impossible de se connecter au backend SQLite', false);
      return;
    }

    // Récupération des données
    showAutoStatus('📊 Récupération des données...');
    const data = await getSQLiteBackendTableData(tableName);
    
    // Vérification et debug des données reçues
    addDumpLog(`🔍 Type de données reçues: ${typeof data}`, '#00aaff');
    addDumpLog(`🔍 Est un tableau: ${Array.isArray(data)}`, '#00aaff');
    
    if (data && Array.isArray(data) && data.length > 0) {
      addDumpLog(`📊 Affichage de ${data.length} enregistrements`, '#00aaff');
      
      try {
        addDumpLog(`🔧 APPEL: displaySQLiteTableData("${tableName}", data[${data.length}])`, '#00aaff');
        displaySQLiteTableData(tableName, data);
        addDumpLog(`✅ SUCCÈS: displaySQLiteTableData terminée`, '#00ff00');
        showAutoStatus(`✅ ${data.length} enregistrements chargés`);
        addDumpLog(`✅ Monitoring terminé: ${data.length} enregistrements`, '#00ff00');
      } catch (displayError) {
        addDumpLog(`❌ ERREUR dans displaySQLiteTableData: ${displayError.message}`, '#ff0000');
        addDumpLog(`📋 STACK TRACE displaySQLiteTableData:`, '#ff0000');
        addDumpLog(`${displayError.stack}`, '#ff0000');
        throw displayError; // Re-lancer pour que le catch global l'attrape aussi
      }
      
    } else if (data && Array.isArray(data) && data.length === 0) {
      clearMonitoringDisplay();
      showAutoStatus('ℹ️ Table vide', false);
      addDumpLog('ℹ️ Table vide (tableau valide mais 0 enregistrements)', '#ffaa00');
    } else {
      clearMonitoringDisplay();
      showAutoStatus('❌ Données invalides reçues', false);
      addDumpLog(`❌ Format de données invalide: ${JSON.stringify(data)}`, '#ff0000');
    }

    setTimeout(hideAutoStatus, 3000);

  } catch (error) {
    showAutoStatus(`❌ Erreur: ${error.message}`, false);
    addDumpLog(`❌ ERREUR GLOBALE monitoring: ${error.message}`, '#ff0000');
    addDumpLog(`📋 STACK TRACE GLOBALE:`, '#ff0000');
    addDumpLog(`${error.stack}`, '#ff0000');
    addDumpLog(`🔍 Fonction appelante: autonomousBackendTableMonitoring()`, '#ff0000');
    setTimeout(hideAutoStatus, 5000);
  }
}

function displaySQLiteTableData(tableName, data) {
  addDumpLog(`🔧 ENTRÉE displaySQLiteTableData(tableName="${tableName}", data)`, '#00aaff');
  addDumpLog(`🔍 Paramètre data type: ${typeof data}, isArray: ${Array.isArray(data)}, length: ${data ? data.length : 'N/A'}`, '#00aaff');
  
  // Chercher les IDs corrects pour la zone d'affichage
  addDumpLog(`🔍 Recherche zone d'affichage...`, '#00aaff');
  let tableDataDiv = document.getElementById('sqlite-monitoring-table');
  addDumpLog(`🔍 sqlite-monitoring-table: ${tableDataDiv ? 'TROUVÉ' : 'NON TROUVÉ'}`, '#00aaff');
  
  if (!tableDataDiv) {
    tableDataDiv = document.getElementById('table-data');
    addDumpLog(`🔍 table-data: ${tableDataDiv ? 'TROUVÉ' : 'NON TROUVÉ'}`, '#00aaff');
  }
  if (!tableDataDiv) {
    tableDataDiv = document.getElementById('monitoring-table-data');
    addDumpLog(`🔍 monitoring-table-data: ${tableDataDiv ? 'TROUVÉ' : 'NON TROUVÉ'}`, '#00aaff');
  }
  
  addDumpLog(`🔍 Zone d'affichage finale: ${tableDataDiv ? 'OUI' : 'NON'}`, '#00aaff');
  
  if (!tableDataDiv) {
    addDumpLog('❌ Aucune zone d\'affichage trouvée (table-data, monitoring-table-data, sqlite-table-data)', '#ff0000');
    return;
  }

  if (!data) {
    addDumpLog('❌ Aucune donnée à afficher (data = null/undefined)', '#ff0000');
    tableDataDiv.innerHTML = '<p style="color: #ff0000;">❌ Aucune donnée reçue</p>';
    return;
  }

  if (!Array.isArray(data)) {
    addDumpLog(`❌ Les données ne sont pas un tableau: ${typeof data}`, '#ff0000');
    tableDataDiv.innerHTML = `<p style="color: #ff0000;">❌ Format de données invalide: ${typeof data}</p>`;
    return;
  }

  if (data.length === 0) {
    addDumpLog('ℹ️ Tableau vide reçu', '#ffaa00');
    tableDataDiv.innerHTML = `<p style="color: #ffaa00;">ℹ️ Table ${tableName} vide</p>`;
    return;
  }

  addDumpLog(`📊 Génération tableau HTML pour ${data.length} enregistrements`, '#00aaff');

  try {
    addDumpLog(`🔧 Début génération HTML...`, '#00aaff');
    let html = `<h4>📊 Table: ${tableName} (${data.length} enregistrements)</h4>`;
    addDumpLog(`✅ Titre HTML généré`, '#00aaff');
    
    html += '<div style="overflow-x: auto; max-height: 400px; border: 1px solid #444; border-radius: 4px;">';
    html += '<table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 12px;">';
    addDumpLog(`✅ Structure table HTML générée`, '#00aaff');
    
    // En-têtes
    if (data.length > 0) {
      addDumpLog(`🔧 Génération en-têtes avec data[0]: ${JSON.stringify(data[0])}`, '#00aaff');
      html += '<thead style="background: #333; position: sticky; top: 0;"><tr>';
      
      const keys = Object.keys(data[0]);
      addDumpLog(`🔧 Clés trouvées: ${keys.join(', ')}`, '#00aaff');
      
      keys.forEach((key, index) => {
        addDumpLog(`🔧 Traitement clé ${index + 1}/${keys.length}: "${key}"`, '#00aaff');
        html += `<th style="padding: 8px; border: 1px solid #555; color: #fff; text-align: left;">${key}</th>`;
      });
      html += '</tr></thead>';
      addDumpLog(`✅ En-têtes HTML générés pour ${keys.length} colonnes`, '#00aaff');
    }
    
    // Données
    html += '<tbody>';
    data.forEach((row, index) => {
      const bgColor = index % 2 === 0 ? '#1a1a1a' : '#2a2a2a';
      html += `<tr style="background: ${bgColor};">`;
      Object.values(row).forEach(value => {
        const displayValue = value !== null ? String(value) : '<em style="color: #888;">NULL</em>';
        html += `<td style="padding: 8px; border: 1px solid #555; color: #ddd;">${displayValue}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    
    tableDataDiv.innerHTML = html;
    addDumpLog('✅ Tableau HTML généré et affiché avec succès', '#00ff00');
    
  } catch (error) {
    addDumpLog(`❌ Erreur génération tableau: ${error.message}`, '#ff0000');
    tableDataDiv.innerHTML = `<p style="color: #ff0000;">❌ Erreur affichage: ${error.message}</p>`;
  }
}

// ========================================
// Fonctions de test pour l'interface
// ========================================

async function testSQLiteBackendConnectionUI() {
  const testButton = document.querySelector('button[onclick="testSQLiteBackendConnectionUI()"]');
  if (testButton) {
    testButton.disabled = true;
    testButton.textContent = 'Test en cours...';
  }

  const success = await testSQLiteBackendConnection();
  
  if (testButton) {
    testButton.disabled = false;
    testButton.textContent = 'Test Connexion';
  }

  return success;
}

// ========================================
// Fonctions de test et debug
// ========================================

function testMonitoringElements() {
  addDumpLog('🔧 Test des éléments DOM du monitoring...', '#ffff00');
  
  const elements = [
    'sqlite-table-select',
    'sqlite-monitoring-table', 
    'sqlite-auto-status',
    'sqlite-auto-logs',
    'sqlite-monitoring-tirage-tag'
  ];
  
  elements.forEach(id => {
    const element = document.getElementById(id);
    addDumpLog(`🔍 ${id}: ${element ? 'TROUVÉ' : 'MANQUANT'}`, element ? '#00ff00' : '#ff0000');
    if (element) {
      addDumpLog(`   └─ Type: ${element.tagName}, Classes: ${element.className}`, '#00aaff');
    }
  });
  
  // Test direct de la fonction de monitoring
  addDumpLog('🎬 Test de la fonction autonomousBackendTableMonitoring...', '#ffff00');
  autonomousBackendTableMonitoring();
}

async function testSQLiteBackendDatabase() {
  addDumpLog('🗄️ Test base de données backend...', '#ffff00');
  updateTestLED('test-database', 'testing', '🗄️ Test base de données...');
  
  try {
    // Test de connexion d'abord
    const isConnected = await testSQLiteBackendConnection();
    if (!isConnected) {
      updateTestLED('test-database', 'failed', '❌ Base de données: ÉCHEC - Connexion backend impossible');
      return false;
    }

    // Test d'une requête simple pour vérifier que les tables existent
    const data = await getSQLiteBackendTableData('tirages');
    
    if (data !== null) {
      addDumpLog('✅ Base de données accessible et opérationnelle', '#00ff00');
      updateTestLED('test-database', 'success', '✅ Base de données: OK');
      return true;
    } else {
      addDumpLog('⚠️ Base de données accessible mais vide', '#ffaa00');
      updateTestLED('test-database', 'warning', '⚠️ Base de données: VIDE - Utilisez Installation Complète');
      return false;
    }
  } catch (error) {
    addDumpLog(`❌ Erreur test base de données: ${error.message}`, '#ff0000');
    updateTestLED('test-database', 'failed', `❌ Base de données: ÉCHEC - ${error.message}`);
    return false;
  }
}

async function testSQLiteBackendTables() {
  addDumpLog('📊 Test tables backend...', '#ffff00');
  updateTestLED('test-tables', 'testing', '📊 Test tables...');
  
  try {
    const isConnected = await testSQLiteBackendConnection();
    if (!isConnected) {
      updateTestLED('test-tables', 'failed', '❌ Tables: ÉCHEC - Connexion backend impossible');
      return false;
    }

    const tiragesData = await getSQLiteBackendTableData('tirages');
    
    if (tiragesData !== null) {
      addDumpLog(`✅ Table tirages accessible (${tiragesData.length} enregistrements)`, '#00ff00');
      updateTestLED('test-tables', 'success', `✅ Tables: OK (${tiragesData.length} tirages)`);
      return true;
    } else {
      addDumpLog('⚠️ Table tirages vide ou inexistante', '#ffaa00');
      updateTestLED('test-tables', 'warning', '⚠️ Tables: VIDES - Utilisez Installation Complète');
      return false;
    }
  } catch (error) {
    addDumpLog(`❌ Erreur test tables: ${error.message}`, '#ff0000');
    updateTestLED('test-tables', 'failed', `❌ Tables: ÉCHEC - ${error.message}`);
    return false;
  }
}

async function testSQLiteBackendInsert() {
  addDumpLog('📝 Test insertion backend...', '#ffff00');
  updateTestLED('test-insert', 'testing', '📝 Test insertion...');
  
  try {
    const isConnected = await testSQLiteBackendConnection();
    if (!isConnected) {
      updateTestLED('test-insert', 'failed', '❌ Insert: ÉCHEC - Connexion backend impossible');
      return false;
    }

    // Créer un timestamp unique pour éviter les conflits de date
    const now = new Date();
    const timestamp = 'test_' + now.getFullYear() + 
                     String(now.getMonth() + 1).padStart(2, '0') +
                     String(now.getDate()).padStart(2, '0') + '_' +
                     String(now.getHours()).padStart(2, '0') +
                     String(now.getMinutes()).padStart(2, '0') +
                     String(now.getSeconds()).padStart(2, '0') +
                     String(now.getMilliseconds()).padStart(3, '0');
    
    const testTirage = {
      date: timestamp,
      numeros: '1,2,3,4,5',
      etoiles: '1,2',
      source: 'test_insertion',
      gains: [
        { rang: 1, combinaison: '5 + 2', nombre_gagnants: 0, gain_unitaire: '0 €' },
        { rang: 2, combinaison: '5 + 1', nombre_gagnants: 1, gain_unitaire: '1000 €' }
      ]
    };

    addDumpLog(`🔍 Données à insérer: ${JSON.stringify(testTirage)}`, '#00aaff');
    
    const result = await createTirageInSQLiteBackend(testTirage);
    
    addDumpLog(`🔍 Résultat reçu: ${JSON.stringify(result)}`, '#00aaff');
    
    if (result && result.success) {
      addDumpLog(`✅ Insertion réussie (ID: ${result.tirageId})`, '#00ff00');
      updateTestLED('test-insert', 'success', `✅ Insert: OK (ID: ${result.tirageId})`);
      return true;
    } else {
      const errorMsg = result ? result.error || 'Erreur inconnue' : 'Pas de résultat reçu';
      
      // Diagnostic spécifique pour les erreurs de contrainte UNIQUE
      if (errorMsg.includes('UNIQUE constraint failed')) {
        addDumpLog(`⚠️ Contrainte UNIQUE: ${errorMsg}`, '#ffaa00');
        updateTestLED('test-insert', 'warning', '⚠️ Insert: Date déjà existante (générer nouveau timestamp)');
      } else {
        addDumpLog(`❌ Échec insertion: ${errorMsg}`, '#ff0000');
        updateTestLED('test-insert', 'failed', `❌ Insert: ÉCHEC - ${errorMsg}`);
      }
      return false;
    }
  } catch (error) {
    addDumpLog(`❌ Erreur test insertion: ${error.message}`, '#ff0000');
    addDumpLog(`📋 Stack trace: ${error.stack}`, '#ff0000');
    updateTestLED('test-insert', 'failed', `❌ Insert: ÉCHEC - ${error.message}`);
    return false;
  }
}

async function testSQLiteBackendSelect() {
  addDumpLog('📋 Test sélection backend...', '#ffff00');
  updateTestLED('test-select', 'testing', '📋 Test sélection...');
  
  try {
    const isConnected = await testSQLiteBackendConnection();
    if (!isConnected) {
      updateTestLED('test-select', 'failed', '❌ Select: ÉCHEC - Connexion backend impossible');
      return false;
    }

    const allData = await getSQLiteBackendTableData('all');
    
    if (allData !== null && allData.length > 0) {
      addDumpLog(`✅ Sélection réussie (${allData.length} enregistrements)`, '#00ff00');
      updateTestLED('test-select', 'success', `✅ Select: OK (${allData.length} enregistrements)`);
      
      if (allData.length > 0) {
        const sample = allData[0];
        addDumpLog(`📄 Échantillon: ${sample.date || 'N/A'} - ${sample.numeros || 'N/A'}`, '#00aaff');
      }
      
      return true;
    } else {
      addDumpLog('⚠️ Aucune donnée trouvée', '#ffaa00');
      updateTestLED('test-select', 'warning', '⚠️ Select: VIDE - Aucune donnée');
      return false;
    }
  } catch (error) {
    addDumpLog(`❌ Erreur test sélection: ${error.message}`, '#ff0000');
    updateTestLED('test-select', 'failed', `❌ Select: ÉCHEC - ${error.message}`);
    return false;
  }
}

async function createDatabaseUI() {
  const createButton = document.querySelector('button[onclick="createDatabaseUI()"]');
  if (createButton) {
    createButton.disabled = true;
    createButton.textContent = 'Création en cours...';
  }

  const success = await recreateSQLiteBackendDatabase();
  
  if (createButton) {
    createButton.disabled = false;
    createButton.textContent = 'Installation Complète';
  }

  if (success) {
    // Recharger les données si une table est sélectionnée
    const selectElement = document.getElementById('sqlite-table-select');
    if (selectElement && selectElement.value) {
      setTimeout(() => autonomousBackendTableMonitoring(), 1000);
    }
  }

  return success;
}

// ========================================
// Fonction d'effacement des données
// ========================================

async function clearAllDatabaseData() {
  addDumpLog('🗑️ Demande d\'effacement de toutes les données...', '#ffff00');
  
  // Confirmation avant effacement
  const confirmed = confirm('⚠️ ATTENTION !\n\nVoulez-vous vraiment EFFACER TOUTES LES DONNÉES de la base SQLite ?\n\nCette action est IRRÉVERSIBLE.\n\n✅ Cliquez OK pour confirmer\n❌ Cliquez Annuler pour abandonner');
  
  if (!confirmed) {
    addDumpLog('❌ Effacement annulé par l\'utilisateur', '#ffaa00');
    updateTestLED('test-clear-data', 'warning', '❌ Effacement: ANNULÉ');
    return false;
  }
  
  try {
    updateTestLED('test-clear-data', 'testing', '🔄 Effacement en cours...');
    
    const response = await fetch(`${SQLITE_API_BASE}/clear-all-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      addDumpLog('✅ Toutes les données ont été effacées avec succès', '#00ff00');
      updateTestLED('test-clear-data', 'success', '✅ Effacement: RÉUSSI');
      
      // Rafraîchir le monitoring si une table est sélectionnée
      const selectElement = document.getElementById('sqlite-table-select');
      if (selectElement && selectElement.value) {
        setTimeout(() => autonomousBackendTableMonitoring(), 500);
      }
      
      return true;
    } else {
      throw new Error(result.error || 'Réponse inattendue du serveur');
    }
  } catch (error) {
    addDumpLog(`❌ Erreur effacement données: ${error.message}`, '#ff0000');
    updateTestLED('test-clear-data', 'failed', `❌ Effacement: ÉCHEC - ${error.message}`);
    return false;
  }
}