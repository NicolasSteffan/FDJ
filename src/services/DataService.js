/**
 * FDJ Project - Data Service
 * Service responsable de la gestion des données (JSON/SQLite)
 * 
 * @class DataService
 * @description Abstraction pour l'accès aux données depuis différentes sources
 */

import Draw from '../models/Draw.js';

class DataService {
  /**
   * Crée une instance de DataService
   * @param {Object} options - Options de configuration
   * @param {string} [options.storageType='json'] - Type de stockage (json, sqlite)
   * @param {string} [options.dataPath] - Chemin vers les données
   * @param {Object} [options.sqliteConfig] - Configuration SQLite
   */
  constructor(options = {}) {
    this.storageType = options.storageType || 'json';
    this.dataPath = options.dataPath || './data';
    this.sqliteConfig = options.sqliteConfig || {
      filename: 'fdj_data.db',
      options: { verbose: false }
    };
    
    this.cache = new Map();
    this.isInitialized = false;
    this.connection = null;
  }

  /**
   * Initialise le service de données
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      if (this.storageType === 'sqlite') {
        await this.initializeSQLite();
      } else {
        await this.initializeJSON();
      }
      
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize DataService: ${error.message}`);
    }
  }

  /**
   * Initialise la base SQLite
   * @returns {Promise<void>}
   */
  async initializeSQLite() {
    try {
      // Dynamic import pour SQLite (si disponible)
      const Database = await import('better-sqlite3').then(m => m.default);
      
      const dbPath = `${this.dataPath}/${this.sqliteConfig.filename}`;
      this.connection = new Database(dbPath, this.sqliteConfig.options);
      
      // Créer les tables si elles n'existent pas
      await this.createTables();
      
    } catch (error) {
      // Fallback vers sql.js pour environnement navigateur
      try {
        await this.initializeSQLjs();
      } catch (sqlJsError) {
        throw new Error(`SQLite initialization failed: ${error.message}. sql.js fallback also failed: ${sqlJsError.message}`);
      }
    }
  }

