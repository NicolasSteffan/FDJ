// =========================================
// SCRIPT DE FORCE DONNÉES DÉMO
// =========================================

// Fonction pour forcer l'insertion de données démo
async function forceInsertDemoData() {
  console.log('🚀 [DEMO] Force insertion données démo...');
  
  const demoTirages = [
    {
      date: '2025-01-15',
      numeros: [7, 14, 21, 28, 35],
      etoiles: [3, 8],
      source: 'demo',
      gains: [
        { rang: '5 + 2', combinaison: '5 + 2', nombre_gagnants: 1, gain_unitaire: '125000000 €' },
        { rang: '5 + 1', combinaison: '5 + 1', nombre_gagnants: 2, gain_unitaire: '350000 €' },
        { rang: '5 + 0', combinaison: '5 + 0', nombre_gagnants: 8, gain_unitaire: '35000 €' },
        { rang: '4 + 2', combinaison: '4 + 2', nombre_gagnants: 15, gain_unitaire: '2500 €' },
        { rang: '4 + 1', combinaison: '4 + 1', nombre_gagnants: 287, gain_unitaire: '150 €' }
      ]
    },
    {
      date: '2025-01-12',
      numeros: [12, 19, 26, 33, 40],
      etoiles: [5, 9],
      source: 'demo',
      gains: [
        { rang: '5 + 2', combinaison: '5 + 2', nombre_gagnants: 0, gain_unitaire: '95000000 €' },
        { rang: '5 + 1', combinaison: '5 + 1', nombre_gagnants: 3, gain_unitaire: '280000 €' },
        { rang: '5 + 0', combinaison: '5 + 0', nombre_gagnants: 12, gain_unitaire: '28000 €' },
        { rang: '4 + 2', combinaison: '4 + 2', nombre_gagnants: 18, gain_unitaire: '2200 €' }
      ]
    },
    {
      date: '2025-01-10',
      numeros: [5, 17, 24, 31, 44],
      etoiles: [2, 11],
      source: 'demo',
      gains: [
        { rang: '5 + 2', combinaison: '5 + 2', nombre_gagnants: 0, gain_unitaire: '75000000 €' },
        { rang: '5 + 1', combinaison: '5 + 1', nombre_gagnants: 1, gain_unitaire: '420000 €' },
        { rang: '5 + 0', combinaison: '5 + 0', nombre_gagnants: 6, gain_unitaire: '42000 €' },
        { rang: '4 + 2', combinaison: '4 + 2', nombre_gagnants: 12, gain_unitaire: '3000 €' }
      ]
    },
    {
      date: '2025-01-08',
      numeros: [3, 16, 23, 29, 42],
      etoiles: [1, 7],
      source: 'demo',
      gains: [
        { rang: '5 + 2', combinaison: '5 + 2', nombre_gagnants: 2, gain_unitaire: '62500000 €' },
        { rang: '5 + 1', combinaison: '5 + 1', nombre_gagnants: 4, gain_unitaire: '245000 €' },
        { rang: '5 + 0', combinaison: '5 + 0', nombre_gagnants: 9, gain_unitaire: '31000 €' }
      ]
    },
    {
      date: '2025-01-05',
      numeros: [9, 18, 27, 36, 45],
      etoiles: [4, 10],
      source: 'demo',
      gains: [
        { rang: '5 + 2', combinaison: '5 + 2', nombre_gagnants: 0, gain_unitaire: '55000000 €' },
        { rang: '5 + 1', combinaison: '5 + 1', nombre_gagnants: 5, gain_unitaire: '198000 €' },
        { rang: '5 + 0', combinaison: '5 + 0', nombre_gagnants: 14, gain_unitaire: '25000 €' }
      ]
    }
  ];
  
  let insertedCount = 0;
  let errorCount = 0;
  
  for (const tirage of demoTirages) {
    try {
      const response = await fetch('http://localhost:3001/api/tirages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: tirage.date,
          numeros: tirage.numeros.join(','),
          etoiles: tirage.etoiles.join(','),
          source: tirage.source,
          gains: tirage.gains
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ [DEMO] Tirage ${tirage.date} inséré: ID ${result.tirageId}, ${result.gainsCount} gains`);
        insertedCount++;
      } else {
        console.error(`❌ [DEMO] Erreur insertion ${tirage.date}: ${response.status}`);
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ [DEMO] Erreur ${tirage.date}:`, error.message);
      errorCount++;
    }
    
    // Délai entre insertions
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`🎉 [DEMO] Insertion terminée: ${insertedCount} succès, ${errorCount} erreurs`);
  
  return { inserted: insertedCount, errors: errorCount };
}

// Fonction accessible globalement
window.forceInsertDemoData = forceInsertDemoData;

console.log('✅ Module force-data-demo.js chargé');
