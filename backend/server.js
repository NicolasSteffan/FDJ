const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Configuration CORS pour permettre les requêtes du frontend
app.use(cors({
  origin: ['http://localhost:3010', 'http://127.0.0.1:3010'],
  credentials: true
}));

app.use(express.json());

// Chemin vers la base de données SQLite
const dbPath = path.join(__dirname, 'fdj_database.sqlite');

// Initialisation de la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur ouverture base SQLite:', err.message);
  } else {
    console.log('✅ Base SQLite connectée:', dbPath);
    initializeDatabase();
  }
});

// Création des tables si elles n'existent pas
function initializeDatabase() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS tirages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      numeros TEXT NOT NULL,
      etoiles TEXT NOT NULL,
      source TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS gains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tirage_id INTEGER NOT NULL,
      rang INTEGER NOT NULL,
      combinaison TEXT NOT NULL,
      nombre_gagnants INTEGER NOT NULL,
      gain_unitaire TEXT NOT NULL,
      source TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tirage_id) REFERENCES tirages (id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL,
      actif INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cle TEXT NOT NULL UNIQUE,
      valeur TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  tables.forEach((sql, index) => {
    db.run(sql, (err) => {
      if (err) {
        console.error(`❌ Erreur création table ${index + 1}:`, err.message);
      } else {
        console.log(`✅ Table ${index + 1} initialisée`);
      }
    });
  });

  // Insertion de données de démonstration si les tables sont vides
  insertDemoData();
}

// Insertion de données de démonstration
function insertDemoData() {
  // Vérifier si des données existent déjà
  db.get("SELECT COUNT(*) as count FROM tirages", (err, row) => {
    if (err) {
      console.error('❌ Erreur vérification données:', err.message);
      return;
    }

    if (row.count === 0) {
      console.log('📝 Insertion données de démonstration...');
      
      // Données de démonstration
      const demoTirage = {
        date: '2024-01-15',
        numeros: '7,12,25,34,48',
        etoiles: '3,9',
        source: 'demo'
      };

      db.run(
        "INSERT INTO tirages (date, numeros, etoiles, source) VALUES (?, ?, ?, ?)",
        [demoTirage.date, demoTirage.numeros, demoTirage.etoiles, demoTirage.source],
        function(err) {
          if (err) {
            console.error('❌ Erreur insertion tirage demo:', err.message);
            return;
          }

          const tirageId = this.lastID;
          console.log(`✅ Tirage demo inséré (ID: ${tirageId})`);

          // Insertion des gains de démonstration
          const demoGains = [
            { rang: 1, combinaison: '5 + 2', nombre_gagnants: 0, gain_unitaire: '0 €' },
            { rang: 2, combinaison: '5 + 1', nombre_gagnants: 1, gain_unitaire: '876 532,10 €' },
            { rang: 3, combinaison: '5 + 0', nombre_gagnants: 2, gain_unitaire: '45 678,90 €' }
          ];

          demoGains.forEach((gain, index) => {
            db.run(
              "INSERT INTO gains (tirage_id, rang, combinaison, nombre_gagnants, gain_unitaire, source) VALUES (?, ?, ?, ?, ?, ?)",
              [tirageId, gain.rang, gain.combinaison, gain.nombre_gagnants, gain.gain_unitaire, 'demo'],
              (err) => {
                if (err) {
                  console.error(`❌ Erreur insertion gain ${index + 1}:`, err.message);
                } else {
                  console.log(`✅ Gain ${index + 1} inséré`);
                }
              }
            );
          });
        }
      );

      // Sources de démonstration
      const demoSources = [
        { nom: 'FDJ Official', url: 'https://www.fdj.fr', actif: 1 },
        { nom: 'EuroMillions.com', url: 'https://www.euromillions.com', actif: 1 }
      ];

      demoSources.forEach((source, index) => {
        db.run(
          "INSERT INTO sources (nom, url, actif) VALUES (?, ?, ?)",
          [source.nom, source.url, source.actif],
          (err) => {
            if (err) {
              console.error(`❌ Erreur insertion source ${index + 1}:`, err.message);
            } else {
              console.log(`✅ Source ${index + 1} insérée`);
            }
          }
        );
      });

      // Configuration de démonstration
      const demoConfig = [
        { cle: 'version', valeur: 'V0.002E-SQLite', description: 'Version application' },
        { cle: 'auto_scraping', valeur: 'false', description: 'Scraping automatique activé' }
      ];

      demoConfig.forEach((config, index) => {
        db.run(
          "INSERT INTO config (cle, valeur, description) VALUES (?, ?, ?)",
          [config.cle, config.valeur, config.description],
          (err) => {
            if (err) {
              console.error(`❌ Erreur insertion config ${index + 1}:`, err.message);
            } else {
              console.log(`✅ Config ${index + 1} insérée`);
            }
          }
        );
      });
    }
  });
}

// Routes API

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'FDJ SQLite Backend API est en ligne!',
    timestamp: new Date().toISOString(),
    database: dbPath
  });
});