  /**
   * Initialise sql.js pour environnement navigateur
   * @returns {Promise<void>}
   */
  async initializeSQLjs() {
    const initSqlJs = await import('sql.js').then(m => m.default);
    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });
    
    this.connection = new SQL.Database();
    await this.createTables();
  }

  /**
   * Initialise le stockage JSON
   * @returns {Promise<void>}
   */
  async initializeJSON() {
    // Vérifier que le dossier de données existe
    if (typeof require !== 'undefined') {
      const fs = require('fs').promises;
      try {
        await fs.access(this.dataPath);
      } catch {
        await fs.mkdir(this.dataPath, { recursive: true });
      }
    }
  }

  /**
   * Crée les tables SQLite nécessaires
   * @returns {Promise<void>}
   */
  async createTables() {
    const createDrawsTable = `
      CREATE TABLE IF NOT EXISTS draws (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        numbers TEXT NOT NULL,
        stars TEXT NOT NULL,
        breakdown TEXT,
        meta TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, numbers, stars)
      )
    `;

    const createSourcesTable = `
      CREATE TABLE IF NOT EXISTS sources (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        base_url TEXT NOT NULL,
        type TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        config TEXT,
        metrics TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_draws_date ON draws(date)',
      'CREATE INDEX IF NOT EXISTS idx_draws_created_at ON draws(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(type)'
    ];

    if (this.connection.exec) {
      // sql.js
      this.connection.exec(createDrawsTable);
      this.connection.exec(createSourcesTable);
      createIndexes.forEach(sql => this.connection.exec(sql));
    } else {
      // better-sqlite3
      this.connection.exec(createDrawsTable);
      this.connection.exec(createSourcesTable);
      createIndexes.forEach(sql => this.connection.exec(sql));
    }
  }

  /**
   * Sauvegarde un tirage
   * @param {Draw} draw - Tirage à sauvegarder
   * @returns {Promise<boolean>} True si sauvegardé avec succès
   */
  async saveDraw(draw) {
    if (!(draw instanceof Draw)) {
      throw new Error('Expected Draw instance');
    }

    await this.initialize();

    if (this.storageType === 'sqlite') {
      return this.saveDrawToSQLite(draw);
    } else {
      return this.saveDrawToJSON(draw);
    }
  }

  /**
   * Sauvegarde un tirage en SQLite
   * @param {Draw} draw - Tirage à sauvegarder
   * @returns {Promise<boolean>} True si sauvegardé
   */
  async saveDrawToSQLite(draw) {
    try {
      const sql = `
        INSERT OR REPLACE INTO draws 
        (id, date, numbers, stars, breakdown, meta, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        draw.id,
        draw.date.toISOString(),
        JSON.stringify(draw.numbers),
        JSON.stringify(draw.stars),
        JSON.stringify(draw.breakdown),
        JSON.stringify(draw.meta),
        new Date().toISOString()
      ];

      if (this.connection.prepare) {
        // better-sqlite3
        const stmt = this.connection.prepare(sql);
        stmt.run(params);
      } else {
        // sql.js
        this.connection.run(sql, params);
      }

      // Mettre à jour le cache
      this.cache.set(`draw_${draw.id}`, draw);
      
      return true;
    } catch (error) {
      console.error('Failed to save draw to SQLite:', error);
      return false;
    }
  }

  /**
   * Sauvegarde un tirage en JSON
   * @param {Draw} draw - Tirage à sauvegarder
   * @returns {Promise<boolean>} True si sauvegardé
   */
  async saveDrawToJSON(draw) {
    try {
      const filename = `${this.dataPath}/draw_${draw.id}.json`;
      const data = JSON.stringify(draw.toJSON(), null, 2);

      if (typeof require !== 'undefined') {
        // Node.js
        const fs = require('fs').promises;
        await fs.writeFile(filename, data, 'utf8');
      } else {
        // Navigateur - utiliser localStorage ou IndexedDB
        localStorage.setItem(`fdj_draw_${draw.id}`, data);
      }

      // Mettre à jour le cache
      this.cache.set(`draw_${draw.id}`, draw);
      
      return true;
    } catch (error) {
      console.error('Failed to save draw to JSON:', error);
      return false;
    }
  }

  /**
   * Récupère un tirage par ID
   * @param {string} drawId - ID du tirage
   * @returns {Promise<Draw|null>} Tirage trouvé ou null
   */
  async getDrawById(drawId) {
    await this.initialize();

    // Vérifier le cache
    const cacheKey = `draw_${drawId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let draw = null;
    
    if (this.storageType === 'sqlite') {
      draw = await this.getDrawFromSQLite(drawId);
    } else {
      draw = await this.getDrawFromJSON(drawId);
    }

    if (draw) {
      this.cache.set(cacheKey, draw);
    }

    return draw;
  }

  /**
   * Récupère un tirage depuis SQLite
   * @param {string} drawId - ID du tirage
   * @returns {Promise<Draw|null>} Tirage ou null
   */
  async getDrawFromSQLite(drawId) {
    try {
      const sql = 'SELECT * FROM draws WHERE id = ?';
      let row = null;

      if (this.connection.prepare) {
        // better-sqlite3
        const stmt = this.connection.prepare(sql);
        row = stmt.get(drawId);
      } else {
        // sql.js
        const stmt = this.connection.prepare(sql);
        stmt.bind([drawId]);
        if (stmt.step()) {
          const columns = stmt.getColumnNames();
          const values = stmt.get();
          row = {};
          columns.forEach((col, idx) => row[col] = values[idx]);
        }
        stmt.free();
      }

      if (!row) {
        return null;
      }

      return this.rowToDraw(row);
    } catch (error) {
      console.error('Failed to get draw from SQLite:', error);
      return null;
    }
  }

  /**
   * Récupère un tirage depuis JSON
   * @param {string} drawId - ID du tirage
   * @returns {Promise<Draw|null>} Tirage ou null
   */
  async getDrawFromJSON(drawId) {
    try {
      let data = null;

      if (typeof require !== 'undefined') {
        // Node.js
        const fs = require('fs').promises;
        const filename = `${this.dataPath}/draw_${drawId}.json`;
        try {
          const content = await fs.readFile(filename, 'utf8');
          data = JSON.parse(content);
        } catch {
          return null;
        }
      } else {
        // Navigateur
        const stored = localStorage.getItem(`fdj_draw_${drawId}`);
        if (stored) {
          data = JSON.parse(stored);
        }
      }

      return data ? Draw.fromJSON(data) : null;
    } catch (error) {
      console.error('Failed to get draw from JSON:', error);
      return null;
    }
  }

  /**
   * Récupère les derniers tirages
   * @param {number} [limit=10] - Nombre de tirages à récupérer
   * @param {number} [offset=0] - Décalage pour la pagination
   * @returns {Promise<Draw[]>} Liste des tirages
   */
  async getLatestDraws(limit = 10, offset = 0) {
    await this.initialize();

    if (this.storageType === 'sqlite') {
      return this.getLatestDrawsFromSQLite(limit, offset);
    } else {
      return this.getLatestDrawsFromJSON(limit, offset);
    }
  }

  /**
   * Récupère les derniers tirages depuis SQLite
   * @param {number} limit - Limite
   * @param {number} offset - Décalage
   * @returns {Promise<Draw[]>} Tirages
   */
  async getLatestDrawsFromSQLite(limit, offset) {
    try {
      const sql = `
        SELECT * FROM draws 
        ORDER BY date DESC 
        LIMIT ? OFFSET ?
      `;
      
      let rows = [];

      if (this.connection.prepare) {
        // better-sqlite3
        const stmt = this.connection.prepare(sql);
        rows = stmt.all(limit, offset);
      } else {
        // sql.js
        const stmt = this.connection.prepare(sql);
        stmt.bind([limit, offset]);
        while (stmt.step()) {
          const columns = stmt.getColumnNames();
          const values = stmt.get();
          const row = {};
          columns.forEach((col, idx) => row[col] = values[idx]);
          rows.push(row);
        }
        stmt.free();
      }

      return rows.map(row => this.rowToDraw(row));
    } catch (error) {
      console.error('Failed to get latest draws from SQLite:', error);
      return [];
    }
  }

  /**
   * Récupère les derniers tirages depuis JSON
   * @param {number} limit - Limite
   * @param {number} offset - Décalage
   * @returns {Promise<Draw[]>} Tirages
   */
  async getLatestDrawsFromJSON(limit, offset) {
    // Implémentation basique - en pratique, il faudrait un index
    try {
      const draws = [];
      
      if (typeof require !== 'undefined') {
        // Node.js
        const fs = require('fs').promises;
        const files = await fs.readdir(this.dataPath);
        const drawFiles = files.filter(f => f.startsWith('draw_') && f.endsWith('.json'));
        
        for (const file of drawFiles) {
          try {
            const content = await fs.readFile(`${this.dataPath}/${file}`, 'utf8');
            const data = JSON.parse(content);
            draws.push(Draw.fromJSON(data));
          } catch {
            // Ignorer les fichiers corrompus
          }
        }
      } else {
        // Navigateur
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('fdj_draw_')) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              draws.push(Draw.fromJSON(data));
            } catch {
              // Ignorer les données corrompues
            }
          }
        }
      }

      // Trier par date et appliquer la pagination
      draws.sort((a, b) => b.date.getTime() - a.date.getTime());
      return draws.slice(offset, offset + limit);
      
    } catch (error) {
      console.error('Failed to get latest draws from JSON:', error);
      return [];
    }
  }

  /**
   * Convertit une ligne SQLite en objet Draw
   * @param {Object} row - Ligne de la base
   * @returns {Draw} Instance de Draw
   */
  rowToDraw(row) {
    return new Draw({
      date: row.date,
      numbers: JSON.parse(row.numbers),
      stars: JSON.parse(row.stars),
      breakdown: row.breakdown ? JSON.parse(row.breakdown) : [],
      meta: row.meta ? JSON.parse(row.meta) : {}
    });
  }

  /**
   * Compte le nombre total de tirages
   * @returns {Promise<number>} Nombre de tirages
   */
  async getTotalDrawCount() {
    await this.initialize();

    if (this.storageType === 'sqlite') {
      try {
        const sql = 'SELECT COUNT(*) as count FROM draws';
        let result = null;

        if (this.connection.prepare) {
          // better-sqlite3
          const stmt = this.connection.prepare(sql);
          result = stmt.get();
        } else {
          // sql.js
          const stmt = this.connection.prepare(sql);
          if (stmt.step()) {
            result = { count: stmt.get()[0] };
          }
          stmt.free();
        }

        return result ? result.count : 0;
      } catch (error) {
        console.error('Failed to count draws in SQLite:', error);
        return 0;
      }
    } else {
      // JSON - compter les fichiers ou entrées localStorage
      const draws = await this.getLatestDrawsFromJSON(1000000, 0); // Hack pour récupérer tous
      return draws.length;
    }
  }

  /**
   * Nettoie le cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Ferme la connexion et nettoie les ressources
   */
  async close() {
    if (this.connection && this.connection.close) {
      this.connection.close();
    }
    this.clearCache();
    this.isInitialized = false;
  }

  /**
   * Obtient les statistiques du service
   * @returns {Object} Statistiques
   */
  getStatistics() {
    return {
      storageType: this.storageType,
      isInitialized: this.isInitialized,
      cacheSize: this.cache.size,
      hasConnection: !!this.connection
    };
  }
}

export default DataService;