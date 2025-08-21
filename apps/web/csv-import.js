// =========================================
// IMPORT CSV EUROMILLIONS
// =========================================

// Configuration du mapping CSV vers SQLite
const CSV_MAPPING = {
  // Colonnes tirages
  date: { index: 2, name: 'date_de_tirage' },        // "15/08/2025"
  numeros: { 
    indexes: [5, 6, 7, 8, 9], 
    names: ['boule_1', 'boule_2', 'boule_3', 'boule_4', 'boule_5'] 
  },
  etoiles: { 
    indexes: [10, 11], 
    names: ['etoile_1', 'etoile_2'] 
  },
  
  // Rangs EuroMillions avec mapping gains
  gains: [
    { rang: 1, combinaison: '5 + 2', gagnants_index: 19, rapport_index: 16 },  // Rang 1: 5 + 2 étoiles
    { rang: 2, combinaison: '5 + 1', gagnants_index: 21, rapport_index: 19 },  // Rang 2: 5 + 1 étoile  
    { rang: 3, combinaison: '5 + 0', gagnants_index: 23, rapport_index: 22 },  // Rang 3: 5 + 0 étoile
    { rang: 4, combinaison: '4 + 2', gagnants_index: 25, rapport_index: 25 },  // Rang 4: 4 + 2 étoiles
    { rang: 5, combinaison: '4 + 1', gagnants_index: 27, rapport_index: 28 },  // Rang 5: 4 + 1 étoile
    { rang: 6, combinaison: '3 + 2', gagnants_index: 29, rapport_index: 31 },  // Rang 6: 3 + 2 étoiles
    { rang: 7, combinaison: '4 + 0', gagnants_index: 31, rapport_index: 34 },  // Rang 7: 4 + 0 étoile
    { rang: 8, combinaison: '2 + 2', gagnants_index: 33, rapport_index: 37 },  // Rang 8: 2 + 2 étoiles
    { rang: 9, combinaison: '3 + 1', gagnants_index: 35, rapport_index: 40 },  // Rang 9: 3 + 1 étoile
    { rang: 10, combinaison: '3 + 0', gagnants_index: 37, rapport_index: 43 }, // Rang 10: 3 + 0 étoile
    { rang: 11, combinaison: '1 + 2', gagnants_index: 39, rapport_index: 46 }, // Rang 11: 1 + 2 étoiles
    { rang: 12, combinaison: '2 + 1', gagnants_index: 41, rapport_index: 49 }, // Rang 12: 2 + 1 étoile
    { rang: 13, combinaison: '2 + 0', gagnants_index: 43, rapport_index: 52 }  // Rang 13: 2 + 0 étoile
  ]
};

// Variables globales
let csvImportData = null;
let existingDates = new Set();

// =========================================
// FONCTIONS UTILITAIRES
// =========================================