// Test de connexion base de données
app.get('/api/test-connection', (req, res) => {
  db.get("SELECT datetime('now') as current_time", (err, row) => {
    if (err) {
      res.status(500).json({
        success: false,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        message: 'Connexion SQLite réussie',
        server_time: row.current_time,
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Récupérer toutes les tables et leurs données
app.get('/api/tables/:tableName', (req, res) => {
  const { tableName } = req.params;
  const validTables = ['tirages', 'gains', 'sources', 'config', 'all'];
  
  if (!validTables.includes(tableName)) {
    return res.status(400).json({
      success: false,
      error: `Table invalide. Tables autorisées: ${validTables.join(', ')}`
    });
  }

  if (tableName === 'all') {
    // Récupérer toutes les données avec jointures
    const query = `
      SELECT 
        t.date,
        t.numeros,
        t.etoiles,
        t.source as tirage_source,
        g.rang,
        g.combinaison,
        g.nombre_gagnants,
        g.gain_unitaire,
        g.source as gain_source
      FROM tirages t
      LEFT JOIN gains g ON t.id = g.tirage_id
      ORDER BY t.date DESC, g.rang ASC
    `;
    
    db.all(query, (err, rows) => {
      if (err) {
        res.status(500).json({
          success: false,
          error: err.message
        });
      } else {
        res.json({
          success: true,
          table: 'all',
          data: rows,
          count: rows.length
        });
      }
    });
  } else {
    // Récupérer une table spécifique
    db.all(`SELECT * FROM ${tableName} ORDER BY id DESC`, (err, rows) => {
      if (err) {
        res.status(500).json({
          success: false,
          error: err.message
        });
      } else {
        res.json({
          success: true,
          table: tableName,
          data: rows,
          count: rows.length
        });
      }
    });
  }
});

// Créer ou recréer la base de données avec données de démonstration
app.post('/api/recreate-database', (req, res) => {
  console.log('🔄 Recréation de la base de données demandée...');
  
  // Supprimer toutes les tables
  const dropTables = [
    'DROP TABLE IF EXISTS gains',
    'DROP TABLE IF EXISTS tirages', 
    'DROP TABLE IF EXISTS sources',
    'DROP TABLE IF EXISTS config'
  ];

  let completed = 0;
  const total = dropTables.length;

  dropTables.forEach((sql) => {
    db.run(sql, (err) => {
      if (err) {
        console.error('❌ Erreur suppression table:', err.message);
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }
      
      completed++;
      if (completed === total) {
        console.log('✅ Tables supprimées, recréation...');
        initializeDatabase();
        
        // Attendre un peu pour que les données soient insérées
        setTimeout(() => {
          res.json({
            success: true,
            message: 'Base de données recréée avec succès',
            timestamp: new Date().toISOString()
          });
        }, 1000);
      }
    });
  });
});

// Effacer toutes les données (sans recréer les tables)
app.post('/api/clear-all-data', (req, res) => {
  console.log('🗑️ Effacement de toutes les données demandé...');
  
  // Effacer les données de toutes les tables
  const clearTables = [
    'DELETE FROM gains',
    'DELETE FROM tirages', 
    'DELETE FROM sources',
    'DELETE FROM config'
  ];

  let completed = 0;
  const total = clearTables.length;

  clearTables.forEach((sql) => {
    db.run(sql, (err) => {
      if (err) {
        console.error('❌ Erreur effacement table:', err.message);
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }
      
      completed++;
      if (completed === total) {
        console.log('✅ Toutes les données ont été effacées');
        res.json({
          success: true,
          message: 'Toutes les données ont été effacées avec succès',
          timestamp: new Date().toISOString()
        });
      }
    });
  });
});

// Ajouter un nouveau tirage
app.post('/api/tirages', (req, res) => {
  const { date, numeros, etoiles, source, gains } = req.body;
  
  if (!date || !numeros || !etoiles || !source) {
    return res.status(400).json({
      success: false,
      error: 'Données manquantes: date, numeros, etoiles, source requis'
    });
  }

  db.run(
    "INSERT INTO tirages (date, numeros, etoiles, source) VALUES (?, ?, ?, ?)",
    [date, numeros, etoiles, source],
    function(err) {
      if (err) {
        res.status(500).json({
          success: false,
          error: err.message
        });
      } else {
        const tirageId = this.lastID;
        
        // Si des gains sont fournis, les insérer
        if (gains && Array.isArray(gains) && gains.length > 0) {
          let gainsInserted = 0;
          gains.forEach((gain) => {
            db.run(
              "INSERT INTO gains (tirage_id, rang, combinaison, nombre_gagnants, gain_unitaire, source) VALUES (?, ?, ?, ?, ?, ?)",
              [tirageId, gain.rang, gain.combinaison, gain.nombre_gagnants, gain.gain_unitaire, source],
              (err) => {
                if (err) {
                  console.error('❌ Erreur insertion gain:', err.message);
                }
                gainsInserted++;
              }
            );
          });
        }

        res.json({
          success: true,
          message: 'Tirage créé avec succès',
          tirageId: tirageId,
          timestamp: new Date().toISOString()
        });
      }
    }
  );
});

// Gestion propre de la fermeture
process.on('SIGINT', () => {
  console.log('\n🔄 Fermeture de la base SQLite...');
  db.close((err) => {
    if (err) {
      console.error('❌ Erreur fermeture base:', err.message);
    } else {
      console.log('✅ Base SQLite fermée proprement');
    }
    process.exit(0);
  });
});

app.listen(port, () => {
  console.log(`🚀 FDJ SQLite Backend API démarré sur http://localhost:${port}`);
  console.log(`📊 Base de données: ${dbPath}`);
});