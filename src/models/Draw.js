/**
 * FDJ Project - Draw Model
 * Modèle représentant un tirage Euromillions
 * 
 * @class Draw
 * @description Encapsule les données et la logique métier d'un tirage
 */

class Draw {
  /**
   * Crée une instance de Draw
   * @param {Object} data - Données du tirage
   * @param {string} data.date - Date du tirage (ISO string)
   * @param {number[]} data.numbers - Numéros principaux (5 numéros)
   * @param {number[]} data.stars - Numéros étoiles (2 étoiles)
   * @param {Object[]} [data.breakdown] - Détails des gains par rang
   * @param {Object} [data.meta] - Métadonnées additionnelles
   */
  constructor(data) {
    this.validateData(data);
    
    this.date = new Date(data.date);
    this.numbers = [...data.numbers].sort((a, b) => a - b);
    this.stars = [...data.stars].sort((a, b) => a - b);
    this.breakdown = data.breakdown || [];
    this.meta = data.meta || {};
    this.id = this.generateId();
  }

  /**
   * Valide les données d'entrée
   * @param {Object} data - Données à valider
   * @throws {Error} Si les données sont invalides
   */
  validateData(data) {
    if (!data) {
      throw new Error('Draw data is required');
    }

    if (!data.date) {
      throw new Error('Draw date is required');
    }

    if (!Array.isArray(data.numbers) || data.numbers.length !== 5) {
      throw new Error('Draw must have exactly 5 numbers');
    }

    if (!Array.isArray(data.stars) || data.stars.length !== 2) {
      throw new Error('Draw must have exactly 2 stars');
    }

    // Validation des plages de numéros
    data.numbers.forEach(num => {
      if (!Number.isInteger(num) || num < 1 || num > 50) {
        throw new Error(`Invalid number: ${num}. Numbers must be integers between 1 and 50`);
      }
    });

    data.stars.forEach(star => {
      if (!Number.isInteger(star) || star < 1 || star > 12) {
        throw new Error(`Invalid star: ${star}. Stars must be integers between 1 and 12`);
      }
    });

    // Vérification des doublons
    if (new Set(data.numbers).size !== data.numbers.length) {
      throw new Error('Numbers must be unique');
    }

    if (new Set(data.stars).size !== data.stars.length) {
      throw new Error('Stars must be unique');
    }
  }

  /**
   * Génère un ID unique pour le tirage basé sur la date et les numéros
   * @returns {string} ID unique
   */
  generateId() {
    const dateStr = this.date.toISOString().split('T')[0];
    const numbersStr = this.numbers.join('-');
    const starsStr = this.stars.join('-');
    return `${dateStr}_${numbersStr}_${starsStr}`;
  }

  /**
   * Formate la date pour l'affichage
   * @param {string} [locale='fr-FR'] - Locale pour le formatage
   * @returns {string} Date formatée
   */
  getFormattedDate(locale = 'fr-FR') {
    return this.date.toLocaleDateString(locale);
  }

  /**
   * Vérifie si le tirage est récent (moins de 30 jours)
   * @returns {boolean} True si récent
   */
  isRecent() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.date >= thirtyDaysAgo;
  }

  /**
   * Compare deux tirages pour le tri
   * @param {Draw} other - Autre tirage à comparer
   * @returns {number} Résultat de comparaison pour Array.sort()
   */
  compareTo(other) {
    return this.date.getTime() - other.date.getTime();
  }

  /**
   * Calcule le jackpot total à partir du breakdown
   * @returns {number} Montant du jackpot
   */
  getJackpot() {
    if (!this.breakdown || this.breakdown.length === 0) {
      return 0;
    }

    const rank1 = this.breakdown.find(item => 
      item.rank === 1 || 
      item.rankLabel === 'Rang 1' || 
      item.rankLabel === '5 + 2'
    );

    return rank1 ? (rank1.amount || 0) : 0;
  }

  /**
   * Compte le nombre total de gagnants
   * @returns {number} Nombre total de gagnants
   */
  getTotalWinners() {
    if (!this.breakdown || this.breakdown.length === 0) {
      return 0;
    }

    return this.breakdown.reduce((total, item) => {
      return total + (item.winners || 0);
    }, 0);
  }

  /**
   * Vérifie si ce tirage contient des numéros consécutifs
   * @returns {boolean} True si des numéros sont consécutifs
   */
  hasConsecutiveNumbers() {
    for (let i = 0; i < this.numbers.length - 1; i++) {
      if (this.numbers[i + 1] - this.numbers[i] === 1) {
        return true;
      }
    }
    return false;
  }

  /**
   * Calcule les statistiques de parité (pair/impair)
   * @returns {Object} Statistiques de parité
   */
  getParityStats() {
    const evenNumbers = this.numbers.filter(n => n % 2 === 0).length;
    const oddNumbers = this.numbers.length - evenNumbers;
    const evenStars = this.stars.filter(s => s % 2 === 0).length;
    const oddStars = this.stars.length - evenStars;

    return {
      numbers: { even: evenNumbers, odd: oddNumbers },
      stars: { even: evenStars, odd: oddStars }
    };
  }

  /**
   * Exporte le tirage en format JSON
   * @returns {Object} Données du tirage
   */
  toJSON() {
    return {
      id: this.id,
      date: this.date.toISOString(),
      numbers: this.numbers,
      stars: this.stars,
      breakdown: this.breakdown,
      meta: this.meta
    };
  }

  /**
   * Crée un tirage à partir de données JSON
   * @param {Object} json - Données JSON
   * @returns {Draw} Instance de Draw
   */
  static fromJSON(json) {
    return new Draw(json);
  }

  /**
   * Vérifie si deux tirages sont identiques
   * @param {Draw} other - Autre tirage
   * @returns {boolean} True si identiques
   */
  equals(other) {
    if (!(other instanceof Draw)) {
      return false;
    }

    return this.id === other.id;
  }

  /**
   * Représentation textuelle du tirage
   * @returns {string} Description du tirage
   */
  toString() {
    return `Draw(${this.getFormattedDate()}: ${this.numbers.join('-')} ⭐ ${this.stars.join('-')})`;
  }
}

export default Draw;