// Convertir date DD/MM/YYYY vers YYYY-MM-DD
function convertDateFormat(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Déterminer le tag basé sur la date
function getDataTag(dateStr) {
  const year = parseInt(dateStr.split('-')[0]);
  return year === 2025 ? 'Test' : 'Training';
}

// Parser une ligne CSV
function parseCSVLine(line) {
  const columns = line.split(';');
  
  // Extraction des données de tirage
  const date = convertDateFormat(columns[CSV_MAPPING.date.index]);
  const numeros = CSV_MAPPING.numeros.indexes.map(i => parseInt(columns[i])).filter(n => !isNaN(n));
  const etoiles = CSV_MAPPING.etoiles.indexes.map(i => parseInt(columns[i])).filter(e => !isNaN(e));
  
  // Extraction des gains
  const gains = CSV_MAPPING.gains.map(gainConfig => {
    const gagnants = parseInt(columns[gainConfig.gagnants_index]) || 0;
    const rapport = columns[gainConfig.rapport_index] || '0';
    
    return {
      rang: gainConfig.combinaison,
      combinaison: gainConfig.combinaison,
      nombre_gagnants: gagnants,
      gain_unitaire: rapport.replace(',', '.') + ' €'
    };
  }).filter(gain => gain.nombre_gagnants > 0 || gain.gain_unitaire !== '0 €');

  // Déterminer le tag basé sur la date
  const tag = getDataTag(date);

  return {
    date,
    numeros,
    etoiles,
    gains,
    tag,
    isValid: date && numeros.length === 5 && etoiles.length === 2
  };
}

// =========================================
// FONCTIONS D'IMPORT
// =========================================

// Récupérer les dates existantes en base
async function getExistingDates() {
  console.log('🔍 [IMPORT] Récupération des dates existantes...');
  
  try {
    const response = await fetch('http://localhost:3001/api/tables/tirages', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      existingDates = new Set(result.data.map(tirage => tirage.date));
      console.log(`✅ [IMPORT] ${existingDates.size} dates trouvées en base`);
      return Array.from(existingDates);
    } else {
      console.log('⚠️ [IMPORT] Aucune donnée en base');
      return [];
    }
  } catch (error) {
    console.error('❌ [IMPORT] Erreur récupération dates:', error);
    return [];
  }
}

// Parser le fichier CSV complet
async function parseCSVFile(fileContent) {
  console.log('📄 [IMPORT] Parsing du fichier CSV...');
  
  const lines = fileContent.split('\n').filter(line => line.trim());
  const header = lines[0];
  const dataLines = lines.slice(1);
  
  console.log(`📊 [IMPORT] ${dataLines.length} lignes de données détectées`);
  
  const parsedData = [];
  let validCount = 0;
  let invalidCount = 0;
  
  dataLines.forEach((line, index) => {
    try {
      const parsed = parseCSVLine(line);
      if (parsed.isValid) {
        parsedData.push(parsed);
        validCount++;
      } else {
        console.warn(`⚠️ [IMPORT] Ligne ${index + 2} invalide:`, line.substring(0, 100));
        invalidCount++;
      }
    } catch (error) {
      console.error(`❌ [IMPORT] Erreur ligne ${index + 2}:`, error);
      invalidCount++;
    }
  });
  
  console.log(`✅ [IMPORT] Parsing terminé: ${validCount} valides, ${invalidCount} invalides`);
  return parsedData;
}

// Identifier les dates manquantes
function findMissingDates(csvData) {
  const csvDates = new Set(csvData.map(item => item.date));
  const missingDates = csvData.filter(item => !existingDates.has(item.date));
  
  console.log(`🔍 [IMPORT] Dates CSV: ${csvDates.size}`);
  console.log(`🔍 [IMPORT] Dates en base: ${existingDates.size}`);
  console.log(`🔍 [IMPORT] Dates manquantes: ${missingDates.length}`);
  
  return missingDates;
}

// Importer un tirage avec ses gains
async function importTirage(tirageData) {
  const dataToSend = {
    date: tirageData.date,
    numeros: tirageData.numeros.join(','),
    etoiles: tirageData.etoiles.join(','),
    source: 'import',
    gains: tirageData.gains,
    tag: tirageData.tag
  };
  
  console.log(`💾 [IMPORT] Import tirage ${tirageData.date} [${tirageData.tag}]:`, dataToSend);
  
  try {
    const response = await fetch('http://localhost:3001/api/tirages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ [IMPORT] Tirage ${tirageData.date} importé: ID ${result.tirageId}, ${result.gainsCount} gains`);
      return { success: true, tirageId: result.tirageId, gainsCount: result.gainsCount };
    } else {
      throw new Error(result.error || 'Erreur inconnue');
    }
  } catch (error) {
    console.error(`❌ [IMPORT] Erreur import ${tirageData.date}:`, error);
    return { success: false, error: error.message };
  }
}

// =========================================
// FONCTION PRINCIPALE D'IMPORT
// =========================================

async function importCSVFile(fileContent) {
  console.log('🚀 [IMPORT] === DÉBUT IMPORT CSV ===');
  
  const startTime = Date.now();
      const stats = {
      total: 0,
      imported: 0,
      errors: 0,
      skipped: 0,
      training: 0,
      test: 0
    };
  
  try {
    // Étape 1: Récupérer les dates existantes
    await getExistingDates();
    
    // Étape 2: Parser le fichier CSV
    const csvData = await parseCSVFile(fileContent);
    stats.total = csvData.length;
    
    // Étape 3: Identifier les dates manquantes
    const missingData = findMissingDates(csvData);
    stats.skipped = stats.total - missingData.length;
    
    if (missingData.length === 0) {
      console.log('ℹ️ [IMPORT] Aucune nouvelle donnée à importer');
      return stats;
    }
    
    // Étape 4: Importer les données manquantes
    console.log(`🔄 [IMPORT] Import de ${missingData.length} nouveaux tirages...`);
    
    for (const tirageData of missingData) {
      const result = await importTirage(tirageData);
      
      if (result.success) {
        stats.imported++;
        // Compter par tag
        if (tirageData.tag === 'Test') {
          stats.test++;
        } else {
          stats.training++;
        }
      } else {
        stats.errors++;
      }
      
      // Délai pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const duration = (Date.now() - startTime) / 1000;
    
    console.log('🎉 [IMPORT] === IMPORT TERMINÉ ===');
    console.log(`📊 [IMPORT] Statistiques:`);
    console.log(`   - Total lignes CSV: ${stats.total}`);
    console.log(`   - Nouveaux imports: ${stats.imported}`);
    console.log(`   - Déjà en base: ${stats.skipped}`);
    console.log(`   - Erreurs: ${stats.errors}`);
    console.log(`   - Tag Training: ${stats.training}`);
    console.log(`   - Tag Test: ${stats.test}`);
    console.log(`   - Durée: ${duration}s`);
    
    return stats;
    
  } catch (error) {
    console.error('❌ [IMPORT] Erreur critique:', error);
    return { ...stats, error: error.message };
  }
}

// =========================================
// INTERFACE UTILISATEUR
// =========================================

// Traiter le fichier sélectionné par l'utilisateur
async function handleCSVImport(file) {
  updateScrapingBreadcrumb(`📁 Import CSV: ${file.name} en cours...`);
  
  try {
    const fileContent = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file, 'UTF-8');
    });
    
    console.log('📁 [IMPORT] Fichier lu:', file.name, `(${(file.size / 1024).toFixed(1)} KB)`);
    
    const stats = await importCSVFile(fileContent);
    
    if (stats.error) {
      updateScrapingBreadcrumb(`❌ Erreur import: ${stats.error}`);
    } else {
      updateScrapingBreadcrumb(`✅ Import terminé: ${stats.imported} tirages (${stats.training} Training, ${stats.test} Test)`);
    }
    
    return stats;
    
  } catch (error) {
    console.error('❌ [IMPORT] Erreur lecture fichier:', error);
    updateScrapingBreadcrumb(`❌ Erreur lecture fichier: ${error.message}`);
    return { error: error.message };
  }
}

console.log('✅ Module CSV Import chargé');
